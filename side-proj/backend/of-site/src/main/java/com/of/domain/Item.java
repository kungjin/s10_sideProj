// src/main/java/com/of/domain/Item.java
package com.of.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(of = {"source","itemNo"})
public class Item {
	private Long noticeNo;
    private Long itemNo;
    private String source;

    private String title;
    private String addrLot;
    private String addrRoad;
    private String usageName;

    private String saleType;
    private BigDecimal minBidPrice;
    private BigDecimal appraisalAmt;

    private LocalDateTime bidStartAt;
    private LocalDateTime bidEndAt;
    private String statusName;

    private Integer failedCount;
    private Integer viewCount;

    private String contentHash;

    // 🔹 여기 새로 추가
    private Integer missingCount;
}
