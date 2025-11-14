// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// TODO: 실제 구현한 API 헬퍼에 맞게 import
// import { login } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleClose = () => {
    // 그냥 이전 페이지로
    navigate(-1);
    // 또는 항상 홈으로 가고 싶으면: navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // TODO: 실제 로그인 API 붙일 때 사용
      // await login({ email: form.email, password: form.password });
      // 로그인 성공 후 홈으로 이동
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("이메일 또는 비밀번호를 다시 확인해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center px-4">
      {/* 모달 카드 */}
      <div className="bg-white rounded-card shadow-2xl max-w-4xl w-full grid md:grid-cols-2 overflow-hidden relative">
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 text-subink hover:text-ink text-xl"
        >
          ×
        </button>

        {/* 왼쪽 웰컴 영역 */}
        <div className="bg-[#f4f4f4] border-r border-line px-10 py-12 flex flex-col justify-between">
          <div>
            <p className="text-sm text-subink mb-2">Welcome!</p>
            <h2 className="text-2xl font-bold tracking-tight mb-3">
              투명한 공매의 시작,{" "}
              <span className="text-primary">OF</span>
            </h2>
            <p className="text-sm text-subink leading-6">
              공공데이터 기반 공매 정보를
              <br />
              카드형 UI로 한 번에 확인해 보세요.
            </p>
          </div>

          <div className="flex items-center gap-4 mt-10">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">OF</span>
            </div>
            <p className="text-xs text-subink">
              아직 계정이 없나요?{" "}
              <Link to="/signup" className="underline font-medium">
                회원가입
              </Link>
            </p>
          </div>
        </div>

        {/* 오른쪽 로그인 폼 영역 */}
        <div className="px-10 py-12">
          <h2 className="text-xl font-semibold mb-6">Log in</h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-subink">
                EMAIL
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-subink">
                PASSWORD
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="w-3.5 h-3.5"
                />
                <span>로그인 상태 유지</span>
              </label>
              <button
                type="button"
                className="text-subink hover:text-ink underline"
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-500 mt-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2"
            >
              {loading ? "로그인 중..." : "Log in now"}
            </button>
          </form>

          {/* 소셜 로그인 영역 (UI만) */}
          <div className="mt-8">
            <p className="text-xs text-subink mb-3">Or sign in with</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 border border-line rounded-md py-2 text-xs hover:bg-neutral-50"
              >
                Google
              </button>
              <button
                type="button"
                className="flex-1 border border-line rounded-md py-2 text-xs hover:bg-neutral-50"
              >
                Facebook
              </button>
              <button
                type="button"
                className="flex-1 border border-line rounded-md py-2 text-xs hover:bg-neutral-50"
              >
                Twitter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
