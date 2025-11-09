import axios from "axios";

const client = axios.create({
  baseURL: "http://127.0.0.1:8095/api",
  timeout: 60000, // ⬆ 60s
  headers: { Accept: "application/json" },
});

// (선택) 아주 간단한 재시도 1~2회
client.interceptors.response.use(
  res => res,
  async err => {
    const cfg = err.config;
    if (!cfg || cfg.__retry) throw err;
    if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
      cfg.__retry = true;
      return client(cfg); // 1회 재시도
    }
    throw err;
  }
);

export default client;
