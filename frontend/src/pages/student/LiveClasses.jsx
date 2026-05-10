import React, { useState } from 'react';
import { 
  Monitor, Users, MessageSquare, Send, 
  Mic, Video, Share2, Settings, MoreVertical,
  Play, Radio, Clock, Calendar, Shield
} from 'lucide-react';
import { useStudentTheme } from '../../context/StudentThemeContext';

const LiveClasses = () => {
  const { currentTheme } = useStudentTheme();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { user: 'Sarah Chen', message: 'The shader graph logic is intense! 🔥', time: '14:02' },
    { user: 'Alex Rivest', message: 'Can we use this for VR projects?', time: '14:05' },
    { user: 'Admin Pixora', message: 'Yes Alex, we have a specialized module for XR next week.', time: '14:06' },
    { user: 'Marcus Wright', message: 'Mind-blowing performance optimizations today.', time: '14:08' },
  ]);

  const upcomingClasses = [
    { title: 'Advanced ZK-Rollups', instructor: 'Dr. Soline', date: 'Tomorrow', time: '10:00 AM', track: 'blockchain' },
    { title: 'Nanite & Lumen Mastery', instructor: 'James Unreal', date: 'Wednesday', time: '02:00 PM', track: 'game_dev' },
    { title: 'Governance Tokenomics', instructor: 'Crypto Wiz', date: 'Friday', time: '11:00 AM', track: 'blockchain' },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setChat([...chat, { user: 'You', message: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-headline font-bold uppercase tracking-widest animate-pulse">
              <Radio size={12} />
              Live Now
            </span>
            <span className="text-on-surface-variant/40 text-[10px] font-headline font-bold uppercase tracking-widest">Global Stream • ID: PX-772</span>
          </div>
          <h1 className="text-3xl font-headline font-bold text-white">Advanced Engine <span className="text-[var(--st-color-primary)]">Architecture</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#051424] overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-[#051424] bg-white/5 flex items-center justify-center text-[10px] font-bold text-white backdrop-blur-xl">
              +842
            </div>
          </div>
          <button className="btn-outline !px-6 !py-3 !rounded-xl !text-xs group">
            <Share2 size={16} className="group-hover:rotate-12 transition-transform" />
            <span>Invite Squad</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Stream Area */}
        <div className="lg:col-span-3 space-y-8">
          <div className="relative aspect-video rounded-[40px] overflow-hidden border border-white/5 bg-black group shadow-2xl">
            {/* Simulated Video Placeholder */}
            <img 
              src="https://images.unsplash.com/photo-1626777552726-4a6b547b4956?q=80&w=2835&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-60"
              alt="Live Stream"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
            
            {/* Stream Overlay Controls */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="w-20 h-20 rounded-full bg-[var(--st-color-primary)] text-black flex items-center justify-center shadow-[0_0_30px_var(--st-color-glow)] scale-90 group-hover:scale-100 transition-all duration-500">
                <Play fill="currentColor" size={32} />
              </button>
            </div>

            <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer">
                  <Mic size={20} />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer">
                  <Video size={20} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="px-4 py-2 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 text-white text-xs font-headline font-bold">
                  1080p 60FPS
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer">
                  <Settings size={20} />
                </div>
              </div>
            </div>

            <div className="absolute top-8 left-8">
               <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                <span className="text-[10px] font-headline font-bold text-white uppercase tracking-widest">Transmission Active</span>
               </div>
            </div>
          </div>

          {/* Instructor & Info */}
          <div className="glass-panel rounded-[32px] p-8 border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[24px] border-2 border-[var(--st-color-primary)] p-1 overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=instructor" alt="" className="w-full h-full object-cover rounded-[18px]" />
              </div>
              <div>
                <h3 className="text-xl font-headline font-bold text-white tracking-wide">Prof. Julian Vane</h3>
                <p className="text-sm font-medium text-on-surface-variant/60">Lead Architect • Epic Games Contributor</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-widest"><Users size={14} /> 1,242 Watching</span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-widest"><Shield size={14} /> Verified Partner</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="btn-primary !px-10 !py-4 !rounded-2xl !text-sm">
                Follow Channel
              </button>
              <button className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-white transition-all">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Chat Sidebar */}
        <div className="flex flex-col h-[600px] lg:h-auto lg:sticky lg:top-24 space-y-8">
          <div className="flex-1 glass-panel rounded-[40px] border-white/5 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h3 className="font-headline font-bold text-white text-xs uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={16} className="text-[var(--st-color-primary)]" />
                Neural Chat
              </h3>
              <Users size={16} className="text-on-surface-variant/20" />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {chat.map((c, idx) => (
                <div key={idx} className="space-y-1.5 group">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-headline font-bold uppercase tracking-wider ${c.user === 'Admin Pixora' ? 'text-[var(--st-color-primary)]' : 'text-on-surface-variant/60'}`}>
                      {c.user}
                    </span>
                    <span className="text-[8px] font-bold text-on-surface-variant/20 opacity-0 group-hover:opacity-100 transition-opacity">{c.time}</span>
                  </div>
                  <p className="text-xs font-medium text-white/90 leading-relaxed bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                    {c.message}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white/[0.02] border-t border-white/5">
              <form onSubmit={handleSendMessage} className="relative">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Send a transmission..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-xs font-body focus:outline-none focus:border-[var(--st-color-primary)]/50 transition-all placeholder:text-on-surface-variant/30"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-[var(--st-color-primary)] text-black flex items-center justify-center hover:scale-110 transition-all shadow-lg"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>

          {/* Upcoming Card */}
          <div className="glass-panel rounded-[32px] border-white/5 p-8 space-y-6">
            <h4 className="font-headline font-bold text-white text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              <Calendar size={14} className="text-[var(--st-color-primary)]" />
              Upcoming Grid
            </h4>
            <div className="space-y-6">
              {upcomingClasses.map((item, idx) => (
                <div key={idx} className="flex gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-[var(--st-color-primary)] group-hover:border-[var(--st-color-primary)]/30 transition-all">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-headline font-bold text-white group-hover:text-[var(--st-color-primary)] transition-colors line-clamp-1">{item.title}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1">{item.date} • {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-4 rounded-2xl border border-white/5 text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.2em] hover:text-white hover:border-white/20 transition-all">
              View Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveClasses;
