package com.of.mapper;

import com.of.domain.Item;
import com.of.dto.OnbidItemDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ItemMapper {

    /** 마감 임박 N개 (홈 미리보기용) */
    List<OnbidItemDto> selectImminent(@Param("limit") int limit);

    /** 전체 공매 목록 */
    List<OnbidItemDto> selectAll();

    /** /api/auctions 검색용 (limit + q + deadlineOnly) */
    List<OnbidItemDto> selectAuctions(
        @Param("limit") int limit,
        @Param("q") String q,
        @Param("deadlineOnly") boolean deadlineOnly,
        @Param("sort") String sort 
    );

    /** 수집 시 item_current upsert용 */
    int upsertItem(Item it);
}


