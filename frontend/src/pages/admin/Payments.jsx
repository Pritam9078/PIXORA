import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { motion } from 'framer-motion';
import { 
  CreditCard, TrendingUp, Download, Search, 
  Filter, CheckCircle2, Clock, AlertTriangle 
} from 'lucide-react';

const Payments = () => {
  const { data: payments, loading } = useSupabaseData('payments', '*, profiles(full_name, email)');

  const stats = {
    gross: payments.filter(p => p.status === 'completed').reduce((acc, curr) => acc + Number(curr.amount), 0),
    activeSubs: payments.filter(p => p.status === 'completed').length, // Rough estimate
    pending: payments.filter(p => p.status === 'pending').reduce((acc, curr) => acc + Number(curr.amount), 0),
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Financial Operations</h1>
            <p className="text-slate-500 text-sm">Monitor revenue, subscriptions, and payouts.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 text-white text-xs font-bold rounded-md hover:bg-white/10 transition-all">
            <Download size={14} />
            GENERATE_TAX_REPORT
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111113] border border-white/5 p-6 rounded-xl relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gross Volume</p>
            <h3 className="text-3xl font-bold text-white">${stats.gross.toLocaleString()}</h3>
            <div className="mt-4 flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold">
              <TrendingUp size={12} />
              <span>STABLE_REVENUE_STREAM</span>
            </div>
          </div>
          <div className="bg-[#111113] border border-white/5 p-6 rounded-xl relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Transactions</p>
            <h3 className="text-3xl font-bold text-white">{payments.length}</h3>
            <div className="mt-4 flex items-center gap-1.5 text-blue-500 text-[10px] font-bold">
              <span>PROCESSED_ACROSS_NETWORK</span>
            </div>
          </div>
          <div className="bg-[#111113] border border-white/5 p-6 rounded-xl relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Payouts</p>
            <h3 className="text-3xl font-bold text-white">${stats.pending.toLocaleString()}</h3>
            <div className="mt-4 flex items-center gap-1.5 text-amber-500 text-[10px] font-bold">
              <Clock size={12} />
              <span>AWAITING_VERIFICATION</span>
            </div>
          </div>
        </div>

        <div className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transaction ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 min-h-[200px]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-600 uppercase tracking-widest animate-pulse">Syncing_Ledger...</td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-600 uppercase tracking-widest">No_Transactions_Found</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-all group">
                      <td className="px-6 py-4 text-[10px] font-mono text-slate-400 truncate max-w-[120px]">{p.id}</td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-white">{p.profiles?.full_name || 'Anonymous'}</p>
                        <p className="text-[10px] text-slate-500 font-mono lowercase">{p.profiles?.email || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-white">${Number(p.amount).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${
                          p.status === 'completed' ? 'text-emerald-500' : p.status === 'failed' ? 'text-rose-500' : 'text-amber-500'
                        }`}>
                          {p.status === 'completed' ? <CheckCircle2 size={12} /> : p.status === 'failed' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Payments;

