import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    // /auctions 페이지로 이동(검색어는 쿼리스트링 사용)
    navigate(`/auctions?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 w-full max-w-xl">
      <input
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        placeholder="예: 화성시 장안면, 근린생활시설, 토지/임야"
        className="px-4 py-3 rounded-button border border-line bg-white flex-1"
      />
      <button type="submit" className="btn btn-primary">검색</button>
    </form>
  );
}
