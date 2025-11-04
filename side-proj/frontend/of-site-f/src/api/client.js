import axios from "axios";

const client = axios.create({
  baseURL: "/api", // 통합 배포 시 동일 도메인
  timeout: 10000,
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    // 간단 로깅
    console.error("[API ERROR]", err?.response || err);
    return Promise.reject(err);
  }
);

export default client;
