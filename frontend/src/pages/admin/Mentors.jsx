import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion } from 'framer-motion';
import { 
  Search, Star, ShieldAlert, Award, Calendar, BookOpen, Clock, 
  ChevronRight, ShieldCheck, Mail, ArrowUpRight, HelpCircle, Check
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

import { supabase } from '../../lib/supabase';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const Mentors = () => {
  const { data: dbProfiles, loading, refresh } = useSupabaseData('profiles', '*, mentor_assignments(*)');
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState('All');

  // Filter profiles to only show mentors, and map them to UI state
  const mentors = dbProfiles
    .filter(p => p.role === 'mentor')
    .map(p => ({
      id: p.id,
      name: p.full_name || 'Unknown Mentor',
      email: p.email || 'N/A',
      rating: 5.0, // Replace with actual ratings table if available
      activeTickets: p.mentor_assignments ? p.mentor_assignments.length : 0,
      totalHours: 0,
      track: 'General', // Would be derived from cohorts/specialization
      cohorts: [], // Would fetch joined cohorts
      status: 'Active', // Needs a status field on profiles
      image: p.avatar_url || 'https://via.placeholder.com/150'
    }));

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) || mentor.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrack = trackFilter === 'All' || mentor.track === trackFilter;
    return matchesSearch && matchesTrack;
  });

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      // In a real scenario, we might update a 'status' or 'is_active' field on the mentor's profile.
      toast.success(`Mentor ${id} status updated to ${newStatus} (Simulated)`);
      // refresh();
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  const totalTickets = mentors.reduce((acc, m) => acc + m.activeTickets, 0);
  const totalHours = mentors.reduce((acc, m) => acc + m.totalHours, 0);

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans flex items-center gap-3">
              <Award className="text-lime-400 h-8 w-8" />
              Mentor Directory & Metrics
            </h1>
            <p className="text-slate-400 text-sm mt-1">Audit active rosters, review community service ratings, and track live support allocations.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search mentor database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-lime-400 w-64"
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
            </select>
          </div>
        </div>

        {/* Roster Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Total Active Mentors</span>
              <span className="text-3xl font-black text-white">{mentors.filter(m=>m.status==='Active').length}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Instructors providing cohort support.</span>
            </div>
            <div className="p-3 bg-lime-400/10 border border-lime-400/20 text-lime-400 rounded-lg">
              <ShieldCheck size={24} />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Active Student Help Tickets</span>
              <span className="text-3xl font-black text-white">{totalTickets}</span>
              <span className="text-[10px] text-slate-400 block mt-1">1-on-1 coaching requests pending.</span>
            </div>
            <div className="p-3 bg-indigo-400/10 border border-indigo-400/20 text-indigo-400 rounded-lg">
              <HelpCircle size={24} />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Coaching Hours Audited</span>
              <span className="text-3xl font-black text-white">{totalHours} Hrs</span>
              <span className="text-[10px] text-slate-400 block mt-1">Accumulated across all sessions.</span>
            </div>
            <div className="p-3 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-lg">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              No mentors found.
            </div>
          ) : (
            filteredMentors.map(mentor => (
            <div key={mentor.id} className="bg-slate-950/60 border border-slate-900 rounded-lg p-6 flex flex-col md:flex-row gap-5 hover:border-slate-800 transition-all">
              {/* Photo & Roster ID */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <img src={mentor.image} alt={mentor.name} className="w-20 h-20 rounded-full object-cover border border-slate-800" />
                  <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                    mentor.status === 'Active' ? 'bg-emerald-400' : 'bg-slate-500'
                  }`} />
                </div>
                <span className="font-mono text-[9px] text-slate-500 bg-slate-900 border border-slate-850 px-2 py-0.5 rounded">{mentor.id}</span>
              </div>

              {/* Roster Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-white font-sans">{mentor.name}</h3>
                    <span className="text-xs text-lime-400 flex items-center gap-1">
                      <Mail size={12} className="text-slate-500" />
                      {mentor.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 text-sm font-bold bg-amber-950/30 border border-amber-900/30 px-2 py-0.5 rounded">
                    <Star size={14} className="fill-amber-400" />
                    {mentor.rating.toFixed(1)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-b border-slate-900 py-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Class Track</span>
                    <span className="text-slate-300 font-semibold truncate block mt-0.5">{mentor.track}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Active Tickets</span>
                    <span className="text-slate-300 font-semibold block mt-0.5">{mentor.activeTickets} Students</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Coaching Hours</span>
                    <span className="text-slate-300 font-semibold block mt-0.5">{mentor.totalHours} Hours</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status State</span>
                    <span className={`font-semibold block mt-0.5 ${mentor.status === 'Active' ? 'text-emerald-400' : 'text-slate-400'}`}>{mentor.status}</span>
                  </div>
                </div>

                {/* Cohorts & Controls */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[10px] text-slate-500">
                    Cohorts: <span className="text-slate-300 font-medium">{mentor.cohorts.join(', ')}</span>
                  </div>

                  <div>
                    {mentor.status === 'Active' ? (
                      <button
                        onClick={() => handleUpdateStatus(mentor.id, 'Inactive')}
                        className="bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(mentor.id, 'Active')}
                        className="bg-lime-500 hover:bg-lime-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded transition-all"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )))}
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default Mentors;
