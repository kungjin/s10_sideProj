package com.of.config;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfig {

    @Value("${public.api.base-url:http://openapi.onbid.co.kr}")
    private String baseUrl;

    @Bean(name = "publicDataClient")
    public WebClient publicDataClient() {
        HttpClient httpClient = HttpClient.create()
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)            // TCP 연결 5s
            .responseTimeout(Duration.ofSeconds(60))                       // 응답 헤더 60s
            .compress(true)                                                // GZIP 등 압축 수신 허용
            .doOnConnected(conn -> {
                conn.addHandlerLast(new ReadTimeoutHandler(60));           // 바디 읽기 60s
                conn.addHandlerLast(new WriteTimeoutHandler(60));          // 바디 쓰기 60s
            });

        return WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .baseUrl(baseUrl)                                              // ★ 기본 URL
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_XML_VALUE)
            .defaultHeader(HttpHeaders.ACCEPT_CHARSET, "UTF-8")
            .defaultHeader(HttpHeaders.USER_AGENT, "of-site/1.0")
            .codecs(c -> c.defaultCodecs().maxInMemorySize(8 * 1024 * 1024))
            // 간단 로깅 (운영 전환 시 로거로 교체 권장)
            .filter(ExchangeFilterFunction.ofRequestProcessor(req -> {
                System.out.println("[WebClient][REQ] " + req.method() + " " + req.url());
                return reactor.core.publisher.Mono.just(req);
            }))
            .filter(ExchangeFilterFunction.ofResponseProcessor(res -> {
                System.out.println("[WebClient][RES] status=" + res.statusCode());
                return reactor.core.publisher.Mono.just(res);
            }))
            .build();
    }
}
