// src/pages/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client"; // axios 인스턴스

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    birthDate: "",
    nationality: "KOR",
    phone: "",
    gender: "M",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password || !form.name) {
      setError("이메일, 비밀번호, 이름은 필수입니다.");
      return;
    }
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);

      // 🔹 백엔드 /api/auth/signup (JSON) 가정
      await client.post("/auth/signup", {
        email: form.email,
        password: form.password,
        name: form.name,
        birthDate: form.birthDate || null,
        nationality: form.nationality || null,
        phone: form.phone || null,
        gender: form.gender || null,
      });

      setDone(true);
      // 잠깐 안내 후 로그인 페이지로 이동하고 싶으면:
      // navigate("/login");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-linear-to-b from-white via-white to-sky/10 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-card shadow-2xl max-w-5xl w-full grid md:grid-cols-2 overflow-hidden border border-line">
        {/* LEFT - 브랜드 / 안내 */}
        <div className="bg-sky/5 border-r border-line flex flex-col justify-between p-8 md:p-10">
          <div>
            <p className="text-xs font-medium text-primary mb-2">
              Beta · Onbid Finder
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">
              계정 만들기
            </h1>
            <p className="text-sm text-subink leading-6">
              OF 계정을 만들면 관심 공매를 저장하고,
              <br />
              마감 임박 알림 등 개인화 기능을 활용할 수 있습니다.
            </p>
          </div>

          <div className="mt-10">
            <div className="text-xs uppercase tracking-[0.2em] text-subink mb-2">
              BRAND
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary inline-block" />
              <span className="font-semibold text-sm">Onbid Finder</span>
            </div>
            <p className="text-xs text-subink mt-3">
              공공데이터 기반 공매 탐색 서비스 ·{" "}
              <span className="font-medium">투명한 공매의 시작</span>
            </p>
          </div>
        </div>

        {/* RIGHT - 회원가입 폼 */}
        <div className="p-8 md:p-10 flex flex-col">
          <h2 className="text-xl font-bold mb-2">회원가입</h2>
          <p className="text-sm text-subink mb-6">
            이미 계정이 있다면{" "}
            <Link to="/login" className="text-primary underline font-medium">
              로그인
            </Link>
            해주세요.
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {done ? (
            <div className="mt-4 text-sm">
              <p className="font-semibold mb-2">회원가입이 완료되었습니다 🎉</p>
              <p className="text-subink mb-4">
                이제 로그인 페이지에서 방금 생성한 계정으로 로그인할 수
                있습니다.
              </p>
              <button
                className="btn btn-primary w-full"
                onClick={() => navigate("/login")}
              >
                로그인 페이지로 이동
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium mb-1">이름</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-line rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                  placeholder="홍길동"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-sm font-medium mb-1">이메일</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-line rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>

              {/* 비밀번호 */}
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border border-line rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                    placeholder="영문/숫자/특수문자 조합"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={form.passwordConfirm}
                    onChange={handleChange}
                    className="w-full border border-line rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                    placeholder="다시 한 번 입력"
                  />
                </div>
              </div>

              {/* 생년월일 / 국적 */}
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    생년월일
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={form.birthDate}
                    onChange={handleChange}
                    className="w-full border border-line rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    국적
                  </label>
                  <select
                    name="nationality"
                    value={form.nationality}
                    onChange={handleChange}
                    className="w-full border border-line rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary bg-white"
                  >
                    <option value="KOR">대한민국</option>
                    <option value="USA">미국</option>
                    <option value="JPN">일본</option>
                    <option value="CHN">중국</option>
                    <option value="OTHER">기타</option>
                  </select>
                </div>
              </div>

              {/* 전화번호 / 성별 */}
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    휴대전화
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border border-line rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                    placeholder="010-1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    성별
                  </label>
                  <div className="flex items-center gap-4 text-sm">
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        name="gender"
                        value="M"
                        checked={form.gender === "M"}
                        onChange={handleChange}
                      />
                      <span>남성</span>
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        name="gender"
                        value="F"
                        checked={form.gender === "F"}
                        onChange={handleChange}
                      />
                      <span>여성</span>
                    </label>
                    <label className="inline-flex items-center gap-1">
                      <input
                        type="radio"
                        name="gender"
                        value="N"
                        checked={form.gender === "N"}
                        onChange={handleChange}
                      />
                      <span>선택 안함</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 약관 동의 (형식만) */}
              <div className="flex items-start gap-2 text-xs text-subink">
                <input type="checkbox" className="mt-1" />
                <span>
                  <span className="font-medium text-ink">
                    서비스 이용약관 및 개인정보 처리방침
                  </span>
                  에 동의합니다.
                </span>
              </div>

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 text-base font-semibold disabled:opacity-60"
              >
                {loading ? "처리 중..." : "회원가입 완료"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

