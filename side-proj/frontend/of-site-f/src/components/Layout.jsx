import { Link, NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-white/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary inline-block" />
            <span className="font-semibold tracking-tight">Onbid Finder</span>
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink to="/auctions" className="btn btn-ghost">공매 탐색</NavLink>
            <a className="btn btn-ghost" href="#">가이드</a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* 여기에 Home/다른 페이지가 꽂힙니다 */}
        <Outlet />
      </main>

      <footer className="border-t border-line bg-white text-sm text-subink">
  <div className="max-w-6xl mx-auto px-5 py-12 space-y-6">

    {/* 1️⃣ 약관 / 정책 링크 */}
    <nav className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] justify-center">
      <a href="#" className="hover:underline">이용약관</a>
      <a href="#" className="hover:underline">개인정보처리방침</a>
      <a href="#" className="hover:underline">저작권 및 데이터 이용정책</a>
      <a href="#" className="hover:underline">고객헌장</a>
      <a href="#" className="hover:underline">제휴안내</a>
      <a href="#" className="hover:underline">신고센터</a>
      <a href="#" className="hover:underline">원격지원</a>
      <a href="#" className="hover:underline">사이트맵</a>
    </nav>

    {/* 2️⃣ 안내 문구 */}
    <p className="text-[13px] leading-6 text-center text-subink/90">
      본 서비스에서 제공되는 모든 정보와 화면은 참고용으로만 제공되며, 
      허가 없이 상업적 용도로 사용할 수 없습니다.<br/>
      데이터는 공공데이터포털 및 관련 기관의 공개 API를 기반으로 제공됩니다.
    </p>

    {/* 3️⃣ 회사 정보 */}
    <div className="text-[13px] leading-6 text-center">
      <p>주소 : (04050) 서울특별시 마포구 홍익로 96, OF빌딩 5층</p>
      <p>사업자등록번호 : 000-00-00000</p>
      <p>
        TEL : 02-1234-5678 / E-mail : 
        <a href="mailto:help@onbidfinder.kr" className="underline ml-1">help@onbidfinder.kr</a>
      </p>
    </div>

    {/* 4️⃣ 저작권 */}
    <div className="border-t border-line pt-4 text-center text-[12px] text-subink/80">
      Copyright © {new Date().getFullYear()} 
      <span className="font-medium text-ink ml-1">OF (Onbid Finder)</span>. 
      All rights reserved.
    </div>
  </div>
</footer>


      <div className="fixed inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-sky/20 to-transparent" />
    </div>
  );
}
