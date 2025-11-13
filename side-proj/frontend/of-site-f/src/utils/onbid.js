export function parseOnbidDate(s) {
  if (!s) return null;
  const str = String(s).padEnd(14, "0");
  const y = str.slice(0, 4);
  const m = str.slice(4, 6);
  const d = str.slice(6, 8);
  const hh = str.slice(8, 10);
  const mm = str.slice(10, 12);
  const ss = str.slice(12, 14);
  return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}`);
}
