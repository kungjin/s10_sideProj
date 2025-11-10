package com.of.controller;

import com.of.service.IngestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
    public ResponseEntity<?> ingest() {
        // 요청 파라미터 구성 (원하면 프론트에서 동적으로 받을 수도 있음)
        Map<String, String> params = Map.of(
                "pageNo", "1",
                "numOfRows", "10",
                "DPSL_MTD_CD", "0001",         // 매각 방식 (0001: 매각, 0002: 임대)
                "PBCT_BEGN_DTM", "20250801",   // 공고 시작일
                "PBCT_CLS_DTM", "20251110"     // 공고 마감일
        );

        int inserted = ingestService.ingestOnce(params);
        return ResponseEntity.ok(Map.of(
                "result", "success",
                "inserted", inserted
        ));
    }
}
