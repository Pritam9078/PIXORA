import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, Heart, Share2, 
  Search, Filter, Plus, Zap, 
  MessageCircle, Sparkles, Loader2,
  Clock, Globe, ShieldCheck, Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { SocialService } from '../../services/SocialService';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const Community = () => {
  const { profile } = useAuth();
  const { currentTheme } = useStudentTheme();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isTransmitting, setIsTransmitting] = useState(false);

  const handleNewTransmission = async () => {
    try {
      setIsTransmitting(true);
      toast.loading('Initializing communal transmission...', { id: 'social-sync' });
      await new Promise(r => setTimeout(r, 1500));
      toast.success('Transmission broadcasted to the Collective!', { id: 'social-sync' });
    } finally {
      setIsTransmitting(false);
    }
  };

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const data = await SocialService.getActivityFeed();
        setFeed(data);
      } catch (error) {
        console.error('Error fetching activity feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();

    // Subscribe to real-time updates
    const subscription = SocialService.subscribeToActivityFeed((newActivity) => {
      setFeed(prev => [newActivity, ...prev].slice(0, 50));
    });

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  const formatTime = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now - then) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getActionDetails = (activity) => {
    switch (activity.action) {
      case 'COURSE_ENROLLED':
        return { text: 'enrolled in a new course', icon: <Globe className="text-blue-400" />, color: 'blue' };
      case 'XP_AWARDED':
        return { text: `earned ${activity.metadata?.amount || 0} XP for ${activity.metadata?.reason || 'activity'}`, icon: <Zap className="text-yellow-400" />, color: 'yellow' };
      case 'SUBMISSION_CREATED':
        return { text: 'completed a mission objective', icon: <ShieldCheck className="text-emerald-400" />, color: 'emerald' };
      case 'ACHIEVEMENT_EARNED':
        return { text: `unlocked achievement: ${activity.metadata?.achievement_name}`, icon: <Sparkles className="text-purple-400" />, color: 'purple' };
      default:
        return { text: 'performed a protocol action', icon: <MessageSquare className="text-slate-400" />, color: 'slate' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[var(--st-color-primary)] animate-spin" />
        <p className="text-on-surface-variant/40 font-headline font-bold text-[10px] uppercase tracking-[0.2em]">Synchronizing Communal Matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Community Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 pb-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-panel border-[var(--st-color-primary)]/20 text-[var(--st-color-primary)] font-headline font-bold text-[9px] uppercase tracking-[0.2em]">
            <Globe size={14} className="animate-spin-slow" />
            Neural Network Online
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tight">The <span className="text-[var(--st-color-primary)]">Collective</span></h1>
          <p className="text-on-surface-variant/60 max-w-lg font-medium leading-relaxed">
            Real-time synchronization of student achievements, collaborations, and protocol milestones across the Pixora ecosystem.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={handleNewTransmission}
            disabled={isTransmitting}
            className="flex-1 md:flex-none btn-primary !rounded-2xl !py-4 !px-8 !text-xs disabled:opacity-50"
          >
            {isTransmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            <span>{isTransmitting ? 'Transmitting...' : 'New Transmission'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          {/* Feed Filters */}
          <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl border-white/5 w-fit">
            {['All', 'Achievements', 'Milestones', 'Community'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2.5 rounded-xl text-[9px] font-headline font-bold uppercase tracking-[0.15em] transition-all ${
                  activeFilter === f 
                    ? 'bg-[var(--st-color-primary)] text-black shadow-[0_0_15px_var(--st-color-glow)]' 
                    : 'text-on-surface-variant/40 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Activity List */}
          <div className="space-y-6">
            {feed.map((activity) => {
              const details = getActionDetails(activity);
              return (
                <div key={activity.id} className="glass-panel p-8 rounded-[32px] border-white/5 hover:border-white/10 transition-all group relative overflow-hidden shadow-xl">
                  <div className={`absolute top-0 left-0 w-1 h-full bg-${details.color}-400/20 group-hover:bg-${details.color}-400 transition-colors`}></div>
                  <div className="flex gap-6 items-start relative z-10">
                    <div className="relative group/avatar">
                      <div className={`absolute inset-0 bg-${details.color}-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full`}></div>
                      <img 
                        src={activity.actor?.avatar_url || `https://ui-avatars.com/api/?name=${activity.actor?.full_name}`} 
                        className="w-14 h-14 rounded-2xl border border-white/10 relative z-10" 
                        alt="" 
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg glass-panel border-white/10 flex items-center justify-center z-20 shadow-xl scale-90 group-hover:scale-100 transition-transform">
                        {details.icon}
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-headline font-bold text-white text-base tracking-wide">
                          {activity.actor?.full_name}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-headline font-bold text-on-surface-variant/30 uppercase tracking-widest">
                          <Clock size={12} />
                          {formatTime(activity.created_at)}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-on-surface-variant/60 leading-relaxed">
                        {details.text}
                      </p>
                      <div className="flex items-center gap-6 pt-4">
                        <button className="flex items-center gap-2 text-[10px] font-headline font-bold text-on-surface-variant/40 hover:text-white transition-colors group/btn">
                          <Heart size={14} className="group-hover/btn:scale-110 transition-transform" />
                          <span>RESPECT</span>
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-headline font-bold text-on-surface-variant/40 hover:text-white transition-colors group/btn">
                          <MessageCircle size={14} className="group-hover/btn:scale-110 transition-transform" />
                          <span>SYNCHRONIZE</span>
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-headline font-bold text-on-surface-variant/40 hover:text-white transition-colors group/btn">
                          <Share2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                          <span>RETRANSMIT</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
          {/* Active Channels */}
          <section className="glass-panel p-8 rounded-[32px] border-white/5 space-y-6">
            <h3 className="text-[10px] font-headline font-bold text-white uppercase tracking-[0.25em] flex items-center gap-2">
              <MessageSquare size={16} className="text-[var(--st-color-primary)]" />
              Active Channels
            </h3>
            <div className="space-y-3">
              {['# general-transmission', '# protocol-debug', '# mission-support', '# elite-circle'].map(channel => (
                <button key={channel} className="w-full text-left p-4 rounded-2xl hover:bg-white/5 text-[11px] font-headline font-bold text-on-surface-variant/40 hover:text-white transition-all flex items-center justify-between group">
                  <span>{channel}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              ))}
            </div>
          </section>

          {/* Trending Achievements */}
          <section className="glass-panel p-8 rounded-[32px] border-white/5 space-y-8">
            <h3 className="text-[10px] font-headline font-bold text-white uppercase tracking-[0.25em] flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              Recent Ascensions
            </h3>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl glass-card border-white/5 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-headline font-bold text-white">Genesis Architect</p>
                    <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-0.5">3 students today</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full btn-outline !text-[9px] !py-4 !rounded-[20px] !tracking-[0.2em]">VIEW ALL BADGES</button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Community;
