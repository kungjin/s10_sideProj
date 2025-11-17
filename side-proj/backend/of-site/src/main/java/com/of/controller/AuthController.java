// src/main/java/com/of/controller/AuthController.java
package com.of.controller;

import com.of.dto.LoginRequest;
import com.of.dto.MemberResponse;
import com.of.dto.SignupRequest;
import com.of.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** 회원가입 */
    @PostMapping("/signup")
    public ResponseEntity<MemberResponse> signup(@Valid @RequestBody SignupRequest req) {
        MemberResponse res = authService.signup(req);   // ✅ 서비스가 바로 DTO 반환
        return ResponseEntity.ok(res);
    }

    /** 로그인 (세션 기반) */
    @PostMapping("/login")
    public ResponseEntity<MemberResponse> login(@Valid @RequestBody LoginRequest req) {
        MemberResponse res = authService.login(req);    // ✅ DTO 바로 사용
        return ResponseEntity.ok(res);
    }

    /** 현재 로그인한 사용자 정보 */
    @GetMapping("/me")
    public ResponseEntity<MemberResponse> me(Authentication authentication) {
        MemberResponse res = authService.getCurrentMember(authentication);
        return ResponseEntity.ok(res);
    }

    /** ID로 회원 조회 */
    @GetMapping(
            value = "/member/{id}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<MemberResponse> getMember(@PathVariable Long id) {
        MemberResponse res = authService.getMemberById(id);
        return ResponseEntity.ok(res);
    }
}
