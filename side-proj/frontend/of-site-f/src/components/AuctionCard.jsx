// src/components/AuctionCard.jsx
import { Link } from "react-router-dom";
import Card from "./Card";
import { parseOnbidDate } from "../utils/onbid";

const fmtKrw = new Intl.NumberFormat("ko-KR");

// 썸네일 placeholder
function getFakeThumbnail(item) {
  if (item?.thumbnail) return item.thumbnail;

  const palette = ["#dbeafe", "#ffe4e6", "#fef9c3", "#dcfce7", "#fae8ff"];
  const idx = (item?.itemNo ?? 0) % palette.length;

  return `data:image/svg+xml;utf8,
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
  <rect width="100%" height="100%" fill="${palette[idx]}" />
  <text x="50%" y="50%" font-size="32" text-anchor="middle" fill="#555" dy="10">
    OF
  </text>
</svg>`;
}

// 마감일 Date 통일 (정규화된 endDate 있으면 그거 우선)
function toSafeDate(item) {
  if (!item) return null;

  if (item.endDate instanceof Date && !isNaN(item.endDate.getTime())) {
    return item.endDate;
  }

  if (item.endDateISO) {
    const d = new Date(item.endDateISO);
    if (!isNaN(d.getTime())) return d;
  }

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

// “n일 n시간 남음”
function remainText(item) {
  const d = toSafeDate(item);
  if (!d) return null;

  const diff = d.getTime() - Date.now();
  if (diff <= 0) return "마감";

  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;
  const dCnt = Math.floor(diff / dayMs);
  const hCnt = Math.floor((diff % dayMs) / hourMs);

  return dCnt > 0 ? `${dCnt}일 ${hCnt}시간 남음` : `${hCnt}시간 남음`;
}

export default function AuctionCard({ item, className = "" }) {
  const end = toSafeDate(item);
  const endLabel = end
    ? `${end.toLocaleDateString("ko-KR")} 마감`
    : "마감일 정보 없음";

  // 정규화된 값들 사용 (normalizeAuctionItem 기준)
  const priceNum = Number(item?.minBid ?? 0);
  const priceLabel =
    priceNum > 0 ? `${fmtKrw.format(priceNum)}원` : "정보 없음";

  const remain = remainText(item);
  const category = item?.category ?? item?.usageName ?? "-";
  const address = item?.address ?? item?.addrRoad ?? "";
  const thumbnail = getFakeThumbnail(item);

  const id = item?.id ?? `${item?.noticeNo ?? ""}-${item?.itemNo ?? ""}`;

  return (
    <Link to={`/auctions/${id}`} className="block h-full">
      <Card className={["h-full flex flex-col", className].join(" ")}>
        {/* 1) 썸네일: 가로 꽉 + 비율 고정 */}
        <div className="w-full mb-3 overflow-hidden rounded-card">
          <img
            src={thumbnail}
            alt="thumbnail"
            className="w-full aspect-video object-cover bg-gray-100"
          />
        </div>

        {/* 2) 본문 영역 */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="relative">
            {/* 오른쪽 상단 마감일 텍스트 */}
            <div className="min-w-[110px] text-right text-sm text-primary/70">
              {endLabel}
            </div>

            {/* 텍스트 블록 (마감일 공간은 위, 제목은 아래에서 시작) */}
            <div>
              <div
                className="text-primary text-base md:text-lg font-semibold line-clamp-2 mt-3 min-h-14"
                title={item?.title}
              >
                {item?.title ?? "(제목 없음)"}
              </div>

              <div className="mt-1 text-sm text-primary/90 min-h-5">
                {category}
              </div>

              {address && (
                <div className="mt-1 text-xs text-subink/70 line-clamp-1 min-h-4">
                  {address}
                </div>
              )}
            </div>
          </div>

          {/* 아래 최저입찰가 + 남은시간 */}
          <div className="mt-auto pt-3 border-t border-line flex items-center justify-between text-sm">
            <div>
              <div className="text-xs text-subink">최저입찰가</div>
              <div className="font-semibold text-primary">{priceLabel}</div>
            </div>

            {remain && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                ⏳ {remain}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
