import { Link } from "react-router-dom";

export default function Guide() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-sky/10 border-b border-line">
        <div className="max-w-6xl mx-auto px-5 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            공매가 처음이라면? <br />
            <span className="bg-gradient-to-r from-primary to-sky bg-clip-text text-transparent">
              OF 초보자 가이드
            </span>
          </h1>
          <p className="text-lg text-subink mt-4 max-w-2xl mx-auto">
            공매는 복잡해 보이지만, 순서를 이해하면 누구나 참여할 수 있습니다.
            <br />
            아래 단계별 안내를 따라 차근히 배워보세요 👇
          </p>
        </div>
      </section>

      {/* Step Section */}
      <section className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-6">
        {/* STEP 1 */}
        <div className="card">
          <div className="text-sm font-semibold text-sky mb-2">STEP 1</div>
          <h3 className="font-bold text-lg mb-2">공매 이해하기</h3>
          <p className="text-subink text-sm">
            공매는 국가·공공기관이 보유한 자산을 공개적으로 매각하는 제도입니다.
            <br />입찰자 간 경쟁을 통해 투명하게 낙찰자가 결정됩니다.
          </p>
        </div>

        {/* STEP 2 */}
        <div className="card">
          <div className="text-sm font-semibold text-sky mb-2">STEP 2</div>
          <h3 className="font-bold text-lg mb-2">OF 회원가입</h3>
          <p className="text-subink text-sm">
            OF 온비드 파인드(<Link to="/Signup" className="text-primary font-medium">onbidfind.co.kr</Link>)에 회원가입 후
            인증서를 등록해야 입찰에 참여할 수 있습니다.
          </p>
        </div>

        {/* STEP 3 */}
        <div className="card">
          <div className="text-sm font-semibold text-sky mb-2">STEP 3</div>
          <h3 className="font-bold text-lg mb-2">물건 검색하기</h3>
          <p className="text-subink text-sm">
            OF에서는 온비드 공공데이터를 기반으로
            <br />공매 물건을 쉽고 빠르게 탐색할 수 있습니다.
            <br />관심 지역과 자산유형을 설정해보세요.
          </p>
        </div>
      </section>

      {/* Visual Tip */}
      <section className="max-w-5xl mx-auto px-5 py-10">
        <div className="rounded-card border border-line bg-gradient-to-r from-sky/10 to-primary/5 p-6 md:p-10 text-center shadow-subtle">
          <h3 className="font-semibold text-lg mb-2">💡 공매는 누구나 접근 가능합니다</h3>
          <p className="text-subink text-sm max-w-2xl mx-auto">
            단, 주의사항(보증금, 유찰, 낙찰 후 절차)을 반드시 숙지하세요.
            <br />OF는 여러분이 신뢰할 수 있는 공공데이터 기반의 정보를 제공합니다.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 border-t border-line bg-background">
        <h2 className="text-2xl font-bold mb-4">이제 실제 공매 물건을 탐색해볼까요?</h2>
        <Link to="/auctions" className="btn btn-primary">
          공매 물건 탐색하기 →
        </Link>
      </section>
    </div>
  );
}
