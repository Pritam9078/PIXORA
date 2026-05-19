import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, Radio, Plus, Calendar, Clock, Loader2, 
  ArrowLeft, Send, Users, ShieldAlert, Sparkles, 
  MessageSquare, Trash2, Video, X, ExternalLink,
  ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const LiveClasses = () => {
  const { user, profile } = useAuth();
  
  // State
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatSubscriptionRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
  });

  // Calendar Selection State & Helpers
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, date: null });
    }
    for (let i = 1; i <= lastDate; i++) {
      const dayDate = new Date(year, month, i);
      days.push({ day: i, date: dayDate });
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isSameDay = (date1, date2String) => {
    if (!date1 || !date2String) return false;
    const yyyy = date1.getFullYear();
    const mm = String(date1.getMonth() + 1).padStart(2, '0');
    const dd = String(date1.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}` === date2String;
  };

  const isPastDay = (date) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleSelectCalendarDay = (dayDate) => {
    if (!dayDate || isPastDay(dayDate)) return;
    const yyyy = dayDate.getFullYear();
    const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
    const dd = String(dayDate.getDate()).padStart(2, '0');
    setFormData(prev => ({
      ...prev,
      scheduled_date: `${yyyy}-${mm}-${dd}`
    }));
    setShowCalendar(false); // Popover closes beautifully upon selection
  };

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getNextHourString = () => {
    const now = new Date();
    const hours = String((now.getHours() + 1) % 24).padStart(2, '0');
    return `${hours}:00`;
  };

  // Reset/populate form state when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setFormData({
        title: '',
        description: '',
        course_id: '',
        scheduled_date: getTodayString(),
        scheduled_time: getNextHourString(),
        duration_minutes: 60,
      });
      setShowCalendar(false); // Collapsed by default for a neat layout
    }
  }, [isModalOpen]);

  // Fetch data
  const fetchInstructorData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // 1. Fetch scheduled & live classes
      const { data: liveData, error: liveErr } = await supabase
        .from('live_classes')
        .select('*, courses(title)')
        .eq('instructor_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (liveErr) throw liveErr;
      setSessions(liveData || []);

      // 2. Fetch instructor courses
      const { data: courseData, error: courseErr } = await supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', user.id);

      if (courseErr) throw courseErr;
      setCourses(courseData || []);
    } catch (err) {
      console.error('Error fetching live class details:', err);
      toast.error('Failed to query classroom state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorData();
  }, [user?.id]);

  // Handle create session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.scheduled_date || !formData.scheduled_time) {
      toast.error('Please specify title, date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const roomIdentifier = `pixora-class-${Math.random().toString(36).substring(2, 11)}-${Date.now().toString().slice(-4)}`;
      const JitsiMeetingUrl = `https://meet.jit.si/${roomIdentifier}`;

      const combinedScheduledAt = `${formData.scheduled_date}T${formData.scheduled_time}:00`;

      const payload = {
        title: formData.title,
        description: formData.description,
        instructor_id: user.id,
        course_id: formData.course_id || null,
        scheduled_at: combinedScheduledAt,
        duration_minutes: parseInt(formData.duration_minutes),
        meeting_url: JitsiMeetingUrl,
        status: 'scheduled'
      };

      const { data, error } = await supabase
        .from('live_classes')
        .insert([payload])
        .select();

      if (error) throw error;

      toast.success('Broadcast session scheduled successfully!');
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        course_id: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 60,
      });
      fetchInstructorData();
    } catch (err) {
      console.error(err);
      toast.error(`Schedule creation failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete session
  const handleDeleteSession = async (id) => {
    if (!window.confirm('Cancel this broadcast session? This action is permanent.')) return;
    try {
      const { error } = await supabase
        .from('live_classes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Broadcast cancelled.');
      fetchInstructorData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Broadcast toggle functions
  const startBroadcast = async (session) => {
    try {
      const { error } = await supabase
        .from('live_classes')
        .update({ status: 'live' })
        .eq('id', session.id);

      if (error) throw error;
      
      const activeCopy = { ...session, status: 'live' };
      setActiveSession(activeCopy);
      toast.success('Neural broadcast initialized. You are now live!');
    } catch (err) {
      toast.error(`Failed to launch broadcast: ${err.message}`);
    }
  };

  const endBroadcast = async (session) => {
    if (!window.confirm('Are you sure you want to end this live broadcast?')) return;
    try {
      const { error } = await supabase
        .from('live_classes')
        .update({ status: 'ended' })
        .eq('id', session.id);

      if (error) throw error;
      
      setActiveSession(null);
      toast.success('Live broadcast ended successfully.');
      fetchInstructorData();
    } catch (err) {
      toast.error(`Failed to stop broadcast: ${err.message}`);
    }
  };

  // Chat Realtime setup
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

    // Subscribe to Postgres Realtime modifications
    const channel = supabase
      .channel(`instructor-chat:${activeSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `session_id=eq.${activeSession.id}`
        },
        async (payload) => {
          // Fetch sender profiles information
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', payload.new.user_id)
            .single();

          const enrichedMessage = {
            ...payload.new,
            profiles: senderProfile
          };

          setChatMessages(prev => [...prev, enrichedMessage]);
        }
      )
      .subscribe();

    chatSubscriptionRef.current = channel;

    return () => {
      if (chatSubscriptionRef.current) {
        supabase.removeChannel(chatSubscriptionRef.current);
      }
    };
  }, [activeSession]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeSession) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase
        .from('live_chat_messages')
        .insert([{
          session_id: activeSession.id,
          user_id: user.id,
          message: messageText
        }]);

      if (error) throw error;
    } catch (err) {
      toast.error('Failed to transmit message.');
      console.error(err);
    }
  };

  // Render Live Studio View
  if (activeSession) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col gap-4 -mt-4">
        {/* Studio Header */}
        <div className="flex justify-between items-center bg-[#0d0e12]/80 backdrop-blur border border-white/5 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
            </span>
            <div>
              <h2 className="text-sm font-headline font-bold text-white uppercase tracking-wider">{activeSession.title}</h2>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">Neural Studio Active • Broadcasting WebRTC Stream</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => endBroadcast(activeSession)}
              className="px-5 py-2.5 bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500 hover:text-white text-rose-400 text-xs font-mono font-bold tracking-widest rounded-xl transition-all"
            >
              END_BROADCAST_STUDIO
            </button>
          </div>
        </div>

        {/* Studio Body Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          {/* WebRTC Video Stream Frame (Left) */}
          <div className="lg:col-span-8 bg-black/60 rounded-2xl border border-white/5 overflow-hidden flex flex-col relative">
            <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
              <Video size={13} className="text-rose-400" />
              <span className="text-[10px] font-mono font-black text-rose-400 tracking-wider">LIVE_FEED</span>
            </div>
            
            <div className="flex-1 w-full h-full bg-[#09090b]">
              <iframe
                src={`${activeSession.meeting_url}#config.prejoinPageEnabled=false&userInfo.displayName="${encodeURIComponent(profile?.full_name || 'Instructor')}"`}
                allow="camera; microphone; fullscreen; display-capture; autoplay; screen-wake-lock"
                className="w-full h-full border-none"
              ></iframe>
            </div>
          </div>

          {/* Interactive Chat Control Sidebar (Right) */}
          <div className="lg:col-span-4 bg-[#0d0e12]/80 backdrop-blur border border-white/5 rounded-2xl flex flex-col min-h-0">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={15} className="text-[#c3f400]" />
                <h3 className="text-xs font-headline font-bold text-white uppercase tracking-wider">Neural Studio Chat</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-slate-400">Supabase Realtime</span>
            </div>

            {/* Chat Stream Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 custom-scrollbar">
              {chatLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Loader2 className="animate-spin text-[#c3f400]" size={20} />
                  <span className="text-[10px] font-mono text-slate-500">SYNCING_MESSAGES</span>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3 text-slate-500">
                  <Sparkles size={24} className="opacity-25" />
                  <p className="text-[10px] font-mono uppercase tracking-wider">Lobby is silent. Waiting for student connections.</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isSelf = msg.user_id === user.id;
                  const role = msg.profiles?.role || 'student';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-slate-400">
                          {msg.profiles?.full_name || 'Anonymous'}
                        </span>
                        {role === 'instructor' && (
                          <span className="px-1.5 py-0.2 bg-[#c3f400]/10 border border-[#c3f400]/25 rounded text-[8px] text-[#c3f400] font-black uppercase font-mono tracking-widest">
                            HOST
                          </span>
                        )}
                      </div>
                      <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed font-body ${
                        isSelf 
                          ? 'bg-[#c3f400] text-black rounded-tr-none' 
                          : 'bg-white/5 text-slate-300 rounded-tl-none'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Terminal Message */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 flex gap-2">
              <input
                type="text"
                placeholder="Transmit data to stream..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-[#09090B] border border-white/5 focus:border-[#c3f400]/30 outline-none rounded-xl px-4 py-3 text-xs text-white transition-all font-body placeholder:text-slate-600"
              />
              <button 
                type="submit" 
                className="p-3 bg-[#c3f400] hover:bg-[#b0dc00] text-black rounded-xl transition-all flex items-center justify-center"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Scheduler & List View
  return (
    <div className="space-y-8">
      {/* Header Command Desk */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6">
        <div>
          <div className="text-[10px] font-mono text-[#c3f400]/60 uppercase tracking-widest mb-1.5">// Broadcast Command Node</div>
          <h1 className="text-3xl font-headline font-bold text-white tracking-tight uppercase">
            Live <span className="text-[#c3f400]">Broadcast Hub</span>
          </h1>
          <p className="text-slate-500 text-xs tracking-widest font-mono uppercase mt-1">Real-time WebRTC streams & class schedules</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#c3f400] hover:bg-[#b0dc00] text-black text-xs font-mono font-bold tracking-widest transition-all rounded-xl shadow-[0_0_15px_rgba(195,244,0,0.3)]"
        >
          <Plus size={14} />
          SCHEDULE_TRANSMISSION
        </button>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-[#c3f400]" size={32} />
          <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Accessing Classroom Grid...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-[#111113]/40 border border-white/5 p-12 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
          <Monitor size={48} className="mx-auto text-slate-600" />
          <h3 className="text-base font-headline font-bold text-white uppercase tracking-wider">No Scheduled Broadcasts</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Schedule a dynamic WebRTC interactive broadcast class for your student cohorts. Embed custom Jitsi streams instantly.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-[#c3f400]/10 hover:bg-[#c3f400]/20 border border-[#c3f400]/20 text-[#c3f400] text-xs font-mono font-bold tracking-widest rounded-xl transition-all"
          >
            INITIALIZE_NEW_SCHEDULE
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className={`bg-[#111113]/80 border rounded-2xl p-6 relative overflow-hidden transition-all group hover:border-[#c3f400]/30 ${
                session.status === 'live' ? 'border-rose-500/40 ring-1 ring-rose-500/20' : 'border-white/5'
              }`}
            >
              {/* Corner Indicators */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#c3f400]/10 group-hover:border-[#c3f400]/30 transition-colors" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#c3f400]/5 group-hover:border-[#c3f400]/20 transition-colors" />
              
              {/* Status Header Badge */}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 text-[9px] font-black font-mono tracking-widest rounded-full uppercase ${
                  session.status === 'live'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25 animate-pulse'
                    : session.status === 'ended'
                      ? 'bg-white/5 text-slate-500 border border-white/5'
                      : 'bg-[#c3f400]/10 text-[#c3f400] border border-[#c3f400]/15'
                }`}>
                  {session.status}
                </span>
                
                {session.status === 'scheduled' && (
                  <button 
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-1.5 bg-white/2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-all"
                    title="Cancel Broadcast"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2 mb-6">
                {session.courses && (
                  <span className="text-[8px] font-black font-mono text-[#c3f400] uppercase tracking-wider">
                    {session.courses.title}
                  </span>
                )}
                <h3 className="text-base font-headline font-bold text-white leading-snug line-clamp-1 group-hover:text-[#c3f400] transition-colors">{session.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-body line-clamp-2">{session.description || 'No system notes configured.'}</p>
              </div>

              {/* Timing Grid */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-white/[0.01] border border-white/5 rounded-xl text-slate-400 font-mono text-[10px] mb-6">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-slate-600" />
                  <span>{new Date(session.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-slate-600" />
                  <span>{session.duration_minutes || session.duration_mins || 60} mins</span>
                </div>
              </div>

              {/* Command Button */}
              {session.status === 'scheduled' && (
                <button 
                  onClick={() => startBroadcast(session)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#c3f400] hover:bg-[#b0dc00] text-black text-xs font-mono font-bold tracking-widest rounded-xl transition-all"
                >
                  <Radio size={14} className="animate-pulse" />
                  INITIALIZE_BROADCAST
                </button>
              )}

              {session.status === 'live' && (
                <button 
                  onClick={() => setActiveSession(session)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-mono font-bold tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
                >
                  <Monitor size={14} />
                  ENTER_BROADCAST_STUDIO
                </button>
              )}

              {session.status === 'ended' && (
                <div className="w-full py-2.5 bg-white/2 text-slate-500 text-center font-mono text-[9px] uppercase tracking-widest rounded-xl border border-white/5">
                  SESSION_TERMINATED
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D0E12] border border-white/5 rounded-2xl overflow-hidden relative shadow-2xl max-h-[90vh] flex flex-col">
            {/* Design accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-[#c3f400]/20 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-white/10 pointer-events-none" />

            <div className="p-5 border-b border-white/5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Video size={16} className="text-[#c3f400]" />
                <h2 className="text-xs font-headline font-bold text-white uppercase tracking-wider">Schedule Neural Stream</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 space-y-3.5 overflow-y-auto flex-1 custom-scrollbar max-h-[58vh]">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Broadcast Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next-Gen Shader Pipelines"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#09090B] border border-white/5 focus:border-[#c3f400]/20 outline-none rounded-xl p-2.5 text-xs text-white transition-all font-body placeholder:text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Broadcast Notes</label>
                  <textarea
                    placeholder="Explain curriculum, prerequisites, or session targets."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#09090B] border border-white/5 focus:border-[#c3f400]/20 outline-none rounded-xl p-2.5 text-xs text-white transition-all font-body min-h-[60px] placeholder:text-slate-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Course Hook</label>
                    <select
                      value={formData.course_id}
                      onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                      className="w-full bg-[#09090B] border border-white/5 focus:border-white/10 outline-none rounded-xl p-2.5 text-xs text-white transition-all font-mono"
                    >
                      <option value="">NONE (GENERAL)</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Duration (Mins)</label>
                    <input
                      type="number"
                      required
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                      className="w-full bg-[#09090B] border border-white/5 focus:border-white/10 outline-none rounded-xl p-2.5 text-xs text-white transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Custom Interactive Calendar Date Picker */}
                <div className="space-y-1.5 relative">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Select Date</label>
                  
                  {/* Dropdown Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full flex items-center justify-between bg-[#09090B] border border-white/5 hover:border-[#c3f400]/20 rounded-xl p-2.5 text-xs text-white transition-all font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-[#c3f400]" />
                      <span className={formData.scheduled_date ? "text-white" : "text-slate-500"}>
                        {formData.scheduled_date 
                          ? new Date(formData.scheduled_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
                          : 'CHOOSE TARGET DATE'}
                      </span>
                    </div>
                    <ChevronDown size={13} className={`text-slate-500 transition-transform duration-200 ${showCalendar ? 'rotate-180 text-white' : ''}`} />
                  </button>

                  {/* Popover Calendar Grid */}
                  {showCalendar && (
                    <div className="p-3 bg-[#09090B] border border-white/10 rounded-xl space-y-2 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 relative z-20">
                      {/* Calendar Month Header */}
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                          {currentCalendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </span>
                        <div className="flex gap-0.5">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded-md transition-all"
                          >
                            <ChevronLeft size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded-md transition-all"
                          >
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Days of Week Header */}
                      <div className="grid grid-cols-7 gap-0.5 text-center text-[8px] font-mono text-slate-650 uppercase font-black">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                          <div key={day} className="py-0.5">{day}</div>
                        ))}
                      </div>

                      {/* Days Grid */}
                      <div className="grid grid-cols-7 gap-0.5">
                        {getDaysInMonth(currentCalendarMonth).map((dayObj, index) => {
                          if (!dayObj.day) {
                            return <div key={`empty-${index}`} className="py-0.5"></div>;
                          }

                          const active = isSameDay(dayObj.date, formData.scheduled_date);
                          const past = isPastDay(dayObj.date);

                          return (
                            <button
                              key={`day-${index}`}
                              type="button"
                              disabled={past}
                              onClick={() => handleSelectCalendarDay(dayObj.date)}
                              className={`py-1 text-[9px] font-mono rounded transition-all ${
                                active
                                  ? 'bg-[#c3f400] text-black font-bold shadow-[0_0_8px_rgba(195,244,0,0.25)]'
                                  : past
                                    ? 'text-slate-800 cursor-not-allowed opacity-20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {dayObj.day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Selector & Presets */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Select Time</label>
                    <input
                      type="time"
                      required
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                      className="w-full bg-[#09090B] border border-white/5 focus:border-[#c3f400]/25 outline-none rounded-xl p-2.5 text-xs text-white transition-all font-mono [color-scheme:dark]"
                    />
                  </div>
                  
                  {/* Popular Time Suggestions Shortcut */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Presets</label>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { label: 'Next Hour', getValue: () => getNextHourString() },
                        { label: '09:00 AM', getValue: () => '09:00' },
                        { label: '02:00 PM', getValue: () => '14:00' },
                        { label: '06:00 PM', getValue: () => '18:00' }
                      ].map((preset, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, scheduled_time: preset.getValue() }))}
                          className={`py-1.5 px-0.5 text-[8px] font-mono rounded border border-white/5 transition-all truncate text-center ${
                            formData.scheduled_time === preset.getValue()
                              ? 'bg-[#c3f400]/10 border-[#c3f400]/30 text-[#c3f400]'
                              : 'bg-[#09090B] text-slate-500 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-white/5 bg-[#09090B]/50 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-white/5 text-slate-400 text-xs font-mono font-bold tracking-widest hover:text-white transition-all rounded-xl border border-white/5"
                >
                  CANCEL_PORTAL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#c3f400] text-black text-xs font-mono font-bold tracking-widest hover:bg-[#b0dc00] transition-all rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : 'INITIALIZE_SCHEDULE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClasses;
