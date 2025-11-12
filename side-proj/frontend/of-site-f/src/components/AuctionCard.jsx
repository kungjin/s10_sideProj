import { Link } from "react-router-dom";
import Card from "./Card";
import Badge from "./Badge";

const fmtKrw = new Intl.NumberFormat("ko-KR");

function toSafeDate(item) {
  if (item?.endTs) return new Date(item.endTs);
  if (item?.endDateISO) return new Date(item.endDateISO);
  return null;
}
function remainText(item) {
  const t = item?.endTs ?? (toSafeDate(item)?.getTime() ?? null);
  if (!t) return null;
  const diff = t - Date.now();
  if (diff <= 0) return "마감";
  const d = Math.floor(diff / (24*60*60*1000));
  const h = Math.floor((diff % (24*60*60*1000)) / (60*60*1000));
  return d > 0 ? `${d}일 ${h}시간 남음` : `${h}시간 남음`;
}

export default function AuctionCard({
  item,
  variant = "default",      // "default" | "deadline"
  className = "",
}) {
  const end = toSafeDate(item);
  const endLabel = end ? `${end.toLocaleDateString("ko-KR")} 마감` : "마감일 정보 없음";
  const price = Number(item?.minPrice ?? 0);
  const priceLabel = price > 0 ? `${fmtKrw.format(price)}원` : "정보 없음";
  const remain = remainText(item);

  const isDeadline = variant === "deadline";

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
          <div className={`mt-1 text-sm ${isDeadline ? "text-red-600/80" : "text-subink"}`}>
            {item?.category || "-"}
          </div>
          {item?.address && !isDeadline && (
            <div className="mt-1 text-xs text-subink line-clamp-1">{item.address}</div>
          )}
        </div>

        <Badge tone={isDeadline ? "danger" : "info"}>
          {endLabel}
        </Badge>
      </div>

      <div className="mt-4 text-sm flex items-center gap-3">
        <span>최저입찰가</span>
        <span className={`font-semibold ${isDeadline ? "text-red-700" : ""}`}>{priceLabel}</span>
        {isDeadline && remain && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
            ⏳ {remain}
          </span>
        )}
      </div>
    </Card>
  );
}
