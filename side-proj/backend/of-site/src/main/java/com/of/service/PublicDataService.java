package com.of.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PublicDataService {

    private final WebClient webClient;

    @Value("${public.api.base-url}")
    private String baseUrl;

    @Value("${public.api.service-key.decoded}")
    private String serviceKeyDecoded;

    private String encodedKey() {
        return URLEncoder.encode(serviceKeyDecoded, StandardCharsets.UTF_8);
    }

    /**
     * 1) 원본 XML 문자열 그대로 전달 (프록시 용도)
     *    - 프론트에서 XML 그대로 보고싶을 때
     */
    public String fetchRawXml(Map<String, String> params) {
        String encodedKey = encodedKey();
        WebClient.RequestHeadersUriSpec<?> spec = webClient.get();
        WebClient.RequestHeadersSpec<?> req = spec.uri(uriBuilder -> {
            var b = uriBuilder
                    .path(baseUrl)          // baseUrl에 경로가 포함되면 path 그대로 사용
                    .queryParam("serviceKey", encodedKey);
            // 추가 파라미터(페이지 등)
            if (params != null) {
                params.forEach((k, v) -> {
                    if (v != null && !v.isBlank()) b.queryParam(k, v);
                });
            }
            return b.build();
        });
        return req.retrieve().bodyToMono(String.class).block();
    }

    /**
     * 2) XML → JSON (문자열) 변환 전달
     *    - 빠르게 JSON으로 프론트 콘솔에서 확인하고 싶을 때
     */
    public String fetchAsJson(Map<String, String> params) {
        String xml = fetchRawXml(params);
        return com.of.util.XmlJsonConverter.xmlStringToJsonString(xml);
    }
}

