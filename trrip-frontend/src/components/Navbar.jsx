import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Upload, LayoutGrid, Menu, X } from "lucide-react";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-midnight-950/80 backdrop-blur-xl border-b border-white/5">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
            <Logo size="small" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                isActive("/dashboard")
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Trips
            </Link>
            <Link
              to="/upload"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-midnight-950 font-semibold text-sm transition-all shadow-md shadow-amber-500/20"
            >
              <Upload className="w-4 h-4" />
              New trip
            </Link>
            <div className="flex items-center gap-3 ml-3 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-midnight-700 flex items-center justify-center text-amber-400 font-semibold text-sm">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="p-2 rounded-full text-white/50 hover:text-coral-400 hover:bg-white/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-white/80"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-1.5 animate-fade-in">
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                isActive("/dashboard") ? "bg-white/10 text-white" : "text-white/60"
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Trips
            </Link>
            <Link
              to="/upload"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500 text-midnight-950 font-semibold text-sm"
            >
              <Upload className="w-4 h-4" /> New trip
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-coral-400 text-sm font-medium text-left"
            >
              <LogOut className="w-4 h-4" /> Log out ({user?.name})
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}