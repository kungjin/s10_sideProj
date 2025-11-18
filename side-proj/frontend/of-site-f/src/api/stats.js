import axios from "axios";

export async function getStatsSummary() {
  const res = await axios.get("/api/auctions/stats");
  return res.data;
}
