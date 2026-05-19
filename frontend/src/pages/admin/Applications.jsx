import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, CheckCircle2, AlertCircle, Eye, 
  ChevronRight, Calendar, ArrowRight, User, X, FileText, Check, Ban
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

import { supabase } from '../../lib/supabase';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const COLUMNS = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Enrolled'];

const Applications = () => {
  const { data: dbApplications, loading, refresh } = useSupabaseData('applications', '*, profiles(full_name, email)');
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState('All');

  // Map DB schema to component schema
  const applications = dbApplications.map(app => ({
    id: app.id,
    student_id: app.student_id,
    name: app.profiles?.full_name || 'Unknown',
    email: app.profiles?.email || 'No email',
    track: app.role_requested || 'Unknown',
    date: new Date(app.created_at).toLocaleDateString(),
    status: app.status || 'Draft',
    github: app.details?.github || app.details?.portfolio || 'N/A',
    education: app.details?.education || (app.details?.specializations ? app.details.specializations.join(', ') : 'N/A'),
    statement: app.details?.statement || app.details?.motivation || 'No statement provided.',
    resume_url: app.details?.resume_url || null,
    portfolio_url: app.details?.portfolio_pdf_url || null,
    profile_image_url: app.details?.profile_image_url || null
  }));

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrack = trackFilter === 'All' || app.track === trackFilter;
    return matchesSearch && matchesTrack;
  });

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const app = applications.find(a => a.id === appId);
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', appId);
        
      if (error) throw error;
      
      // Note: Promotion to instructor is handled automatically by the PostgreSQL trigger
      // 'trg_application_status_update' on the 'applications' table when status is set to 'Approved'.
      if (app && app.track === 'instructor' && newStatus === 'Approved') {
        toast.success(`${app.name} has been promoted to Instructor (via trigger)!`);
      }
      
      toast.success(`Application status updated to ${newStatus}`);
      refresh();
      
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">Applications Pipeline</h1>
            <p className="text-slate-400 text-sm mt-1">Manage and track student application cohorts through each vetting phase.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-transparent w-64"
              />
            </div>
            
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-md text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-lime-400"
            >
              <option value="All">All Tracks</option>
              <option value="Blockchain & Web3 Development">Web3 Development</option>
              <option value="Game Development & Metaverse">Game Development</option>
              <option value="instructor">Instructor Applications</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400"></div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-slate-500" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">No Applications Found</h3>
            <p className="text-slate-400 text-sm mt-2">There are currently no applications matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {COLUMNS.map(col => {
            const colApps = filteredApps.filter(app => app.status === col);
            return (
              <div key={col} className="bg-slate-950/80 border border-slate-900 rounded-lg p-4 flex flex-col min-h-[450px]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-900">
                  <span className="font-semibold text-xs text-slate-400 uppercase tracking-widest">{col}</span>
                  <span className="bg-slate-900 text-lime-400 text-xs px-2 py-0.5 rounded-full border border-lime-400/20">{colApps.length}</span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  <AnimatePresence>
                    {colApps.map(app => (
                      <motion.div
                        key={app.id}
                        layoutId={app.id}
                        onClick={() => setSelectedApp(app)}
                        className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/60 p-3.5 rounded-md cursor-pointer transition-all duration-200"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-mono">{app.id}</span>
                          <span className={`w-2 h-2 rounded-full ${
                            app.track === 'instructor' ? 'bg-rose-500 animate-pulse' : app.track.includes('Blockchain') ? 'bg-indigo-400' : 'bg-amber-400'
                          }`} title={app.track} />
                        </div>
                        <h4 className="font-bold text-sm text-white mt-1">{app.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{app.track}</p>
                        
                        <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {app.date}
                          </span>
                          <span className="text-lime-400 font-semibold flex items-center gap-0.5 hover:text-white transition-colors">
                            View <ArrowRight size={8} />
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Candidate Detail Modal */}
        <AnimatePresence>
          {selectedApp && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-950 border border-slate-800 rounded-lg max-w-2xl w-full p-6 relative shadow-2xl"
              >
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900 p-1.5 rounded-md border border-slate-800 transition-all"
                >
                  <X size={16} />
                </button>

                <div className="flex items-start gap-4">
                  {selectedApp.profile_image_url ? (
                    <img src={selectedApp.profile_image_url} alt="Profile" className="w-12 h-12 rounded-full border border-lime-400/20 object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400 font-bold text-lg">
                      {selectedApp.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                      {selectedApp.name}
                      <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono font-normal">{selectedApp.id}</span>
                    </h2>
                    <p className="text-slate-400 text-sm mt-0.5">{selectedApp.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t border-b border-slate-900 py-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">Academic Track</span>
                    <span className="text-white text-sm font-semibold">{selectedApp.track}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">Github Username</span>
                    <a href={`https://${selectedApp.github}`} target="_blank" rel="noreferrer" className="text-lime-400 hover:underline text-sm flex items-center gap-1">
                      {selectedApp.github}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">Education</span>
                    <span className="text-slate-300 text-sm">{selectedApp.education}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">Application Date</span>
                    <span className="text-slate-300 text-sm">{selectedApp.date}</span>
                  </div>
                  {selectedApp.resume_url && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">Resume/CV</span>
                      <a href={selectedApp.resume_url} target="_blank" rel="noreferrer" className="text-lime-400 hover:underline text-sm flex items-center gap-1">
                        <FileText size={14} /> Download PDF
                      </a>
                    </div>
                  )}
                  {selectedApp.portfolio_url && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">Portfolio</span>
                      <a href={selectedApp.portfolio_url} target="_blank" rel="noreferrer" className="text-lime-400 hover:underline text-sm flex items-center gap-1">
                        <FileText size={14} /> View Document
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">Statement of Intent</span>
                  <p className="text-slate-300 text-sm italic mt-1 bg-slate-900/40 border border-slate-900/80 p-3 rounded-md leading-relaxed">
                    "{selectedApp.statement}"
                  </p>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-900 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Current Phase:</span>
                    <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold text-lime-400">{selectedApp.status}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedApp.status === 'Submitted' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedApp.id, 'Under Review')}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3.5 py-2 rounded-md font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Eye size={14} /> Review Application
                        </button>
                      </>
                    )}
                    {selectedApp.status === 'Under Review' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(selectedApp.id, 'Approved')}
                          className="bg-lime-500 hover:bg-lime-400 text-slate-950 text-xs px-3.5 py-2 rounded-md font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Check size={14} /> Approve Applicant
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(selectedApp.id, 'Draft')}
                          className="bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-900/30 text-xs px-3.5 py-2 rounded-md font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Ban size={14} /> Reject / Draft
                        </button>
                      </>
                    )}
                    {selectedApp.status === 'Approved' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedApp.id, 'Enrolled')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3.5 py-2 rounded-md font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 size={14} /> {selectedApp.track === 'instructor' ? 'Finalize Onboarding' : 'Finalize Enrollment'}
                      </button>
                    )}
                    {selectedApp.status === 'Enrolled' && (
                      <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 bg-emerald-950/30 border border-emerald-900/30 px-3 py-1.5 rounded-md">
                        <CheckCircle2 size={14} /> {selectedApp.track === 'instructor' ? 'Complete & Active Instructor' : 'Complete & Active Student'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default Applications;
