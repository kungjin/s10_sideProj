package com.of.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper 
public interface StagingMapper { 
	int insertRaw(@Param("source") 
	String source, @Param("noticeNo") 
	Long noticeNo, @Param("itemNo") 
	Long itemNo, @Param("payloadJson") 
	String payloadJson, @Param("contentHash") 
	String contentHash); 
	}
