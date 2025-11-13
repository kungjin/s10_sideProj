// src/RoutesConfig.jsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Auctions from "./pages/Auctions.jsx";
import AuctionDetail from "./pages/AuctionDetail.jsx";
import AuctionsRaw from "./pages/AuctionsRaw.jsx"; // 디버그용

export default function RoutesConfig() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* 홈 */}
        <Route index element={<Home />} />

        {/* 목록 */}
        <Route path="auctions" element={<Auctions />} />

        {/* 상세: /auctions/:id */}
        <Route path="auctions/:id" element={<AuctionDetail />} />

        {/* 디버그: /debug/raw */}
        <Route path="debug/raw" element={<AuctionsRaw />} />

        {/* 그 외 → 홈 */}
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}

