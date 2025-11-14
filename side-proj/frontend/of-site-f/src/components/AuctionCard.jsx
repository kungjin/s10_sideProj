// src/components/AuctionCard.jsx
import { Link } from "react-router-dom";
import Card from "./Card";
import Badge from "./Badge";
import { parseOnbidDate } from "../utils/onbid";

const fmtKrw = new Intl.NumberFormat("ko-KR");

function toSafeDate(item) {
  if (!item) return null;

  // 1) 타임스탬프(ms)
  if (item.endTs) {
    const d = new Date(item.endTs);
    if (!isNaN(d.getTime())) return d;
  }

  // 2) Date 객체
  if (item.endDate instanceof Date) {
    if (!isNaN(item.endDate.getTime())) return item.endDate;
  }

  // 3) ISO 문자열
  if (item.endDateISO) {
    const d = new Date(item.endDateISO);
    if (!isNaN(d.getTime())) return d;
  }

  // 4) 백엔드가 문자열로만 내려주는 경우 (DB DATETIME / 온비드 포맷)
  if (item.bidEndAt) {
    const d = parseOnbidDate(item.bidEndAt);
    if (d) return d;
  }
  if (item.bid_end_at) {
    const d = parseOnbidDate(item.bid_end_at);
    if (d) return d;
  }

  return null;
}

function remainText(item) {
  const d = toSafeDate(item);
  if (!d) return null;

  const t = d.getTime();
  const diff = t - Date.now();
  if (diff <= 0) return "마감";

  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const dCnt = Math.floor(diff / dayMs);
  const hCnt = Math.floor((diff % dayMs) / hourMs);

  return dCnt > 0 ? `${dCnt}일 ${hCnt}시간 남음` : `${hCnt}시간 남음`;
}

export default function AuctionCard({
  item,
  variant = "default", // "default" | "deadline"
  className = "",
}) {
  const end = toSafeDate(item);
  const endLabel = end
    ? `${end.toLocaleDateString("ko-KR")} 마감`
    : "마감일 정보 없음";

  // 🔹 가격: 여러 필드 중 하나라도 있으면 사용
  const rawPrice =
    item?.minPrice ??
    item?.minBid ?? // Auctions.jsx에서 만든 값이 있으면 우선
    item?.minBidPrice ??
    item?.min_bid_price ??
    0;

  const price = Number(rawPrice || 0);
  const priceLabel = price > 0 ? `${fmtKrw.format(price)}원` : "정보 없음";

  const remain = remainText(item);
  const isDeadline = variant === "deadline";

  const category = item?.category ?? item?.usageName ?? "-";
  const address = item?.address ?? item?.addrRoad;

  return (
    <Card
      className={[
        "w-full",
        isDeadline ? "border border-red-200 bg-red-50/40" : "",
        className,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={`/auctions/${item?.id}`}
            className={`text-lg font-semibold hover:underline line-clamp-2 ${
              isDeadline ? "text-red-700" : ""
            }`}
            title={item?.title}
          >
            {item?.title ?? "(제목 없음)"}
          </Link>
          <div
            className={`mt-1 text-sm ${
              isDeadline ? "text-red-600/80" : "text-subink"
            }`}
          >
            {category}
          </div>
          {address && !isDeadline && (
            <div className="mt-1 text-xs text-subink line-clamp-1">
              {address}
            </div>
          )}
        </div>

        <Badge tone={isDeadline ? "danger" : "info"}>{endLabel}</Badge>
      </div>

      <div className="mt-4 text-sm flex items-center gap-3">
        <span>최저입찰가</span>
        <span
          className={`font-semibold ${
            isDeadline ? "text-red-700" : ""
          }`}
        >
          {priceLabel}
        </span>
        {isDeadline && remain && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
            ⏳ {remain}
          </span>
        )}
      </div>
    </Card>
  );
}
