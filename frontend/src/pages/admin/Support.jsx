import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, AlertCircle, Clock, CheckCircle, Search, 
  Send, User, ArrowUpRight, ShieldCheck, CornerDownRight, X
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

import { supabase } from '../../lib/supabase';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { useAuth } from '../../context/AuthContext';

const Support = () => {
  const { data: rawTickets } = useSupabaseData('support_tickets', '*, ticket_replies(*)');
  const { profile } = useAuth();
  
  // Provide an empty array if rawTickets is null
  const tickets = rawTickets || [];
  
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      const { error } = await supabase.from('ticket_replies').insert({
        ticket_id: selectedTicket.id,
        sender_id: profile?.id,
        sender_name: profile?.full_name || 'Admin',
        message: replyText
      });

      if (error) throw error;

      setReplyText('');
      toast.success('Response dispatched successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to dispatch response.');
    }
  };

  const handleResolveTicket = async (id) => {
    try {
      const { error } = await supabase.from('support_tickets').update({ status: 'Resolved' }).eq('id', id);
      if (error) throw error;
      toast.success(`Ticket ${id} marked as Resolved`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to resolve ticket.');
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesSearch = (t.student_name && t.student_name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                          (t.id && t.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans flex items-center gap-3">
              <MessageSquare className="text-lime-400 h-8 w-8" />
              Student Support Center
            </h1>
            <p className="text-slate-400 text-sm mt-1">Review active support requests, coordinate mentorship assistance, and resolve course blockers.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-lime-400 w-64"
              />
            </div>
            
            <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-lg">
              {['All', 'Open', 'Resolved'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                    statusFilter === tab ? 'bg-lime-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Load Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Unresolved Blockers</span>
              <span className="text-3xl font-black text-white">{tickets.filter(t=>t.status==='Open').length}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Students actively blocked in courses.</span>
            </div>
            <div className="p-3 bg-red-400/10 border border-red-400/20 text-red-400 rounded-lg">
              <AlertCircle size={24} />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Resolved Issues</span>
              <span className="text-3xl font-black text-white">{tickets.filter(t=>t.status==='Resolved').length}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Tickets closed successfully.</span>
            </div>
            <div className="p-3 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 rounded-lg">
              <CheckCircle size={24} />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Roster Response SLA</span>
              <span className="text-3xl font-black text-white">98.4%</span>
              <span className="text-[10px] text-slate-400 block mt-1">First replies sent under 4 hours.</span>
            </div>
            <div className="p-3 bg-indigo-400/10 border border-indigo-400/20 text-indigo-400 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* Master Ticket Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Ticket Listing Column */}
          <div className="lg:col-span-1 bg-slate-950/60 border border-slate-900 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest px-2">Support Queue ({filteredTickets.length})</h3>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedTicketId === ticket.id ? 'bg-slate-900 border-lime-500' : 'bg-slate-900/40 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[9px] text-lime-400 bg-slate-950 border border-slate-900 px-2 py-0.5 rounded uppercase">{ticket.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ticket.status === 'Open' ? 'text-red-400 bg-red-950/20' : 'text-emerald-400 bg-emerald-950/20'
                    }`}>{ticket.status}</span>
                  </div>
                  
                  <h4 className="font-bold text-sm text-white mt-2 truncate">{ticket.subject}</h4>
                  <p className="text-xs text-slate-400 truncate mt-1">{ticket.student_name}</p>
                  
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-950 text-[10px] text-slate-500">
                    <span>{ticket.category}</span>
                    <span>{ticket.ticket_replies?.length || 0} replies</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Interactivity Console */}
          <div className="lg:col-span-2 bg-slate-950/60 border border-slate-900 rounded-lg p-6 min-h-[500px] flex flex-col">
            {selectedTicket ? (
              <div className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start border-b border-slate-900 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-lime-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded">{selectedTicket.id}</span>
                        <span className="text-xs text-slate-400">{selectedTicket.category}</span>
                      </div>
                      <h2 className="text-xl font-extrabold text-white font-sans mt-1">{selectedTicket.subject}</h2>
                    </div>

                    <div className="flex gap-2">
                      {selectedTicket.status === 'Open' && (
                        <button
                          onClick={() => handleResolveTicket(selectedTicket.id)}
                          className="bg-emerald-500/10 hover:bg-emerald-505 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Student Original Post */}
                  <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-full">
                        <User size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">{selectedTicket.student_name}</span>
                        <span className="text-[10px] text-slate-500">{selectedTicket.track}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-350 leading-relaxed pl-1">{selectedTicket.message}</p>
                  </div>

                  {/* Conversation Threads */}
                  {selectedTicket.ticket_replies && selectedTicket.ticket_replies.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-900">
                      <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider pl-1">Resolution History</h4>
                      
                      {selectedTicket.ticket_replies.map((reply, idx) => (
                        <div key={idx} className="flex gap-3 items-start pl-2">
                          <CornerDownRight className="text-slate-600 mt-1 shrink-0" size={14} />
                          <div className="bg-slate-900/60 border border-slate-900/60 p-3 rounded-lg flex-1 space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-bold text-lime-400">{reply.sender_name || 'System'}</span>
                              <span className="text-slate-500">{new Date(reply.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-slate-300">{reply.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-900 space-y-3">
                  <textarea
                    placeholder="Provide detailed instruction path or system answer response..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full h-24 bg-slate-900 border border-slate-800 rounded p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-transparent resize-none"
                    required
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      type="submit"
                      className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold uppercase tracking-wider px-5 py-2 rounded text-[11px] flex items-center gap-1.5 transition-all"
                    >
                      <Send size={12} /> Dispatch Reply
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-2">
                <MessageSquare size={48} className="text-slate-800" />
                <p className="text-sm font-medium">Select a support ticket from the active queue to interact.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default Support;
