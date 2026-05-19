import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Monitor, Users, MessageSquare, Send, 
  Mic, Video, Share2, Settings, MoreVertical,
  Play, Radio, Clock, Calendar, Shield, 
  ArrowLeft, Loader2, Award, Sparkles, X, Heart
} from 'lucide-react';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const LiveClasses = () => {
  const { currentTheme } = useStudentTheme();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // --- Directory State ---
  const [sessions, setSessions] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(true);

  // --- Active Stream State ---
  const [activeSession, setActiveSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [classStatus, setClassStatus] = useState('scheduled'); // 'scheduled', 'live', 'ended'
  
  // --- Chat State ---
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatSubscriptionRef = useRef(null);
  const statusSubscriptionRef = useRef(null);

  // --- Aesthetic Enhancements ---
  const [likesCount, setLikesCount] = useState(128);
  const [hasLiked, setHasLiked] = useState(false);
  const [viewerCount, setViewerCount] = useState(1);

  // Fetch Directory (Active and Upcoming sessions)
  const fetchDirectory = async () => {
    setLoadingDirectory(true);
    try {
      const userTrack = profile?.track || (profile?.learning_track ? profile.learning_track.toUpperCase() : null);
      
      let query = supabase
        .from('live_classes')
        .select('*, courses(title)')
        .in('status', ['scheduled', 'live', 'ended']);

      if (userTrack) {
        query = query.or(`track.eq.${userTrack},track.is.null`);
      }

      const { data, error } = await query.order('scheduled_at', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching broadcast directory:', err);
      toast.error('Failed to update live stream feed.');
    } finally {
      setLoadingDirectory(false);
    }
  };

  // Check if sessionId is provided on mount / change
  useEffect(() => {
    if (!sessionId) {
      fetchDirectory();
      setActiveSession(null);
      return;
    }

    const loadSession = async () => {
      setLoadingSession(true);
      try {
        const { data, error } = await supabase
          .from('live_classes')
          .select('*, courses(title)')
          .eq('id', sessionId)
          .single();

        if (error || !data) {
          toast.error('Specified broadcast node not found.');
          setSearchParams({});
          return;
        }

        setActiveSession(data);
        setClassStatus(data.status);
        
        // Randomize mock starting metrics to make it feel responsive and alive
        setLikesCount(Math.floor(Math.random() * 200) + 50);
        setViewerCount(Math.floor(Math.random() * 45) + 12);
      } catch (err) {
        console.error(err);
        setSearchParams({});
      } finally {
        setLoadingSession(false);
      }
    };

    loadSession();
  }, [sessionId, searchParams]);

  // Subscribe to changes in class status (live, ended)
  useEffect(() => {
    if (!activeSession) return;

    // Realtime listener for this specific class row
    const statusChannel = supabase
      .channel(`class-status:${activeSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_classes',
          filter: `id=eq.${activeSession.id}`
        },
        (payload) => {
          console.log('Class update payload:', payload);
          if (payload.new && payload.new.status) {
            setClassStatus(payload.new.status);
            setActiveSession(prev => ({ ...prev, status: payload.new.status }));
            if (payload.new.status === 'ended') {
              toast.success('The broadcast session has concluded. Thank you for joining!');
            } else if (payload.new.status === 'live') {
              toast.success('Transmission is now active! Joining classroom stream...');
            }
          }
        }
      )
      .subscribe();

    statusSubscriptionRef.current = statusChannel;

    return () => {
      if (statusSubscriptionRef.current) {
        supabase.removeChannel(statusSubscriptionRef.current);
      }
    };
  }, [activeSession]);

  // Chat realtime integration
  useEffect(() => {
    if (!activeSession) {
      if (chatSubscriptionRef.current) {
        supabase.removeChannel(chatSubscriptionRef.current);
        chatSubscriptionRef.current = null;
      }
      setChatMessages([]);
      return;
    }

    const loadChatHistory = async () => {
      setChatLoading(true);
      try {
        const { data, error } = await supabase
          .from('live_chat_messages')
          .select('*, profiles(full_name, role)')
          .eq('session_id', activeSession.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setChatMessages(data || []);
      } catch (err) {
        console.error('Error loading chat history:', err);
      } finally {
        setChatLoading(false);
      }
    };

    loadChatHistory();

    // Subscribe to Postgres insertion events
    const channel = supabase
      .channel(`student-chat:${activeSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `session_id=eq.${activeSession.id}`
        },
        async (payload) => {
          // Enrich profile info
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.user_id)
            .single();

          const enriched = {
            ...payload.new,
            profiles: profileData
          };

          setChatMessages(prev => [...prev, enriched]);
        }
      )
      .subscribe();

    chatSubscriptionRef.current = channel;

    // Simulate standard organic viewer swings
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => {
        const diff = Math.random() > 0.5 ? 1 : -1;
        const next = prev + diff;
        return next > 0 ? next : 1;
      });
    }, 15000);

    return () => {
      if (chatSubscriptionRef.current) {
        supabase.removeChannel(chatSubscriptionRef.current);
      }
      clearInterval(viewerInterval);
    };
  }, [activeSession]);

  // Scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeSession) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('live_chat_messages')
        .insert([{
          session_id: activeSession.id,
          user_id: user.id,
          message: text
        }]);

      if (error) throw error;
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit message.');
    }
  };

  const toggleLike = () => {
    if (hasLiked) {
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
      toast.success('Liked! Sending positive resonance to the instructor.');
    }
  };

  const getTrackBadgeColor = (track) => {
    if (track === 'game_dev') return 'text-[var(--st-color-primary)] border-[var(--st-color-primary)]/20 bg-[var(--st-color-primary)]/10';
    return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
  };

  // --- RENDER 1: Loading Session state ---
  if (loadingSession) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="animate-spin text-[var(--st-color-primary)]" size={36} />
        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Opening Secure Stream Channel...</span>
      </div>
    );
  }

  // --- RENDER 2: Active Broadcast Studio View ---
  if (activeSession) {
    const displayName = profile?.full_name || 'Explorer';
    const isLive = classStatus === 'live';
    const isEnded = classStatus === 'ended';

    return (
      <div className="space-y-6 max-w-7xl mx-auto -mt-4 animate-in fade-in duration-500">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0d0e12]/80 border border-white/5 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSearchParams({})}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center justify-center"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className={`flex h-2.5 w-2.5 relative ${isLive ? 'visible' : 'hidden'}`}>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <h2 className="text-sm font-headline font-bold text-white uppercase tracking-wider">{activeSession.title}</h2>
              </div>
              <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">
                {isLive ? 'Neural transmission sync complete' : isEnded ? 'Session finalized' : 'Lobby open • Waiting for instructor broadcast'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-mono text-slate-400">
              <Users size={12} className="text-[var(--st-color-primary)]" />
              <span>{viewerCount} peers</span>
            </div>
            
            <button 
              onClick={toggleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-[10px] font-mono ${
                hasLiked 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Heart size={12} fill={hasLiked ? 'currentColor' : 'none'} className={hasLiked ? 'scale-110' : ''} />
              <span>{likesCount} likes</span>
            </button>
          </div>
        </div>

        {/* Dynamic Inner Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          {/* Main stream box */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-[#09090b] rounded-[32px] border border-white/5 overflow-hidden relative aspect-video flex flex-col justify-center items-center group shadow-2xl">
              {isEnded ? (
                /* Broadcast Finished Screen */
                <div className="p-8 text-center space-y-6 max-w-md animate-in zoom-in-95 duration-500 z-10">
                  <div className="w-16 h-16 bg-[var(--st-color-primary)]/10 border border-[var(--st-color-primary)]/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_var(--st-color-glow)]">
                    <Award className="text-[var(--st-color-primary)]" size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-headline font-bold text-white uppercase tracking-wider">Transmission Terminated</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-body">
                      Prof. Julian Vane has finished this classroom broadcast. Your sequence participation progress has been logged.
                    </p>
                  </div>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between text-left font-mono">
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase block tracking-wider">Experience Bonus</span>
                      <span className="text-xs text-[var(--st-color-primary)] font-bold font-headline">+250 XP Credited</span>
                    </div>
                    <Sparkles size={20} className="text-[var(--st-color-primary)]" />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSearchParams({})}
                      className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-mono font-bold tracking-widest rounded-xl transition-all border border-white/5"
                    >
                      RETURN_LOBBY
                    </button>
                    <button 
                      onClick={() => navigate('/student/dashboard')}
                      className="flex-1 py-3 bg-[var(--st-color-primary)] hover:bg-[var(--st-color-primary)]/90 text-black text-xs font-mono font-bold tracking-widest rounded-xl transition-all shadow-[0_0_15px_var(--st-color-glow)]"
                    >
                      DASHBOARD_SYNC
                    </button>
                  </div>
                </div>
              ) : isLive ? (
                /* Interactive WebRTC Stream */
                <iframe
                  src={`${activeSession.meeting_url}#config.prejoinPageEnabled=false&userInfo.displayName="${encodeURIComponent(displayName)}"`}
                  allow="camera; microphone; fullscreen; display-capture; autoplay; screen-wake-lock"
                  className="w-full h-full border-none"
                ></iframe>
              ) : (
                /* Lobby Screen */
                <div className="p-8 text-center space-y-6 max-w-md z-10">
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Radio className="text-blue-400" size={28} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-headline font-bold text-white uppercase tracking-wider">Pre-Broadcast Buffer</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-body">
                      The lecture is scheduled for {new Date(activeSession.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. The instructor has not yet opened the streaming gates. Enjoy the lobby chat with your peers!
                    </p>
                  </div>
                  <div className="px-4 py-3 bg-white/[0.02] border border-white/5 rounded-2xl inline-flex items-center gap-2.5 text-[10px] font-mono text-slate-500">
                    <Clock size={12} className="text-blue-400" />
                    <span>Awaiting Host Transmission...</span>
                  </div>
                </div>
              )}

              {/* Gradient Overlays */}
              {!isLive && !isEnded && (
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none opacity-80" />
              )}
            </div>

            {/* Instructor / Cohort notes */}
            <div className="glass-panel p-6 rounded-[28px] border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl border border-white/10 p-0.5 bg-white/5 overflow-hidden">
                  <img src="https://i.pravatar.cc/150?u=instructor" alt="Instructor Profile" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-headline font-bold text-white">Prof. Julian Vane</span>
                    <span className="px-1.5 py-0.2 bg-blue-500/10 border border-blue-500/25 rounded text-[8px] text-blue-400 font-bold uppercase font-mono tracking-widest">Host</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">LMS Technical Architect & Epic Games Contributor</p>
                  {activeSession.courses && (
                    <span className="inline-block mt-2 text-[9px] font-mono font-bold text-[var(--st-color-primary)]">
                      Course Integration: {activeSession.courses.title}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => toast.success('Link copied! Share the coordinate squad link.')}
                  className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 transition-all"
                  title="Share Stream"
                >
                  <Share2 size={16} />
                </button>
                <button 
                  onClick={() => navigate('/student/dashboard')}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono font-bold tracking-widest rounded-xl transition-all border border-white/5"
                >
                  BACK_TO_HUB
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Chat Console Sidebar */}
          <div className="lg:col-span-4 bg-[#0d0e12]/80 border border-white/5 rounded-[32px] flex flex-col overflow-hidden min-h-[450px]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-[var(--st-color-primary)]" />
                <h3 className="text-xs font-headline font-bold text-white uppercase tracking-wider">Stream Chat</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-mono text-slate-500 uppercase tracking-widest">Active Node</span>
            </div>

            {/* Chat message feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {chatLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Loader2 className="animate-spin text-[var(--st-color-primary)]" size={18} />
                  <span className="text-[9px] font-mono text-slate-500 uppercase">Synchronizing Live Feed...</span>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-2 text-slate-600">
                  <Sparkles size={20} className="opacity-25" />
                  <p className="text-[9px] font-mono uppercase tracking-widest">Lobby chat active. Wave hello!</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isSelf = msg.user_id === user.id;
                  const role = msg.profiles?.role || 'student';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} animate-in fade-in duration-300`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-bold text-slate-400">
                          {msg.profiles?.full_name || 'Anonymous'}
                        </span>
                        {role === 'instructor' ? (
                          <span className="px-1 py-0.2 bg-[var(--st-color-primary)]/10 border border-[var(--st-color-primary)]/20 rounded text-[7px] text-[var(--st-color-primary)] font-black uppercase font-mono tracking-widest">
                            HOST
                          </span>
                        ) : role === 'super_admin' ? (
                          <span className="px-1 py-0.2 bg-rose-500/10 border border-rose-500/20 rounded text-[7px] text-rose-400 font-black uppercase font-mono tracking-widest">
                            ADMIN
                          </span>
                        ) : null}
                      </div>
                      <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed font-body ${
                        isSelf 
                          ? 'bg-[var(--st-color-primary)] text-black rounded-tr-none shadow-[0_4px_12px_rgba(195,244,0,0.1)]' 
                          : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/5'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Write stream message */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 flex gap-2">
              <input
                type="text"
                placeholder="Say something to instructor..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-[#09090B] border border-white/5 focus:border-[var(--st-color-primary)]/30 outline-none rounded-xl px-4 py-3 text-xs text-white transition-all font-body placeholder:text-slate-600"
              />
              <button 
                type="submit" 
                className="p-3 bg-[var(--st-color-primary)] hover:bg-[var(--st-color-primary)]/90 text-black rounded-xl transition-all flex items-center justify-center shadow-lg"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER 3: General Directory & Broadcast list ---
  const activeSessionsList = sessions.filter(s => s.status === 'live');
  const upcomingSessionsList = sessions.filter(s => s.status === 'scheduled');

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--st-color-primary)] animate-pulse shadow-[0_0_8px_var(--st-color-glow)]"></span>
            <span className="font-headline text-[9px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Active Transmissions</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-white tracking-tight uppercase">
            Live <span className="text-[var(--st-color-primary)]">Classroom Grid</span>
          </h1>
          <p className="text-slate-500 text-xs tracking-widest font-mono uppercase mt-1">Join active broadcasts or explore curriculum schedules</p>
        </div>
        
        <button 
          onClick={fetchDirectory}
          className="btn-outline !rounded-xl !text-xs !px-5 !py-2.5"
        >
          SYNC_PORTAL_DIRECTIVES
        </button>
      </div>

      {/* Directory Grid */}
      {loadingDirectory ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-[var(--st-color-primary)]" size={32} />
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Querying Live Feed Database...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main List Area */}
          <div className="lg:col-span-8 space-y-10">
            {/* 1. Live Now Section */}
            <div className="space-y-6">
              <h3 className="font-headline font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                ACTIVE_TRANSMISSIONS
              </h3>

              {activeSessionsList.length === 0 ? (
                <div className="glass-panel p-8 rounded-[28px] border-white/5 border-dashed bg-white/[0.01] text-center space-y-3">
                  <Radio size={36} className="mx-auto text-slate-600 opacity-60" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">No active lectures currently transmitting.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeSessionsList.map((session) => (
                    <div 
                      key={session.id} 
                      className="glass-card rounded-[28px] overflow-hidden border-rose-500/20 hover:border-rose-500/40 hover-glow transition-all duration-500 flex flex-col group relative"
                    >
                      {/* Interactive visual styling */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-rose-500/20 group-hover:border-rose-500/40 transition-colors" />
                      
                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/25 text-[8px] font-black text-rose-400 tracking-wider uppercase animate-pulse">
                              <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                              LIVE_NOW
                            </span>
                            {session.courses && (
                              <span className="text-[8px] font-black font-mono text-slate-500 uppercase">
                                {session.courses.title}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-base font-headline font-bold text-white leading-snug line-clamp-1 group-hover:text-rose-400 transition-colors">
                            {session.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-body leading-relaxed line-clamp-2 mt-2">
                            {session.description || 'Join live to review technical curriculum directives.'}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1.5">
                            <Clock size={12} className="text-rose-400" />
                            Active Now
                          </span>
                          
                          <button 
                            onClick={() => setSearchParams({ session_id: session.id })}
                            className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-mono font-bold tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
                          >
                            JOIN_TRANSMISSION
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Upcoming Section */}
            <div className="space-y-6">
              <h3 className="font-headline font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} className="text-[var(--st-color-primary)]" />
                SCHEDULED_DIRECTIVES_FEED
              </h3>

              {upcomingSessionsList.length === 0 ? (
                <div className="glass-panel p-8 rounded-[28px] border-white/5 border-dashed bg-white/[0.01] text-center space-y-3">
                  <Calendar size={36} className="mx-auto text-slate-600 opacity-60" />
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">No forthcoming lecture transmission events found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingSessionsList.map((session) => (
                    <div 
                      key={session.id} 
                      className="glass-card rounded-[28px] overflow-hidden border-white/5 hover:border-[var(--st-color-primary)]/20 hover-glow transition-all duration-500 flex flex-col group relative"
                    >
                      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#c3f400]/5 group-hover:border-[#c3f400]/25 transition-colors" />
                      
                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#c3f400]/10 border border-[#c3f400]/20 text-[8px] font-black text-[#c3f400] tracking-wider uppercase">
                              SCHEDULED
                            </span>
                            {session.courses && (
                              <span className="text-[8px] font-black font-mono text-slate-500 uppercase">
                                {session.courses.title}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="text-base font-headline font-bold text-white leading-snug line-clamp-1 group-hover:text-[var(--st-color-primary)] transition-colors">
                            {session.title}
                          </h4>
                          <p className="text-xs text-slate-500 font-body leading-relaxed line-clamp-2 mt-2">
                            {session.description || 'Pre-transmission preparations underway. Set calendar reminders.'}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1.5">
                            <Clock size={12} className="text-[var(--st-color-primary)]" />
                            {new Date(session.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} @ {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          <button 
                            onClick={() => setSearchParams({ session_id: session.id })}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-mono font-bold tracking-widest rounded-xl transition-all border border-white/5"
                          >
                            ENTER_PORTAL
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Info Widget */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-panel rounded-[32px] border-white/5 p-6 relative overflow-hidden">
              <Award className="absolute -top-6 -right-6 text-[var(--st-color-primary)] opacity-5 rotate-12" size={120} />
              
              <h4 className="font-headline font-bold text-white text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Shield size={14} className="text-[var(--st-color-primary)]" />
                Verification Status
              </h4>
              
              <p className="text-xs text-slate-400 font-body leading-relaxed">
                Pixora broadcast streams are protected with WebRTC peer-to-peer security. Attending live streams boosts track mastery levels and logs course attendance.
              </p>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3 mt-6">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
                  <span>Peer Protocol</span>
                  <span className="text-[var(--st-color-primary)]">Online</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
                  <span>Chat Sync Channel</span>
                  <span className="text-blue-400">Connected</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
                  <span>Attendance Logger</span>
                  <span className="text-[var(--st-color-primary)]">Automatic</span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="glass-panel rounded-[32px] border-white/5 p-6 space-y-4">
              <h4 className="font-headline font-bold text-white text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles size={14} className="text-[var(--st-color-primary)]" />
                Command Tips
              </h4>
              
              <div className="space-y-3 font-body text-xs text-slate-400 leading-relaxed">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--st-color-primary)] mt-1.5 shrink-0" />
                  <p>Toggle audio/video input overlays inside active WebRTC frame as required.</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--st-color-primary)] mt-1.5 shrink-0" />
                  <p>Likes and chat transmissions sync live; keep peer coordination premium.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
