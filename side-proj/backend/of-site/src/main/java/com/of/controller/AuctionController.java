package com.of.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.of.dto.OnbidItemDto;
import com.of.service.AuctionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;

    /** 홈 미리보기용: 마감 임박 3개 */
    @GetMapping("/preview")
    public List<OnbidItemDto> preview() {
        return auctionService.getImminent(3);
    }

    /** /auctions 페이지용: DB 기반 검색/필터 */
    @GetMapping
    public List<OnbidItemDto> list(
            @RequestParam(name = "limit", defaultValue = "50") int limit,
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "deadlineOnly", defaultValue = "false") boolean deadlineOnly,
            @RequestParam(required = false) String sort
    ) {
        return auctionService.findAuctions(limit, q, deadlineOnly, sort);
    }
}

