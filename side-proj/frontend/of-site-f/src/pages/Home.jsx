import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Feature from "../components/Feature";
import Section from "../components/Section";
import Stat from "../components/Stat";
import SearchBar from "../components/SearchBar";
import { getAuctions } from "../api/auctions";
import { normalizeAuctionItem } from "../utils/auctionNormalize.js";
import AuctionCard from "../components/AuctionCard.jsx";
import { getStatsSummary } from "../api/Stats.js";

export default function Home() {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  // 🔹 홈에서의 기본 검색값
  const q = "";
  const deadlineOnly = false;

  // 🔹 검색 제출 시 Auctions 페이지로 이동
  const handleSearchSubmit = (nextQ, nextDeadlineOnly) => {
    const sp = new URLSearchParams();
    if (nextQ) sp.set("q", nextQ);
    if (nextDeadlineOnly) sp.set("deadlineOnly", "1");
    navigate(`/auctions?${sp.toString()}`);
  };

  // 🔹 히어로 오른쪽 추천 키워드 클릭
  const handleQuickKeyword = (kw) => {
    handleSearchSubmit(kw, false);
  };

  // 🔹 공매 데이터 가져와서: 날짜 정규화 → 마감 임박 순 정렬 → 상위 3개만 recent에 저장
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // 백엔드에서 마감일 기준으로 준다면 sort 파라미터도 줄 수 있음
        const raw = await getAuctions({ limit: 50, sort: "deadline" });

        // 1) 공통 정규화
        const normalized = (raw || []).map((item, idx) =>
          normalizeAuctionItem(item, idx)
        );

        // 2) endDate 있는 것만, 마감일 가까운 순
        const sorted = normalized
          .filter((v) => v.endDate instanceof Date)
          .sort((a, b) => a.endDate - b.endDate);

        // 3) 상위 3개만 사용 (마감 임박 3개) + id/uid 세팅
        const top3 = sorted.slice(0, 3).map((it, idx) => {
          const notice = it.noticeNo ?? it.notice_no;
          const itemNo = it.itemNo ?? it.item_no;

          const id =
            it.id ?? (notice && itemNo ? `${notice}-${itemNo}` : `home-${idx}`);

          return {
            ...it,
            id,
            uid: it.uid ?? id,
          };
        });

        setRecent(top3);
      } catch (err) {
        console.error(err);
        setRecent([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const d = await getStatsSummary();
        setStats(d);
      } catch (err) {
        console.error("통계 API 에러:", err);
      }
    })();
  }, []);

  const {
    totalCount = 0,
    closingToday = 0,
    closingThisWeek = 0,
    avgMinBid = 0,
    topRegion = null,
    topRegionCount = 0,
  } = stats || {};

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="bg-linear-to-b from-white via-white to-sky/10">
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-14 grid lg:grid-cols-2 gap-10 items-center">
          {/* 왼쪽: 브랜드 메시지 + 검색 */}
          <div className="flex flex-col gap-6">
            <p className="inline-flex items-center gap-2 text-xs border border-line rounded-full px-3 py-1 bg-white w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Beta · 공공데이터 기반 공매 탐색
            </p>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              투명한 공매의 시작,{" "}
              <span className="bg-linear-to-r from-primary to-sky bg-clip-text text-transparent">
                OF
              </span>
            </h1>

            <p className="text-lg text-subink max-w-xl leading-7">
              객관적인 공공데이터와 개인 맞춤형 탐색을 결합해 복잡한 공매 정보를{" "}
              <span className="font-semibold">카드형 UI</span>로 명확하게
              보여줍니다. 마감이 임박한 물건부터 한눈에 확인해 보세요.
            </p>

            {/* 바로검색 */}
            <div className="mt-2">
              <SearchBar
                initial={q}
                initialDeadlineOnly={deadlineOnly}
                onSubmit={handleSearchSubmit}
                placeholder="주소/물건명으로 검색해 보세요"
              />
              <div className="text-xs text-subink mt-2">
                예) “화성시 장안면”, “근린생활시설”, “토지/임야”
              </div>
            </div>

            {/* 신뢰 포인트 */}
            <div className="flex flex-wrap gap-3 mt-4 text-sm">
              <span className="badge">공공데이터 기반</span>
              <span className="badge">마감 임박 우선</span>
              <span className="badge">카드형 요약</span>
              <span className="badge">반응형 UI</span>
            </div>
          </div>

          {/* 오른쪽: 사용 플로우 + 추천 키워드 */}
          <div className="relative">
            <div className="absolute -inset-4 bg-linear-to-r from-primary/10 to-sky/10 blur-2xl rounded-card -z-10" />
            <div className="grid gap-3">
              <PreviewRow
                step="1"
                title="주소나 물건명을 입력하세요"
                sub="궁금한 지역이나 유형을 키워드로 검색합니다."
              />
              <PreviewRow
                step="2"
                title="‘마감 임박’ 토글로 우선순위를 정리"
                sub="임박한 공매부터 확인해 리스크를 줄일 수 있어요."
              />
              <PreviewRow
                step="3"
                title="카드 한 장씩 비교하며 결정"
                sub="최저입찰가, 감정가, 분류, 마감일을 한 번에 봅니다."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 상태/CTA 바 ===== */}
      <section className="bg-animated-gradient text-white">
        <div className="max-w-6xl mx-auto px-5 py-6 flex flex-wrap items-center gap-3 justify-between">
          <p className="text-sm text-white/90">
            현재는 베타 버전으로, 샘플 데이터 및 일부 공매 정보를 기준으로
            동작합니다. Onbid API 연동 후 더 많은 물건을 제공할 예정입니다.
          </p>

          <div className="flex gap-2">
            <Link
              to="/auctions"
              className="btn bg-white text-primary hover:bg-white/90 shadow-subtle"
            >
              공매 리스트 보러가기
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 특징 3가지 ===== */}
      <Section
        title="OF가 더 편한 이유"
        subtitle="한 화면에서 핵심만 정리해 빠르게 비교·결정할 수 있습니다."
        className="py-12"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <Feature
            icon={<DotIcon />}
            title="카드형 요약"
            desc="최저입찰가, 분류, 마감일 등 핵심 정보를 한 장에 정리합니다."
          />
          <Feature
            icon={<BoltIcon />}
            title="마감 임박 우선"
            desc="임박한 공매를 먼저 보여줘 시간과 에너지를 아껴줍니다."
          />
          <Feature
            icon={<ShieldIcon />}
            title="공공데이터 기반"
            desc="공공 데이터로 신뢰할 수 있는 정보를 제공합니다."
          />
        </div>
      </Section>

      {/* ===== 공매 미리보기 ===== */}
      <Section
        title="최근 등록 · 마감 임박 공매"
        subtitle="지금 바로 확인해야 할 공매를 카드형으로 미리 살펴볼 수 있습니다."
        className="py-2"
      >
        <div className="grid md:grid-cols-3 gap-4">
          {loading && (
            <>
              <Card>불러오는 중…</Card>
              <Card>불러오는 중…</Card>
              <Card>불러오는 중…</Card>
            </>
          )}

          {!loading && recent.length === 0 && (
            <Card>표시할 항목이 없습니다.</Card>
          )}

          {!loading &&
            recent.map((item) => (
              <AuctionCard key={item.uid ?? item.id} item={item} />
            ))}
        </div>

        {/* 전체 리스트로 이어지는 글로벌 CTA */}
        <div className="mt-6 flex justify-center">
          <Link
            to="/auctions"
            className="btn btn-ghost bg-primary text-sm text-white"
          >
            더 많은 공매 보기 →
          </Link>
        </div>
      </Section>

      {/* ===== 간단 통계 ===== */}
      <Section className="py-10">
        <div className="grid sm:grid-cols-3 gap-3">
          <Stat label="전체 공매 수" value={`${totalCount}건`} />
          <Stat label="오늘 마감" value={`${closingToday}건`} />
          <Stat label="이번 주 마감" value={`${closingThisWeek}건`} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <Stat
            label="평균 최저입찰가"
            value={
              avgMinBid
                ? `${Number(avgMinBid).toLocaleString()}원`
                : "-"
            }
          />
          <Stat
            label="가장 많은 물건이 있는 지역"
            value={
              topRegion
                ? `${topRegion} (${topRegionCount}건)`
                : "지역 데이터 없음"
            }
          />
        </div>


      </Section>

      {/* ===== FAQ 라이트 ===== */}
      <Section title="자주 묻는 질문" className="pb-16">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h4 className="font-semibold">실제 공매 데이터인가요?</h4>
            <p className="text-sm text-subink mt-2">
              현재는 샘플 데이터 및 제한된 공매 정보로 동작하며, Onbid API 연동
              후 점차 범위를 넓혀갈 예정입니다.
            </p>
          </Card>
          <Card className="p-5">
            <h4 className="font-semibold">어떤 필터가 제공되나요?</h4>
            <p className="text-sm text-subink mt-2">
              주소/물건명 검색과 “마감 임박” 토글을 지원합니다. 향후
              지역/유형/가격 필터를 추가할 예정입니다.
            </p>
          </Card>
        </div>
      </Section>
    </>
  );
}

/* ===== 내부 미니 컴포넌트 ===== */
function PreviewRow({ step, title, sub }) {
  return (
    <div className="card flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          {step && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs rounded-full bg-primary text-white">
              {step}
            </span>
          )}
          <div className="font-semibold">{title}</div>
        </div>
        <div className="text-sm text-subink mt-1">{sub}</div>
      </div>
      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
      </div>
    </div>
  );
}

function DotIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

