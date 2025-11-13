// src/pages/AuctionDetail.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuctionById } from "../api/auctions";
import Card from "../components/Card";
import Badge from "../components/Badge";
import AuctionCard from "../components/AuctionCard";
import Slider from "../components/Slider";

export default function AuctionDetail() {
  // 🔹 이제는 id 하나만 받음
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAuctionById(id, { signal: controller.signal });
        if (!alive) return;

        setData(res);

        // 🔹 임시 관련 공매 (나중에 API 붙이면 교체)
        const fake = Array.from({ length: 6 }).map((_, i) => ({
          uid: `related-${i}`,
          id: i,
          title: `관련 공매 ${i + 1}`,
          category: res?.usageName || "토지 / 임야",
          minPrice: Math.floor(Math.random() * 100_000_000),
          endDateISO: "2025-11-30T12:00:00",
        }));
        setRelated(fake);
      } catch (e) {
        if (e.name === "CanceledError" || e.code === "ERR_CANCELED") return;
        console.error("[AuctionDetail] 실패:", e);
        if (alive) setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [id]);

  if (loading) return <Card>불러오는 중...</Card>;
  if (error) return <Card>에러 발생: {String(error.message || error)}</Card>;
  if (!data) return <Card>데이터 없음</Card>;

  const begin = data.startDate instanceof Date ? data.startDate : null;
  const end = data.endDate instanceof Date ? data.endDate : null;

  const fmtMoney = (n) =>
    n != null ? Number(n).toLocaleString("ko-KR") + "원" : "정보 없음";

  return (
    <section className="max-w-4xl mx-auto px-5 py-12">
      {/* ---------- 이미지 ---------- */}
      <div className="mb-6">
        <img
          src="https://placehold.co/800x400?text=Auction+Image"
          alt="공매 이미지"
          className="w-full h-auto rounded-lg object-cover border border-gray-200"
        />
      </div>

      {/* ---------- 제목/기본정보 ---------- */}
      <h1 className="text-3xl font-bold mb-3">{data.title}</h1>

      <div className="flex items-center gap-2 text-sm text-subink mb-6">
        <Badge tone="info">{data.usageName || data.category || "-"}</Badge>
        {data.saleType && (
          <span>{data.saleType === "RENT" ? "임대" : "매각"}</span>
        )}
        {data.statusName && <span>· {data.statusName}</span>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <div>
          <h3 className="font-semibold mb-2">기본 정보</h3>
          <ul className="text-sm leading-6">
            <li>
              내부 ID: <strong>{data.id}</strong>
            </li>
            {data.noticeNo && data.itemNo && (
              <li>
                공고번호 / 물건번호:{" "}
                <strong>
                  {data.noticeNo} / {data.itemNo}
                </strong>
              </li>
            )}
            <li>주소: {data.addrRoad || data.address || "-"}</li>
            <li>최저입찰가: {fmtMoney(data.minBidPrice ?? data.minPrice)}</li>
            <li>감정가: {fmtMoney(data.appraisalAmt)}</li>
            <li>
              입찰 시작일:{" "}
              {begin
                ? begin.toLocaleString("ko-KR")
                : data.bidStartAt || "정보 없음"}
            </li>
            <li>
              입찰 마감일:{" "}
              {end
                ? end.toLocaleString("ko-KR")
                : data.bidEndAt || "정보 없음"}
            </li>
          </ul>
        </div>

        {/* 상태 정보 */}
        <div>
          <h3 className="font-semibold mb-2">상태</h3>
          <p className="text-sm">
            현재 상태:{" "}
            <strong>{data.statusName || data.status || "정보 없음"}</strong>
          </p>
          <p className="mt-2 text-sm text-subink">
            조회수: {data.viewCount ?? data.views ?? 0} / 유찰 횟수:{" "}
            {data.failedCount ?? data.bids ?? 0}
          </p>
        </div>
      </div>

      {/* ---------- 관련 공매 슬라이드 ---------- */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-3">관련 공매</h3>
        <Slider step={2} itemWidth={260} gap={16}>
          {related.map((item) => (
            <div
              key={item.uid}
              className="min-w-[260px] snap-start flex-shrink-0"
            >
              <AuctionCard item={item} compact />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}

