package com.of.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.of.service.IngestService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public")
public class PublicController {

    private final IngestService ingestService;

    /** 
     * 테스트용 수동 수집 API
     * 예: GET http://localhost:8095/api/public/ingest
     */
    @GetMapping("/ingest")
    public Map<String, Object> ingestOnce(
    		@RequestParam(name = "pageNo", defaultValue = "1") int pageNo,
            @RequestParam(name = "numOfRows", defaultValue = "50") int numOfRows
    ) {
        Map<String, String> params = Map.of(
                "pageNo", String.valueOf(pageNo),
                "numOfRows", String.valueOf(numOfRows),
                "DPSL_MTD_CD", "0001",       // 매각
                "PBCT_BEGN_DTM", "20250801", // 공고 시작일 (원하면 나중에 파라미터로 뺄 수 있음)
                "PBCT_CLS_DTM", "20251231"  // 공고 마감일
        );

        int inserted = ingestService.ingestOnce(params);  // ← 여기서 upsert 수행
        return Map.of(
        		"result", "success",
                "inserted", inserted,
                "pageNo", pageNo,
                "numOfRows", numOfRows
        );
    }

    /** ② 여러 페이지 한번에 수집 (insert+update=upsert)
     *   예: POST http://localhost:8095/api/public/ingest/bulk?startPage=1&endPage=3
     */
    @PostMapping("/ingest/bulk")
    public Map<String, Object> ingestBulk(
    	      @RequestParam(name = "startPage", defaultValue = "1") int startPage,
              @RequestParam(name = "endPage", defaultValue = "3") int endPage
    ) {
        int total = ingestService.ingestMany(startPage, endPage);
        return Map.of(
        		  "result", "success",
                  "rows", total,
                  "startPage", startPage,
                  "endPage", endPage
        );
    }
}
   



