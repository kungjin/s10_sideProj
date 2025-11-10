package com.of.service;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;  // ✅ 이걸로 바꿔야 함!
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FetchService {
    private final WebClient webClient;
    @Value("${public.api.base-url}")
    private String baseUrl;

    @Value("${public.api.service-key.decoded}")
    private String serviceKey;

    public String fetchRawXml(Map<String,String> params) {
        var ub = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParam("serviceKey", serviceKey);
        if (params != null) params.forEach(ub::queryParam);

        String url = ub.build(true).toUriString();
        String xml = webClient.get().uri(url)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        // 바디 앞부분만 로그
        System.out.println("[Body head]\n" + (xml == null ? "(null)" : xml.substring(0, Math.min(xml.length(), 800))));
        return xml;
    }
}

