import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileEdit, Plus, Loader2, ClipboardList, 
  ChevronRight, X, Send, CheckCircle, 
  AlertCircle, Search, Filter, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EvaluationService } from '../../services/EvaluationService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const CornerAccents = () => (
  <>
    <div style={{ position: 'absolute', top: 0, left: 0, width: 18, height: 18, borderTop: '1px solid rgba(195,244,0,0.4)', borderLeft: '1px solid rgba(195,244,0,0.4)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderBottom: '1px solid rgba(195,244,0,0.15)', borderRight: '1px solid rgba(195,244,0,0.15)', pointerEvents: 'none' }} />
  </>
);

const cardStyle = {
  background: 'rgba(13, 14, 18, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.06)',
  position: 'relative',
};

const Assignments = () => {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmissionsLoading, setIsSubmissionsLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  
  // Grading form state
  const [gradingForm, setGradingForm] = useState({ submissionId: null, grade: '', feedback: '' });

  const loadAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await EvaluationService.getAssignmentsForInstructor();
      setAssignments(data);
    } catch (error) {
      console.error("Failed to load assignments:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Real-time listener for new submissions
  useEffect(() => {
    if (!profile?.id) return;
    const channel = EvaluationService.subscribeToSubmissions(() => {
      loadAssignments();
      if (selectedAssignment) loadSubmissions(selectedAssignment.id);
    });
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, selectedAssignment, loadAssignments]);

  const loadSubmissions = async (assignmentId) => {
    setIsSubmissionsLoading(true);
    try {
      const data = await EvaluationService.getSubmissionsForAssignment(assignmentId);
      setSubmissions(data);
    } catch (error) {
      console.error("Failed to load submissions:", error);
    } finally {
      setIsSubmissionsLoading(false);
    }
  };

  const handleSelectAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    loadSubmissions(assignment.id);
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!gradingForm.submissionId || !gradingForm.grade) return;
    
    setIsGrading(true);
    try {
      await EvaluationService.gradeSubmission(
        gradingForm.submissionId, 
        parseInt(gradingForm.grade), 
        gradingForm.feedback
      );
      // Update local state
      setSubmissions(prev => prev.map(s => 
        s.id === gradingForm.submissionId 
          ? { ...s, grade: parseInt(gradingForm.grade), feedback: gradingForm.feedback, status: 'graded' }
          : s
      ));
      setGradingForm({ submissionId: null, grade: '', feedback: '' });
      loadAssignments(); // Refresh counts
    } catch (error) {
      alert("Grading failed: " + error.message);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36, height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div className="code-label" style={{ color: 'rgba(195,244,0,0.5)', marginBottom: 10 }}>// Grading Workflow Engine</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Assignment <span style={{ color: '#fb923c' }}>Desk</span>
          </h1>
          <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
            System ready. {assignments.filter(a => a.pendingCount > 0).length} tasks require immediate attention.
          </p>
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '16px 28px', gap: 10, background: '#fb923c', color: '#1a0800' }}>
          <Plus size={16} /> New Assignment
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedAssignment ? '400px 1fr' : '1fr', gap: 24, transition: 'all 0.3s ease' }}>
        
        {/* Left Column: Assignment List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isLoading ? (
            <div style={{ ...cardStyle, padding: 60, display: 'flex', justifyContent: 'center' }}>
              <Loader2 size={32} className="animate-spin" style={{ color: '#fb923c' }} />
            </div>
          ) : assignments.length > 0 ? (
            assignments.map((a) => (
              <motion.div
                key={a.id}
                layoutId={a.id}
                onClick={() => handleSelectAssignment(a)}
                style={{ 
                  ...cardStyle, 
                  padding: 24, 
                  cursor: 'pointer',
                  borderColor: selectedAssignment?.id === a.id ? '#fb923c' : 'rgba(255,255,255,0.06)',
                  background: selectedAssignment?.id === a.id ? 'rgba(251,146,60,0.05)' : 'rgba(13, 14, 18, 0.8)'
                }}
                whileHover={{ x: 4, borderColor: 'rgba(251,146,60,0.3)' }}
              >
                <CornerAccents />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="code-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{a.courseName}</span>
                  {a.pendingCount > 0 && (
                    <span style={{ fontSize: 9, padding: '2px 8px', background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)', fontWeight: 700 }}>
                      {a.pendingCount} PENDING
                    </span>
                  )}
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{a.title}</h3>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div>
                    <div className="code-label" style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>SUBMISSIONS</div>
                    <div style={{ color: '#fff', fontWeight: 600 }}>{a.submissionsCount}</div>
                  </div>
                  <div>
                    <div className="code-label" style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)' }}>DUE DATE</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{new Date(a.due_date).toLocaleDateString()}</div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ ...cardStyle, padding: 60, textAlign: 'center' }}>
              <ClipboardList size={48} style={{ color: 'rgba(255,255,255,0.1)', margin: '0 auto 20px' }} />
              <p className="code-label">No assignments found</p>
            </div>
          )}
        </div>

        {/* Right Column: Submission Details & Grading */}
        <AnimatePresence mode="wait">
          {selectedAssignment && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ ...cardStyle, padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              <CornerAccents />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: '#fff' }}>{selectedAssignment.title}</h2>
                    <span className="code-label" style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', fontSize: 10 }}>{selectedAssignment.assignment_type}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8 }}>{selectedAssignment.instructions}</p>
                </div>
                <button 
                  onClick={() => setSelectedAssignment(null)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: 10, cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h4 className="code-label" style={{ color: '#fb923c' }}>// Submissions Matrix</h4>
                
                {isSubmissionsLoading ? (
                  <div style={{ padding: 40, textAlign: 'center' }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: '#fb923c' }} />
                  </div>
                ) : submissions.length > 0 ? (
                  submissions.map(sub => (
                    <div 
                      key={sub.id} 
                      style={{ 
                        padding: 20, 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 40, height: 40, background: 'rgba(251,146,60,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb923c' }}>
                          <User size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{sub.studentName}</div>
                          <div className="code-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{new Date(sub.submitted_at).toLocaleString()}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        {sub.grade !== null ? (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#4ade80', fontWeight: 800, fontSize: 18 }}>{sub.grade}<span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>/{selectedAssignment.max_points}</span></div>
                            <div className="code-label" style={{ fontSize: 8 }}>GRADED</div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setGradingForm({ submissionId: sub.id, grade: '', feedback: '' })}
                            style={{ 
                              background: '#fb923c', 
                              border: 'none', 
                              color: '#1a0800', 
                              padding: '8px 16px', 
                              fontFamily: "'Space Grotesk', monospace", 
                              fontSize: 10, 
                              fontWeight: 800,
                              cursor: 'pointer' 
                            }}
                          >
                            GRADE NOW
                          </button>
                        )}
                        <a href={sub.submission_url} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          <ChevronRight size={20} />
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.2)' }}>
                    No submissions received yet for this assignment.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grading Modal */}
      <AnimatePresence>
        {gradingForm.submissionId && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ ...cardStyle, width: '100%', maxWidth: 500, padding: 40 }}
            >
              <CornerAccents />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30 }}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: '#fff' }}>EVALUATE <span style={{ color: '#fb923c' }}>SUBMISSION</span></h3>
                <button onClick={() => setGradingForm({ submissionId: null, grade: '', feedback: '' })} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleGrade} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label className="code-label" style={{ color: 'rgba(255,255,255,0.4)' }}>SCORE (0 - {selectedAssignment?.max_points})</label>
                  <input 
                    type="number" 
                    required
                    max={selectedAssignment?.max_points}
                    value={gradingForm.grade}
                    onChange={e => setGradingForm(prev => ({ ...prev, grade: e.target.value }))}
                    className="input-field"
                    placeholder="Enter points..."
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label className="code-label" style={{ color: 'rgba(255,255,255,0.4)' }}>FEEDBACK / COMMENTS</label>
                  <textarea 
                    rows={4}
                    value={gradingForm.feedback}
                    onChange={e => setGradingForm(prev => ({ ...prev, feedback: e.target.value }))}
                    className="input-field"
                    placeholder="Provide constructive feedback..."
                    style={{ resize: 'none' }}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isGrading}
                  className="submit-btn" 
                  style={{ background: '#fb923c', color: '#1a0800', marginTop: 10 }}
                >
                  {isGrading ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />}
                  SUBMIT GRADE
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Assignments;
