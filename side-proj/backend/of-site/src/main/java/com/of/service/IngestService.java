package com.of.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.of.domain.Item;
import com.of.dto.OnbidItemDto;
import com.of.mapper.ItemMapper;
import com.of.mapper.StagingMapper;
import com.of.util.XmlJsonConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class IngestService {

    private static final String SRC = "ONBID";

    private final FetchService fetch;
    private final StagingMapper stagingMapper;
    private final ItemMapper itemMapper;

    /** 온비드 API 1회 호출 → DB 저장 (items가 배열/단일 모두 커버) */
    @Transactional
    public int ingestOnce(Map<String, String> params) {
        // 1) XML 수신
        String xml = fetch.fetchRawXml(params);
        if (xml == null || xml.isBlank()) {
            throw new RuntimeException("공공데이터 응답 없음");
        }

        // 2) XML -> JSON
        final String json = XmlJsonConverter.xmlStringToJsonString(xml);

        // 3) JSON 루트 파싱
        final ObjectMapper mapper = new ObjectMapper();
        final JsonNode root;
        try {
            root = mapper.readTree(json); // JsonProcessingException만 던짐
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new RuntimeException("JSON 파싱 실패", e);
        }

        // 4) items 노드 확보
        JsonNode top = unwrapTop(root);
        JsonNode items = root.path("response").path("body").path("items");
        if (items.isMissingNode() || items.isNull() || items.isEmpty()) {
            // 폴백: 트리 전체에서 'items'를 탐색
            items = top.findPath("items");
        }
        if (items.isMissingNode() || items.isNull() || items.isEmpty()) {
            System.out.println("[Ingest] items 노드 없음. top-level keys = " + top.fieldNames().next());
            String head = json.substring(0, Math.min(json.length(), 600));
            System.out.println("[Ingest][DEBUG json head]\n" + head);
            return 0;
        }
        
        int inserted = 0;

        // (A) items 자체가 배열인 케이스
        if (items.isArray()) {
            for (JsonNode itemNode : items) {
                inserted += processOne(itemNode);
            }
            return inserted;
        }

        // (B) items가 객체 → 보통 items.item 이 단일/배열로 옴
        JsonNode maybeItem = items.path("item");
        if (maybeItem.isMissingNode() || maybeItem.isNull()) {
            // 간혹 item 없이 items가 바로 item 속성들을 담는 경우가 있어 방어
            inserted += processOne(items);
            return inserted;
        }

        if (maybeItem.isArray()) {
            for (JsonNode itemNode : maybeItem) {
                inserted += processOne(itemNode);
            }
        } else {
            inserted += processOne(maybeItem);
        }

        return inserted;
    }

    /** 개별 itemNode 처리 (스테이징 저장 + 정규화 + UPSERT) */
    private int processOne(JsonNode itemNode) {
        if (itemNode == null || itemNode.isMissingNode() || itemNode.isNull() || itemNode.isEmpty()) {
            return 0;
        }

        // 필수 키
        long noticeNo = itemNode.path("PBCT_NO").asLong(0);
        long itemNo   = itemNode.path("CLTR_NO").asLong(0);
        if (noticeNo == 0 || itemNo == 0) {
            // 키가 없으면 스킵 (원하는 경우 로그만 남기고 continue)
            System.out.println("[Ingest] 키 누락 → skip  PBCT_NO=" + noticeNo + ", CLTR_NO=" + itemNo);
            return 0;
        }

        // 1) 원본 보관: item 단위 JSON 보관(감사/재처리용). 해시=내용 동등성
        String payload = itemNode.toString();
        String rawHash = sha256(payload);
        try {
            stagingMapper.insertRaw(SRC, noticeNo, itemNo, payload, rawHash);
        } catch (Exception e) {
            // 유니크 제약(uq_staging)으로 중복이면 업데이트 없이 넘어감(INSERT IGNORE 느낌)
            System.out.println("[Ingest] staging_raw insert 실패(중복 등 가능) → " + e.getMessage());
        }

        // 2) DTO 매핑
        OnbidItemDto dto = new OnbidItemDto();
        dto.setNoticeNo(noticeNo);
        dto.setItemNo(itemNo);
        dto.setTitle(getText(itemNode, "CLTR_NM"));
        // 도로명/지번 등 혼재하는 경우가 있어 ADDR_RD 없으면 NMRD_ADRS를 보조로 사용
        String addrRoad = getText(itemNode, "ADDR_RD");
        if (addrRoad.isBlank()) addrRoad = getText(itemNode, "NMRD_ADRS");
        dto.setAddrRoad(addrRoad);
        dto.setUsageName(getText(itemNode, "CTGR_FULL_NM"));
        dto.setSaleType(getText(itemNode, "DPSL_MTD_CD"));
        dto.setMinBidPrice(getDecimal(itemNode, "MIN_BID_PRC"));
        dto.setAppraisalAmt(getDecimal(itemNode, "APSL_ASES_AVG_AMT"));
        dto.setBidStartAt(getText(itemNode, "PBCT_BEGN_DTM"));
        dto.setBidEndAt(getText(itemNode, "PBCT_CLS_DTM"));
        dto.setStatusName(getText(itemNode, "PBCT_CLTR_STAT_NM"));
        dto.setFailedCount(itemNode.path("USCBD_CNT").asInt(0));
        dto.setViewCount(itemNode.path("IQRY_CNT").asInt(0));

        // 3) DTO → Item
        Item it = new Item();
        it.setSource(SRC);
        it.setNoticeNo(dto.getNoticeNo());
        it.setItemNo(dto.getItemNo());
        it.setTitle(dto.getTitle());
        it.setAddrRoad(dto.getAddrRoad());
        it.setUsageName(dto.getUsageName());
        it.setSaleType(("0002".equals(dto.getSaleType()) || "RENT".equalsIgnoreCase(dto.getSaleType())) ? "RENT" : "SALE");
        it.setMinBidPrice(dto.getMinBidPrice());
        it.setAppraisalAmt(dto.getAppraisalAmt());
        it.setBidStartAt(parseOnbidDate(dto.getBidStartAt()));
        it.setBidEndAt(parseOnbidDate(dto.getBidEndAt()));
        it.setStatusName(dto.getStatusName());
        it.setFailedCount(dto.getFailedCount());
        it.setViewCount(dto.getViewCount());
        it.setContentHash(sha256(canonical(it)));

        // 4) UPSERT
        try {
            return itemMapper.upsertItem(it);
        } catch (Exception e) {
            System.out.println("[Ingest] upsert 실패 → noticeNo=" + noticeNo + ", itemNo=" + itemNo + " / " + e.getMessage());
            return 0;
        }
    }

    /** 안전 문자열 추출 (null/빈값 방지) */
    private String getText(JsonNode n, String field) {
        if (n == null) return "";
        JsonNode v = n.path(field);
        return (v.isMissingNode() || v.isNull()) ? "" : v.asText("");
    }

    /** 안전 BigDecimal 추출 (빈문자/없음 → 0) */
    private BigDecimal getDecimal(JsonNode n, String field) {
        String s = getText(n, field);
        if (s.isBlank()) return BigDecimal.ZERO;
        try { return new BigDecimal(s); } catch (Exception ignore) { return BigDecimal.ZERO; }
    }

    /** 해시용 정규화 문자열 */
    private String canonical(Item it) {
        return String.join("|",
                nullToEmpty(it.getTitle()),
                String.valueOf(it.getMinBidPrice()),
                nullToEmpty(it.getAddrRoad()),
                String.valueOf(it.getBidStartAt()),
                String.valueOf(it.getBidEndAt())
        );
    }

    private String nullToEmpty(Object o) { return o == null ? "" : o.toString(); }

    /** SHA-256 해시 */
    private String sha256(String s) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] bytes = md.digest(s.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 계산 오류", e);
        }
    }

    /** 온비드 날짜 파싱 (YYYYMMDD / YYYYMMDDHHMMSS 지원) */
    private LocalDateTime parseOnbidDate(String s) {
        if (s == null || s.isBlank()) return null;
        String str = (s + "000000");
        if (str.length() < 14) str = (str + "00000000000000").substring(0, 14);
        else str = str.substring(0, 14);
        String iso = str.substring(0, 4) + "-" + str.substring(4, 6) + "-" + str.substring(6, 8)
                + "T" + str.substring(8, 10) + ":" + str.substring(10, 12) + ":" + str.substring(12, 14);
        try {
            return LocalDateTime.parse(iso);
        } catch (Exception e) {
            // 형식이 비정상일 때 null로 처리(수집은 계속)
            System.out.println("[Ingest] 날짜 파싱 실패(" + s + ") → null 처리");
            return null;
        }
        
        
    }
    private JsonNode unwrapTop(JsonNode root) {
        if (root == null || root.isMissingNode() || root.isNull()) return root;
        if (root.isObject() && root.size() == 1) {
            var it = root.fieldNames();
            if (it.hasNext()) {
                String k = it.next();
                // "Map", "MapN", "map", "map1" 등 대응
                if (k.toLowerCase().startsWith("map")) {
                    return root.path(k);
                }
            }
        }
        return root;
    }
}


