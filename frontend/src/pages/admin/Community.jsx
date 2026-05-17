import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabase';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { 
  Users, MessageSquare, AlertTriangle, Plus, Globe, 
  Settings, Terminal, Radio, Webhook, ShieldAlert, Sparkles,
  CheckCircle2, Loader2, Send, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Community = () => {
  const { data: dbChannels, loading: channelsLoading, refresh: refreshChannels } = useSupabaseData('community_channels');
  const [activeTab, setActiveTab] = useState('ANNOUNCEMENTS');
  const [announcements, setAnnouncements] = useState([]);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementCategory, setAnnouncementCategory] = useState('GENERAL');
  const [isSending, setIsSending] = useState(false);

  // Load announcements or fallbacks
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase.from('notifications')
      .select('*')
      .eq('type', 'announcement')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setAnnouncements(data);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!announcementTitle || !announcementText) {
      toast.error('Please complete announcement fields before broadcasting.');
      return;
    }

    setIsSending(true);
    // Write announcement payload to Supabase
    const { data, error } = await supabase.from('notifications').insert({
      title: announcementTitle,
      message: announcementText,
      type: 'announcement',
      category: announcementCategory,
      metadata: { priority: 'high', generatedBy: 'SuperAdmin_Portal' }
    }).select();

    setIsSending(false);
    if (error) {
      toast.error(`Database Error: ${error.message}`);
    } else {
      toast.success('System announcement broadcasted to all enrolled students.');
      const newAnn = data ? data[0] : {
        id: Date.now().toString(),
        title: announcementTitle,
        message: announcementText,
        category: announcementCategory,
        created_at: new Date().toISOString()
      };
      setAnnouncements(prev => [newAnn, ...prev]);
      setAnnouncementTitle('');
      setAnnouncementText('');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) {
      toast.error(`Failed to purge notification: ${error.message}`);
    } else {
      toast.success('Announcement removed from global feed.');
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  };

  const webhooks = [
    { name: 'Discord Dev Broadcasts', url: 'https://discord.com/api/webhooks/9823...', event: 'On-chain Mint Events', active: true },
    { name: 'Slack Ops Telemetry', url: 'https://hooks.slack.com/services/T01...', event: 'Failed Payment Retries', active: false },
    { name: 'Github Commit Feed', url: 'https://github.com/webhooks/pixora...', event: 'Push to deployment/production', active: true }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Community Operating Deck</h1>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-0.5">Admin-to-Student channel orchestrators & announcements</p>
          </div>
          <div className="flex gap-2">
            {['ANNOUNCEMENTS', 'WEBHOOKS', 'CHANNELS'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-[10px] font-mono font-bold tracking-wider rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-[#c3f400] text-black shadow-[0_0_15px_rgba(195,244,0,0.2)]'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Panels */}
        {activeTab === 'ANNOUNCEMENTS' && (
          <div className="grid grid-cols-12 gap-8">
            {/* Broadcaster form */}
            <div className="col-span-12 lg:col-span-5 bg-[#111113]/60 border border-white/5 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Radio size={16} className="text-[#c3f400] animate-pulse" />
                  Broadcaster System
                </h3>
                <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider mt-1">Dispatches notification to all mobile/web profile feeds</p>
              </div>

              <form onSubmit={handleBroadcast} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Broadcast Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. System Wide Solidity Core Patch"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="w-full bg-[#09090B] border border-white/5 focus:border-white/15 outline-none rounded-xl p-3 text-xs text-white transition-all font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Broadcast Category</label>
                  <select
                    value={announcementCategory}
                    onChange={(e) => setAnnouncementCategory(e.target.value)}
                    className="w-full bg-[#09090B] border border-white/5 focus:border-white/15 outline-none rounded-xl p-3 text-xs text-white transition-all font-mono"
                  >
                    <option value="GENERAL">GENERAL ANNOUNCEMENT</option>
                    <option value="TRACKS">BLOCKCHAIN / GAMEDEV TRACKS</option>
                    <option value="ACADEMICS">ACADEMIC & SYLLABUS UPDATES</option>
                    <option value="MAINTENANCE">SYSTEM STATUS & MAINTENANCES</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Announcement Message</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Write announcement details..."
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full bg-[#09090B] border border-white/5 focus:border-white/15 outline-none rounded-xl p-3 text-xs text-white transition-all resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#c3f400] text-black text-xs font-mono font-bold tracking-widest rounded-xl hover:bg-[#b0dc00] transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      DISPATCHING_PROTOCOL...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      BROADCAST_NOW
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Broadcast feed history */}
            <div className="col-span-12 lg:col-span-7 bg-[#111113]/60 border border-white/5 rounded-2xl p-6 space-y-6">
              <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Globe size={16} className="text-blue-500" />
                Live Broadcast History
              </h3>

              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 bg-white/2 border border-white/5 hover:border-white/10 rounded-xl transition-all flex justify-between items-start group">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-full font-bold uppercase tracking-wider">
                          {ann.category}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {new Date(ann.created_at).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{ann.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{ann.message}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'WEBHOOKS' && (
          <div className="bg-[#111113]/60 border border-white/5 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Webhook size={16} className="text-purple-500" />
                  Integration Webhook Subscriptions
                </h3>
                <p className="text-slate-500 text-xs mt-1">Direct system-wide triggers to secondary platforms</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-xs font-mono font-bold tracking-widest hover:bg-white/10 transition-all rounded-xl text-white">
                <Plus size={14} />
                REGISTER_NEW_HOOK
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {webhooks.map((hook, i) => (
                <div key={i} className="p-5 bg-white/2 border border-white/5 rounded-2xl space-y-4 hover:border-white/10 transition-all relative overflow-hidden group">
                  <div className="flex justify-between items-center">
                    <span className={`w-2 h-2 rounded-full ${hook.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                    <span className="text-[9px] text-slate-500 font-mono">ACTIVE_MODE</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">{hook.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{hook.url}</p>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">EVENT_CLASS:</span>
                    <span className="text-[10px] font-bold text-[#c3f400] font-mono uppercase tracking-wide">{hook.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'CHANNELS' && (
          <div className="bg-[#111113]/60 border border-white/5 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={16} className="text-amber-500" />
                  Community Channels
                </h3>
                <p className="text-slate-500 text-xs mt-1">Manage active communication channels across the platform</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {channelsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-[#c3f400]" />
                </div>
              ) : dbChannels.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No community channels provisioned.
                </div>
              ) : (
                dbChannels.map((channel) => (
                  <div key={channel.id} className="p-5 bg-white/2 border border-white/5 rounded-xl flex justify-between items-center hover:border-white/10 transition-all">
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1">{channel.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{channel.description || 'No description'}</p>
                    </div>
                    <div>
                      <span className={`px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider rounded ${channel.is_private ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {channel.is_private ? 'PRIVATE' : 'PUBLIC'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default Community;
