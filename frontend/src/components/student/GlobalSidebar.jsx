import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Target, FileText, 
  Settings, LogOut, X, Trophy, Briefcase, 
  Users, Monitor, Wallet, Gamepad2, Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { LogoMark } from '../common/Logo';

const GlobalSidebar = ({ isOpen, setIsOpen }) => {
  const { signOut } = useAuth();
  const { currentTheme } = useStudentTheme();
  const location = useLocation();

  const { profile } = useAuth();
  const isAgnostic = !profile || profile.learning_track === 'agnostic';
  const isGameDev = currentTheme?.id === 'game_dev';
  const isBlockchain = currentTheme?.id === 'blockchain';

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Browse Catalog', path: '/student/courses', icon: Compass },
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
          <LogoMark size={28} />
          {isOpen && <span className="font-headline font-bold text-xl tracking-tight text-white">PIXORA</span>}
        </Link>
        {isOpen && (
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/5 rounded text-on-surface-variant transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-6 py-4 custom-scrollbar">
        {/* Onboarding Cadet Pipeline Steps Card */}
        {isAgnostic && isOpen && (
          <div className="mx-1 p-3.5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-yellow-500/5 border border-orange-500/20 shadow-lg shadow-orange-500/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-headline font-black text-orange-400 uppercase tracking-wider">Cadet Onboarding</span>
              <span className="text-[9px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-black">INITIALIZING</span>
            </div>
            
            <div className="space-y-2">
              <Link to="/student/enroll-now" className="flex items-center gap-2.5 group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-black transition-all ${
                  location.pathname === '/student/enroll-now' 
                    ? 'border-orange-400 text-orange-400 animate-pulse bg-orange-400/10'
                    : 'border-orange-500/30 text-orange-500/50 group-hover:border-orange-400/50'
                }`}>1</div>
                <span className={`text-[11px] font-medium transition-colors ${location.pathname === '/student/enroll-now' ? 'text-orange-300 font-bold' : 'text-on-surface-variant/60 group-hover:text-on-surface-variant'}`}>Choose Track</span>
              </Link>
              
              <Link to="/student/document-verification" className="flex items-center gap-2.5 group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-black transition-all ${
                  location.pathname === '/student/document-verification' 
                    ? 'border-orange-400 text-orange-400 animate-pulse bg-orange-400/10'
                    : 'border-orange-500/30 text-orange-500/50 group-hover:border-orange-400/50'
                }`}>2</div>
                <span className={`text-[11px] font-medium transition-colors ${location.pathname === '/student/document-verification' ? 'text-orange-300 font-bold' : 'text-on-surface-variant/60 group-hover:text-on-surface-variant'}`}>ID Verification</span>
              </Link>
              
              <Link to="/student/checkout" className="flex items-center gap-2.5 group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-black transition-all ${
                  location.pathname === '/student/checkout' 
                    ? 'border-orange-400 text-orange-400 animate-pulse bg-orange-400/10'
                    : 'border-orange-500/30 text-orange-500/50 group-hover:border-orange-400/50'
                }`}>3</div>
                <span className={`text-[11px] font-medium transition-colors ${location.pathname === '/student/checkout' ? 'text-orange-300 font-bold' : 'text-on-surface-variant/60 group-hover:text-on-surface-variant'}`}>Secure Payment</span>
              </Link>
            </div>
          </div>
        )}

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isLocked = isAgnostic && item.path !== '/student/dashboard' && item.path !== '/student/courses';
            return isLocked ? (
              <div
                key={item.name}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-headline text-on-surface-variant/30 cursor-not-allowed border border-dashed border-white/5"
                title="Complete Onboarding to unlock"
              >
                <item.icon size={20} className="opacity-40" />
                {isOpen && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                    <span className="text-[9px] bg-white/5 text-on-surface-variant/40 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Locked</span>
                  </div>
                )}
              </div>
            ) : (
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
            );
          })}
          
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
          {communityItems.map((item) => {
            const isLocked = isAgnostic;
            return isLocked ? (
              <div
                key={item.name}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-headline text-on-surface-variant/30 cursor-not-allowed border border-dashed border-white/5"
                title="Complete Onboarding to unlock"
              >
                <item.icon size={20} className="opacity-40" />
                {isOpen && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-sm font-semibold tracking-wide">{item.name}</span>
                    <span className="text-[9px] bg-white/5 text-on-surface-variant/40 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Locked</span>
                  </div>
                )}
              </div>
            ) : (
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
            );
          })}
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
