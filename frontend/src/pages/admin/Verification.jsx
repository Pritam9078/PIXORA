import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Shield, CheckCircle, AlertTriangle, Eye, X, Check, Ban, 
  MapPin, Calendar, FileText, UserCheck, ShieldAlert, Award
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

import { supabase } from '../../lib/supabase';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const Verification = () => {
  const { data: dbVerifications, loading, refresh } = useSupabaseData('verification_registry', '*, profiles(full_name, email)');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Map DB schema to UI state
  const items = dbVerifications.map(v => ({
    id: v.id,
    name: v.profiles?.full_name || 'Unknown',
    email: v.profiles?.email || 'No Email',
    track: 'N/A', // Assuming track might come from application or course enrollment 
    country: 'Unknown',
    documentType: v.document_type || 'Unknown Document',
    docNumber: 'N/A',
    dob: 'N/A',
    status: v.status || 'Pending',
    docUrl: v.document_url || 'https://via.placeholder.com/600',
    rejectionReason: null
  }));

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('verification_registry')
        .update({ status: 'Approved', verified_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      toast.success(`Identity for ${id} has been officially verified!`);
      refresh();
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => ({ ...prev, status: 'Approved' }));
      }
    } catch (err) {
      toast.error(err.message || 'Error updating status');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Please specify a reason for rejection.');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('verification_registry')
        .update({ status: 'Rejected' }) // Note: our schema might need a rejection_reason column later
        .eq('id', selectedItem.id);
        
      if (error) throw error;
      
      toast.error(`Verification rejected for ${selectedItem.id}`);
      refresh();
      setSelectedItem(prev => ({ ...prev, status: 'Rejected', rejectionReason }));
      setShowRejectForm(false);
      setRejectionReason('');
    } catch (err) {
      toast.error(err.message || 'Error rejecting verification');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans flex items-center gap-3">
              <Shield className="text-lime-400 h-8 w-8" />
              KYC & ID Verification Engine
            </h1>
            <p className="text-slate-400 text-sm mt-1">Audit submitted student identification documents and verify enrollment credentials.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search candidate name or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-lime-400 focus:border-transparent w-64"
              />
            </div>
            
            <div className="flex bg-slate-950 border border-slate-800 rounded-md p-1">
              {['Pending', 'Approved', 'Rejected', 'All'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                    statusFilter === status 
                      ? 'bg-lime-500 text-slate-950 font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Queue & Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List queue */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-5 lg:col-span-1 space-y-4">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2">Verification Queue</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">No applications matching current filters.</div>
              ) : (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => { setSelectedItem(item); setShowRejectForm(false); }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 ${
                      selectedItem?.id === item.id 
                        ? 'bg-slate-900 border-lime-400' 
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">{item.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'Approved' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/40' :
                        item.status === 'Rejected' ? 'bg-red-950/50 text-red-400 border border-red-900/40' :
                        'bg-amber-950/50 text-amber-400 border border-amber-900/40'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white mt-2">{item.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.documentType}</p>
                    
                    <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                      <span>{item.country}</span>
                      <span className="text-lime-400 font-semibold flex items-center gap-1">
                        Verify Card <Eye size={10} />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Details & Side-by-Side Review */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-6 lg:col-span-2">
            {selectedItem ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between border-b border-slate-900 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400 font-bold">
                      {selectedItem.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">{selectedItem.name}</h3>
                      <p className="text-xs text-slate-400">{selectedItem.email}</p>
                    </div>
                  </div>

                  <span className="font-mono text-xs text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                    ID: {selectedItem.id}
                  </span>
                </div>

                {/* Side-by-Side Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Registry Details */}
                  <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-lg space-y-4">
                    <h4 className="font-bold text-xs text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck size={14} /> Registry Profile
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block">Full Name</span>
                        <span className="text-sm font-semibold text-white">{selectedItem.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block">Enrollment Track</span>
                        <span className="text-sm font-semibold text-slate-300">{selectedItem.track}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block">Country of Origin</span>
                        <span className="text-sm font-semibold text-slate-300 flex items-center gap-1">
                          <MapPin size={12} className="text-slate-500" />
                          {selectedItem.country}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block">Date of Birth</span>
                        <span className="text-sm font-semibold text-slate-300 flex items-center gap-1">
                          <Calendar size={12} className="text-slate-500" />
                          {selectedItem.dob}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Credential Document */}
                  <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-lg space-y-4">
                    <h4 className="font-bold text-xs text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Award size={14} /> Submitted Credential
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block">Document Type</span>
                        <span className="text-sm font-semibold text-white">{selectedItem.documentType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 block">Document Identification #</span>
                        <span className="text-sm font-mono font-semibold text-slate-300">{selectedItem.docNumber}</span>
                      </div>
                      
                      <div className="relative group overflow-hidden rounded border border-slate-800 h-32 bg-slate-950">
                        <img 
                          src={selectedItem.docUrl} 
                          alt="Submitted Document" 
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-slate-900 border border-slate-800 text-xs px-2.5 py-1.5 rounded text-white flex items-center gap-1">
                            <Eye size={12} /> Inspect Scan
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Action Banner */}
                {selectedItem.status === 'Rejected' && selectedItem.rejectionReason && (
                  <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-lg flex items-start gap-3">
                    <ShieldAlert className="text-red-400 h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-xs text-red-400 uppercase tracking-wider">Verification Rejected</h5>
                      <p className="text-slate-300 text-sm mt-1">{selectedItem.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {/* Status controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-900 pt-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">STATUS AUDIT:</span>
                    <span className={`px-3 py-1 text-xs rounded-full font-bold uppercase ${
                      selectedItem.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      selectedItem.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedItem.status}
                    </span>
                  </div>

                  {selectedItem.status === 'Pending' && !showRejectForm && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleApprove(selectedItem.id)}
                        className="bg-lime-500 hover:bg-lime-400 text-slate-950 text-xs px-4 py-2.5 rounded-md font-bold flex items-center gap-1.5 transition-all shadow-md shadow-lime-950/20"
                      >
                        <Check size={14} /> Approve KYC Identity
                      </button>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-red-400 border border-slate-800 text-xs px-4 py-2.5 rounded-md font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Ban size={14} /> Reject Document
                      </button>
                    </div>
                  )}
                </div>

                {/* Rejection Form Box */}
                {showRejectForm && (
                  <form onSubmit={handleRejectSubmit} className="bg-slate-900/80 border border-slate-800 p-5 rounded-lg space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="font-bold text-xs text-red-400 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle size={14} /> Specify Rejection Grounds
                      </h4>
                      <button type="button" onClick={() => setShowRejectForm(false)} className="text-slate-400 hover:text-white">
                        <X size={14} />
                      </button>
                    </div>

                    <div>
                      <textarea
                        rows="3"
                        placeholder="State reason (e.g. Blurry photo, mismatch in registration fields...)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(false)}
                        className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-500 text-white text-xs px-4 py-2 rounded font-semibold transition-all"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-24 text-slate-500 space-y-3">
                <Shield className="h-12 w-12 text-slate-700" />
                <p className="text-sm">Select an applicant from the queue to run registry identity audit.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default Verification;
