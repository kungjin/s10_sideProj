// src/pages/AuctionsRaw.jsx
import { useEffect, useState } from "react";
import client from "../api/client";
import { getAuctions } from "../api/auctions";

const pretty = (v) => {
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
};

export default function AuctionsRaw() {
  const [raw, setRaw] = useState(null);
  const [norm, setNorm] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // 1) 백엔드 원시 응답
        const { data } = await client.get("/public/auctions", {
          params: { pageNo: 1, numOfRows: 12 },
          timeout: 20000
        });
        setRaw(data);

        // 2) 정규화 결과
        const list = await getAuctions({ pageNo: 1, numOfRows: 12 });
        setNorm(list);
      } catch (e) {
        console.error(e);
        setErr(e.message || "error");
      }
    })();
  }, []);

  if (err) return <div style={{padding:16,color:'crimson'}}>에러: {String(err)}</div>;

  return (
    <div style={{padding:16}}>
      <h2>RAW JSON & Normalized 비교</h2>

      <h3>Normalized({norm.length})</h3>
      <pre style={{background:'#111',color:'#0f0',padding:12,overflow:'auto',maxHeight:240}}>
        {pretty(norm.slice(0,3)) /* 너무 길면 일부만 */}
      </pre>

      <h3>Raw</h3>
      <pre style={{background:'#111',color:'#0ff',padding:12,overflow:'auto',maxHeight:360}}>
        {typeof raw === 'string' ? raw : pretty(raw)}
      </pre>
    </div>
  );
}
