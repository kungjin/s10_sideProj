package com.of.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.of.mapper.ItemMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dev")
public class TestController {
    private final ItemMapper itemMapper;

    @PostMapping("/test-item")
    public String testItemInsert() {
        var it = new com.of.domain.Item();
        it.setSource("ONBID");
        it.setNoticeNo(123456L);
        it.setItemNo(1L);
        it.setTitle("테스트 물건");
        it.setAddrLot(null);
        it.setAddrRoad("서울특별시 강남구 테스트로 1");
        it.setUsageName("업무시설");
        it.setSaleType("SALE");
        it.setMinBidPrice(new java.math.BigDecimal("100000000"));
        it.setAppraisalAmt(new java.math.BigDecimal("150000000"));
        it.setBidStartAt(java.time.LocalDateTime.now());
        it.setBidEndAt(java.time.LocalDateTime.now().plusDays(5));
        it.setStatusName("OPEN");
        it.setFailedCount(0);
        it.setViewCount(0);
        it.setContentHash("abc123hash");
        int rows = itemMapper.upsertItem(it);
        return "Inserted rows: " + rows;
    }
}

