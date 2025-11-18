// src/pages/Auctions.jsx
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getAuctions } from "../api/auctions";
import AuctionCard from "../components/AuctionCard";
import Card from "../components/Card";
import SearchBar from "../components/SearchBar";
import { safePrice,safeEndDate,safeStartDate,normalizeAuctionItem } from "../utils/auctionNormalize";

const PAGE_SIZE = 12; // 🔹 한 페이지당 12개





export default function Auctions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 🔹 URL에서 쿼리 읽기
  const q = (searchParams.get("q") || "").trim();
  const deadlineOnly = (searchParams.get("deadlineOnly") || "") === "1";
  const sort = searchParams.get("sort") || "latest"; // latest | price | deadline

  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const page =
    Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

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
        const normalized = raw.map((it, idx) =>
          normalizeAuctionItem(it, idx)
        );

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

    // 검색하면 항상 page 1부터
    sp.delete("page");

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
    sp.delete("page"); // 정렬 바꾸면 1페이지로
    setSearchParams(sp, { replace: false });
  };

  const sortValue = sort || "latest";

  // 🔹 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageItems = list.slice(startIdx, startIdx + PAGE_SIZE);

  // 🔹 페이지 변경
  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    const sp = new URLSearchParams(searchParams);
    if (nextPage === 1) sp.delete("page");
    else sp.set("page", String(nextPage));
    setSearchParams(sp, { replace: false });
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
          pageItems.map((item) => (
            <AuctionCard key={item.uid} item={item} />
          ))}
      </div>
        {/* 페이지네이션 */}
      {!loading && !err && list.length > 0 && (
        <div className="mt-6 flex justify-center items-center gap-1 text-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={
              "px-3 py-1 rounded-full border " +
              (currentPage === 1
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
            }
          >
            이전
          </button>

          {Array.from({ length: totalPages }, (_, i) => {
            const p = i + 1;
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={
                  "px-3 py-1 rounded-full border " +
                  (isActive
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
                }
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={
              "px-3 py-1 rounded-full border " +
              (currentPage === totalPages
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
            }
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
