import React, { useState, useEffect } from 'react';
import { 
  FileText, Send, CheckCircle2, AlertCircle, 
  Loader2, Link, ExternalLink, Clock, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AssignmentService from '../../services/AssignmentService';
import { toast } from 'react-hot-toast';

const AssignmentViewer = ({ assignment, studentId, onComplete }) => {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [githubUrl, setGithubUrl] = useState('');

  useEffect(() => {
    fetchSubmission();
  }, [assignment.id]);

  const fetchSubmission = async () => {
    setLoading(true);
    try {
      const data = await AssignmentService.getStudentSubmission(studentId, assignment.id);
      setSubmission(data);
      if (data) {
        setContent(data.content || '');
        setGithubUrl(data.github_url || '');
      } else {
        setContent('');
        setGithubUrl('');
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await AssignmentService.submitAssignment(studentId, assignment.id, {
        content,
        github_url: githubUrl
      });
      toast.success('Objective Uploaded Successfully');
      await fetchSubmission();
      if (onComplete) onComplete();
    } catch (error) {
      toast.error('Sync Error: Failed to upload objective');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8 lg:p-12 space-y-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
            <FileText className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-black tracking-tight text-white uppercase italic">
              Objective: {assignment.title}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5 text-on-surface-variant/60 text-xs font-headline font-bold uppercase tracking-wider">
                <Clock size={14} />
                Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No Deadline'}
              </div>
              <div className="flex items-center gap-1.5 text-yellow-500 text-xs font-headline font-bold uppercase tracking-wider">
                <Trophy size={14} />
                Max Score: {assignment.max_score || 100}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Instructions */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-panel p-8 space-y-6">
            <h2 className="text-lg font-headline font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">
              Mission Parameters
            </h2>
            <div className="prose prose-invert max-w-none text-on-surface-variant/80 leading-relaxed font-sans text-sm">
              {assignment.instructions || "No instructions provided for this objective."}
            </div>
          </section>

          {/* Submission Form */}
          <section className="glass-panel p-8 space-y-6">
            <h2 className="text-lg font-headline font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">
              Synchronize Objective
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
                  Submission Content / Documentation
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your solution or paste code here..."
                  className="w-full bg-surface/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors min-h-[200px] font-mono"
                  disabled={submission?.status === 'graded'}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-headline font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
                  Repository URL (GitHub/GitLab)
                </label>
                <div className="relative">
                  <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full bg-surface/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                    disabled={submission?.status === 'graded'}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || submission?.status === 'graded'}
                className="btn-primary w-full !py-4 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(var(--st-color-glow-rgb),0.2)] disabled:opacity-50 disabled:grayscale"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                <span className="text-xs uppercase tracking-widest font-black">
                  {submission ? 'Resync Objective' : 'Submit Objective'}
                </span>
              </button>
            </form>
          </section>
        </div>

        {/* Status Sidebar */}
        <div className="space-y-6">
          <section className="glass-panel p-6 space-y-6 border-l-4 border-primary">
            <h3 className="text-sm font-headline font-black text-white uppercase tracking-widest">
              Status Report
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] font-headline font-bold text-on-surface-variant/60 uppercase">Current Phase</span>
                <span className={`text-[10px] font-headline font-black uppercase px-2 py-1 rounded-md ${
                  submission?.status === 'graded' ? 'bg-green-500/20 text-green-500' : 
                  submission ? 'bg-blue-500/20 text-blue-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {submission?.status || 'Awaiting Sync'}
                </span>
              </div>

              {submission?.status === 'graded' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-headline font-bold text-green-500 uppercase">Grade</span>
                      <span className="text-xl font-black text-white">{submission.grade.score}/{submission.grade.max_score}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-headline font-black text-on-surface-variant/40 uppercase">Instructor Feedback</span>
                      <p className="text-xs text-on-surface-variant/80 italic leading-relaxed">
                        "{submission.grade.feedback || 'Excellent execution, Cadet.'}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!submission && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3">
                  <AlertCircle className="text-primary shrink-0" size={18} />
                  <p className="text-xs text-on-surface-variant/60 leading-relaxed">
                    Cadet, this objective is critical for your training. Complete the parameters and synchronize your work.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="glass-panel p-6 space-y-4">
            <h3 className="text-sm font-headline font-black text-white uppercase tracking-widest">
              Resources
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                <span className="text-xs text-on-surface-variant/60 group-hover:text-white transition-colors">Project Starter Files</span>
                <ExternalLink size={14} className="text-on-surface-variant/40" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                <span className="text-xs text-on-surface-variant/60 group-hover:text-white transition-colors">API Documentation</span>
                <ExternalLink size={14} className="text-on-surface-variant/40" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AssignmentViewer;
