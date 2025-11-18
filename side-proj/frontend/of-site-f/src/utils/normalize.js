// src/utils/onbidRawNormalize.js (이 파일이라고 가정)

// 온비드 원본(JSON 변환 후)에서 배열 꺼내기
function pickItems(raw) {
  const r = raw?.response ?? raw;           // response 래핑 유무 모두 대응
  const items = r?.body?.items?.item;
  if (Array.isArray(items)) return items;
  if (items && typeof items === "object") return [items];
  return [];
}

// YYYYMMDD[HHMMSS] 문자열을 그대로 넘김
function pickEndDate(it) {
  return (
    it.PBCT_CLS_DTM ||      // 대표 마감 일시
    it.BID_CLS_DTM ||       // 일부 API 변형 필드
    it.PBCT_CLS_DTM_DT ||   // 날짜/시간 합성 필드
    null
  );
}

// (선택) 시작일도 같이 쓰고 싶으면
function pickStartDate(it) {
  return it.PBCT_BEGN_DTM || it.BID_BEGN_DTM || null;
}

import { normalizeAuctionItem } from "./auctionNormalize";

// 🔹 온비드 원본 → 우리 앱에서 쓰는 공통 아이템 형태로 정규화
export function normalizeList(raw) {
  const arr = pickItems(raw);

  return arr.map((it, idx) => {
    // 1차: 온비드 필드를 우리 도메인 필드명으로 변환
    const base = {
      // 도메인 키 (백엔드 DTO / DB랑 맞추기)
      noticeNo: it.PBCT_NO ? Number(it.PBCT_NO) : null,
      itemNo: it.CLTR_NO ? Number(it.CLTR_NO) : null,

      title: it.CLTR_NM ?? "",

      usageName: [it.CTGR_NM1, it.CTGR_NM2].filter(Boolean).join(" / "),
      addrRoad: it.NMRD_ADRS || it.LDNM_ADRS || "",

      // 가격 (최저입찰가 우선, 없으면 감정가)
      minBidPrice: it.MIN_BID_PRC ?? it.APSL_ASES_AVG_AMT ?? null,

      // 날짜: 나중에 safeEndDate/safeStartDate가 처리
      bidEndAt: pickEndDate(it),
      bidStartAt: pickStartDate(it),

      // 필요하면 여기에 statusName, failedCount 등도 매핑 가능
      // statusName: it.PBCT_CLTR_STAT_NM ?? null,
    };

    // 2차: 프론트 공통 normalize → AuctionCard / Auctions / Home에서 그대로 사용
    return normalizeAuctionItem(base, idx);
  });
}

