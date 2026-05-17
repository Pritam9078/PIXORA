import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Shield, User, Globe, 
  Terminal, Search, Filter, Clock 
} from 'lucide-react';

const AuditLogs = () => {
  const { data: logs, loading } = useSupabaseData('audit_logs', '*, profiles(full_name, email)');
  const [expandedLogId, setExpandedLogId] = useState(null);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Audit Logs</h1>
            <p className="text-slate-500 text-sm">Immutable record of all platform administrative actions.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold rounded-md hover:bg-rose-500/20 transition-all">
              <Shield size={14} />
              EXPORT_SECURITY_LOG
            </button>
          </div>
        </div>

        <div className="bg-[#09090B] border border-white/5 rounded-xl overflow-hidden font-mono text-[11px]">
          <div className="bg-[#111113] p-4 border-b border-white/5 flex justify-between items-center">
            <div className="flex gap-4 text-slate-500 font-bold uppercase tracking-widest">
              <span className="text-white">STREAMING_LIVE</span>
              <span>FILTER: ALL_ACTIONS</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock size={12} />
              <span>REAL-TIME_SYNC_ACTIVE</span>
            </div>
          </div>
          
          <div className="p-4 space-y-3 min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-slate-600 animate-pulse uppercase tracking-[0.3em]">
                Initializing_Neural_Stream...
              </div>
            ) : logs.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-slate-600 uppercase tracking-[0.3em]">
                No_Logs_In_Buffer
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="group">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                    className="flex gap-6 p-2 rounded hover:bg-white/5 transition-all cursor-pointer border-l border-transparent hover:border-blue-500"
                  >
                    <span className="text-slate-600 w-24">{new Date(log.created_at).toLocaleTimeString()}</span>
                    <span className="text-blue-500 font-bold w-32 truncate">[{log.profiles?.full_name || log.profiles?.email || 'SYSTEM'}]</span>
                    <span className="text-white font-black w-40 truncate">{log.action}</span>
                    <span className="text-slate-400 flex-1 truncate">{log.details ? JSON.stringify(log.details) : 'No details provided'}</span>
                  </motion.div>
                  <AnimatePresence>
                    {expandedLogId === log.id && (log.details?.previous_state || log.details?.new_state) && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-[calc(6rem+8rem+10rem+4.5rem)] pr-4 pb-2 text-[10px]"
                      >
                        <div className="grid grid-cols-2 gap-4 p-4 bg-white/[0.02] rounded-md border border-white/5">
                          <div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest mb-2 text-[9px]">Previous State</p>
                            <pre className="text-slate-400 overflow-x-auto whitespace-pre-wrap">
                              {log.details?.previous_state ? JSON.stringify(log.details.previous_state, null, 2) : 'null'}
                            </pre>
                          </div>
                          <div>
                            <p className="text-blue-500 font-bold uppercase tracking-widest mb-2 text-[9px]">New State</p>
                            <pre className="text-white overflow-x-auto whitespace-pre-wrap">
                              {log.details?.new_state ? JSON.stringify(log.details.new_state, null, 2) : 'null'}
                            </pre>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AuditLogs;

