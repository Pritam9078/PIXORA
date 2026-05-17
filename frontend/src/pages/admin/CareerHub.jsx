import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Briefcase, Send, Users, ChevronRight, CheckCircle2, 
  Clock, XCircle, Search, Filter, Plus, ShieldCheck, Mail
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import toast from 'react-hot-toast';

const CareerHub = () => {
  const { data: jobPostings, loading: jobsLoading } = useSupabaseData('career_jobs');
  const { data: applications, loading: appsLoading, refresh } = useSupabaseData('career_applications', '*, career_jobs(title), profiles(full_name)');
  
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const handleDispenseOffer = async (appId, studentName) => {
    toast.loading(`Drafting and signing legal offer letter for ${studentName}...`);
    try {
      const { error } = await supabase.from('career_applications').update({ status: 'offered' }).eq('id', appId);
      if (error) throw error;
      toast.dismiss();
      toast.success(`Internship offer dispatched to ${studentName}'s dashboard!`);
      refresh();
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to dispatch offer.');
    }
  };

  const filteredApplications = applications.filter(app => {
    const studentName = app.profiles?.full_name || 'Unknown';
    const jobTitle = app.career_jobs?.title || 'Unknown Role';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) || jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'ALL' || app.status.toUpperCase() === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Career Hub & Internship Deck</h1>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-0.5">Manage partner listings, verify applicants, and authorize internships</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#c3f400] text-black text-xs font-mono font-bold tracking-widest hover:bg-[#b0dc00] transition-all rounded-xl shadow-[0_0_15px_rgba(195,244,0,0.2)]">
            <Plus size={14} />
            POST_NEW_INTERNSHIP
          </button>
        </div>

        {/* Telemetry Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Openings', value: '4 Listings', color: 'blue', icon: Briefcase },
            { label: 'Enrolled Applicants', value: '30 Candidates', color: 'purple', icon: Users },
            { label: 'Successful Offers', value: '18 Issued', color: 'emerald', icon: ShieldCheck },
            { label: 'Review Latency', value: '24 Hours', color: 'rose', icon: Clock }
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

        {/* Dynamic Split Deck */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Active Job Postings */}
          <div className="col-span-12 lg:col-span-5 bg-[#111113]/60 border border-white/5 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase size={16} className="text-[#c3f400]" />
                Operational Opportunities
              </h3>
              <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider mt-1">Current internship placements within partnering ecosystems</p>
            </div>

            <div className="space-y-4">
              {jobsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c3f400]"></div>
                </div>
              ) : jobPostings.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-mono text-[10px]">NO_JOB_POSTINGS_FOUND</div>
              ) : (
                jobPostings.map((job) => (
                  <div key={job.id} className="p-4 bg-white/2 border border-white/5 hover:border-white/10 rounded-xl transition-all space-y-3 group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-[#c3f400] transition-all">{job.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{job.company}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[8px] font-bold font-mono rounded uppercase tracking-wider ${
                        job.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                      <span>{job.type}</span>
                      <span>{job.salary}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Applicant Pipeline */}
          <div className="col-span-12 lg:col-span-7 bg-[#111113]/60 border border-white/5 rounded-2xl p-6 space-y-6">
            
            {/* Toolbar filter */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users size={16} className="text-blue-500" />
                  Application Pipeline
                </h3>
                <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider mt-1">Screening gates and graduation track approvals</p>
              </div>

              <div className="flex gap-2">
                {['ALL', 'PENDING', 'OFFERED'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 text-[9px] font-mono font-bold tracking-wider rounded-lg border transition-all ${
                      activeFilter === filter
                        ? 'bg-[#c3f400] text-black border-[#c3f400] shadow-[0_0_10px_rgba(195,244,0,0.15)]'
                        : 'bg-white/5 text-slate-400 hover:text-white border-white/5'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Search candidates by name, specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#09090B] border border-white/5 focus:border-white/10 outline-none rounded-xl py-3 pl-10 pr-4 text-xs text-white transition-all font-mono"
              />
            </div>

            {/* Pipeline List */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
              {appsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              ) : filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <div key={app.id} className="p-4 bg-white/2 border border-white/5 hover:border-white/10 rounded-xl transition-all flex items-center justify-between group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{app.profiles?.full_name || 'Unknown User'}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                          Score: {app.score}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400">{app.career_jobs?.title || 'Unknown Role'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-[8px] font-bold font-mono rounded uppercase tracking-wider ${
                        app.status === 'offered' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                          : app.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {app.status}
                      </span>
                      {app.status !== 'offered' && (
                        <button
                          onClick={() => handleDispenseOffer(app.id, app.profiles?.full_name || 'Unknown')}
                          className="p-2 bg-[#c3f400]/10 hover:bg-[#c3f400] text-[#c3f400] hover:text-black rounded-lg transition-all"
                          title="Authorize Internship Offer"
                        >
                          <Send size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 font-mono text-[10px] py-8 uppercase tracking-wider">
                  No applicants matching active search filters
                </p>
              )}
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default CareerHub;
