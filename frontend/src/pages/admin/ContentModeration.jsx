import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabase';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { 
  AlertTriangle, Shield, Check, Trash2, Eye, EyeOff, 
  MessageSquare, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ContentModeration = () => {
  const { data: reports, refresh: refreshReports } = useSupabaseData('moderation_reports', '*');
  const [processingId, setProcessingId] = useState(null);

  const handleResolve = async (id, status, remarks = '') => {
    setProcessingId(id);
    const { error } = await supabase.from('moderation_reports')
      .update({ 
        status, 
        remarks,
        resolved_at: new Date().toISOString()
      })
      .eq('id', id);
    setProcessingId(null);

    if (error) {
      toast.error(`Database Error: ${error.message}`);
    } else {
      toast.success(`Report status marked as '${status}'.`);
      // Log to admin_logs
      supabase.from('admin_logs').insert({
        action: `MODERATION_RESOLVE: ID ${id} set to ${status}`,
        target_type: 'moderation_report',
        target_id: id
      }).then(() => {});
      refreshReports();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-400 border border-amber-500/10';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10';
      case 'dismissed': return 'bg-slate-500/10 text-slate-400 border border-white/5';
      default: return 'bg-slate-500/10 text-slate-400 border border-white/5';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight uppercase flex items-center gap-2">
              <Shield className="text-[#c3f400] animate-pulse" size={24} />
              Platform Moderation Hub
            </h1>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-0.5">Audit community reports, flag violations, and suspend contents</p>
          </div>
        </div>

        {/* Telemetry statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Pending Reports', value: reports.filter(r => r.status === 'pending').length, color: 'amber', icon: AlertTriangle },
            { label: 'Resolved Violations', value: reports.filter(r => r.status === 'resolved').length, color: 'emerald', icon: Check },
            { label: 'Dismissed Cases', value: reports.filter(r => r.status === 'dismissed').length, color: 'blue', icon: EyeOff },
            { label: 'Global Reports Logged', value: reports.length, color: 'purple', icon: MessageSquare }
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-[#111113]/60 border border-white/5 p-5 rounded-2xl flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="text-slate-500 text-[9px] font-mono uppercase tracking-wider">{card.label}</p>
                  <div className="flex items-center gap-2">
                    <h4 className="text-2xl font-bold text-white tracking-tight">{card.value}</h4>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-${card.color}-500/10 text-${card.color}-500 group-hover:scale-110 transition-all duration-300`}>
                  <Icon size={18} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Master moderation table */}
        <div className="bg-[#111113]/60 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider">Flagged Content Registry</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  <th className="p-6">Report ID</th>
                  <th className="p-6">Target Object Type</th>
                  <th className="p-6">Reporter ID</th>
                  <th className="p-6">Reason for Flag</th>
                  <th className="p-6">Logged At</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-white/[0.01] transition-all group">
                      <td className="p-6 font-mono text-[10px] text-slate-400 select-all truncate max-w-[120px]">{report.id}</td>
                      <td className="p-6 font-bold text-white uppercase tracking-wider font-mono text-[10px]">{report.target_type}</td>
                      <td className="p-6 font-mono text-[10px] text-slate-500 truncate max-w-[120px]">{report.reporter_id}</td>
                      <td className="p-6 text-slate-300">{report.reason}</td>
                      <td className="p-6 text-slate-400 font-mono text-[10px]">{new Date(report.created_at).toLocaleString()}</td>
                      <td className="p-6">
                        <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full font-mono uppercase tracking-wider ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        {report.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleResolve(report.id, 'resolved', 'Flag confirmed, content restricted')}
                              disabled={processingId === report.id}
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition-all"
                              title="Resolve & Restrict"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => handleResolve(report.id, 'dismissed', 'False alarm')}
                              disabled={processingId === report.id}
                              className="p-1.5 bg-slate-500/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all"
                              title="Dismiss Report"
                            >
                              <EyeOff size={13} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">RESOLVED</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                      No reports flagged in the database
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default ContentModeration;
