// src/pages/AuctionDetail.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuctionById } from "../api/auctions";
import Card from "../components/Card";
import Badge from "../components/Badge";

export default function AuctionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getAuctionById(id, { signal: controller.signal });
        if (isMounted) setData(res);
      } catch (e) {
        if (e.code === "ERR_CANCELED") {
          console.log("[AuctionDetail] 요청 취소됨");
        } else {
          console.error("[AuctionDetail] 불러오기 실패:", e);
          if (isMounted) setError(e);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  if (loading) return <Card>불러오는 중...</Card>;
  if (error) return <Card>에러 발생: {String(error.message)}</Card>;
  if (!data) return <Card>데이터 없음</Card>;

  // 데이터가 존재할 경우 렌더링
  return (
    <section className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="text-3xl font-bold mb-3">{data.title}</h1>
      <div className="flex items-center gap-2 text-sm text-subink mb-6">
        <Badge tone="info">{data.category}</Badge>
        <span>{data.status}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">기본 정보</h3>
          <ul className="text-sm leading-6">
            <li>공매번호: {data.id}</li>
            <li>주소: {data.address || "-"}</li>
            <li>최저입찰가: {data.minPrice?.toLocaleString()}원</li>
            <li>입찰 시작일: {new Date(data.beginDate).toLocaleString("ko-KR")}</li>
            <li>입찰 마감일: {new Date(data.endDate).toLocaleString("ko-KR")}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">상태</h3>
          <p className="text-sm">
            현재 상태: <strong>{data.status || "정보 없음"}</strong>
          </p>
          <p className="mt-2 text-sm text-subink">조회수: {data.views || 0} / 입찰수: {data.bids || 0}</p>
        </div>
      </div>
    </section>
  );
}

