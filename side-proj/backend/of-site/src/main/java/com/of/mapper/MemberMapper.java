package com.of.mapper;

import com.of.domain.Member;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MemberMapper {

    Member findByEmail(@Param("email") String email);

    Member findById(@Param("id") Long id);

    int insertMember(Member member);
}