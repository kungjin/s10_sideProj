// src/main/java/com/of/controller/AuthController.java
package com.of.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.of.domain.Member;
import com.of.dto.LoginRequest;
import com.of.dto.MemberResponse;
import com.of.dto.SignupRequest;
import com.of.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;

    /** 회원가입 */
    @PostMapping("/signup")
    public ResponseEntity<MemberResponse> signup(@Valid @RequestBody SignupRequest req) {
        Member m = authService.signup(req);
        return ResponseEntity.ok(toResponse(m));
    }

    /** 로그인 (세션 기반) */
    @PostMapping("/login")
    public ResponseEntity<MemberResponse> login(@Valid @RequestBody LoginRequest req) {
        Authentication authToken =
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword());

        Authentication auth = authenticationManager.authenticate(authToken);

        // 세션에 인증 정보 저장
        SecurityContextHolder.getContext().setAuthentication(auth);

        Member m = authService.findByEmail(req.getEmail());
        return ResponseEntity.ok(toResponse(m));
    }

    /** 현재 로그인한 사용자 정보 */
    @GetMapping("/me")
    public ResponseEntity<MemberResponse> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        Member m = authService.findByEmail(email);
        if (m == null) {
            return ResponseEntity.status(404).build();
        }

        return ResponseEntity.ok(toResponse(m));
    }
    
    @GetMapping(
    	    value = "/member/{id}",
    	    produces = MediaType.APPLICATION_JSON_VALUE
    	)
    	public MemberResponse getMember(@PathVariable Long id) {
    	    return authService.getMember(id);
    	}
    

    private MemberResponse toResponse(Member m) {
        MemberResponse res = new MemberResponse();
        res.setId(m.getId());
        res.setEmail(m.getEmail());
        res.setName(m.getName());
        res.setBirth(m.getBirthDate());
        res.setNationality(m.getNationality());
        res.setPhone(m.getPhone());
        res.setGender(m.getGender());
        res.setRole(m.getRole());
        return res;
    }
}

