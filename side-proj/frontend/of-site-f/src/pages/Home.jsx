import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Feature from "../components/Feature";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Section from "../components/Section";
import Stat from "../components/Stat";
import SearchBar from "../components/SearchBar";
import { getAuctions } from "../api/auctions";

// 작은 유틸
const fmtPrice = (n) => n?.toLocaleString?.("ko-KR") + "원";
const fmtDate = (d) => new Date(d).toLocaleDateString("ko-KR");

export default function Home() {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(false);
  const navigate = useNavigate();

  // 최근 공매 미리보기 (3개)
  useEffect(() => {
    if (mountedRef.current) return; // StrictMode에서 첫 번째만 동작시키기
    mountedRef.current = true;
  
   (async () => {
      setLoading(true);
      try {
        const list = await getAuctions({ q: "", pageNo: 1, numOfRows: 12 },
           );
        // 마감일 오름차순 정렬 후 상위 3개
        const sorted = [...list].sort(
          (a, b) => new Date(a.endDate) - new Date(b.endDate)
        );
        setRecent(sorted.slice(0, 3));
      } catch (e) {
        if (e.code === "ERR_CANCELED") {
          console.log("[Home] 요청 취소됨");
        } else if (e.code === "ECONNABORTED") {
          console.warn("[Home] 타임아웃(ECONNABORTED)");
        } else {
          console.error("[Home] 요청 실패:", e);
        }
      } finally {
        setLoading(false);
      }
    })();
 
  }, []);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="bg-linear-to-b from-white via-white to-sky/10">
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-14 grid lg:grid-cols-2 gap-10 items-center">
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
              객관적인 공공데이터와 개인 맞춤형 탐색을 결합해
              복잡한 공매 정보를{" "}
              <span className="font-semibold">카드형 UI</span>로 명확하게
              보여줍니다.
            </p>

            {/* 바로검색 */}
            <div className="mt-2">
              <SearchBar />
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

          {/* 우측 카드 미리보기 */}
          <div className="relative">
            <div className="absolute -inset-4 bg-linear-to-r from-primary/10 to-sky/10 blur-2xl rounded-card -z-10" />
            <div className="grid gap-3">
              <PreviewRow
                title="주소/물건명으로 빠르게 검색"
                sub="지역/유형/마감일 필터"
              />
              <PreviewRow
                title="카드형 리스트로 핵심만"
                sub="최저가 · 마감일 · 분류"
              />
              <PreviewRow
                title="상세 페이지에서 한눈에"
                sub="감정가 · 보증금 · 면적"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 바로가기 CTA ===== */}
      <section className="bg-white border-y border-line">
        <div className="max-w-6xl mx-auto px-5 py-6 flex flex-wrap items-center gap-3 justify-between">
          <p className="text-sm text-subink">
            샘플 데이터를 먼저 둘러보세요. (Onbid API 연동 예정)
          </p>
          <div className="flex gap-2">
            <Link to="/auctions" className="btn btn-primary">
              공매 탐색 바로가기
            </Link>
            <button
              className="btn btn-ghost"
              onClick={() => navigate("/auctions?q=%ED%86%A0%EC%A7%80")}
            >
              토지/임야 보기
            </button>
          </div>
        </div>
      </section>

      {/* ===== 특징 3가지 ===== */}
      <Section
        title="OF가 더 편한 이유"
        subtitle="한 화면에서 핵심만 정리해 빠르게 비교/결정할 수 있습니다."
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
            desc="일주일 이내 마감 물건만 모아 빠르게 확인할 수 있어요."
          />
          <Feature
            icon={<ShieldIcon />}
            title="공공데이터 기반"
            desc="공공 데이터로 신뢰할 수 있는 정보를 제공합니다."
          />
        </div>
      </Section>

      {/* ===== 최근 공매 미리보기 ===== */}
      <Section title="최근 등록 · 마감 임박" className="py-2">
        <div className="grid md:grid-cols-3 gap-4">
          {loading && (
            <>
              <Card>불러오는 중…</Card>
              <Card>불러오는 중…</Card>
              <Card>불러오는 중…</Card>
            </>
          )}
          {!loading && recent.length === 0 && <Card>표시할 항목이 없습니다.</Card>}
          {!loading &&
            recent.map((v) => (
              <Card key={v.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/auctions/${v.id}`}
                      className="font-semibold hover:underline"
                    >
                      {v.title}
                    </Link>
                    <div className="text-sm text-subink mt-1">{v.category}</div>
                  </div>
                  <Badge
                    tone={
                      new Date(v.endDate) - Date.now() < 1000 * 60 * 60 * 24 * 3
                        ? "danger"
                        : "info"
                    }
                  >
                    {fmtDate(v.endDate)} 마감
                  </Badge>
                </div>

                <div className="mt-3 text-sm">
                  최저입찰가 <span className="font-semibold">{fmtPrice(v.minBid)}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link to={`/auctions/${v.id}`} className="btn btn-primary flex-1 text-center">
                    상세
                  </Link>
                  <Link to="/auctions" className="btn btn-ghost flex-1 text-center">
                    더보기
                  </Link>
                </div>
              </Card>
            ))}
        </div>
      </Section>

      {/* ===== 간단 통계 ===== */}
      <Section className="py-10">
        <div className="grid sm:grid-cols-3 gap-3">
          <Stat label="금주 마감" value={`${recent.length}건`} />
          <Stat label="평균 최저가(샘플)" value="418,000,000원" />
          <Stat label="연동 예정" value="Onbid API" />
        </div>
      </Section>

      {/* ===== FAQ 라이트 ===== */}
      <Section title="자주 묻는 질문" className="pb-16">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h4 className="font-semibold">실제 공매 데이터인가요?</h4>
            <p className="text-sm text-subink mt-2">
              현재는 샘플 데이터로 동작하며, Onbid API 연동을 준비 중입니다.
            </p>
          </Card>
          <Card className="p-5">
            <h4 className="font-semibold">어떤 필터가 제공되나요?</h4>
            <p className="text-sm text-subink mt-2">
              주소/물건명 검색과 “마감 임박” 토글을 지원합니다. 향후 지역/유형/가격 필터를
              추가할 예정입니다.
            </p>
          </Card>
        </div>
      </Section>
    </>
  );
}

/* ===== 내부 미니 컴포넌트 ===== */
function PreviewRow({ title, sub }) {
  return (
    <div className="card flex items-center justify-between gap-4">
      <div>
        <div className="font-semibold">{title}</div>
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
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6l7-3z" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  );
}
