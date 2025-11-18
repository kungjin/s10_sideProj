// src/main/java/com/of/dto/AuctionStatsDto.java
package com.of.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class AuctionStatsDto {
    private long totalCount;
    private long closingToday;
    private long closingThisWeek;
    private BigDecimal avgMinBid;

    private String topRegion;
    private long topRegionCount;
}

