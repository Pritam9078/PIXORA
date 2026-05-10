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
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full glass-panel border-[var(--st-color-primary)]/20 text-[var(--st-color-primary)] font-headline font-bold text-[10px] uppercase tracking-[0.25em] shadow-[0_0_20px_var(--st-color-glow)]">
          <Trophy size={16} className="animate-pulse" />
          Elite Rankings Matrix
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-white tracking-tight">Pixora <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_15px_var(--st-color-glow)]">Hall of Fame</span></h1>
        <p className="text-on-surface-variant/60 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
          The elite learners of the Pixora ecosystem. Climb the ranks by completing missions, deploying protocols, and maintaining your transmission streak.
        </p>
      </div>

      {/* Podium Section */}
      <div className="flex flex-col md:flex-row items-end justify-center gap-10 md:gap-8 pt-16 pb-12 relative">
        <div className="absolute inset-0 circuit-bg opacity-[0.03] -z-10"></div>
        
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="order-2 md:order-1 flex flex-col items-center group w-full md:w-auto">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-3xl rotate-45 border-2 border-slate-400/30 p-1.5 group-hover:scale-110 transition-all duration-700 overflow-hidden glass-panel shadow-[0_0_30px_rgba(148,163,184,0.2)]">
                <img src={topThree[1].avatar_url || `https://ui-avatars.com/api/?name=${topThree[1].full_name}`} className="-rotate-45 w-full h-full object-cover rounded-2xl" alt="Rank 2" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-slate-400 text-black flex items-center justify-center font-headline font-black text-lg border-[4px] border-[#051424] shadow-2xl">2</div>
            </div>
            <p className="font-headline font-bold text-white text-base mb-1 tracking-wide">{topThree[1].full_name}</p>
            <p className="text-[10px] font-headline font-bold text-slate-400 uppercase tracking-widest">{(topThree[1].xp_points || 0).toLocaleString()} XP</p>
            <div className="h-28 w-48 glass-panel border-white/5 rounded-t-[32px] mt-6 hidden md:block relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-slate-400/5 to-transparent"></div>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="order-1 md:order-2 flex flex-col items-center group w-full md:w-auto z-10">
            <div className="relative mb-8 scale-110">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                <Star size={40} fill="currentColor" />
              </div>
              <div className="w-32 h-32 rounded-3xl rotate-45 border-[4px] border-yellow-500/50 p-2 group-hover:scale-110 transition-all duration-700 overflow-hidden glass-panel shadow-[0_0_50px_rgba(234,179,8,0.3)]">
                <img src={topThree[0].avatar_url || `https://ui-avatars.com/api/?name=${topThree[0].full_name}`} className="-rotate-45 w-full h-full object-cover rounded-2xl" alt="Rank 1" />
              </div>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-xl bg-yellow-500 text-black flex items-center justify-center font-headline font-black text-xl border-[4px] border-[#051424] shadow-2xl">1</div>
            </div>
            <p className="font-headline font-black text-white text-xl mb-1 tracking-wider drop-shadow-lg">{topThree[0].full_name}</p>
            <p className="text-xs font-headline font-bold text-yellow-500 uppercase tracking-[0.2em] drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">{(topThree[0].xp_points || 0).toLocaleString()} XP</p>
            <div className="h-40 w-56 glass-panel border-yellow-500/10 rounded-t-[40px] mt-8 hidden md:block relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent"></div>
               <div className="absolute inset-0 circuit-bg opacity-10"></div>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="order-3 flex flex-col items-center group w-full md:w-auto">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-3xl rotate-45 border-2 border-amber-700/30 p-1.5 group-hover:scale-110 transition-all duration-700 overflow-hidden glass-panel shadow-[0_0_30px_rgba(180,83,9,0.2)]">
                <img src={topThree[2].avatar_url || `https://ui-avatars.com/api/?name=${topThree[2].full_name}`} className="-rotate-45 w-full h-full object-cover rounded-2xl" alt="Rank 3" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center font-headline font-black text-lg border-[4px] border-[#051424] shadow-2xl">3</div>
            </div>
            <p className="font-headline font-bold text-white text-base mb-1 tracking-wide">{topThree[2].full_name}</p>
            <p className="text-[10px] font-headline font-bold text-amber-700 uppercase tracking-widest">{(topThree[2].xp_points || 0).toLocaleString()} XP</p>
            <div className="h-20 w-48 glass-panel border-white/5 rounded-t-[32px] mt-6 hidden md:block relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-amber-700/5 to-transparent"></div>
            </div>
          </div>
        )}
      </div>

      {/* Rankings List */}
      <div className="glass-panel rounded-[40px] border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-8 bg-white/[0.02]">
          <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl border-white/10 w-fit">
            {['global', 'track-only'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-headline font-bold uppercase tracking-[0.2em] transition-all ${
                  activeTab === t 
                    ? 'bg-[var(--st-color-primary)] text-black shadow-[0_0_15px_var(--st-color-glow)]' 
                    : 'text-on-surface-variant/40 hover:text-white'
                }`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--st-color-primary)] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search student identity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-card border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-[11px] font-medium text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 placeholder:text-white/10 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-on-surface-variant/30 text-[9px] font-headline font-black uppercase tracking-[0.3em] border-b border-white/5">
              <tr>
                <th className="px-10 py-6">Rank</th>
                <th className="px-10 py-6">Identity</th>
                <th className="px-10 py-6">Matrix Points</th>
                <th className="px-10 py-6">Streak</th>
                <th className="px-10 py-6 text-right">Delta Status</th>
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
                    <td className="px-10 py-6">
                      <span className={`font-headline font-bold text-sm ${isMe ? 'text-[var(--st-color-primary)]' : 'text-on-surface-variant/40 group-hover:text-white'} transition-colors`}>
                        #{(index + 4).toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-[18px] border p-1 transition-all duration-500 group-hover:scale-110 shadow-lg ${isMe ? 'border-[var(--st-color-primary)] shadow-[0_0_15px_var(--st-color-glow)]' : 'border-white/10 group-hover:border-white/20'}`}>
                          <img src={student.avatar_url || `https://ui-avatars.com/api/?name=${student.full_name}`} className="w-full h-full object-cover rounded-[14px]" alt="" />
                        </div>
                        <div>
                          <p className={`font-headline font-bold text-sm tracking-wide ${isMe ? 'text-[var(--st-color-primary)]' : 'text-white'}`}>
                            {student.full_name} {isMe && <span className="ml-3 text-[8px] font-black bg-[var(--st-color-primary)] text-black px-2 py-0.5 rounded shadow-[0_0_10px_var(--st-color-glow)]">YOU</span>}
                          </p>
                          <p className="text-[9px] font-headline font-bold text-on-surface-variant/30 uppercase tracking-[0.15em] mt-0.5">NEURAL SYNCED</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <Zap size={14} className="text-[var(--st-color-primary)] drop-shadow-[0_0_5px_var(--st-color-glow)]" fill="currentColor" />
                        <span className="font-headline font-black text-sm text-white tracking-widest">{(student.xp_points || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <Flame size={14} className="text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]" fill="currentColor" />
                        <span className="font-headline font-bold text-sm text-white">{student.current_streak || 0} Days</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-emerald-400 font-headline font-bold text-[10px] uppercase tracking-widest">
                        <ChevronUp size={16} />
                        <span>Matrix Stable</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* User's Contextual Rank (If not in top view) */}
        {!filteredLeaders.find(s => s.id === profile?.id) && (
          <div className="p-6 bg-[var(--st-color-primary)]/[0.05] border-t border-[var(--st-color-primary)]/20 flex items-center justify-between px-10 relative overflow-hidden group">
            <div className="absolute inset-0 circuit-bg opacity-10 -z-10 group-hover:scale-110 transition-transform duration-[10s]"></div>
            <div className="flex items-center gap-8">
              <span className="font-headline font-black text-2xl text-[var(--st-color-primary)] drop-shadow-[0_0_10px_var(--st-color-glow)]">SYNC</span>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl border border-[var(--st-color-primary)] overflow-hidden shadow-[0_0_10px_var(--st-color-glow)]">
                  <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}`} alt="" />
                </div>
                <span className="font-headline font-bold text-base text-white tracking-wide">Your Matrix Standing</span>
              </div>
            </div>
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-3">
                <Zap size={16} className="text-[var(--st-color-primary)]" fill="currentColor" />
                <span className="font-headline font-black text-lg text-white">{profile?.xp_points || 0} XP</span>
              </div>
              <p className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">Continue missions to ascend ranks</p>
            </div>
          </div>
        )}
      </div>

      {/* Rewards Teaser */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {[
          { title: 'Seasonal MVP Protocol', icon: <Medal size={32} />, color: 'yellow-500', desc: 'Top 10 matrix leaders receive 20% credit towards advanced masterclass circuits.' },
          { title: 'Streak Multiplier', icon: <Flame size={32} />, color: 'orange-500', desc: 'Maintain a 7-day transmission streak to trigger a 500 XP burst every reset.' }
        ].map((reward) => (
          <div key={reward.title} className="glass-panel p-10 rounded-[32px] border-white/5 flex items-center gap-8 group hover:border-[var(--st-color-primary)]/30 transition-all shadow-xl relative overflow-hidden">
            <div className={`absolute -right-4 -bottom-4 text-${reward.color} opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700`}>
               {React.cloneElement(reward.icon, { size: 120 })}
            </div>
            <div className={`w-20 h-20 rounded-[24px] bg-${reward.color}/10 flex items-center justify-center text-${reward.color} group-hover:scale-110 transition-all duration-500 shadow-inner border border-${reward.color}/20`}>
              {reward.icon}
            </div>
            <div className="relative z-10 flex-1">
              <h3 className="font-headline font-bold text-white text-xl mb-2 tracking-tight group-hover:text-[var(--st-color-primary)] transition-colors">{reward.title}</h3>
              <p className="text-xs font-medium text-on-surface-variant/60 leading-relaxed">{reward.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
