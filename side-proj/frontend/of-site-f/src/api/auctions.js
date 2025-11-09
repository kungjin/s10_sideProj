// src/api/auctions.js
import client from "./client";

/* ---------- helpers ---------- */
const toNum = (v) => {
  const n = Number(String(v ?? "").replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const toIsoDate = (v) => {
  const s = String(v ?? "").trim();
  // 14자리: YYYYMMDDHHMMSS -> YYYY-MM-DDTHH:MM:SS
  if (/^\d{14}$/.test(s)) {
    const y = s.slice(0, 4), m = s.slice(4, 6), d = s.slice(6, 8);
    const hh = s.slice(8, 10), mm = s.slice(10, 12), ss = s.slice(12, 14);
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
  }
  // 8자리: YYYYMMDD -> YYYY-MM-DD
  if (/^\d{8}$/.test(s)) {
    const y = s.slice(0, 4), m = s.slice(4, 6), d = s.slice(6, 8);
    return `${y}-${m}-${d}`;
  }
  return s || "";
};

const toJsDate = (s) => {
  if (!s) return null;
  const v = String(s);
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?$/.test(v)) {
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }
  return null;
};

const tryParse = (s) => {
  try { return JSON.parse(s); } catch { return {}; }
};

/* ---------- normalizer ---------- */
// 백엔드(JSON 문자열일 수도 있음) → 공통 모델 배열
function normalizeList(raw) {
  const data = typeof raw === "string" ? tryParse(raw) : (raw ?? {});

  // 응답 루트가 response일 수도, 아닐 수도 있음 → 모두 대비
  const root = data.response ?? data;
  const body = root.body ?? data.body ?? {};
  const items = body.items?.item ?? body.item ?? [];
  const arr = Array.isArray(items) ? items : (items ? [items] : []);
  


  if (!arr.length) {
    console.warn("[normalizeList] empty items path. data keys:", Object.keys(data || {}));
  }

  return arr.map((it, i) => {
    const min = toNum(
      it?.LOWEST_PBCT_AMT ??
      it?.MIN_BID_PRC ??
      it?.MIN_BID_AMT ??
      it?.LOW_PBCT_AMT ??
      it?.MIN_BID_AMOUNT ?? 0
    );
      const uid = [
    it?.PBCT_NO,                               // 공매번호
    it?.CLTR_HSTR_NO || it?.CLTR_NO || it?.CLTR_MNMT_NO // 히스토리/대체키
  ].filter(Boolean).join("-") || String(i);

    // 주소 후보 다양성 커버
    const addr =
      it?.LDNM_ADRS ||
      it?.NMRD_ADRS ||
      it?.ADDR ||
      it?.CLTR_ADRS ||
      "";

    // 공매번호/대체키
    const id =
      it?.PBCT_NO ||
      it?.CLTR_MNMT_NO ||
      it?.CLTR_NO ||
      i;

    return {
      uid,                       // 👈 고유 키
      id: it?.PBCT_NO || it?.CLTR_MNMT_NO || it?.CLTR_NO || i, // 기존 식별자 유지
      title: it?.CLTR_NM ?? "(무제)",
      category: it?.CTGR_FULL_NM ?? "",
      minPrice: min, // ← 화면에서 이 키 사용
      beginDate: toIsoDate(it?.PBCT_BEGN_DTM) ?? "",
      endDate: toIsoDate(it?.PBCT_CLS_DTM) ?? "",
      address: String(addr).trim(),
      bids: toNum(it?.USCBD_CNT),
      views: toNum(it?.IQRY_CNT),
      status: it?.PBCT_CLTR_STAT_NM ?? "",
      raw: it, // 디버깅용 원본 보관
    };
  });
}

/* ---------- APIs ---------- */
export async function getAuctions(
  { q = "", pageNo = 1, numOfRows = 12, deadlineOnly = false } = {},
  axiosConfig = {}
) {
  const { data } = await client.get("/public/auctions", {
    params: { q, pageNo, numOfRows },
    timeout: 60000,          // ⬆ 타임아웃 상향
    ...axiosConfig,          // ⬅ AbortController signal 등 전달
  });

  let list = normalizeList(data);

  // 클라이언트 검색(옵션)
  if (q) {
    const needle = q.toLowerCase();
    list = list.filter(v => (v.title || "").toLowerCase().includes(needle));
  }

  // 마감 임박(3일 이내) 필터(옵션)
  if (deadlineOnly) {
    const now = Date.now();
    const soon = 3 * 24 * 60 * 60 * 1000;
    list = list.filter(v => {
      const dt = toJsDate(v.endDate);
      if (!dt) return false;
      const diff = dt.getTime() - now;
      return diff > 0 && diff <= soon;
    });
  }

  console.log("[getAuctions] normalized length =", list.length);
  if (list[0]) console.log("[getAuctions] first =", list[0]);
  return list;
}

// 단건 조회 API — 공매번호(id) 기반
export async function getAuctionById(id, axiosConfig = {}) {
  const { data } = await client.get(`/public/auctions/${encodeURIComponent(id)}`, {
    timeout: 60000,   // 요청 제한시간 60초
    ...axiosConfig,   // (추가 설정 병합 — AbortController.signal 등)
  });

  // 서버가 문자열 또는 JSON을 줄 수 있으므로 방어적으로 처리
  try {
    const raw = typeof data === "string" ? JSON.parse(data) : data;
    const list = normalizeList(raw);
    return list[0] || null;  // 정규화된 배열의 첫 번째 항목 반환
  } catch {
    // 혹시 JSON 파싱 실패 시 한 번 더 시도
    const list = normalizeList(data);
    return list[0] || null;
  }
}


