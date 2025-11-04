import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function HeaderSearch() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const loc = useLocation();

  const submit = (e) => {
    e.preventDefault();
    const sp = new URLSearchParams({ q });
    nav(`/auctions?${sp.toString()}`);
  };

  // 단축키: "/" 누르면 포커스
  const id = "global-search";
  return (
    <form onSubmit={submit} className="hidden md:flex items-center gap-2">
      <input
        id={id}
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        placeholder="검색: 주소·물건명 ( / 로 포커스 )"
        className="px-3 py-2 w-56 rounded-button border border-line bg-white"
        onKeyDown={(e)=>{ if(e.key==='/' && e.currentTarget.value===''){ e.preventDefault(); e.currentTarget.focus(); } }}
      />
      <button className="btn btn-primary">검색</button>
    </form>
  );
}
