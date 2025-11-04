import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuctions } from "../api/auctions";
import Card from "../components/Card";
import Badge from "../components/Badge";

export default function Auctions() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [deadlineOnly, setDeadlineOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await getAuctions({ q, deadlineOnly });
      setList(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

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
            <input type="checkbox" checked={deadlineOnly} onChange={(e)=>setDeadlineOnly(e.target.checked)}/>
            마감 임박
          </label>
          <button onClick={fetchData} className="btn btn-primary">검색</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {loading && <Card>불러오는 중…</Card>}
        {!loading && list.length === 0 && <Card>검색 결과가 없습니다.</Card>}
        {!loading && list.map(item => (
          <Card key={item.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link to={`/auctions/${item.id}`} className="text-lg font-semibold hover:underline">
                  {item.title}
                </Link>
                <div className="mt-1 text-sm text-subink">{item.category}</div>
              </div>
              <Badge tone={new Date(item.endDate) - Date.now() < 1000*60*60*24*3 ? "danger" : "info"}>
                {new Date(item.endDate).toLocaleDateString()} 마감
              </Badge>
            </div>
            <div className="mt-4 text-sm">
              최저입찰가 <span className="font-semibold">{item.minBid.toLocaleString()}원</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
