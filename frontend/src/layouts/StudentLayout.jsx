import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Target, FileText, 
  HelpCircle, Settings, LogOut, Menu, X, 
  Bell, Flame, Zap, Trophy, Briefcase, 
  Users, MessageSquare, Monitor, Cpu, 
  ChevronRight, Search, Wallet, Gamepad2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudentTheme } from '../context/StudentThemeContext';

const StudentLayout = () => {
  const { profile, signOut } = useAuth();
  const { currentTheme } = useStudentTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const isGameDev = currentTheme.id === 'game_dev';
  const isBlockchain = currentTheme.id === 'blockchain';

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/student/courses', icon: BookOpen },
    { name: 'Assignments', path: '/student/assignments', icon: FileText },
    { name: 'Quizzes', path: '/student/quizzes', icon: Target },
    { name: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
    { name: 'Career Hub', path: '/student/career', icon: Briefcase },
  ];

  const communityItems = [
    { name: 'Community', path: '/student/community', icon: Users },
    { name: 'Live Classes', path: '/student/live', icon: Monitor },
  ];

  const specializedItem = isGameDev 
    ? { name: 'Game Dev Hub', path: '/student/game-hub', icon: Gamepad2 }
    : isBlockchain 
      ? { name: 'Web3 Hub', path: '/student/web3-hub', icon: Wallet }
      : null;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--st-color-background)] font-body">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} glass-panel border-r border-white/5 transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--st-gradient-primary)] flex items-center justify-center text-on-secondary font-bold shadow-lg shadow-secondary-container/20 group-hover:scale-110 transition-transform">
              P
            </div>
            {isSidebarOpen && <span className="font-headline font-bold text-xl tracking-tight text-white">PIXORA</span>}
          </Link>
          {isSidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/5 rounded text-on-surface-variant transition-colors">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-6 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-headline ${
                  location.pathname === item.path 
                    ? 'bg-[var(--st-gradient-primary)] text-on-secondary shadow-lg shadow-[var(--st-color-glow)]' 
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} className={location.pathname === item.path ? 'animate-pulse' : ''} />
                {isSidebarOpen && <span className="text-sm font-semibold tracking-wide">{item.name}</span>}
              </Link>
            ))}
            
            {specializedItem && (
              <Link
                to={specializedItem.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-headline mt-4 ${
                  location.pathname === specializedItem.path 
                    ? 'bg-[var(--st-gradient-primary)] text-on-secondary shadow-lg shadow-[var(--st-color-glow)]' 
                    : 'text-[var(--st-color-primary)] border border-[var(--st-color-primary)]/20 hover:bg-[var(--st-color-primary)]/10'
                }`}
              >
                <specializedItem.icon size={20} />
                {isSidebarOpen && <span className="text-sm font-semibold tracking-wide">{specializedItem.name}</span>}
              </Link>
            )}
          </nav>

          {isSidebarOpen && <div className="text-[10px] font-headline font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] px-3 pt-4">Network</div>}
          <nav className="space-y-1">
            {communityItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-headline ${
                  location.pathname === item.path 
                    ? 'bg-white/10 text-white border border-white/10' 
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span className="text-sm font-semibold tracking-wide">{item.name}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5 space-y-1">
          <Link to="/student/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-white font-headline transition-all">
            <Settings size={20} />
            {isSidebarOpen && <span className="text-sm font-semibold tracking-wide">Settings</span>}
          </Link>
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 font-headline transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-semibold tracking-wide">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 glass-panel border-b border-white/5 flex items-center justify-between px-6 z-40 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            {!isSidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded text-on-surface-variant">
                <Menu size={20} />
              </button>
            )}
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input 
                type="text" 
                placeholder="Search terminal..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs font-body focus:outline-none focus:border-[var(--st-color-primary)]/50 focus:ring-1 focus:ring-[var(--st-color-primary)]/20 transition-all placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {/* Gamified Stats */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-orange-500/5 text-orange-500 px-3 py-1.5 rounded-full border border-orange-500/10 font-headline">
                <Flame size={16} fill="currentColor" />
                <span className="text-xs font-bold">{profile?.current_streak || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[var(--st-color-primary)]/5 text-[var(--st-color-primary)] px-3 py-1.5 rounded-full border border-[var(--st-color-primary)]/10 font-headline">
                <Zap size={16} fill="currentColor" />
                <span className="text-xs font-bold">{profile?.xp_points || 0} XP</span>
              </div>
            </div>

            <button className="p-2 text-on-surface-variant hover:text-white relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--st-color-primary)] rounded-full border border-[var(--st-color-surface)] shadow-[0_0_10px_var(--st-color-glow)]"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-white/5">
              <div className="text-right hidden md:block">
                <p className="text-xs font-headline font-bold text-white truncate max-w-[120px]">{profile?.full_name || 'Student'}</p>
                <p className="text-[10px] font-headline font-bold text-on-surface-variant/60 uppercase tracking-widest">{currentTheme.name}</p>
              </div>
              <div className="w-9 h-9 rounded-full border border-[var(--st-color-primary)]/30 overflow-hidden ring-2 ring-[var(--st-color-primary)]/5">
                <img 
                  src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=random`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* CSS Utilities for Themes */}
      <style>{`
        .student-theme-game_dev {
          --st-glow-effect: 0 0 15px rgba(0, 209, 255, 0.3);
        }
        .student-theme-blockchain {
          --st-glow-effect: 0 0 15px rgba(0, 255, 148, 0.2);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: var(--st-color-border);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: var(--st-color-muted);
        }
      `}</style>
    </div>
  );
};

export default StudentLayout;
