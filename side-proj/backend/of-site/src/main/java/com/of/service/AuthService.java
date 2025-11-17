// src/main/java/com/of/service/AuthService.java
package com.of.service;

import java.util.List;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.of.domain.Member;
import com.of.dto.LoginRequest;
import com.of.dto.MemberResponse;
import com.of.dto.SignupRequest;
import com.of.mapper.MemberMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final MemberMapper memberMapper;
//    private final PasswordEncoder passwordEncoder;
//    private final AuthenticationManager authenticationManager;

    /** 회원가입 */
    public MemberResponse signup(SignupRequest dto) {
        // 이메일 중복 체크
        Member existing = memberMapper.findByEmail(dto.getEmail());
        if (existing != null) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        Member m = new Member();
        m.setEmail(dto.getEmail());
        m.setName(dto.getName());
        m.setBirthDate(dto.getBirthDate());
        m.setNationality(dto.getNationality());
        m.setPhone(dto.getPhone());
        m.setGender(dto.getGender());
        m.setPasswordHash(dto.getPassword());
        m.setRole("USER");

        memberMapper.insertMember(m);

        Member saved = memberMapper.findByEmail(dto.getEmail());
        log.info("New member signed up: {}", saved.getEmail());

        return MemberResponse.from(saved);
    }

    /** 로그인 (세션 기반) */
    public MemberResponse login(LoginRequest req) {

        // 1) DB에서 사용자 찾기
        Member m = memberMapper.findByEmail(req.getEmail());
        if (m == null) {
            throw new IllegalArgumentException("존재하지 않는 이메일입니다.");
        }

        // 2) 패스워드 평문 비교 (BCrypt 제거)
        if (!m.getPasswordHash().equals(req.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // 3) 세션에 로그인 정보 넣기 (Spring Security 없이 직접)
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(
                    m.getEmail(),
                    null,
                    List.of(() -> "ROLE_USER")
                );
        SecurityContextHolder.getContext().setAuthentication(authToken);

        return MemberResponse.from(m);
    }


    /** 현재 로그인한 사용자 조회 */
    public MemberResponse getCurrentMember(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }

        String email = authentication.getName();
        Member m = memberMapper.findByEmail(email);
        if (m == null) {
            throw new IllegalArgumentException("회원 정보를 찾을 수 없습니다.");
        }

        return MemberResponse.from(m);
    }

    /** ID로 회원 조회 (DTO) */
    public MemberResponse getMemberById(Long id) {
        Member m = memberMapper.findById(id);
        if (m == null) {
            throw new IllegalArgumentException("member not found");
        }
        return MemberResponse.from(m);
    }

    /** 필요하면 아직 Entity로도 제공 */
    public Member findByEmail(String email) {
        return memberMapper.findByEmail(email);
    }

    public Member findById(Long id) {
        return memberMapper.findById(id);
    }
}


