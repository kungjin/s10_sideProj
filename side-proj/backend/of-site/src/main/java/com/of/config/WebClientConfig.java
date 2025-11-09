package com.of.config;

import java.time.Duration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import io.netty.channel.ChannelOption;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient publicDataClient() {
        HttpClient httpClient = HttpClient.create()
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)   // 연결 5s
            .responseTimeout(Duration.ofSeconds(60));             // 응답헤더 60s

        return WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_XML_VALUE)  // ★ XML
            .defaultHeader(HttpHeaders.USER_AGENT, "of-site/1.0")
            .codecs(c -> c.defaultCodecs().maxInMemorySize(8 * 1024 * 1024))
            // ↓ 잠깐 로깅: 실제 나가는 URL 즉시 확인용 (문제 해결되면 제거해도 됨)
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


