// 온비드 원본(JSON 변환 후)에서 배열 꺼내기
function pickItems(raw) {
  const r = raw?.response ?? raw;           // response 래핑 유무 모두 대응
  const items = r?.body?.items?.item;
  if (Array.isArray(items)) return items;
  if (items && typeof items === "object") return [items];
  return [];
}

// YYYYMMDD[HHMMSS] 문자열을 그대로 넘김(렌더에서 parse)
function pickEndDate(it) {
  return (
    it.PBCT_CLS_DTM ||      // 대표 마감 일시
    it.BID_CLS_DTM ||       // 일부 API 변형 필드가 있을 수 있음
    it.PBCT_CLS_DTM_DT ||   // 혹시 날짜/시간 분리된 경우의 합성 필드를 쓰면 여기로
    null
  );
}

export function normalizeList(raw) {
  const arr = pickItems(raw);
  return arr.map(it => ({
    uid: `${it.PBCT_NO ?? ""}-${it.CLTR_NO ?? ""}`,
    id: String(it.PBCT_NO ?? ""),
    title: it.CLTR_NM ?? "",
    category: [it.CTGR_NM1, it.CTGR_NM2].filter(Boolean).join(" / "),
    address: it.LDNM_ADRS || it.NMRD_ADRS || "",
    minPrice: Number(it.MIN_BID_PRC ?? it.APSL_ASES_AVG_AMT ?? 0),
    endDate: pickEndDate(it),               // ✅ 여기서 매핑
  }));
}
