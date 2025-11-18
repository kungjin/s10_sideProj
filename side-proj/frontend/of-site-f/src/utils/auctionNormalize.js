// src/utils/auctionNormalize.js
import { parseOnbidDate } from "./onbid";

// 🔹 안전한 가격 추출
export const safePrice = (item) => {
  const raw =
    item?.minBid ??
    item?.minBidPrice ??
    item?.min_bid_price ??
    item?.minPrice ??
    item?.min_price ??
    0;

  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

// 🔹 마감일 Date 추출
export const safeEndDate = (item) => {
  if (!item) return null;

  const raw = item.bidEndAt ?? item.bid_end_at ?? item.endDate ?? item.end_date;
  if (!raw) return null;

  const d1 = new Date(raw);
  if (!isNaN(d1.getTime())) return d1;

  const d2 = parseOnbidDate(raw);
  if (d2 && !isNaN(d2.getTime())) return d2;

  return null;
};

// 🔹 시작일 Date 추출
export const safeStartDate = (item) => {
  if (!item) return null;

  const raw =
    item.bidStartAt ?? item.bid_start_at ?? item.startDate ?? item.start_date;
  if (!raw) return null;

  const d1 = new Date(raw);
  if (!isNaN(d1.getTime())) return d1;

  const d2 = parseOnbidDate(raw);
  if (d2 && !isNaN(d2.getTime())) return d2;

  return null;
};

// 🔹 공통 정규화: Auctions / Home / 온비드 원본 모두 여기 통일
export const normalizeAuctionItem = (item, idx = 0) => {
  const noticeNo = item.noticeNo ?? item.notice_no;
  const itemNo = item.itemNo ?? item.item_no;

  const endDate = safeEndDate(item);
  const startDate = safeStartDate(item);

  const id =
    item.id ??
    (noticeNo && itemNo ? `${noticeNo}-${itemNo}` : `idx-${idx}`);

  const uid =
    item.uid ??
    (noticeNo && itemNo ? `${noticeNo}-${itemNo}` : `idx-${idx}`);

  return {
    ...item,
    id,
    uid,
    minBid: safePrice(item),
    endDate,
    endDateISO: endDate ? endDate.toISOString() : null,
    startDate,
    address: item.addrRoad ?? item.address,
    category: item.usageName ?? item.category,
  };
};
