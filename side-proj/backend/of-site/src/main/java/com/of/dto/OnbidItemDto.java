package com.of.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OnbidItemDto {
    private Long noticeNo;          // PBCT_NO (공고번호)
    private Long itemNo;            // CLTR_NO (물건번호)
    private String title;           // CLTR_NM
    private String addrRoad;        // ADDR_RD
    private String usageName;       // CTGR_FULL_NM
    private String saleType;        // DPSL_MTD_CD → SALE / RENT
    private BigDecimal minBidPrice; // MIN_BID_PRC
    private BigDecimal appraisalAmt;// APSL_ASES_AVG_AMT
    private String bidStartAt;      // PBCT_BEGN_DTM (문자열 그대로)
    private String bidEndAt;        // PBCT_CLS_DTM
    private String statusName;      // PBCT_CLTR_STAT_NM
    private Integer failedCount;    // USCBD_CNT
    private Integer viewCount;      // IQRY_CNT
}

