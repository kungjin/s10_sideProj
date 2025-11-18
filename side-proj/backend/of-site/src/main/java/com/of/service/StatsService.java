// src/main/java/com/of/service/StatsService.java
package com.of.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.of.dto.AuctionStatsDto;
import com.of.mapper.StatsMapper;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final StatsMapper statsMapper;

    public AuctionStatsDto getAuctionStats() {
        return statsMapper.selectAuctionStats();
    }
}
