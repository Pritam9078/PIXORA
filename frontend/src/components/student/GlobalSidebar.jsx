import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Target, FileText, 
  Settings, LogOut, X, Trophy, Briefcase, 
  Users, Monitor, Wallet, Gamepad2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';

const GlobalSidebar = ({ isOpen, setIsOpen }) => {
  const { signOut } = useAuth();
  const { currentTheme } = useStudentTheme();
  const location = useLocation();

  const isGameDev = currentTheme.id === 'game_dev';
  const isBlockchain = currentTheme.id === 'blockchain';

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/student/my-courses', icon: BookOpen },
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
    <aside 
      className={`${isOpen ? 'w-64' : 'w-20'} glass-panel border-r border-white/5 transition-all duration-300 flex flex-col z-50 flex-shrink-0 h-full overflow-hidden`}
    >
      <div className="p-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[var(--st-gradient-primary)] flex items-center justify-center text-on-secondary font-bold shadow-lg shadow-secondary-container/20 group-hover:scale-110 transition-transform">
            P
          </div>
          {isOpen && <span className="font-headline font-bold text-xl tracking-tight text-white">PIXORA</span>}
        </Link>
        {isOpen && (
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/5 rounded text-on-surface-variant transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 py-4 custom-scrollbar">
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
              {isOpen && <span className="text-sm font-semibold tracking-wide">{item.name}</span>}
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
              {isOpen && <span className="text-sm font-semibold tracking-wide">{specializedItem.name}</span>}
            </Link>
          )}
        </nav>

        {isOpen && <div className="text-[10px] font-headline font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] px-3 pt-4">Network</div>}
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
              {isOpen && <span className="text-sm font-semibold tracking-wide">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5 space-y-1">
        <Link to="/student/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-on-surface-variant hover:bg-white/5 hover:text-white font-headline transition-all">
          <Settings size={20} />
          {isOpen && <span className="text-sm font-semibold tracking-wide">Settings</span>}
        </Link>
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 font-headline transition-all"
        >
          <LogOut size={20} />
          {isOpen && <span className="text-sm font-semibold tracking-wide">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default GlobalSidebar;
