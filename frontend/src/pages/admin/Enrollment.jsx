import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Layers, Calendar, Plus, PlusCircle, Check, X, ShieldAlert,
  ArrowUpRight, BarChart2, BookOpen, Clock, Settings, Search
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

import { supabase } from '../../lib/supabase';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const Enrollment = () => {
  const { data: dbCohorts, loading, refresh } = useSupabaseData('cohorts');
  
  // Transform DB cohorts to UI state
  const cohorts = dbCohorts.map(c => ({
    id: c.id,
    name: c.name || 'Unnamed',
    track: c.status || 'Active', // Fallback
    startDate: c.start_date || 'N/A',
    limit: 50, // default if not in db
    filled: 0, // could fetch from enrollments
    status: c.status || 'Draft',
    instructors: [] // Need to fetch relations later
  }));
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [newCohort, setNewCohort] = useState({
    id: '',
    name: '',
    track: 'Blockchain & Web3 Development',
    startDate: '',
    limit: 30,
    status: 'Draft',
    instructors: ''
  });

  const handleCreateCohort = async (e) => {
    e.preventDefault();
    if (!newCohort.name || !newCohort.startDate) {
      toast.error('Please fill in all required cohort parameters.');
      return;
    }

    try {
      const { error } = await supabase.from('cohorts').insert([
        {
          name: newCohort.name,
          start_date: newCohort.startDate,
          status: newCohort.status || 'Draft',
        }
      ]);
      
      if (error) throw error;

      setShowAddForm(false);
      setNewCohort({
        id: '',
        name: '',
        track: 'Blockchain & Web3 Development',
        startDate: '',
        limit: 30,
        status: 'Draft',
        instructors: ''
      });
      toast.success(`Cohort ${newCohort.name} has been successfully deployed!`);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Error creating cohort');
    }
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const { error } = await supabase.from('cohorts').update({ status: nextStatus }).eq('id', id);
      if (error) throw error;
      toast.success(`Cohort state shifted to ${nextStatus}`);
      refresh();
    } catch (err) {
      toast.error(err.message || 'Error updating status');
    }
  };

  const filteredCohorts = cohorts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSeats = cohorts.reduce((acc, c) => acc + c.limit, 0);
  const filledSeats = cohorts.reduce((acc, c) => acc + c.filled, 0);
  const percentFilled = totalSeats > 0 ? Math.round((filledSeats / totalSeats) * 100) : 0;

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans flex items-center gap-3">
              <Layers className="text-lime-400 h-8 w-8" />
              Cohort Enrollment Management
            </h1>
            <p className="text-slate-400 text-sm mt-1">Configure active batches, regulate student limit guidelines, and allocate class cohorts.</p>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="bg-lime-500 hover:bg-lime-400 text-slate-950 px-4 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 self-start md:self-auto transition-all"
          >
            <PlusCircle size={15} /> Deploy New Cohort
          </button>
        </div>

        {/* Overview KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Total Active Cohorts</span>
              <span className="text-3xl font-black text-white">{cohorts.filter(c=>c.status==='Active').length}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Vetted classes actively running.</span>
            </div>
            <div className="p-3 bg-lime-400/10 border border-lime-400/20 text-lime-400 rounded-lg">
              <BookOpen size={24} />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Seat Allocation Audit</span>
              <span className="text-3xl font-black text-white">{filledSeats} / {totalSeats}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Global program fill rate at {percentFilled}%.</span>
            </div>
            <div className="p-3 bg-indigo-400/10 border border-indigo-400/20 text-indigo-400 rounded-lg">
              <Users size={24} />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Batches in Draft</span>
              <span className="text-3xl font-black text-white">{cohorts.filter(c=>c.status==='Draft').length}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Configured batches waiting for launch gates.</span>
            </div>
            <div className="p-3 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* Cohort Search and Listing */}
        <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-4">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Active Batches & Deployments</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search cohort code or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-transparent w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
              </div>
            ) : filteredCohorts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                No cohorts found matching your criteria.
              </div>
            ) : (
              filteredCohorts.map(cohort => (
              <div key={cohort.id} className="bg-slate-900/40 border border-slate-900 p-5 rounded-lg space-y-4 hover:border-slate-800 transition-all">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-lime-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded uppercase">{cohort.id}</span>
                    <h4 className="font-bold text-base text-white mt-1">{cohort.name}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    cohort.status === 'Active' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' :
                    'bg-slate-950/50 text-slate-400 border border-slate-800/30'
                  }`}>
                    {cohort.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-900/60 py-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Class Track</span>
                    <span className="text-slate-300 font-semibold truncate block mt-0.5">{cohort.track}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Class Begins</span>
                    <span className="text-slate-300 font-semibold flex items-center gap-1 mt-0.5">
                      <Calendar size={12} className="text-slate-500" />
                      {cohort.startDate}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Cohort Limit Fill Rate:</span>
                    <span className="text-slate-300 font-semibold">{cohort.filled} / {cohort.limit} Filled</span>
                  </div>
                  <div className="w-full bg-slate-950 border border-slate-900 h-2 rounded overflow-hidden">
                    <div 
                      className="bg-lime-400 h-full rounded" 
                      style={{ width: `${(cohort.filled / cohort.limit) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900/40 text-xs">
                  <div className="text-[11px] text-slate-500">
                    Instructors: <span className="text-slate-300 font-medium">{cohort.instructors.join(', ')}</span>
                  </div>

                  <div className="flex gap-2">
                    {cohort.status === 'Draft' ? (
                      <button
                        onClick={() => handleUpdateStatus(cohort.id, 'Active')}
                        className="bg-lime-500/10 hover:bg-lime-500 hover:text-slate-950 border border-lime-500/20 text-lime-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all"
                      >
                        Activate Batch
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(cohort.id, 'Draft')}
                        className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all"
                      >
                        Move to Draft
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>

        {/* Deploy New Cohort Modal */}
        <AnimatePresence>
          {showAddForm && (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-950 border border-slate-800 rounded-lg max-w-lg w-full p-6 relative shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="font-extrabold text-lg text-white font-sans">Deploy Custom Class Cohort</h3>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="text-slate-400 hover:text-white bg-slate-900 border border-slate-800 p-1.5 rounded-md transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleCreateCohort} className="space-y-4 text-xs text-slate-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-semibold text-slate-500 block">Cohort Batch Code *</label>
                      <input
                        type="text"
                        placeholder="e.g. COH-BC-05"
                        value={newCohort.id}
                        onChange={(e) => setNewCohort(prev => ({ ...prev, id: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-850 rounded p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-lime-400"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-semibold text-slate-500 block">Cohort Limit Seat *</label>
                      <input
                        type="number"
                        value={newCohort.limit}
                        onChange={(e) => setNewCohort(prev => ({ ...prev, limit: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-850 rounded p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-lime-400"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-500 block">Cohort Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ethereum Dapp Core Pioneers"
                      value={newCohort.name}
                      onChange={(e) => setNewCohort(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-850 rounded p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-lime-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-semibold text-slate-500 block">Ecosystem Track</label>
                      <select
                        value={newCohort.track}
                        onChange={(e) => setNewCohort(prev => ({ ...prev, track: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-850 rounded p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-lime-400"
                      >
                        <option value="Blockchain & Web3 Development">Blockchain / Web3 Development</option>
                        <option value="Game Development & Metaverse">Game Development & Metaverse</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-semibold text-slate-500 block">Cohort Start Date *</label>
                      <input
                        type="date"
                        value={newCohort.startDate}
                        onChange={(e) => setNewCohort(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-850 rounded p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-lime-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-slate-500 block">Allocated Instructors (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Gavin Wood, Tim Sweeney"
                      value={newCohort.instructors}
                      onChange={(e) => setNewCohort(prev => ({ ...prev, instructors: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-850 rounded p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-lime-400"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white"
                    >
                      Dismiss Form
                    </button>
                    <button
                      type="submit"
                      className="bg-lime-500 hover:bg-lime-400 text-slate-950 font-bold uppercase tracking-wider px-5 py-2.5 rounded transition-all"
                    >
                      Deploy Cohort
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default Enrollment;
