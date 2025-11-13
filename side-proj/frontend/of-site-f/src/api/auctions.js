// src/api/auctions.js
import client from "./client";
import { parseOnbidDate } from "../utils/onbid"; // 이미 있는 날짜 파서 재사용

// DB에서 받아온 row 그대로에서 id 붙여주기
export async function getAuctions(limit = 12) {
  const res = await client.get("/auctions", { params: { limit } });
  const rows = res.data ?? [];

  return rows.map((row) => ({
    ...row,
    // 프론트에서 공통으로 쓸 id: "noticeNo-itemNo"
    id: `${row.noticeNo}-${row.itemNo}`,
  }));
}

// ✅ 디테일 API 없이, 목록에서 찾아오는 버전
export async function getAuctionById(id) {
  if (!id) throw new Error("id is required");

  // 1) 목록을 넉넉히 불러와서
  const list = await getAuctions(100);

  // 2) id 기준으로 찾기
  const found =
    list.find((v) => String(v.id) === String(id)) ||
    list.find(
      (v) =>
        `${v.noticeNo}-${v.itemNo}` === String(id)
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

