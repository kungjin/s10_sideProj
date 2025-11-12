// src/main/java/com/of/controller/PublicDataController.java
package com.of.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicDataController {
	@Qualifier("publicDataClient")   // ★ 명시적 주입
    private final WebClient webClient;

    @Value("${public.api.base-url}")
    private String baseUrl;

    @Value("${public.api.service-key.decoded}")
    private String serviceKey;

    /* ---------- small utils ---------- */
    private static String quote(String s) {
        if (s == null) return "null";
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }
    private String maskKey(String key) {
        if (key == null || key.length() < 8) return "****";
        return key.substring(0, 4) + "****" + key.substring(key.length() - 4);
    }

    /* =========================================
     * 목록: XML → JSON 변환 + (옵션) 서버 필터(q)
     * ========================================= */
    @GetMapping(value = "/auctions", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> auctions(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "12") int numOfRows,
            @RequestParam(defaultValue = "0001") String DPSL_MTD_CD,
            @RequestParam(required = false) String PBCT_BEGN_DTM,
            @RequestParam(required = false) String PBCT_CLS_DTM,
            @RequestParam(required = false) String q,
            @RequestParam Map<String, String> extra
    ) {
        final String xml = proxyCallForXml(pageNo, numOfRows, DPSL_MTD_CD, PBCT_BEGN_DTM, PBCT_CLS_DTM, extra);
        if (xml == null || xml.isBlank()) {
            return ResponseEntity.status(502).body("{\"error\":\"upstream-empty\"}");
        }
        // 온비드 표준 헤더(간단 검사)
        if (!xml.contains("<resultCode>00</resultCode>")) {
            String head = xml.length() > 400 ? xml.substring(0, 400) + "..." : xml;
            System.out.println("[auctions] upstream error xml head: " + head.replace("\n", " "));
            return ResponseEntity.badRequest().body("{\"error\":\"onbid-error\",\"rawHead\":" + quote(head) + "}");
        }

        // XML → JSON
        String json = com.of.util.XmlJsonConverter.xmlStringToJsonString(xml);

//        // 서버 측 가벼운 contains 필터(대소문자 무시, 실패해도 서버 500 금지)
//        if (q != null && !q.isBlank()) {
//            try {
//                org.json.JSONObject root = new org.json.JSONObject(json);
//                final String pathWithResp = "response.body.items.item";
//                final String pathNoResp   = "body.items.item";
//                String path = root.has("response") ? pathWithResp : pathNoResp;
//
//                int before = com.of.util.JsonFilters.countAtPath(json, path);
//
//                // 다중 필드 검색: 물건명/도로명/지번/카테고리
//                String filtered = com.of.util.JsonFilters.filterByContains(
//                        json,
//                        path,
//                        new String[]{"CLTR_NM", "LDNM_ADRS", "NMRD_ADRS", "CTGR_FULL_NM"},
//                        q.trim()
//                );
//                int after = com.of.util.JsonFilters.countAtPath(filtered, path);
//
//                // 경로 추정이 빗나간 경우 반대 경로로 한 번 더 시도
//                if (after == before) {
//                    String altPath = path.equals(pathWithResp) ? pathNoResp : pathWithResp;
//                    int altBefore = com.of.util.JsonFilters.countAtPath(json, altPath);
//
//                    String filtered2 = com.of.util.JsonFilters.filterByContains(
//                            json,
//                            altPath,
//                            new String[]{"CLTR_NM", "LDNM_ADRS", "NMRD_ADRS", "CTGR_FULL_NM"},
//                            q.trim()
//                    );
//                    int altAfter = com.of.util.JsonFilters.countAtPath(filtered2, altPath);
//
//                    System.out.println("[auctions] path=" + path + " before=" + before + " after=" + after
//                            + " | altPath=" + altPath + " altBefore=" + altBefore + " altAfter=" + altAfter
//                            + " | q=" + q);
//
//                    // 더 잘 줄어든 쪽을 채택
//                    json = (altAfter < altBefore && altAfter <= after) ? filtered2 : filtered;
//                } else {
//                    json = filtered;
//                    System.out.println("[auctions] path=" + path + " before=" + before + " after=" + after + " | q=" + q);
//                }
//
//            } catch (Exception e) {
//                System.out.println("[auctions] filter skipped: " + e.getClass().getSimpleName() + " - " + e.getMessage());
//            }
//        }
//
//        return ResponseEntity.ok(json);
//    }
        
        if (q != null && !q.isBlank()) {
            try {
                json = applyContainsFilter(json, q.trim());
            } catch (Exception e) {
                System.out.println("[auctions] filter skipped: " + e.getMessage());
            }
        }
        return ResponseEntity.ok(json);
    }  
        

    /* ======================
     * 상세 (간단 equal 필터)
     * ====================== */
    @GetMapping(value = "/auctions/{pbctNo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> auctionDetail(
            @PathVariable String pbctNo,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "50") int numOfRows,
            @RequestParam(defaultValue = "0001") String DPSL_MTD_CD,
            @RequestParam(required = false) String PBCT_BEGN_DTM,
            @RequestParam(required = false) String PBCT_CLS_DTM,
            @RequestParam Map<String, String> extra
    ) {
        String xml = proxyCallForXml(pageNo, numOfRows, DPSL_MTD_CD, PBCT_BEGN_DTM, PBCT_CLS_DTM, extra);
        String json = com.of.util.XmlJsonConverter.xmlStringToJsonString(xml);

        // PBCT_NO 일치 1건만 추려 반환
        String one = com.of.util.JsonFilters.filterByEquals(
                json,
                "response.body.items.item",
                "PBCT_NO",
                pbctNo
        );
        return ResponseEntity.ok(one);
    }
    
    
    private String applyContainsFilter(String json, String keyword) {
        String path1 = "response.body.items.item";
        String path2 = "body.items.item";

        int before1 = com.of.util.JsonFilters.countAtPath(json, path1);
        String f1 = com.of.util.JsonFilters.filterByContains(
            json, path1, new String[]{"CLTR_NM","LDNM_ADRS","NMRD_ADRS","CTGR_FULL_NM"}, keyword
        );
        int after1 = com.of.util.JsonFilters.countAtPath(f1, path1);

        int before2 = com.of.util.JsonFilters.countAtPath(json, path2);
        String f2 = com.of.util.JsonFilters.filterByContains(
            json, path2, new String[]{"CLTR_NM","LDNM_ADRS","NMRD_ADRS","CTGR_FULL_NM"}, keyword
        );
        int after2 = com.of.util.JsonFilters.countAtPath(f2, path2);

        System.out.println("[auctions] q=" + keyword + " | path1 " + before1 + "→" + after1 + " | path2 " + before2 + "→" + after2);
        return (after2 < after1) ? f2 : f1;
    }
    
    

    /* =======================
     * 공용 Upstream XML 호출
     * ======================= */
    private String proxyCallForXml(
            int pageNo, int numOfRows, String DPSL_MTD_CD,
            String PBCT_BEGN_DTM, String PBCT_CLS_DTM,
            Map<String,String> extra
        ) {
            pageNo = Math.max(1, pageNo);
            numOfRows = Math.max(1, numOfRows);

            var today = LocalDate.now();
            var from = today.minusDays(30);
            var fmt = DateTimeFormatter.BASIC_ISO_DATE;

            String beg = (PBCT_BEGN_DTM == null || PBCT_BEGN_DTM.isBlank()) ? from.format(fmt) : PBCT_BEGN_DTM;
            String end = (PBCT_CLS_DTM == null || PBCT_CLS_DTM.isBlank()) ? today.format(fmt) : PBCT_CLS_DTM;

            var ub = UriComponentsBuilder.fromUriString(baseUrl.trim())
                .queryParam("serviceKey", serviceKey)
                .queryParam("pageNo", pageNo)
                .queryParam("numOfRows", numOfRows)
                .queryParam("DPSL_MTD_CD", DPSL_MTD_CD)
                .queryParam("PBCT_BEGN_DTM", beg)
                .queryParam("PBCT_CLS_DTM", end);

            extra.forEach((k,v) -> {
                if (v != null && !v.isBlank()
                 && !k.equalsIgnoreCase("serviceKey")
                 && !k.equalsIgnoreCase("pageNo")
                 && !k.equalsIgnoreCase("numOfRows")
                 && !k.equalsIgnoreCase("DPSL_MTD_CD")
                 && !k.equalsIgnoreCase("PBCT_BEGN_DTM")
                 && !k.equalsIgnoreCase("PBCT_CLS_DTM")
                 && !k.equalsIgnoreCase("q")
                 && !k.equalsIgnoreCase("pbctno")) {
                    ub.queryParam(k, v);
                }
            });

            URI uri = ub.encode(StandardCharsets.UTF_8).build().toUri();
            System.out.println("요청 URI(JSON 변환용): [" + uri.toString().replace(serviceKey, maskKey(serviceKey)) + "]");

            return webClient.get()
                .uri(uri)
                .accept(org.springframework.http.MediaType.APPLICATION_XML)
                .exchangeToMono(res -> {
                    var headers = res.headers().asHttpHeaders();
                    return res.bodyToMono(byte[].class)
                        .map(bytes -> com.of.util.Charsets.smartDecode(bytes, headers));
                })
                .block();
    }
}

