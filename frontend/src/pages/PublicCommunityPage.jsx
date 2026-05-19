import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, MessageSquare, Heart, Share2, Search, Filter, Plus, 
  Zap, MessageCircle, Sparkles, Loader2, Clock, Globe, ShieldCheck, Award, LogIn 
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { SocialService } from '../services/SocialService';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const PublicCommunityPage = () => {
  const navigate = useNavigate();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // High-fidelity fallback milestones representing peak Pixora network metrics
  const fallbackFeed = [
    {
      id: 'mock-1',
      created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // 12m ago
      action: 'XP_AWARDED',
      actor: { full_name: 'Pritam Dev', avatar_url: '' },
      metadata: { amount: 250, reason: 'auditing Solidity smart contract gas consumption' }
    },
    {
      id: 'mock-2',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
      action: 'ACHIEVEMENT_EARNED',
      actor: { full_name: 'Alex Mercer', avatar_url: '' },
      metadata: { achievement_name: 'Genesis Architect' }
    },
    {
      id: 'mock-3',
      created_at: new Date(Date.now() - 1000 * 3600 * 2).toISOString(), // 2h ago
      action: 'COURSE_ENROLLED',
      actor: { full_name: 'Sarah Connor', avatar_url: '' },
      metadata: { course_title: 'AAA Pipeline Mastery: Unreal Engine 5' }
    },
    {
      id: 'mock-4',
      created_at: new Date(Date.now() - 1000 * 3600 * 5).toISOString(), // 5h ago
      action: 'SUBMISSION_CREATED',
      actor: { full_name: 'Marcus Aurelius', avatar_url: '' },
      metadata: { mission_name: 'Custom Character Movement replication' }
    }
  ];

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const data = await SocialService.getActivityFeed();
        if (data && data.length > 0) {
          setFeed(data);
        } else {
          setFeed(fallbackFeed);
        }
      } catch (error) {
        console.warn('Supabase social connection bypassed, using dynamic simulation feed:', error);
        setFeed(fallbackFeed);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();

    // Subscribe to real-time updates anonymously if possible
    let subscription = null;
    try {
      subscription = SocialService.subscribeToActivityFeed((newActivity) => {
        setFeed(prev => [newActivity, ...prev].slice(0, 30));
      });
    } catch (_) {}

    return () => {
      if (subscription && supabase) {
        try {
          supabase.removeChannel(subscription);
        } catch (_) {}
      }
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
        return { text: 'enrolled in a new mission track', icon: <Globe className="text-blue-400" />, color: 'blue' };
      case 'XP_AWARDED':
        return { text: `earned ${activity.metadata?.amount || 0} XP for ${activity.metadata?.reason || 'submitting core objectives'}`, icon: <Zap className="text-yellow-400" />, color: 'yellow' };
      case 'SUBMISSION_CREATED':
        return { text: 'successfully completed a pipeline objective', icon: <ShieldCheck className="text-emerald-400" />, color: 'emerald' };
      case 'ACHIEVEMENT_EARNED':
        return { text: `unlocked elite achievement: ${activity.metadata?.achievement_name || 'Protocol Ascended'}`, icon: <Sparkles className="text-purple-400" />, color: 'purple' };
      default:
        return { text: 'broadcasted a verified network transmission', icon: <MessageSquare className="text-slate-400" />, color: 'slate' };
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0E12] text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Scanline Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(195,244,0,0.01),rgba(0,0,0,0),rgba(195,244,0,0.01))] bg-[size:100%_8px,20px_100%] pointer-events-none -z-10"></div>

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 pb-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-[#c3f400]/20 bg-[#c3f400]/5 text-[#c3f400] font-headline font-bold text-[9px] uppercase tracking-[0.2em] w-fit">
              <Globe size={12} className="animate-spin-slow" />
              Pixora Neural Core Live
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
              The <span className="text-[#c3f400] drop-shadow-[0_0_15px_rgba(195,244,0,0.2)]">Collective</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-lg text-sm md:text-base leading-relaxed">
              Real-time telemetry log showcasing achievements, course completion sequences, and academic ascensions across our global network.
            </p>
          </div>

          <button 
            onClick={() => setShowAuthModal(true)}
            className="bg-[#c3f400] text-black hover:shadow-[0_0_20px_rgba(195,244,0,0.4)] px-6 py-3.5 rounded-xl text-xs font-headline font-bold uppercase tracking-widest flex items-center space-x-2 transition-all w-full md:w-auto justify-center"
          >
            <Plus size={16} />
            <span>Broadcast Transmission</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Timeline Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Feed Filters */}
            <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl border border-white/5 bg-white/[0.01] w-fit">
              {['All', 'Achievements', 'Milestones'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2 rounded-xl text-[9px] font-headline font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                    activeFilter === f 
                      ? 'bg-[#c3f400] text-black shadow-[0_0_12px_rgba(195,244,0,0.35)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* List of Transmissions */}
            {loading ? (
              <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-[#c3f400] animate-spin" />
                <p className="text-slate-500 font-headline font-bold text-[9px] uppercase tracking-[0.2em]">Synchronizing feed telemetry...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {feed.map((activity) => {
                  const details = getActionDetails(activity);
                  return (
                    <div 
                      key={activity.id} 
                      className="glass-panel p-6 rounded-[24px] border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all group relative overflow-hidden shadow-xl"
                    >
                      {/* Interactive Accent Bar */}
                      <div className={`absolute top-0 left-0 w-1 h-full bg-[#c3f400]/20 group-hover:bg-[#c3f400] transition-colors`}></div>
                      
                      <div className="flex gap-5 items-start">
                        <div className="relative shrink-0">
                          <img 
                            src={activity.actor?.avatar_url || `https://ui-avatars.com/api/?name=${activity.actor?.full_name || 'Student'}&background=random`} 
                            className="w-12 h-12 rounded-xl border border-white/15 relative z-10" 
                            alt="" 
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md glass-panel border border-white/10 bg-[#0D0E12] flex items-center justify-center z-20 shadow-md">
                            {details.icon}
                          </div>
                        </div>

                        <div className="flex-grow space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-headline font-bold text-white text-sm tracking-wide">
                              {activity.actor?.full_name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-[9px] font-headline font-bold text-slate-500 uppercase tracking-widest">
                              <Clock size={10} />
                              {formatTime(activity.created_at)}
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            {details.text}
                          </p>

                          <div className="flex items-center gap-5 pt-3 border-t border-white/[0.02]">
                            <button 
                              onClick={() => setShowAuthModal(true)}
                              className="flex items-center gap-1.5 text-[9px] font-headline font-bold text-slate-500 hover:text-white transition-colors"
                            >
                              <Heart size={12} />
                              <span>RESPECT</span>
                            </button>
                            <button 
                              onClick={() => setShowAuthModal(true)}
                              className="flex items-center gap-1.5 text-[9px] font-headline font-bold text-slate-500 hover:text-white transition-colors"
                            >
                              <MessageCircle size={12} />
                              <span>SYNCHRONIZE</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-8">
            {/* CTA Join Network Box */}
            <div className="glass-panel p-6 rounded-[28px] border border-[#c3f400]/15 bg-gradient-to-br from-[#c3f400]/[0.02] to-transparent space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-[#c3f400]/10 border border-[#c3f400]/25 flex items-center justify-center text-[#c3f400]">
                <Users size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="font-headline font-bold text-white text-base">Join the Collective</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Establish your neural transmission footprint to post achievements, sync nodes, and network with elite developers.
                </p>
              </div>
              <button 
                onClick={() => navigate('/signup/student')}
                className="w-full bg-[#c3f400] text-black hover:shadow-[0_0_15px_rgba(195,244,0,0.3)] py-3 rounded-xl text-[10px] font-headline font-bold uppercase tracking-widest transition-all"
              >
                Create Account
              </button>
            </div>

            {/* Simulated Active Channels */}
            <section className="glass-panel p-6 rounded-[28px] border border-white/5 bg-white/[0.01] space-y-4">
              <h3 className="text-[9px] font-headline font-bold text-white uppercase tracking-[0.25em] flex items-center gap-2">
                <MessageSquare size={14} className="text-[#c3f400]" />
                Active Channels
              </h3>
              <div className="space-y-2">
                {['# general-transmission', '# protocol-debug', '# mission-support', '# elite-circle'].map(channel => (
                  <button 
                    key={channel} 
                    onClick={() => setShowAuthModal(true)}
                    className="w-full text-left p-3 rounded-xl hover:bg-white/5 text-[10px] font-headline font-bold text-slate-500 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span>{channel}</span>
                    <div className="w-1 h-1 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                ))}
              </div>
            </section>

            {/* Trending Badges */}
            <section className="glass-panel p-6 rounded-[28px] border border-white/5 bg-white/[0.01] space-y-6">
              <h3 className="text-[9px] font-headline font-bold text-white uppercase tracking-[0.25em] flex items-center gap-2">
                <Sparkles size={14} className="text-purple-400" />
                Network Badges
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Genesis Architect', desc: 'Bootstrap first course core pipeline' },
                  { name: 'Solidity Sage', desc: 'Secure smart contract validation' },
                  { name: 'Unreal Vanguard', desc: 'Compile physics loops without failure' }
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Award size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-headline font-bold text-white">{badge.name}</p>
                      <p className="text-[9px] text-slate-500 font-medium leading-none mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Auth Gate Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0D0E12]/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-8 rounded-[32px] border border-white/10 bg-[#0D0E12] max-w-md w-full relative space-y-6 shadow-2xl"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs text-[#c3f400] font-headline font-bold uppercase tracking-widest bg-[#c3f400]/10 py-1 px-3.5 rounded-full border border-[#c3f400]/20">
                  <LogIn size={12} />
                  Access Protocols
                </div>
                <h3 className="text-2xl font-headline font-bold text-white leading-tight">
                  Authorization Required
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  To broadcast custom transmissions, sync active channels, or respect objectives, you must synchronize with the Pixora Core Terminal.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    navigate('/login');
                  }}
                  className="bg-[#c3f400] text-black py-4 rounded-xl text-xs font-headline font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(195,244,0,0.35)] transition-all"
                >
                  <LogIn size={14} />
                  <span>Access Terminal Log In</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    navigate('/signup/student');
                  }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl text-xs font-headline font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  <span>Apply for Student Account</span>
                </button>

                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-slate-500 hover:text-white text-[10px] font-headline font-bold uppercase tracking-widest pt-2 transition-colors"
                >
                  Cancel Sequence
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default PublicCommunityPage;
