package com.of.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.of.dto.OnbidItemDto;
import com.of.service.AuctionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;

    /** 최근/임박 공매 조회 (DB 기반) */
    @GetMapping
    public List<OnbidItemDto> recent(
            @RequestParam(defaultValue = "3") int limit
    ) {
        return auctionService.getRecent(limit);
    }
}
