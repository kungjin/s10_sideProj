// src/pages/Auctions.jsx
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAuctions } from "../api/auctions";
import AuctionCard from "../components/AuctionCard";
import Card from "../components/Card";
import SearchBar from "../components/SearchBar";
import { parseOnbidDate } from "../utils/onbid";

// 🔹 안전한 가격 추출 (문자열/nullable 다 커버)
const safePrice = (item) => {
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

// 🔹 마감일 Date 추출: DB DATETIME + ONBID 문자열 둘 다 지원
const safeEndDate = (item) => {
  if (!item) return null;

  const raw = item.bidEndAt ?? item.bid_end_at ?? item.endDate ?? item.end_date;
  if (!raw) return null;

  // 1) DB DATETIME (“2025-11-15 15:24:52.000000”)
  const d1 = new Date(raw);
  if (!isNaN(d1.getTime())) return d1;

  // 2) 안 되면 ONBID(YYYYMMDDHHMMSS) 포맷으로 시도
  const d2 = parseOnbidDate(raw);
  if (d2 && !isNaN(d2.getTime())) return d2;

  return null;
};

// 🔹 시작일 Date 추출
const safeStartDate = (item) => {
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

export default function Auctions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 🔹 URL에서 쿼리 읽기
  const q = (searchParams.get("q") || "").trim();
  const deadlineOnly = (searchParams.get("deadlineOnly") || "") === "1";
  const sort = searchParams.get("sort") || "latest"; // latest | price | deadline

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const abortRef = useRef(null);

  // 🔹 URL(q, deadlineOnly, sort)이 바뀔 때마다 목록 로드
  useEffect(() => {
    // 이전 요청 취소
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      setLoading(true);
      setErr("");

      try {
        // 👉 백엔드 /api/auctions (DB 기반)
        const raw = await getAuctions({
          limit: 50,
          q,
          deadlineOnly,
          sort,
          axiosConfig: { signal: ctrl.signal },
        });

        console.log("[Auctions] raw sample =", raw?.[0]);

        // 1) 공통 필드 normalize
        const normalized = (raw || []).map((item, idx) => {
          const noticeNo = item.noticeNo ?? item.notice_no;
          const itemNo = item.itemNo ?? item.item_no;

          const endDate = safeEndDate(item);
          const startDate = safeStartDate(item);

          return {
            ...item,
            // ✅ 디테일 링크용 id, 카드 key용 uid
            id:
              item.id ??
              (noticeNo && itemNo
                ? `${noticeNo}-${itemNo}`
                : `idx-${idx}`),
            uid:
              item.uid ??
              (noticeNo && itemNo
                ? `${noticeNo}-${itemNo}`
                : `idx-${idx}`),

            // 정렬용/카드용 공통 필드
            minBid: safePrice(item),
            endDate,
            endDateISO: endDate ? endDate.toISOString() : null,
            startDate,
            address: item.addrRoad ?? item.address,
            category: item.usageName ?? item.category,
          };
        });

        // 2) 프론트에서 검색 필터 (주소/물건명/카테고리)
        const filtered = q
          ? normalized.filter((it) => {
              const key = (
                (it.title ?? "") +
                " " +
                (it.address ?? "") +
                " " +
                (it.category ?? "")
              )
                .toLowerCase()
                .trim();
              return key.includes(q.toLowerCase());
            })
          : normalized;

        // 3) 정렬 적용
        const sorted = [...filtered].sort((a, b) => {
          switch (sort) {
            case "price": {
              const pa = safePrice(a);
              const pb = safePrice(b);
              return pa - pb; // 오름차순: 싼 거 → 비싼 거
            }
            case "deadline": {
              const ea = safeEndDate(a);
              const eb = safeEndDate(b);
              const ta = ea ? ea.getTime() : Number.MAX_SAFE_INTEGER;
              const tb = eb ? eb.getTime() : Number.MAX_SAFE_INTEGER;
              return ta - tb; // 마감 빠른 순
            }
            case "latest":
            default: {
              const sa = safeStartDate(a);
              const sb = safeStartDate(b);
              const ta = sa ? sa.getTime() : 0;
              const tb = sb ? sb.getTime() : 0;
              return tb - ta; // 최신 시작일 순 (내림차순)
            }
          }
        });

        console.log(
          "[Auctions] sort =", sort,
          "| first 3 prices =", sorted.slice(0, 3).map((v) => safePrice(v))
        );

        setList(sorted);
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
  }, [q, deadlineOnly, sort]);

  // 🔹 SearchBar에서 검색 제출 시 → URL 갱신
  const handleSearchSubmit = (nextQ, nextDeadlineOnly) => {
    const sp = new URLSearchParams(searchParams);

    if (nextQ) sp.set("q", nextQ);
    else sp.delete("q");

    if (nextDeadlineOnly) sp.set("deadlineOnly", "1");
    else sp.delete("deadlineOnly");

    setSearchParams(sp, { replace: false });

    if (location.pathname !== "/auctions") {
      navigate(`/auctions?${sp.toString()}`);
    }
  };

  // 🔥 정렬 버튼 클릭 핸들러
  const handleSortChange = (nextSort) => {
    const sp = new URLSearchParams(searchParams);
    if (!nextSort || nextSort === "latest") {
      sp.delete("sort");
    } else {
      sp.set("sort", nextSort);
    }
    setSearchParams(sp, { replace: false });
  };

  const sortValue = sort || "latest";

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

      {/* 정렬 토글 */}
      <div className="mt-4 flex gap-2 text-sm">
        <button
          onClick={() => handleSortChange("latest")}
          className={
            "px-3 py-1 rounded-full border " +
            (sortValue === "latest"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 border-gray-300")
          }
        >
          최신순
        </button>
        <button
          onClick={() => handleSortChange("price")}
          className={
            "px-3 py-1 rounded-full border " +
            (sortValue === "price"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 border-gray-300")
          }
        >
          최저입찰가순
        </button>
        <button
          onClick={() => handleSortChange("deadline")}
          className={
            "px-3 py-1 rounded-full border " +
            (sortValue === "deadline"
              ? "bg-black text-white border-black"
              : "bg-white text-gray-700 border-gray-300")
          }
        >
          마감 임박순
        </button>
      </div>

      {/* 리스트 */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {loading && <Card>불러오는 중…</Card>}
        {!loading && err && <Card>{err}</Card>}
        {!loading && !err && list.length === 0 && (
          <Card>검색 결과가 없습니다.</Card>
        )}

        {!loading &&
          !err &&
          list.map((item) => (
            <AuctionCard key={item.uid} item={item} />
          ))}
      </div>
    </div>
  );
}
