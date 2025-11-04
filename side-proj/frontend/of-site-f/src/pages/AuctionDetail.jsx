import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAuctionById } from "../api/auctions";
import Card from "../components/Card";
import Badge from "../components/Badge";
import Button from "../components/Button";

export default function AuctionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    (async ()=>{
      setLoading(true);
      try {
        const res = await getAuctionById(id);
        setData(res);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="max-w-6xl mx-auto px-5 py-10">불러오는 중…</div>;
  if (!data) return <div className="max-w-6xl mx-auto px-5 py-10">데이터 없음</div>;

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <h2 className="text-2xl font-bold">{data.title}</h2>
          <div className="mt-2 text-subink">{data.address}</div>
          <div className="mt-3 flex items-center gap-2">
            <Badge tone="info">{data.category}</Badge>
            <Badge tone={new Date(data.endDate) - Date.now() < 1000*60*60*24*3 ? "danger" : "info"}>
              {new Date(data.endDate).toLocaleDateString()} 마감
            </Badge>
          </div>
          <p className="mt-4 text-sm text-subink leading-6">{data.description}</p>
        </Card>

        <Card>
          <h3 className="font-semibold mb-2">상세 정보</h3>
          <ul className="text-sm grid sm:grid-cols-2 gap-2">
            <li>최저입찰가: <span className="font-semibold">{data.minBid.toLocaleString()}원</span></li>
            <li>감정가: <span className="font-semibold">{data.appraised.toLocaleString()}원</span></li>
            <li>보증금: <span className="font-semibold">{data.deposit.toLocaleString()}원</span></li>
            <li>면적: <span className="font-semibold">{data.area}</span></li>
            <li>물건번호: <span className="font-semibold">{data.id}</span></li>
          </ul>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <h4 className="font-semibold mb-2">입찰 진행</h4>
          <div className="text-sm text-subink">Onbid 연동 준비 중입니다.</div>
          <div className="mt-3 flex gap-2">
            <Button className="flex-1">알림 설정</Button>
            <Link to="/auctions" className="btn btn-ghost flex-1 text-center">목록</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
