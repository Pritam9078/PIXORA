import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { supabase } from '../../lib/supabase';
import ActionModal from '../../components/common/ActionModal';
import { motion } from 'framer-motion';
import { 
  Bell, Send, Search, Filter, 
  MessageSquare, Mail, Zap, Trash2, 
  Settings, CheckCircle2, Loader2
} from 'lucide-react';

const Notifications = () => {
  const { data: notifications, loading, refresh } = useSupabaseData('notifications');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'ALERT',
    target: 'ALL'
  });

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from('notifications').insert([
        { ...formData, status: 'SENT', sent_at: new Date().toISOString() }
      ]);
      if (error) throw error;
      refresh();
      setIsModalOpen(false);
      setFormData({ title: '', message: '', type: 'ALERT', target: 'ALL' });
    } catch (error) {
      console.error('Broadcast failed:', error);
      alert('Broadcast failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete notification record?')) return;
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      refresh();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Notification Center</h1>
            <p className="text-slate-500 text-sm">Broadcast messages and manage system-wide alerts.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
          >
            <Send size={14} />
            CREATE_BROADCAST
          </button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-4 space-y-4">
            <div className="bg-[#111113] border border-white/5 rounded-xl p-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Notification Channels</h3>
              <div className="space-y-3">
                {[
                  { icon: <MessageSquare size={16} />, label: 'Push Notifications', status: 'ACTIVE', color: 'blue' },
                  { icon: <Mail size={16} />, label: 'Email Alerts', status: 'ACTIVE', color: 'emerald' },
                  { icon: <Zap size={16} />, label: 'Webhooks', status: '8 ACTIVE', color: 'purple' },
                ].map((ch, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg group hover:border-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`text-${ch.color}-500`}>{ch.icon}</div>
                      <span className="text-xs font-bold text-white">{ch.label}</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-500">{ch.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-600/20 p-6 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-blue-500">
                <Bell size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">Broadcast Tip</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">Scheduled broadcasts can increase user engagement by up to 40%. Use templates for consistency across multi-role targets.</p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-4">
            <div className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sent History</h3>
                <div className="flex gap-2">
                  <button className="p-1.5 text-slate-500 hover:text-white transition-all"><Search size={14} /></button>
                </div>
              </div>
              <div className="divide-y divide-white/5">
                {loading ? (
                  <div className="p-12 text-center text-slate-600 uppercase tracking-widest animate-pulse">Syncing_Broadcasts...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-12 text-center text-slate-600 uppercase tracking-widest">No_History_Found</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-4 flex items-center justify-between group hover:bg-white/[0.01] transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${n.type === 'ALERT' ? 'bg-rose-500' : n.type === 'PROMO' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                        <div>
                          <h4 className="text-xs font-bold text-white mb-0.5">{n.title}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                            {n.type} • TARGET: {n.target} • {new Date(n.sent_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-emerald-500 flex items-center gap-1.5">
                          <CheckCircle2 size={12} /> {n.status}
                        </span>
                        <button 
                          onClick={() => handleDelete(n.id)}
                          className="p-2 text-slate-600 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <ActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="INITIALIZE_BROADCAST_PROTOCOL"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Broadcast Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                placeholder="System Maintenance Scheduled"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="ALERT">ALERT</option>
                  <option value="PROMO">PROMO</option>
                  <option value="AUTO">AUTO</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Audience</label>
                <select 
                  value={formData.target}
                  onChange={(e) => setFormData({...formData, target: e.target.value})}
                  className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="ALL">ALL USERS</option>
                  <option value="STUDENTS">STUDENTS ONLY</option>
                  <option value="INSTRUCTORS">INSTRUCTORS ONLY</option>
                  <option value="PARTNERS">PARTNERS ONLY</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Message Payload</label>
              <textarea 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                rows="4"
                placeholder="Enter the notification content..."
              />
            </div>
            <div className="pt-4">
              <button 
                onClick={handleSubmit}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-md transition-all shadow-lg shadow-blue-600/20"
              >
                EXECUTE_BROADCAST
              </button>
            </div>
          </div>
        </ActionModal>
      </div>
    </AdminLayout>
  );
};

export default Notifications;
