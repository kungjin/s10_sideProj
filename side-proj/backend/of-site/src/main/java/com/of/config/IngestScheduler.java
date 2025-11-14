// src/main/java/com/of/config/IngestScheduler.java
package com.of.config;

import com.of.service.IngestService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.util.Map;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class IngestScheduler {

    private final IngestService ingestService;

    // 매일 새벽 4시(한국시간) 실행 예시
    @Scheduled(cron = "0 0 4 * * *", zone = "Asia/Seoul")
    public void syncDaily() {
        Map<String, String> params = Map.of(
                "pageNo", "1",
                "numOfRows", "30"
                // TODO: 필요하면 지역/상태 필터 더 추가
        );
        int count = ingestService.ingestOnce(params);
        System.out.println("[IngestScheduler] daily sync done, inserted/updated = " + count);
    }
}

