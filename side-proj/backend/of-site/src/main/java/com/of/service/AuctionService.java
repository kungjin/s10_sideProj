package com.of.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.of.mapper.ItemMapper;
import com.of.dto.OnbidItemDto;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuctionService {

    private final ItemMapper itemMapper;
    
    /** 전체 공매 목록 (마감일 오름차순) */
    public List<OnbidItemDto> getAll() {
        // 🔧 XML의 <select id="selectAll"> 과 연결
        return itemMapper.selectAll();
    }

    /** 마감 임박 N개 (홈 미리보기용) */
    public List<OnbidItemDto> getImminent(int limit) {
        // 🔧 XML의 <select id="selectImminent"> 과 연결
        return itemMapper.selectImminent(limit);
    }
    
    public List<OnbidItemDto> findAuctions(int limit, String q, boolean deadlineOnly, String sort) {
        // null 이면 기본값 "latest"
        String safeSort = (sort == null || sort.isBlank()) ? "latest" : sort;
        return itemMapper.selectAuctions(limit, q, deadlineOnly, safeSort);
    }
}
