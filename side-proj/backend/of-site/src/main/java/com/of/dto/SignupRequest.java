package com.of.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String birthDate;  // "YYYY-MM-DD" 포맷으로 받기

    @NotBlank
    private String nationality;

    @NotBlank
    private String phone;

    @NotBlank
    private String gender;     // "M", "F", "OTHER"

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;
}