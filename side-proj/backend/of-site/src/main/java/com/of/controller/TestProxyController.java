// src/main/java/com/of/controller/TestProxyController.java
package com.of.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
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

@Profile("!prod") // 운영(prod) 제외 환경에서만 활성
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestProxyController {

    private final WebClient webClient;

    @Value("${public.api.base-url}")
    private String baseUrl;

    @Value("${public.api.service-key.decoded}")
    private String serviceKey;

    private String maskKey(String key) {
        if (key == null || key.length() < 8) return "****";
        return key.substring(0, 4) + "****" + key.substring(key.length() - 4);
    }

    // 1) 원문 XML 그대로 보기
    @GetMapping(value = "/xml", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> rawXml(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "1") int numOfRows,
            @RequestParam(defaultValue = "0001") String DPSL_MTD_CD,
            @RequestParam(required = false) String PBCT_BEGN_DTM,
            @RequestParam(required = false) String PBCT_CLS_DTM,
            @RequestParam Map<String, String> extra
    ) {
        var uri = buildUri(pageNo, numOfRows, DPSL_MTD_CD, PBCT_BEGN_DTM, PBCT_CLS_DTM, extra);
        String body = webClient.get()
                .uri(uri)
                .accept(MediaType.APPLICATION_XML)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(body);
    }

    // 2) XML→JSON 변환 결과 바로 보기
    @GetMapping(value = "/json", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> rawJson(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "1") int numOfRows,
            @RequestParam(defaultValue = "0001") String DPSL_MTD_CD,
            @RequestParam(required = false) String PBCT_BEGN_DTM,
            @RequestParam(required = false) String PBCT_CLS_DTM,
            @RequestParam Map<String, String> extra
    ) {
        var uri = buildUri(pageNo, numOfRows, DPSL_MTD_CD, PBCT_BEGN_DTM, PBCT_CLS_DTM, extra);
        String xml = webClient.get()
                .uri(uri)
                .accept(MediaType.APPLICATION_XML)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        String json = com.of.util.XmlJsonConverter.xmlStringToJsonString(xml);
        return ResponseEntity.ok(json);
    }

    private URI buildUri(
            int pageNo, int numOfRows, String DPSL_MTD_CD,
            String PBCT_BEGN_DTM, String PBCT_CLS_DTM, Map<String,String> extra
    ) {
        pageNo = Math.max(1, pageNo);
        numOfRows = Math.max(1, numOfRows);

        var today = LocalDate.now();
        var from  = today.minusDays(30);
        var fmt   = DateTimeFormatter.BASIC_ISO_DATE;

        String beg = (PBCT_BEGN_DTM == null || PBCT_BEGN_DTM.isBlank()) ? from.format(fmt) : PBCT_BEGN_DTM;
        String end = (PBCT_CLS_DTM == null || PBCT_CLS_DTM.isBlank()) ? today.format(fmt) : PBCT_CLS_DTM;

        var ub = UriComponentsBuilder.fromUriString(baseUrl.trim())
                .queryParam("serviceKey", serviceKey)
                .queryParam("pageNo", pageNo)
                .queryParam("numOfRows", numOfRows)
                .queryParam("DPSL_MTD_CD", DPSL_MTD_CD)
                .queryParam("PBCT_BEGN_DTM", beg)
                .queryParam("PBCT_CLS_DTM", end);

        // 민감/내부 파라미터 제외, q도 제외
        extra.forEach((k, v) -> {
            if (v != null && !v.isBlank()
                    && !k.equalsIgnoreCase("serviceKey")
                    && !k.equalsIgnoreCase("q")) {
                ub.queryParam(k, v);
            }
        });

        var uri = ub.encode(StandardCharsets.UTF_8).build().toUri();
        System.out.println("[TEST] 요청 URI: " + uri.toString().replace(serviceKey, maskKey(serviceKey)));
        return uri;
    }
}
