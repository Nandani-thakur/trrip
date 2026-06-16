import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/api";
import toast from "react-hot-toast";
import { Mail, Lock, Loader, ArrowRight, Eye, EyeOff } from "lucide-react";
import Logo from "../components/Logo";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't sign you in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 bg-grid-pattern bg-[size:32px_32px] flex items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-[26rem] animate-fade-up">
        <div className="flex justify-center mb-8 sm:mb-10">
          <Logo size="large" />
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-2xl sm:text-3xl text-white font-semibold">Welcome back</h1>
          <p className="text-white/50 mt-2 text-sm sm:text-base">Sign in to pick up your next trip</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-midnight-900 rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5 shadow-2xl shadow-black/40"
        >
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-midnight-800 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all text-[15px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPass ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-midnight-800 border border-white/10 rounded-2xl pl-11 pr-11 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all text-[15px]"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-midnight-950 font-semibold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
          >
            {loading ? (
              <><Loader className="w-4 h-4 animate-spin" /> Signing in</>
            ) : (
              <>Sign in <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <p className="text-center text-white/50 text-sm pt-1">
            New to Trrip?{" "}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 font-medium">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}