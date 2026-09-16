import { useState } from "react"
import { useNavigate } from "react-router"
import { Eye, EyeOff, ArrowRight } from "lucide-react"

export function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    navigate("/dashboard")
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#0D1D35" }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-[-120px] right-[-80px] w-[480px] h-[480px] rounded-full opacity-[0.06]"
        style={{ background: "#F59E0B" }}
      />
      <div
        className="absolute bottom-[-160px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-[0.05]"
        style={{ background: "#F59E0B" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full opacity-[0.03]"
        style={{ background: "#FFFFFF" }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-[440px] mx-auto px-6">
        {/* Logo mark */}
        <div className="flex justify-center mb-10">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #B45309, #D97706)",
                boxShadow: "0 8px 32px rgba(180,83,9,0.45)",
              }}
            >
              <span className="text-white font-extrabold text-lg tracking-tight">
                BM
              </span>
            </div>
            <div className="text-center">
              <p className="text-white font-bold text-[15px] tracking-wide">
                Buyer Memo System
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
                Manajemen Memo Supplier Terpadu
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Amber top bar */}
          <div
            className="h-[3px]"
            style={{
              background: "linear-gradient(90deg, #B45309, #F59E0B, #B45309)",
            }}
          />

          <div className="px-8 pt-8 pb-8">
            <div className="mb-7">
              <h1 className="text-[22px] font-bold text-white leading-tight">
                Selamat Datang
              </h1>
              <p className="text-[13px] mt-1" style={{ color: "#64748B" }}>
                Masuk ke akun Anda untuk melanjutkan.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  className="text-[12px] font-semibold uppercase tracking-wider"
                  style={{ color: "#94A3B8" }}
                >
                  Email / Username
                </label>
                <input
                  type="text"
                  className="block w-full px-4 py-3 rounded-xl text-[13px] text-white placeholder:text-slate-600 transition-all focus:outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(180,83,9,0.7)"
                    e.currentTarget.style.boxShadow =
                      "0 0 0 3px rgba(180,83,9,0.12)"
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(255,255,255,0.1)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="text-[12px] font-semibold uppercase tracking-wider"
                    style={{ color: "#94A3B8" }}
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-[11px] font-medium"
                    style={{ color: "#D97706" }}
                  >
                    Lupa password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="block w-full pl-4 pr-10 py-3 rounded-xl text-[13px] text-white placeholder:text-slate-600 transition-all focus:outline-none"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border =
                        "1px solid rgba(180,83,9,0.7)"
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(180,83,9,0.12)"
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border =
                        "1px solid rgba(255,255,255,0.1)"
                      e.currentTarget.style.boxShadow = "none"
                    }}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors"
                    style={{ color: "#475569" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <div className="relative flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="w-4 h-4 rounded cursor-pointer accent-amber-600"
                  />
                </div>
                <label
                  htmlFor="remember-me"
                  className="text-[12px] cursor-pointer select-none"
                  style={{ color: "#64748B" }}
                >
                  Ingat saya selama 30 hari
                </label>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-[13px] font-bold text-white transition-all active:scale-[0.98] mt-2 group"
                style={{
                  background: "linear-gradient(135deg, #B45309, #D97706)",
                  boxShadow: "0 4px 20px rgba(180,83,9,0.4)",
                }}
              >
                Masuk ke Sistem
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-6">
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
              <span className="text-[11px]" style={{ color: "#334155" }}>
                v2.3.1 — Production
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(255,255,255,0.07)" }}
              />
            </div>
          </div>
        </div>

        <p
          className="text-center mt-6 text-[11px]"
          style={{ color: "#1E293B" }}
        >
          &copy; {new Date().getFullYear()} Buyer Memo System. All rights
          reserved.
        </p>
      </div>
    </div>
  )
}
