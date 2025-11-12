import { useEffect, useRef, useState } from "react";

/**
 * 수평 카드 슬라이더
 * - 좌우 화살표로 step 단위 이동
 * - 스와이프/휠(shift+wheel) 스크롤도 자연스럽게 동작
 * - snap으로 카드 경계에 착 붙음
 */
export default function Slider({
  children,
  className = "",
  step = 2,          // 클릭 시 몇 카드 이동할지
  itemWidth = 260,   // 각 카드 최소 너비(px) (min-w-[260px]과 맞출 것)
  gap = 16,          // 카드 간격(px) (Tailwind gap-4 = 16)
  showArrows = true, // 화살표 표시 여부
  prevLabel = "이전",
  nextLabel = "다음",
}) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = () => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 0);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    updateButtons();
    const el = trackRef.current;
    if (!el) return;

    // 스크롤/리사이즈 시 버튼 상태 업데이트
    const onScroll = () => updateButtons();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // 내용 변화 감지 (children 변동/폰트 로딩 등)
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
    };
  }, []);

  const distance = step * (itemWidth + gap);

  const handlePrev = () => {
    trackRef.current?.scrollBy({ left: -distance, behavior: "smooth" });
  };
  const handleNext = () => {
    trackRef.current?.scrollBy({ left: distance, behavior: "smooth" });
  };

  return (
    <div className={`relative ${className}`}>
      {/* 트랙 */}
      <div
        ref={trackRef}
        className="overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: "none" }} // 파폭 스크롤바 최소화
      >
        <div className="flex" style={{ gap }}>
          {children}
        </div>
      </div>

      {/* 좌우 화살표 */}
      {showArrows && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            disabled={!canPrev}
            aria-label={prevLabel}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white border shadow disabled:opacity-40"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext}
            aria-label={nextLabel}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white border shadow disabled:opacity-40"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
