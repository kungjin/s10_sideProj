package com.of.config;

import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.channel.ChannelOption;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfig {
	
	
	// WebClientConfig.java
	@Bean
	public WebClient webClient(WebClient.Builder builder) {
	    HttpClient httpClient = HttpClient.create()
	            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 10_000) // connect 10s
	            .responseTimeout(Duration.ofSeconds(60));             // ★ response 60s

	    return builder
	            .clientConnector(new ReactorClientHttpConnector(httpClient))
	            .defaultHeader("User-Agent", "of-site/1.0")
	            .build();
	}

}
