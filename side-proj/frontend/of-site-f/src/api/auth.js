// src/api/auth.js
import client from "./client";

// 회원가입
export async function signup(form) {
  const res = await client.post("/auth/signup", form);
  return res.data;
}

// 로그인
export async function login({ email, password }) {
  const res = await client.post("/auth/login", { email, password });
  return res.data;
}
