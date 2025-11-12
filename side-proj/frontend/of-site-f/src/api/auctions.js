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
    return `${y}-${m}-${d}T00:00:00`;
  }
  return s || "";
};

const toJsDate = (s) => {
  if (!s) return null;
  const v = String(s);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(v)) {
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }
  return null;
};

const tryParse = (s) => {
  try { return JSON.parse(s); } catch { return {}; }
};

// 0, 00000000, 00000000000000 같은 비유효 날짜 제거
const cleanDateRaw = (s) => {
  const v = String(s ?? "").trim();
  const digits = v.replace(/\D/g, "");
  if (!digits || /^0+$/.test(digits)) return "";
  return v;
};

/* ---------- normalizer ---------- */
function normalizeList(raw) {
  const data = typeof raw === "string" ? tryParse(raw) : (raw ?? {});
  const root = data.response ?? data;
  const body = root.body ?? data.body ?? {};
  const items = body.items?.item ?? body.item ?? [];
  const arr = Array.isArray(items) ? items : (items ? [items] : []);

  return arr.map((it, i) => {
    // 가격 후보 흡수
    const min = toNum(
      it?.LOWEST_PBCT_AMT ??
      it?.MIN_BID_PRC ??
      it?.MIN_BID_AMT ??
      it?.LOW_PBCT_AMT ??
      it?.MIN_BID_AMOUNT ?? 0
    );

    // 주소 후보
    const addr =
      it?.LDNM_ADRS || it?.NMRD_ADRS || it?.ADDR || it?.CLTR_ADRS || "";

    // 날짜 원본 → ISO → TS
    const beginRaw = it?.PBCT_BEGN_DTM ?? it?.PBCT_BEGN_DT ?? it?.PBCT_BEGN_YMD ?? "";
    const endRaw   = it?.PBCT_CLS_DTM  ?? it?.PBCT_CLS_DT  ?? it?.PBCT_CLS_YMD  ?? "";
    const beginISO = toIsoDate(beginRaw);
    const endISO   = toIsoDate(endRaw);
    const beginTs  = beginISO ? new Date(beginISO).getTime() : null;
    const endTs    = endISO   ? new Date(endISO).getTime()   : null;

    // uid(고유키): 공매번호 + 서브키(히스토리/조건/대체키) 조합
    const subKey =
      it?.CLTR_HSTR_NO || it?.PBCT_CDTN_NO || it?.CLTR_MNMT_NO || it?.CLTR_NO;
    const uid =
      [it?.PBCT_NO, subKey].filter(Boolean).join("-") ||
      (it?.PBCT_NO ? `${it.PBCT_NO}-${i}` : String(i));

    // 화면 공통 모델
    return {
      uid,
      id: it?.PBCT_NO || it?.CLTR_MNMT_NO || it?.CLTR_NO || i,
      title: it?.CLTR_NM ?? "(무제)",
      category: it?.CTGR_FULL_NM ?? "",
      address: String(addr).trim(),
      minPrice: min,

      // 날짜(원본+ISO+TS 모두 제공)
      beginDate: beginRaw,
      endDate: endRaw,
      beginDateISO: beginISO || "",
      endDateISO: endISO || "",
      beginTs: Number.isFinite(beginTs) ? beginTs : null,
      endTs: Number.isFinite(endTs) ? endTs : null,

      bids: toNum(it?.USCBD_CNT),
      views: toNum(it?.IQRY_CNT),
      status: it?.PBCT_CLTR_STAT_NM ?? "",
      raw: it,
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
    timeout: 60000,
    ...axiosConfig,
  });

  // 정규화
  let list = normalizeList(data);

  // ✅ uid 기준 중복 제거
  const uniq = [];
  const seen = new Set();
  for (const it of list) {
    const k = it.uid ?? `${it.id}-${it.raw?.CLTR_HSTR_NO ?? it.raw?.PBCT_CDTN_NO ?? ""}`;
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(it);
  }
  list = uniq;

  // 검색(제목/주소/카테고리 내부 포함)
  if (q) {
    const needle = q.toLowerCase();
    list = list.filter(v =>
      (v.title || "").toLowerCase().includes(needle) ||
      (v.address || "").toLowerCase().includes(needle) ||
      (v.category || "").toLowerCase().includes(needle)
    );
  }

  // 마감 임박(3일 이내) — endTs 기준
  if (deadlineOnly) {
    const now = Date.now();
    const soon = 3 * 24 * 60 * 60 * 1000;
    list = list.filter(v => {
      const t = v.endTs;
      if (!t) return false;
      const diff = t - now;
      return diff > 0 && diff <= soon;
    });
  }

  return list;
}