package com.of.service;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

@Service
@RequiredArgsConstructor
public class PublicDataService {

	@Qualifier("publicDataClient")
	private final WebClient webClient;

	@Value("${public.api.base-url}")
	private String baseUrl;

	@Value("${public.api.service-key.decoded}")
	private String serviceKey;

	/** 온비드 쿼리 파라미터 화이트리스트(중복/오염 방지) */
	private static final Set<String> ALLOWED_PARAMS = Set.of("pageNo", "numOfRows", "DPSL_MTD_CD", "PBCT_BEGN_DTM",
			"PBCT_CLS_DTM",
			// 필요시 확장: "CTGR_FULL_NM","SIGUN_CD", ...
			// 주의: serviceKey/q/pbctNo 등 내부에서 처리하는 키는 제외
			"CLTR_NM", "LDNM_ADRS", "NMRD_ADRS", "CTGR_FULL_NM");

	/** 이미 퍼센트 인코딩처럼 보이면 true */
	private boolean looksEncoded(String s) {
		return s != null && s.matches(".*%[0-9a-fA-F]{2}.*");
	}

	/** URL/키 마스킹 */
	private String maskKey(String key) {
		if (key == null || key.length() < 8)
			return "****";
		return key.substring(0, 4) + "****" + key.substring(key.length() - 4);
	}

	/** 길이 제한 잘라내기 */
	private String clip(String s, int max) {
		if (s == null)
			return null;
		if (s.length() <= max)
			return s;
		return s.substring(0, max) + "...";
	}


	/** XML 원문 프록시 (응답 헤더 기반 안전 디코딩) */
	public String fetchRawXml(Map<String, String> params) {
	    boolean alreadyEncoded = looksEncoded(serviceKey);

	    UriComponentsBuilder ub = UriComponentsBuilder.fromUriString(baseUrl.trim())
	            .queryParam("serviceKey", serviceKey);

	    if (params != null) {
	        params.forEach((k, v) -> {
	            if (v == null || v.isBlank()) return;
	            if (!ALLOWED_PARAMS.contains(k)) return; // 화이트리스트 외 파라미터 차단
	            ub.queryParam(k, v);
	        });
	    }

	    URI uri = ub.build(alreadyEncoded).toUri();
	    String safeUrlForLog = uri.toString().replace(serviceKey, maskKey(serviceKey));
	    System.out.println("[PublicDataService] GET " + safeUrlForLog);

	    // 여기서 바로 String으로 디코딩까지 끝내서 리턴
	    String xml = webClient.get()
	            .uri(uri)
	            .accept(MediaType.APPLICATION_XML)
	            .exchangeToMono(res ->
	                    res.bodyToMono(byte[].class).flatMap(body -> {
	                        if (res.statusCode().is2xxSuccessful()) {
	                            // ★ 헤더를 smartDecode에 그대로 전달
	                            return Mono.just(
	                                    com.of.util.Charsets.smartDecode(
	                                            body, res.headers().asHttpHeaders()
	                                    )
	                            );
	                        }
	                        String head = new String(body, StandardCharsets.UTF_8);
	                        String msg = "Upstream error: status=" + res.statusCode()
	                                + ", headers=" + res.headers().asHttpHeaders()
	                                + ", head=" + clip(head.replace("\n"," ").replace("\r"," "), 400);
	                        return Mono.error(new RuntimeException(msg));
	                    })
	            )
	            .retryWhen(
	                    Retry.backoff(2, Duration.ofMillis(500))
	                         // ★ 5xx/네트워크만 재시도
	                         .filter(ex -> {
	                             // WebClientResponseException 5xx
	                             if (ex instanceof org.springframework.web.reactive.function.client.WebClientResponseException wre) {
	                                 return wre.getStatusCode().is5xxServerError();
	                             }
	                             String m = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase();
	                             // 타임아웃/연결계열
	                             return m.contains("timeout") || m.contains("connection");
	                         })
	            )
	            .block();

	    if (xml == null || xml.isBlank()) {
	        throw new RuntimeException("Upstream 응답 없음(빈 본문)");
	    }
	    return xml;
	}
	}
