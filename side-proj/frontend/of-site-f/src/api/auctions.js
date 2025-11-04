import client from "./client";
import { MOCK_AUCTIONS, MOCK_DETAIL } from "../lib/mock";

// 개발 중, 백엔드 준비 전엔 모의 데이터 우선
const useMock = import.meta.env.MODE === "development";

export async function getAuctions({ q = "", deadlineOnly = false } = {}) {
  if (useMock) {
    let list = [...MOCK_AUCTIONS];
    if (q) list = list.filter(v => v.title.includes(q));
    if (deadlineOnly) {
      const soon = new Date();
      soon.setDate(soon.getDate() + 7);
      list = list.filter(v => new Date(v.endDate) <= soon);
    }
    return list;
  }
  const { data } = await client.get("/auctions", { params: { q, deadlineOnly }});
  return data;
}

export async function getAuctionById(id) {
  if (useMock) return MOCK_DETAIL(id);
  const { data } = await client.get(`/auctions/${id}`);
  return data;
}
