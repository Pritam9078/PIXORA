import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { 
  HelpCircle, MessageSquare, Mail, 
  ExternalLink, Search, Filter, 
  CheckCircle2, Clock, AlertCircle, 
  MoreHorizontal, ChevronRight
} from 'lucide-react';

const Support = () => {
  const { data: tickets, loading, refresh } = useSupabaseData('support_tickets', '*, profiles(full_name)');
  const [activeFilter, setActiveFilter] = useState('Active Tickets');

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
  };

  const filteredTickets = tickets.filter(t => {
    if (activeFilter === 'Resolved') return t.status === 'resolved' || t.status === 'closed';
    if (activeFilter === 'Pending') return t.status === 'in_progress';
    return t.status === 'open';
  });

  const updateTicketStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) refresh();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Support Console</h1>
            <p className="text-slate-500 text-sm">Manage tickets, inquiries, and platform feedback.</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded-md">
              <CheckCircle2 size={14} />
              ONLINE_READY
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Open Tickets', val: stats.open, icon: <MessageSquare size={20} />, color: 'blue' },
            { label: 'In Progress', val: stats.inProgress, icon: <Clock size={20} />, color: 'amber' },
            { label: 'Resolved', val: stats.resolved, icon: <CheckCircle2 size={20} />, color: 'emerald' },
            { label: 'Total Tickets', val: tickets.length, icon: <HelpCircle size={20} />, color: 'purple' },
          ].map((s, i) => (
            <div key={i} className="bg-[#111113] border border-white/5 p-6 rounded-xl relative overflow-hidden group">
              <div className={`p-3 rounded-lg bg-${s.color}-500/10 text-${s.color}-500 w-fit mb-4`}>
                {s.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{s.val}</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex gap-4">
              {['Active Tickets', 'Pending', 'Resolved'].map((t) => (
                <button 
                  key={t} 
                  onClick={() => setActiveFilter(t)}
                  className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === t ? 'text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search tickets..."
                className="w-full bg-[#09090B] border border-white/5 rounded-md py-1.5 pl-9 pr-4 text-[10px] text-slate-200 outline-none"
              />
            </div>
          </div>
          
          <div className="divide-y divide-white/5 min-h-[300px]">
            {loading ? (
              <div className="p-12 text-center text-slate-600 uppercase tracking-widest animate-pulse">Syncing_Inquiries...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-slate-600 uppercase tracking-widest">Clear_Queue</div>
            ) : filteredTickets.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between group hover:bg-white/[0.01] transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                    {t.profiles?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-0.5">{t.subject}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                      {t.profiles?.full_name || 'Anonymous'} • {t.priority} PRIORITY • {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <select 
                    value={t.status}
                    onChange={(e) => updateTicketStatus(t.id, e.target.value)}
                    className="bg-transparent border border-white/10 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded text-slate-400 outline-none hover:border-white/30 transition-all"
                  >
                    <option value="open">OPEN</option>
                    <option value="in_progress">PENDING</option>
                    <option value="resolved">RESOLVED</option>
                    <option value="closed">CLOSED</option>
                  </select>
                  <ChevronRight size={16} className="text-slate-700 group-hover:text-white transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Support;

