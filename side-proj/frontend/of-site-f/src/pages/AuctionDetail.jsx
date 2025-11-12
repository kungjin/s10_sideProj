// src/pages/AuctionDetail.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuctionById } from "../api/auctions";
import Card from "../components/Card";
import Badge from "../components/Badge";
import AuctionCard from "../components/AuctionCard"; // ✅ 관련 카드 재사용
import Slider from "../components/Slider";

export default function AuctionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [related, setRelated] = useState([]); // ✅ 관련 공매 리스트

  useEffect(() => {
    const controller = new AbortController();
    let alive = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAuctionById(id, { signal: controller.signal });
        if (alive) {
          setData(res);

          // ✅ 임시 관련 리스트 (나중에 카테고리 기반 API로 교체)
          const fake = Array.from({ length: 6 }).map((_, i) => ({
            uid: `related-${i}`,
            id: i,
            title: `관련 공매 ${i + 1}`,
            category: res?.category || "토지 / 임야",
            minPrice: Math.floor(Math.random() * 100000000),
            endDateISO: "2025-11-30T12:00:00",
          }));
          setRelated(fake);
        }
      } catch (e) {
        if (e.code !== "ERR_CANCELED") {
          console.error("[AuctionDetail] 실패:", e);
          if (alive) setError(e);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; controller.abort(); };
  }, [id]);

  if (loading) return <Card>불러오는 중...</Card>;
  if (error) return <Card>에러 발생: {String(error.message || error)}</Card>;
  if (!data) return <Card>데이터 없음</Card>;

  const begin = data?.beginDateISO ? new Date(data.beginDateISO) : null;
  const end = data?.endDateISO ? new Date(data.endDateISO) : null;

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
        <Badge tone="info">{data.category || "-"}</Badge>
        {data.status && <span>{data.status}</span>}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">기본 정보</h3>
          <ul className="text-sm leading-6">
            <li>공매번호: {data.id}</li>
            <li>주소: {data.address || "-"}</li>
            <li>최저입찰가: {data.minPrice?.toLocaleString()}원</li>
            <li>입찰 시작일: {begin ? begin.toLocaleString("ko-KR") : "정보 없음"}</li>
            <li>입찰 마감일: {end ? end.toLocaleString("ko-KR") : "정보 없음"}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">상태</h3>
          <p className="text-sm">
            현재 상태: <strong>{data.status || "정보 없음"}</strong>
          </p>
          <p className="mt-2 text-sm text-subink">
            조회수: {data.views ?? 0} / 입찰수: {data.bids ?? 0}
          </p>
        </div>
      </div>

      {/* ---------- 관련 공매 슬라이드 ---------- */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-3">관련 공매</h3>
        <Slider step={2} itemWidth={260} gap={16}>
          {related.map((item) => (
            <div key={item.uid} className="min-w-[260px] snap-start flex-shrink-0">
              <AuctionCard item={item} compact />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}


