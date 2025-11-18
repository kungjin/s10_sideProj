// src/main/java/com/of/controller/StatsController.java
package com.of.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import com.of.dto.AuctionStatsDto;
import com.of.service.StatsService;

@RestController
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/api/auctions/stats")
    public AuctionStatsDto stats() {
        return statsService.getAuctionStats();
    }
}
