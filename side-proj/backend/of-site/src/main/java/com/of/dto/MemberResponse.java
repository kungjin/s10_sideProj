package com.of.dto;

import java.time.format.DateTimeFormatter;

import com.of.domain.Member;

import lombok.Data;

@Data
public class MemberResponse {
    private Long id;
    private String email;
    private String name;
    private String birth;          // 프론트에서 쓸 필드명
    private String nationality;
    private String phone;
    private String gender;
    private String role;
    private String createdAt;      // "yyyy-MM-dd HH:mm:ss" 포맷 문자열

    public static MemberResponse from(Member m) {
        MemberResponse dto = new MemberResponse();

        dto.setId(m.getId());
        dto.setEmail(m.getEmail());
        dto.setName(m.getName());
        dto.setBirth(m.getBirthDate());          // String → String 그대로
        dto.setNationality(m.getNationality());
        dto.setPhone(m.getPhone());
        dto.setGender(m.getGender());
        dto.setRole(m.getRole());

        if (m.getCreatedAt() != null) {
            dto.setCreatedAt(
                m.getCreatedAt().format(
                    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                )
            );
        }

        return dto;
    }
}
