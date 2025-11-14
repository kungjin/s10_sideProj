// src/api/auctions.js
import client from "./client";
import { parseOnbidDate } from "../utils/onbid";

// ✅ 목록 가져오기 (검색/필터 포함)
export async function getAuctions({
  limit = 50,
  q = "",
  deadlineOnly = false,
  axiosConfig = {},
} = {}) {
  const res = await client.get("/auctions", {
    params: {
      limit,
      q,
      deadlineOnly,
    },
    // axiosConfig 안의 signal 같은 건 params가 아니라 옵션으로
    signal: axiosConfig.signal,
  });

  const rows = res.data ?? [];

  return rows.map((row) => ({
    ...row,
    // 프론트에서 공통으로 쓸 id: "noticeNo-itemNo"
    id: `${row.noticeNo}-${row.itemNo}`,
    // 리스트에서 쓰고 싶으면 여기서도 endDate 미리 넣어줄 수 있음
    endDate: parseOnbidDate(row.bidEndAt),
  }));
}

// ✅ 디테일: 목록에서 찾아오는 버전 (그대로 쓰되, 새 getAuctions에 맞게 수정)
export async function getAuctionById(id, axiosConfig = {}) {
  if (!id) throw new Error("id is required");

  // 1) 목록을 넉넉히 불러와서
  const list = await getAuctions({ limit: 200, axiosConfig });

  // 2) id 기준으로 찾기
  const found =
    list.find((v) => String(v.id) === String(id)) ||
    list.find(
      (v) => `${v.noticeNo}-${v.itemNo}` === String(id)
    );

  if (!found) {
    throw new Error("Auction not found");
  }

  // 3) 디테일 페이지용 파싱 (날짜 변환까지)
  return {
    ...found,
    startDate: parseOnbidDate(found.bidStartAt),
    endDate: parseOnbidDate(found.bidEndAt),
  };
}


