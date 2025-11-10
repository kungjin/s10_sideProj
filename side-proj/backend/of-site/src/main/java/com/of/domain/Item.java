// src/main/java/com/of/domain/Item.java
package com.of.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class Item {
    private String source;
    private Long noticeNo;
    private Long itemNo;
    private String title;
    private String addrLot;
    private String addrRoad;
    private String usageName;
    private String saleType;             // 'SALE' or 'RENT'
    private BigDecimal minBidPrice;
    private BigDecimal appraisalAmt;
    private LocalDateTime bidStartAt;
    private LocalDateTime bidEndAt;
    private String statusName;
    private Integer failedCount;
    private Integer viewCount;
    private String contentHash;
}
