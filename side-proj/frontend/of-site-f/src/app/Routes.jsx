import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import Home from "../pages/Home.jsx";
import Auctions from "../pages/Auctions.jsx";
import AuctionDetail from "../pages/AuctionDetail.jsx";

export default function RoutesConfig() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="auctions" element={<Auctions />} />
        <Route path="auctions/:id" element={<AuctionDetail />} />
      </Route>
    </Routes>
  );
}

