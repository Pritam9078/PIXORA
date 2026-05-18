import React, { useState, useEffect } from 'react';
import { 
  Trophy, Medal, Target, Zap, 
  Flame, ChevronUp, ChevronDown, 
  Search, Globe, Filter, Star, Award,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';
import SocialService from '../../services/SocialService';

const Leaderboard = () => {
  const { profile } = useAuth();
  const { currentTheme } = useStudentTheme();
  const [activeTab, setActiveTab] = useState('global');
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const limit = activeTab === 'global' ? 50 : 20;
        const data = await SocialService.getLeaderboard(limit, activeTab, profile?.id);
        setLeaders(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeTab]);

  const filteredLeaders = leaders.filter(l => 
    l.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[var(--st-color-primary)] animate-spin" />
        <p className="text-on-surface-variant/40 font-headline font-bold text-[10px] uppercase tracking-[0.2em]">Aggregating Neural Rankings...</p>
      </div>
    );
  }

  const topThree = filteredLeaders.slice(0, 3);
  const others = filteredLeaders.slice(3);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel border-[var(--st-color-primary)]/20 text-[var(--st-color-primary)] font-headline font-bold text-[8px] uppercase tracking-[0.25em] shadow-[0_0_12px_var(--st-color-glow)]">
          <Trophy size={12} className="animate-pulse" />
          Elite Rankings Matrix
        </div>
        <h1 className="text-xl md:text-2xl font-headline font-bold text-white tracking-tight">Pixora <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_12px_var(--st-color-glow)]">Hall of Fame</span></h1>
        <p className="text-on-surface-variant/60 max-w-lg mx-auto font-medium text-[11px] md:text-xs leading-relaxed">
          The elite learners of the Pixora ecosystem. Climb the ranks by completing missions, deploying protocols, and maintaining your transmission streak.
        </p>
      </div>

      {/* Podium Section */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-3 pt-2 pb-1 relative">
        <div className="absolute inset-0 circuit-bg opacity-[0.03] -z-10"></div>
        
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="order-2 md:order-1 flex flex-col items-center group w-full md:w-auto">
            <div className="relative mb-2">
              <div className="w-11 h-11 rounded-[14px] rotate-45 border border-slate-400/30 p-0.5 group-hover:scale-105 transition-all duration-700 overflow-hidden glass-panel shadow-[0_0_15px_rgba(148,163,184,0.12)]">
                <img src={topThree[1].avatar_url || `https://ui-avatars.com/api/?name=${topThree[1].full_name}`} className="-rotate-45 w-full h-full object-cover rounded-lg" alt="Rank 2" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded bg-slate-400 text-black flex items-center justify-center font-headline font-black text-[10px] border border-[#051424] shadow-xl">2</div>
            </div>
            <p className="font-headline font-bold text-white text-xs mb-0.5 tracking-wide">{topThree[1].full_name}</p>
            <p className="text-[8px] font-headline font-bold text-slate-400 uppercase tracking-widest">{(topThree[1].xp_points || 0).toLocaleString()} XP</p>
            <div className="h-6 w-28 glass-panel border-white/5 rounded-t-xl mt-2 hidden md:block relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-slate-400/5 to-transparent"></div>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="order-1 md:order-2 flex flex-col items-center group w-full md:w-auto z-10">
            <div className="relative mb-3">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce drop-shadow-[0_0_8px_rgba(234,179,8,0.35)]">
                <Star size={16} fill="currentColor" />
              </div>
              <div className="w-14 h-14 rounded-[16px] rotate-45 border-2 border-yellow-500/50 p-0.5 group-hover:scale-105 transition-all duration-700 overflow-hidden glass-panel shadow-[0_0_25px_rgba(234,179,8,0.2)]">
                <img src={topThree[0].avatar_url || `https://ui-avatars.com/api/?name=${topThree[0].full_name}`} className="-rotate-45 w-full h-full object-cover rounded-lg" alt="Rank 1" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded bg-yellow-500 text-black flex items-center justify-center font-headline font-black text-xs border border-[#051424] shadow-xl">1</div>
            </div>
            <p className="font-headline font-black text-white text-sm mb-0.5 tracking-wider drop-shadow-lg">{topThree[0].full_name}</p>
            <p className="text-[9px] font-headline font-bold text-yellow-500 uppercase tracking-[0.15em] drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]">{(topThree[0].xp_points || 0).toLocaleString()} XP</p>
            <div className="h-10 w-32 glass-panel border-yellow-500/10 rounded-t-2xl mt-3 hidden md:block relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent"></div>
               <div className="absolute inset-0 circuit-bg opacity-10"></div>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="order-3 flex flex-col items-center group w-full md:w-auto">
            <div className="relative mb-2">
              <div className="w-11 h-11 rounded-[14px] rotate-45 border border-amber-700/30 p-0.5 group-hover:scale-105 transition-all duration-700 overflow-hidden glass-panel shadow-[0_0_15px_rgba(180,83,9,0.12)]">
                <img src={topThree[2].avatar_url || `https://ui-avatars.com/api/?name=${topThree[2].full_name}`} className="-rotate-45 w-full h-full object-cover rounded-lg" alt="Rank 3" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded bg-amber-700 text-white flex items-center justify-center font-headline font-black text-[10px] border border-[#051424] shadow-xl">3</div>
            </div>
            <p className="font-headline font-bold text-white text-xs mb-0.5 tracking-wide">{topThree[2].full_name}</p>
            <p className="text-[8px] font-headline font-bold text-amber-700 uppercase tracking-widest">{(topThree[2].xp_points || 0).toLocaleString()} XP</p>
            <div className="h-4 w-28 glass-panel border-white/5 rounded-t-xl mt-2 hidden md:block relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-amber-700/5 to-transparent"></div>
            </div>
          </div>
        )}
      </div>

      {/* Rankings List */}
      <div className="glass-panel rounded-[20px] border-white/5 overflow-hidden shadow-2xl">
        <div className="p-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
          <div className="flex items-center gap-1.5 p-0.5 glass-panel rounded-lg border-white/10 w-fit">
            {['global', 'track-only'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1 rounded-md text-[8px] font-headline font-bold uppercase tracking-[0.2em] transition-all ${
                  activeTab === t 
                    ? 'bg-[var(--st-color-primary)] text-black shadow-[0_0_8px_var(--st-color-glow)]' 
                    : 'text-on-surface-variant/40 hover:text-white'
                }`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-56 group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--st-color-primary)] transition-colors" size={12} />
            <input 
              type="text" 
              placeholder="Search student identity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-card border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-[9px] font-medium text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 placeholder:text-white/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-on-surface-variant/30 text-[8px] font-headline font-black uppercase tracking-[0.25em] border-b border-white/5">
              <tr>
                <th className="px-4 py-2">Rank</th>
                <th className="px-4 py-2">Identity</th>
                <th className="px-4 py-2">Matrix Points</th>
                <th className="px-4 py-2">Streak</th>
                <th className="px-4 py-2 text-right">Delta Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {others.map((student, index) => {
                const isMe = student.id === profile?.id;
                return (
                  <tr 
                    key={student.id} 
                    className={`group transition-all duration-300 ${isMe ? 'bg-[var(--st-color-primary)]/[0.03]' : 'hover:bg-white/[0.02]'}`}
                  >
                    <td className="px-4 py-1.5">
                      <span className={`font-headline font-bold text-xs ${isMe ? 'text-[var(--st-color-primary)]' : 'text-on-surface-variant/40 group-hover:text-white'} transition-colors`}>
                        #{(index + 4).toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-4 py-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg border p-0.5 transition-all duration-500 group-hover:scale-105 shadow-lg ${isMe ? 'border-[var(--st-color-primary)] shadow-[0_0_8px_var(--st-color-glow)]' : 'border-white/10 group-hover:border-white/20'}`}>
                          <img src={student.avatar_url || `https://ui-avatars.com/api/?name=${student.full_name}`} className="w-full h-full object-cover rounded-md" alt="" />
                        </div>
                        <div>
                          <p className={`font-headline font-bold text-xs tracking-wide ${isMe ? 'text-[var(--st-color-primary)]' : 'text-white'}`}>
                            {student.full_name} {isMe && <span className="ml-2 text-[7px] font-black bg-[var(--st-color-primary)] text-black px-1 py-0.5 rounded shadow-[0_0_4px_var(--st-color-glow)]">YOU</span>}
                          </p>
                          <p className="text-[8px] font-headline font-bold text-on-surface-variant/30 uppercase tracking-[0.15em] mt-0.5">NEURAL SYNCED</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <Zap size={10} className="text-[var(--st-color-primary)] drop-shadow-[0_0_4px_var(--st-color-glow)]" fill="currentColor" />
                        <span className="font-headline font-black text-xs text-white tracking-widest">{(student.xp_points || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <Flame size={10} className="text-orange-500 drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]" fill="currentColor" />
                        <span className="font-headline font-bold text-xs text-white">{student.current_streak || 0} Days</span>
                      </div>
                    </td>
                    <td className="px-4 py-1.5 text-right">
                      <div className="flex items-center justify-end gap-1 text-emerald-400 font-headline font-bold text-[8px] uppercase tracking-widest">
                        <ChevronUp size={10} />
                        <span>Matrix Stable</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* User's Contextual Rank (If not in top view and role is student) */}
        {profile?.role === 'student' && !filteredLeaders.find(s => s.id === profile?.id) && (
          <div className="p-3 bg-[var(--st-color-primary)]/[0.05] border-t border-[var(--st-color-primary)]/20 flex items-center justify-between px-5 relative overflow-hidden group">
            <div className="absolute inset-0 circuit-bg opacity-10 -z-10 group-hover:scale-110 transition-transform duration-[10s]"></div>
            <div className="flex items-center gap-3">
              <span className="font-headline font-black text-sm text-[var(--st-color-primary)] drop-shadow-[0_0_8px_var(--st-color-glow)]">SYNC</span>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg border border-[var(--st-color-primary)] overflow-hidden shadow-[0_0_6px_var(--st-color-glow)]">
                  <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}`} alt="" />
                </div>
                <span className="font-headline font-bold text-xs text-white tracking-wide">Your Standing</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-[var(--st-color-primary)]" fill="currentColor" />
                <span className="font-headline font-black text-xs text-white">{profile?.xp_points || 0} XP</span>
              </div>
              <p className="text-[8px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.2em] hidden sm:block">Ascend ranks with missions</p>
            </div>
          </div>
        )}
      </div>

      {/* Rewards Teaser */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Seasonal MVP Protocol', icon: <Medal size={16} />, color: 'yellow-500', desc: 'Top 10 matrix leaders receive 20% credit towards advanced masterclass circuits.', size: 48 },
          { title: 'Streak Multiplier', icon: <Flame size={16} />, color: 'orange-500', desc: 'Maintain a 7-day transmission streak to trigger a 500 XP burst every reset.', size: 48 }
        ].map((reward) => (
          <div key={reward.title} className="glass-panel p-4 rounded-[20px] border-white/5 flex items-center gap-3.5 group hover:border-[var(--st-color-primary)]/30 transition-all shadow-xl relative overflow-hidden">
            <div className={`absolute -right-3 -bottom-3 text-${reward.color} opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700`}>
               {React.cloneElement(reward.icon, { size: reward.size })}
            </div>
            <div className={`w-10 h-10 rounded-[14px] bg-${reward.color}/10 flex items-center justify-center text-${reward.color} group-hover:scale-110 transition-all duration-500 shadow-inner border border-${reward.color}/20`}>
              {reward.icon}
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="font-headline font-bold text-white text-xs mb-0.5 tracking-tight group-hover:text-[var(--st-color-primary)] transition-colors">{reward.title}</h3>
              <p className="text-[9px] font-medium text-on-surface-variant/60 leading-relaxed">{reward.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
