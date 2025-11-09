package com.of.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;


@Service
@RequiredArgsConstructor
public class PublicDataService {

    @Qualifier("publicDataClient")      // 네가 쓰던 Bean 그대로 사용
    private final WebClient webClient;

    @Value("${public.api.base-url}")
    private String baseUrl;             // 풀 URL

    @Value("${public.api.service-key.decoded}")
    private String serviceKey;          // 단일 키 (encoded/decoded 구분 없음)

    /** 이미 퍼센트 인코딩처럼 보이면 true */
    private boolean looksEncoded(String s) {
        return s != null && s.matches(".*%[0-9a-fA-F]{2}.*");
    }
    
    
    /** XML 원문 프록시 */
    public String fetchRawXml(Map<String, String> params) {
        boolean alreadyEncoded = looksEncoded(serviceKey);

        UriComponentsBuilder ub = UriComponentsBuilder
                .fromUriString(baseUrl)
                .queryParam("serviceKey", serviceKey);

        if (params != null) {
            params.forEach((k, v) -> {
                if (v != null && !v.isBlank()) ub.queryParam(k, v);
            });
        }

        // alreadyEncoded=true면 serviceKey를 다시 인코딩하지 않음
        String url = ub.build(alreadyEncoded).toUriString();

        return webClient.get()
                .uri(url)                 // ★ 절대 URL로 호출 (path로 안 넣음)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    /** XML → JSON 문자열 */
    public String fetchAsJson(Map<String, String> params) {
        final String xml = fetchRawXml(params);

        if (xml == null || xml.isBlank()) {
            throw new RuntimeException("Upstream 응답 없음(빈 XML)");
        }

        // ★ 여기서 ‘<resultCode>00</resultCode>’ 강제 실패 제거
        //   → 공공데이터 측에서 구조가 달리 올 때도 일단 JSON으로 변환해 프론트에서 확인 가능
        try {
            return com.of.util.XmlJsonConverter.xmlStringToJsonString(xml);
        } catch (Exception e) {
            throw new RuntimeException("XML→JSON 변환 실패", e);
        }
    }
}





