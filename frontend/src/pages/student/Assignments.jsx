import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, Filter, 
  Search, Terminal, Rocket, Upload,
  Loader2, X, Shield, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SubmissionService } from '../../services/SubmissionService';
import { toast } from 'react-hot-toast';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null); // ID of assignment being uploaded
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAssignments = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await SubmissionService.getAssignments(user.id);
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to synchronize mission protocols');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const handleFileUpload = async (assignmentId) => {
    if (!selectedFile || !user) return;
    
    try {
      setUploading(assignmentId);
      const result = await SubmissionService.submitAssignment(user.id, assignmentId, selectedFile);
      
      if (result.success) {
        toast.success('Mission data deployed successfully');
        await fetchAssignments(); // Refresh
        setSelectedFile(null);
      } else {
        toast.error(result.error || 'Deployment failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('System error during deployment');
    } finally {
      setUploading(null);
    }
  };

  const filteredAssignments = assignments.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[var(--st-color-primary)] animate-spin" />
        <p className="text-on-surface-variant/40 font-headline font-bold text-[10px] uppercase tracking-[0.2em]">Initializing Mission Parameters...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-white/5 text-[var(--st-color-primary)] font-headline font-bold text-[9px] uppercase tracking-[0.2em]">
            <Terminal size={14} />
            Mission Protocols
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white">Active <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_10px_var(--st-color-glow)]">Assignments</span></h1>
          <p className="text-on-surface-variant/60 font-medium">Execute mission parameters and upload source code for evaluation.</p>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--st-color-primary)] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search protocols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-card border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 transition-all placeholder:text-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-10">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="glass-panel p-8 rounded-[32px] border-white/5 flex flex-col lg:flex-row lg:items-center gap-8 group hover:border-[var(--st-color-primary)]/30 transition-all shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 circuit-bg opacity-[0.02] group-hover:opacity-[0.05] transition-opacity"></div>
               
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                 assignment.mySubmission?.grade ? 'bg-emerald-500/10 text-emerald-400' : 
                 assignment.mySubmission ? 'bg-blue-500/10 text-blue-400' : 
                 'bg-white/5 text-white/20'
               }`}>
                 <FileText size={32} />
               </div>
  
               <div className="flex-1 space-y-2">
                 <div className="flex items-center gap-3">
                   <h3 className="font-headline font-bold text-xl text-white tracking-tight">{assignment.title}</h3>
                   <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                     assignment.mySubmission ? 'bg-emerald-500 text-white' : 'bg-red-500/20 text-red-400'
                   }`}>
                     {assignment.mySubmission ? 'DEPLOYED' : 'PENDING'}
                   </span>
                 </div>
                 <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">
                   {assignment.course?.title || 'General Curriculum'}
                 </p>
               </div>
  
               <div className="flex flex-wrap items-center gap-8">
                 <div className="space-y-1">
                   <p className="text-[9px] font-headline font-black text-on-surface-variant/20 uppercase tracking-widest">Deadline</p>
                   <div className="flex items-center gap-2 text-white/60">
                     <Clock size={14} />
                     <span className="text-sm font-bold font-mono">{new Date(assignment.due_date).toLocaleDateString()}</span>
                   </div>
                 </div>
  
                 <div className="space-y-1">
                   <p className="text-[9px] font-headline font-black text-on-surface-variant/20 uppercase tracking-widest">Status</p>
                   <div className="flex items-center gap-2">
                     {assignment.mySubmission?.grade ? (
                       <span className="text-emerald-400 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                         <Shield size={14} /> GRADE: {assignment.mySubmission.grade}
                       </span>
                     ) : assignment.mySubmission ? (
                        <span className="text-blue-400 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                          <Clock size={14} /> EVALUATING
                        </span>
                     ) : (
                       <span className="text-red-400 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                         <AlertCircle size={14} /> INCOMPLETE
                       </span>
                     )}
                   </div>
                 </div>
  
                 <div className="space-y-1 min-w-[80px]">
                   <p className="text-[9px] font-headline font-black text-on-surface-variant/20 uppercase tracking-widest">Reward</p>
                   <span className="text-white font-headline font-black text-sm tracking-widest">{assignment.max_points} XP</span>
                 </div>
  
                 <div className="flex items-center gap-3 min-w-[200px] justify-end">
                   {!assignment.mySubmission ? (
                     <div className="flex items-center gap-3">
                        <label className="cursor-pointer">
                          <input 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                          />
                          <div className={`p-3 rounded-xl border border-dashed transition-all ${
                            selectedFile ? 'border-[var(--st-color-primary)] bg-[var(--st-color-primary)]/10 text-white shadow-[0_0_10px_rgba(var(--st-color-primary-rgb),0.2)]' : 'border-white/10 text-white/20 hover:border-white/30'
                          }`}>
                            <Upload size={20} />
                          </div>
                        </label>
                        <button 
                          onClick={() => handleFileUpload(assignment.id)}
                          disabled={!selectedFile || uploading !== null}
                          className="btn-primary py-3 px-6 shadow-[0_0_15px_var(--st-color-glow)] disabled:opacity-50 disabled:shadow-none min-w-[100px]"
                        >
                          {uploading === assignment.id ? <Loader2 size={18} className="animate-spin" /> : 'Deploy'}
                        </button>
                     </div>
                   ) : (
                     <a 
                       href={assignment.mySubmission.submission_url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="btn-outline py-3 px-6 flex items-center gap-2 group/link"
                     >
                       <span>View Code</span>
                       <ExternalLink size={14} className="opacity-40 group-hover/link:opacity-100 transition-opacity" />
                     </a>
                   )}
                 </div>
               </div>
            </div>
          ))
        ) : (
          <div className="glass-panel p-20 rounded-[40px] border-white/5 text-center space-y-6">
            <Rocket size={48} className="mx-auto text-on-surface-variant/20" />
            <p className="text-on-surface-variant/40 font-headline font-bold text-sm uppercase tracking-widest">No mission protocols detected in neural archives.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
