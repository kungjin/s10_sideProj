// 실제 API 준비 전 개발 속도를 위한 모의 데이터
export const MOCK_AUCTIONS = [
  {
    id: "2024-05694-003",
    title: "경기도 화성시 장안면 수촌리 산32-5, 산32-9",
    category: "토지/임야",
    minBid: 154_000_000,
    endDate: "2025-11-30",
    status: "진행중",
  },
  {
    id: "2024-01234-001",
    title: "서울시 강서구 가양동 근린생활시설",
    category: "상가/업무",
    minBid: 890_000_000,
    endDate: "2025-12-05",
    status: "진행중",
  },
];

export const MOCK_DETAIL = (id) => ({
  id,
  title: "경기도 화성시 장안면 수촌리 산32-5, 산32-9",
  category: "토지/임야",
  minBid: 154_000_000,
  appraised: 210_000_000,
  deposit: 10_000_000,
  area: "2,430㎡",
  address: "경기도 화성시 장안면 수촌리 산32-5, 산32-9",
  endDate: "2025-11-30",
  status: "진행중",
  description: "공공데이터 예시 기반. 실제 Onbid API 연결 예정.",
});
