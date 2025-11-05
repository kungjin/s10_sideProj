import axios from "axios";

const client = axios.create({
  baseURL: "http://127.0.0.1:8095/api",
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  console.log("[REQ]", config.method?.toUpperCase(), config.baseURL + config.url, config.params);
  return config;
});
client.interceptors.response.use(
  (res) => res,
  (err) => {
    // AxiosError 상세 보기
    console.error("[API ERROR] AxiosError", {
      code: err.code,
      message: err.message,
      url: err.config?.baseURL + err.config?.url,
      status: err.response?.status,
      data: err.response?.data,
    });
    return Promise.reject(err);
  }
);

export default client;
