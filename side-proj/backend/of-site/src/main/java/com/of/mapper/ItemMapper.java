package com.of.mapper;

import org.apache.ibatis.annotations.Mapper;
import com.of.domain.Item;

@Mapper
public interface ItemMapper {
    int upsertItem(Item it);
}
