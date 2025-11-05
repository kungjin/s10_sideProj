import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuctions } from "../api/auctions";
import Card from "../components/Card";
import Badge from "../components/Badge";

// ONBID 날짜(YYYYMMDDHHMMSS or YYYYMMDD) -> Date 객체
function parseOnbidDate(s) {
  if (!s) return null;
  const str = String(s).padEnd(14, "0"); // HHMMSS 없으면 0으로 보정
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

export default function Auctions() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [deadlineOnly, setDeadlineOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function fetchData() {
    setLoading(true);
    setErr("");
    try {
      const data = await getAuctions({ q, deadlineOnly, pageNo: 1, numOfRows: 12 });
      setList(data);
      // 디버깅용: console.log(data);
    } catch (e) {
      console.error(e);
      setErr("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ 검색/필터 변경 시에도 재조회
  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [q, deadlineOnly]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <h2 className="text-2xl font-bold">공매 탐색</h2>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="주소/물건명 검색"
            className="px-3 py-2 rounded-button border border-line bg-white w-56"
          />
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={deadlineOnly}
              onChange={(e)=>setDeadlineOnly(e.target.checked)}
            />
            마감 임박
          </label>
          <button onClick={fetchData} className="btn btn-primary">검색</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {loading && <Card>불러오는 중…</Card>}
        {!loading && err && <Card>{err}</Card>}
        {!loading && !err && list.length === 0 && <Card>검색 결과가 없습니다.</Card>}

        {!loading && !err && list.map(item => {
          // ✅ 날짜 파싱
          const endDt = parseOnbidDate(item.endDate);
          const isSoon = endDt ? (endDt.getTime() - Date.now()) < 1000*60*60*24*3 : false;

          // ✅ 필드명: minBid -> minPrice 로 수정
          const price = Number(item.minPrice ?? 0);

          return (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link to={`/auctions/${item.id}`} className="text-lg font-semibold hover:underline">
                    {item.title}
                  </Link>
                  <div className="mt-1 text-sm text-subink">{item.category}</div>
                </div>

                <Badge tone={isSoon ? "danger" : "info"}>
                  {endDt ? `${endDt.toLocaleDateString()} 마감` : "마감일 정보 없음"}
                </Badge>
              </div>

              <div className="mt-4 text-sm">
                최저입찰가{" "}
                <span className="font-semibold">
                  {price.toLocaleString()}원
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
