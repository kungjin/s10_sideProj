import client from "./client";

const toNum = v => {
  const n = Number(String(v ?? "").replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const tryParse = s => { try { return JSON.parse(s); } catch { return {}; } };

// 백엔드(JSON 문자열일 수도 있음) → 공통 모델 배열
function normalizeList(raw) {
  const data  = typeof raw === "string" ? tryParse(raw) : raw;
  const items = data?.response?.body?.items?.item ?? [];
  const arr   = Array.isArray(items) ? items : [items];
  return arr.map((it, i) => {
    const min = toNum(it.MIN_BID_PRC);   // ← 공통 값을 먼저 계산
    return {
      id: it.PBCT_NO ?? i,
      title: it.CLTR_NM ?? "(무제)",
      category: it.CTGR_FULL_NM ?? "",
      minPrice: min,
      minBid: min,                        // ← ★ 컴포넌트 호환용 별칭 추가
      beginDate: it.PBCT_BEGN_DTM ?? "",
      endDate: it.PBCT_CLS_DTM ?? "",
      address: it.LDNM_ADRS || it.NMRD_ADRS || "",
      bids: toNum(it.USCBD_CNT),
      views: toNum(it.IQRY_CNT),
      status: it.PBCT_CLTR_STAT_NM ?? "",
      raw: it,
    };
  });
}

export async function getAuctions({ q = "", pageNo = 1, numOfRows = 12 } = {}) {
  try {
    const { data } = await client.get("/public/auctions", {
      params: { q, pageNo, numOfRows },
      timeout: 10000, // ← 권장
    });
    let list = normalizeList(data);
    if (q) list = list.filter(v => v.title.includes(q)); // 서버에서 q 필터 안 하면 유지
    console.log('[getAuctions] normalized length =', list.length);
    return list;
  } catch (e) {
    console.error("[getAuctions] error", e);
    throw e; // ← 컴포넌트에서 err UI 표시
  }
}

export async function getAuctionById(id) {
  const { data } = await client.get(`/public/auctions/${id}`, { timeout: 10000 });
  return data; // 필요 시 normalizeDetail 적용 가능
}
