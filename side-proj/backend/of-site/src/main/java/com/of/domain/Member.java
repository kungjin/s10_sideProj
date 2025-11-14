package com.of.domain;

import lombok.Data;

@Data
public class Member {
	private Long id;
	
	private String email;
	private String passwordHash;
	
	private String name;
	private String birthDate;
	private String nationality;
	private String phone;
	private String gender;
	
	private String role;
	private java.time.LocalDateTime createdAt;
	
}
