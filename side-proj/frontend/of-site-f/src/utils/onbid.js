export function parseOnbidDate(input) {
  if (!input) return null;
  const raw = String(input).trim();

  // 1) 이미 DB/ISO 스타일 날짜인 경우 (YYYY-MM-DD...)
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const dt = new Date(raw);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // 2) 숫자만 있는 온비드 포맷 (YYYYMMDD or YYYYMMDDHHMMSS)
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8 && digits.length !== 14) {
    return null; // 예상하지 못한 포맷은 null
  }

  const str = digits.padEnd(14, "0"); // HHMMSS 없으면 0으로 채움
  const y = str.slice(0, 4);
  const m = str.slice(4, 6);
  const d = str.slice(6, 8);
  const hh = str.slice(8, 10);
  const mm = str.slice(10, 12);
  const ss = str.slice(12, 14);
  const iso = `${y}-${m}-${d}T${hh}:${mm}:${ss}`;

  const dt = new Date(iso);
  return isNaN(dt.getTime()) ? null : dt;
}
