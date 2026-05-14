import React from 'react';
import { Menu, Search, Bell, Flame, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';

const StudentTopNavbar = ({ isSidebarOpen, setSidebarOpen }) => {
  const { profile } = useAuth();
  const { currentTheme } = useStudentTheme();

  return (
    <header className="h-16 glass-panel border-b border-white/5 flex items-center justify-between px-6 z-40 sticky top-0 bg-[var(--st-color-background)]/80 backdrop-blur-xl">
      <div className="flex items-center gap-4 flex-1">
        {!isSidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded text-on-surface-variant transition-colors">
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
          <div className="flex items-center gap-1.5 bg-orange-500/5 text-orange-500 px-3 py-1.5 rounded-full border border-orange-500/10 font-headline shadow-sm shadow-orange-500/5">
            <Flame size={16} fill="currentColor" />
            <span className="text-xs font-bold">{profile?.current_streak || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[var(--st-color-primary)]/5 text-[var(--st-color-primary)] px-3 py-1.5 rounded-full border border-[var(--st-color-primary)]/10 font-headline shadow-sm shadow-[var(--st-color-glow)]/5">
            <Zap size={16} fill="currentColor" />
            <span className="text-xs font-bold">{profile?.xp_points || 0} XP</span>
          </div>
        </div>

        <button className="p-2 text-on-surface-variant hover:text-white relative transition-colors group">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--st-color-primary)] rounded-full border border-[var(--st-color-surface)] shadow-[0_0_10px_var(--st-color-glow)] group-hover:scale-125 transition-transform"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
          <div className="text-right hidden md:block">
            <p className="text-xs font-headline font-bold text-white truncate max-w-[120px]">{profile?.full_name || 'Student'}</p>
            <p className="text-[10px] font-headline font-bold text-on-surface-variant/60 uppercase tracking-widest">{currentTheme.name}</p>
          </div>
          <div className="w-9 h-9 rounded-full border border-[var(--st-color-primary)]/30 overflow-hidden ring-2 ring-[var(--st-color-primary)]/5 hover:ring-[var(--st-color-primary)]/20 transition-all cursor-pointer">
            <img 
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=random`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default StudentTopNavbar;
