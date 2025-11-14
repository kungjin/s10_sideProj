package com.of.dto;

import java.time.format.DateTimeFormatter;

import com.of.domain.Member;

import lombok.Data;

@Data
public class MemberResponse {
    private Long id;
    private String email;
    private String name;
    private String birth;          // ← Member의 birth 이름과 맞춰야 함
    private String nationality;
    private String phone;
    private String gender;
    private String role;
    private String createdAt;      // ← 프론트용이므로 String이 더 좋음

    public static MemberResponse from(Member m) {
        MemberResponse dto = new MemberResponse();

        dto.setId(m.getId());
        dto.setEmail(m.getEmail());
        dto.setName(m.getName());
        dto.setBirth(m.getBirthDate());
        dto.setNationality(m.getNationality());
        dto.setPhone(m.getPhone());
        dto.setGender(m.getGender());
        dto.setRole(m.getRole());

        // LocalDateTime → String 변환
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

