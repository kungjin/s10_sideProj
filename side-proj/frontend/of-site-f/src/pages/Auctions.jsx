// src/pages/Auctions.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getAuctions } from "../api/auctions";
import AuctionCard from "../components/AuctionCard";
import Card from "../components/Card";
import SearchBar from "../components/SearchBar";

// 유틸: ONBID 날짜 파싱
function parseOnbidDate(s) {
  if (!s) return null;
  const str = String(s).padEnd(14, "0");
  const dt = new Date(
    `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}T${str.slice(8, 10)}:${str.slice(10, 12)}:${str.slice(12, 14)}`
  );
  return isNaN(dt.getTime()) ? null : dt;
}

export default function Auctions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 🔹 URL에서 진실을 읽음
  const q = (searchParams.get("q") || "").trim();
  const deadlineOnly = (searchParams.get("deadlineOnly") || "") === "1";

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const abortRef = useRef(null);

  // 🔹 URL이 바뀌면 fetch
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await getAuctions({
          q,
          deadlineOnly,
          pageNo: 1,
          numOfRows: 12,
          axiosConfig: { signal: ctrl.signal },
        });
        setList(data);
      } catch (e) {
        if (e.name !== "CanceledError" && e.code !== "ERR_CANCELED") {
          console.error("[Auctions] 요청 실패:", e);
          setErr("데이터를 불러오지 못했습니다.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [q, deadlineOnly]);

  // 🔹 SearchBar가 제출하면 URL을 갱신 → 양쪽 페이지 동기화
  const handleSearchSubmit = (nextQ, nextDeadlineOnly) => {
    const sp = new URLSearchParams(searchParams);
    if (nextQ) sp.set("q", nextQ); else sp.delete("q");
    if (nextDeadlineOnly) sp.set("deadlineOnly", "1"); else sp.delete("deadlineOnly");
    setSearchParams(sp, { replace: false });
    // 목록 페이지 유지
    if (location.pathname !== "/auctions") navigate(`/auctions?${sp.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <h2 className="text-2xl font-bold">공매 탐색</h2>
        <SearchBar
          initial={q}
          initialDeadlineOnly={deadlineOnly}
          onSubmit={handleSearchSubmit}
          placeholder="주소/물건명 검색"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {loading && <Card>불러오는 중…</Card>}
        {!loading && err && <Card>{err}</Card>}
        {!loading && !err && list.length === 0 && <Card>검색 결과가 없습니다.</Card>}

        {!loading && !err && list.map((item) => (
          <AuctionCard key={item.uid} item={item} />
        ))}

      </div>
    </div>
  );
}
