
// src/main/java/com/of/controller/PublicDataController.java
package com.of.controller;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicDataController {

    private final WebClient webClient;

    // 예: http://openapi.onbid.co.kr/openapi/services/KamcoPblsalThingInquireSvc/getKamcoPbctCltrList
    @Value("${public.api.base-url}")
    private String baseUrl;

    @Value("${public.api.service-key.decoded}")
    private String serviceKey;

    // ---------------------------------------
    // 유틸: 서비스키 로그 마스킹
    // ---------------------------------------
    private String maskKey(String key) {
        if (key == null || key.length() < 8) return "****";
        return key.substring(0, 4) + "****" + key.substring(key.length() - 4);
    }

    // ---------------------------------------
    // 원문 XML 프록시(상태/헤더 + 본문, 한글깨짐 방지)
    // 예) /api/public/test?pageNo=1&numOfRows=1&DPSL_MTD_CD=0001
    // ---------------------------------------
    @GetMapping("/test")
    public ResponseEntity<String> test(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "1") int numOfRows,
            @RequestParam(name = "DPSL_MTD_CD", defaultValue = "0001") String dpslMtdCd,
            @RequestParam(required = false) String PBCT_BEGN_DTM, // YYYYMMDD
            @RequestParam(required = false) String PBCT_CLS_DTM,  // YYYYMMDD
            @RequestParam Map<String, String> extra
    ) {
        // 입력 방어
        pageNo = Math.max(1, pageNo);
        numOfRows = Math.max(1, numOfRows);

        // 기본 기간: 최근 30일
        LocalDate today = LocalDate.now();
        LocalDate from  = today.minusDays(30);
        DateTimeFormatter fmt = DateTimeFormatter.BASIC_ISO_DATE; // yyyyMMdd
        String beg = (PBCT_BEGN_DTM == null || PBCT_BEGN_DTM.isBlank()) ? from.format(fmt)  : PBCT_BEGN_DTM;
        String end = (PBCT_CLS_DTM == null || PBCT_CLS_DTM.isBlank())  ? today.format(fmt) : PBCT_CLS_DTM;

        String encodedKey = URLEncoder.encode(serviceKey, StandardCharsets.UTF_8);

        UriComponentsBuilder ub = UriComponentsBuilder
                .fromUriString(baseUrl.trim())
                .queryParam("serviceKey", encodedKey)
                .queryParam("pageNo", pageNo)
                .queryParam("numOfRows", numOfRows)
                .queryParam("DPSL_MTD_CD", dpslMtdCd)
                .queryParam("PBCT_BEGN_DTM", beg)
                .queryParam("PBCT_CLS_DTM", end);

        // 사용자 추가 파라미터(중복 키 제외)
        extra.forEach((k, v) -> {
            if (v != null && !v.isBlank()
                    && !k.equalsIgnoreCase("serviceKey")
                    && !k.equalsIgnoreCase("pageNo")
                    && !k.equalsIgnoreCase("numOfRows")
                    && !k.equalsIgnoreCase("DPSL_MTD_CD")
                    && !k.equalsIgnoreCase("PBCT_BEGN_DTM")
                    && !k.equalsIgnoreCase("PBCT_CLS_DTM")) {
                ub.queryParam(k, v);
            }
        
        
        });

        URI uri = ub.build(true).toUri();
        String safeUri = uri.toString().replace(serviceKey, maskKey(serviceKey));
        System.out.println("요청 URI: [" + safeUri + "]");

        String body = webClient.get()
                .uri(uri)
                .accept(MediaType.APPLICATION_XML)
                .exchangeToMono(res -> {
                    var headers = res.headers().asHttpHeaders();
                    return res.bodyToMono(byte[].class)
                            // ★ EUC-KR/UTF-8 혼선 자동 처리
                            .map(bytes -> com.of.util.Charsets.smartDecode(bytes, headers))
                            .map(text -> "HTTP " + res.statusCode().value()
                                    + "\nResp-Headers: " + headers + "\n\n" + text);
                })
                .block();

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(body);
    }
    
    // ---------------------------------------
    // XML → JSON 변환 엔드포인트 (한글 안전, 기간 기본 적용)
    // 예) /api/public/json?pageNo=1&numOfRows=3&DPSL_MTD_CD=0001
    // ---------------------------------------
    @GetMapping(value = "/auctions", produces = "application/json;charset=UTF-8")
    public ResponseEntity<String> auctions(
        @RequestParam(defaultValue = "1") int pageNo,
        @RequestParam(defaultValue = "12") int numOfRows,
        @RequestParam(name = "DPSL_MTD_CD", defaultValue = "0001") String dpslMtdCd,
        @RequestParam(required = false) String PBCT_BEGN_DTM,
        @RequestParam(required = false) String PBCT_CLS_DTM,
        @RequestParam(required = false) String q,   // ← 추가
        @RequestParam Map<String, String> extra
    ) {
        String xml  = proxyCallForXml(pageNo, numOfRows, dpslMtdCd, PBCT_BEGN_DTM, PBCT_CLS_DTM, extra);
        String json = com.of.util.XmlJsonConverter.xmlStringToJsonString(xml);
        if (q != null && !q.isBlank()) {
            json = com.of.util.JsonFilters.filterByContains(json, "response.body.items.item", "CLTR_NM", q);
        }
        return ResponseEntity.ok(json);
    }

    @GetMapping(value = "/auctions/{pbctNo}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> auctionDetail(
            @PathVariable String pbctNo,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "50") int numOfRows, // 충분히 넉넉히 받아서
            @RequestParam(name = "DPSL_MTD_CD", defaultValue = "0001") String dpslMtdCd,
            @RequestParam(required = false) String PBCT_BEGN_DTM,
            @RequestParam(required = false) String PBCT_CLS_DTM,
            @RequestParam Map<String, String> extra
    ) {
        String xml = proxyCallForXml(pageNo, numOfRows, dpslMtdCd, PBCT_BEGN_DTM, PBCT_CLS_DTM, extra);
        String json = com.of.util.XmlJsonConverter.xmlStringToJsonString(xml);

        // 간단 필터: items.item 중 PBCT_NO == pbctNo 인 것만 남기기
        String one = com.of.util.JsonFilters.filterByEquals(json, "response.body.items.item", "PBCT_NO", pbctNo);

        return ResponseEntity.ok(one);
    }

    
    
    // ---------------------------------------
    // 공용: 원문 XML 호출(스마트 디코딩 & 기간 기본 적용 & 키 마스킹 로그)
    // ---------------------------------------
    private String proxyCallForXml(
            int pageNo,
            int numOfRows,
            String dpslMtdCd,
            String PBCT_BEGN_DTM,
            String PBCT_CLS_DTM,
            Map<String, String> extra
    ) {
        // 입력 방어
        pageNo = Math.max(1, pageNo);
        numOfRows = Math.max(1, numOfRows);

        // 기본 기간: 최근 30일
        LocalDate today = LocalDate.now();
        LocalDate from  = today.minusDays(30);
        DateTimeFormatter fmt = DateTimeFormatter.BASIC_ISO_DATE;
        String beg = (PBCT_BEGN_DTM == null || PBCT_BEGN_DTM.isBlank()) ? from.format(fmt)  : PBCT_BEGN_DTM;
        String end = (PBCT_CLS_DTM == null || PBCT_CLS_DTM.isBlank())  ? today.format(fmt) : PBCT_CLS_DTM;


        UriComponentsBuilder ub = UriComponentsBuilder
                .fromUriString(baseUrl.trim())
                .queryParam("serviceKey", serviceKey)
                .queryParam("pageNo", pageNo)
                .queryParam("numOfRows", numOfRows)
                .queryParam("DPSL_MTD_CD", dpslMtdCd)
                .queryParam("PBCT_BEGN_DTM", beg)
                .queryParam("PBCT_CLS_DTM", end);

        extra.forEach((k, v) -> {
            if (v != null && !v.isBlank()
                    && !k.equalsIgnoreCase("serviceKey")
                    && !k.equalsIgnoreCase("pageNo")
                    && !k.equalsIgnoreCase("numOfRows")
                    && !k.equalsIgnoreCase("DPSL_MTD_CD")
                    && !k.equalsIgnoreCase("PBCT_BEGN_DTM")
                    && !k.equalsIgnoreCase("PBCT_CLS_DTM")
                    && !k.equals("q")
                    && !k.equals("pbctno") ) {
                ub.queryParam(k, v);
            }
        });

        URI uri = ub.encode(StandardCharsets.UTF_8).build().toUri();

        String safeUri = uri.toString().replace(serviceKey, maskKey(serviceKey));
        System.out.println("요청 URI(JSON 변환용): [" + safeUri + "]");

        try {
            return webClient.get()
                    .uri(uri)
                    .accept(MediaType.APPLICATION_XML)
                    .exchangeToMono(res -> {
                        var headers = res.headers().asHttpHeaders();
                        return res.bodyToMono(byte[].class)
                                .map(bytes -> com.of.util.Charsets.smartDecode(bytes, headers));
                    })
                    .block();
        } catch (Exception e) {
            // (선택) 로깅 후 빈 JSON 구조 반환 or 상위에서 예외 처리
            throw new RuntimeException("Upstream 호출 실패", e);
        }
        }
}
