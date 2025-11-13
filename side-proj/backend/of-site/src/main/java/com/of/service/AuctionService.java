package com.of.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.of.mapper.ItemMapper;
import com.of.dto.OnbidItemDto;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuctionService {
    private final ItemMapper itemMapper;

    public List<OnbidItemDto> getRecent(int limit) {
        return itemMapper.findRecent(limit);
    }
}