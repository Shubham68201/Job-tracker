import { useState } from "react";
import { FiBriefcase, FiLogOut, FiUser, FiChevronDown } from "react-icons/fi";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { logout } from "../../store/slices/authSlice";
import { toast } from "react-hot-toast";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const { items } = useAppSelector((s) => s.applications);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out");
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center">
            <FiBriefcase className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg">JobTrackr</span>
          <span className="hidden sm:flex items-center gap-1 ml-2 px-2 py-0.5 bg-slate-800 rounded-full text-xs text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {items.length} applications
          </span>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center">
              <FiUser className="w-3.5 h-3.5 text-indigo-300" />
            </div>
            <span className="hidden sm:block text-sm text-slate-300 font-medium">
              {user?.name}
            </span>
            <FiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 card-glass shadow-xl z-20 py-1 animate-fade-in">
                <div className="px-3 py-2 border-b border-slate-700/50">
                  <p className="text-xs text-slate-500">Signed in as</p>
                  <p className="text-sm text-slate-200 font-medium truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-red-400 transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
