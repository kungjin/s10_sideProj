// src/main/java/com/of/mapper/StatsMapper.java
package com.of.mapper;

import org.apache.ibatis.annotations.Mapper;
import com.of.dto.AuctionStatsDto;

@Mapper
public interface StatsMapper {

    AuctionStatsDto selectAuctionStats();

}

