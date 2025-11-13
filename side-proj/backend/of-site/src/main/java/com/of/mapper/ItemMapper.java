package com.of.mapper;

import com.of.domain.Item;
import com.of.dto.OnbidItemDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ItemMapper {

    // 수집용: 정규화된 Item 도메인 UPSERT
    int upsertItem(Item item);

    // 프론트 조회용: 최근 공매 리스트
    List<OnbidItemDto> findRecent(@Param("limit") int limit);

    // 프론트 조회용: 상세
    OnbidItemDto findOne(
            @Param("noticeNo") long noticeNo,
            @Param("itemNo") long itemNo
    );
}
