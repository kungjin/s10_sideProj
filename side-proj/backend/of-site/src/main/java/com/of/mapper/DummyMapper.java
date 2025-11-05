package com.of.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface DummyMapper {
    @Select("SELECT 1")
    int ping();
}

