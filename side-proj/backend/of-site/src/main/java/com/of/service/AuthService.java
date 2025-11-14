// src/main/java/com/of/service/AuthService.java
package com.of.service;

import com.of.domain.Member;
import com.of.dto.MemberResponse;
import com.of.dto.SignupRequest;
import com.of.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberMapper memberMapper;
    private final PasswordEncoder passwordEncoder;

    /** 회원가입 */
    public Member signup(SignupRequest dto) {
        // 이메일 중복 체크
        Member existing = memberMapper.findByEmail(dto.getEmail());
        if (existing != null) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        Member m = new Member();
        m.setEmail(dto.getEmail());
        m.setName(dto.getName());
        m.setBirthDate(dto.getBirthDate());
        m.setNationality(dto.getNationality());
        m.setPhone(dto.getPhone());
        m.setGender(dto.getGender());
        m.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        m.setRole("USER");

        memberMapper.insertMember(m);

        return memberMapper.findByEmail(dto.getEmail());
    }

    public Member findByEmail(String email) {
        return memberMapper.findByEmail(email);
    }

    public Member findById(Long id) {
        return memberMapper.findById(id);
    }

	public MemberResponse getMember(Long id) {
		 Member m = memberMapper.findById(id);
		    if (m == null) {
		        throw new RuntimeException("member not found");
		    }

		    return MemberResponse.from(m);
		
	}
}

