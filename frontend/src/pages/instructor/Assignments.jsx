import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileEdit, Plus, Loader2, ClipboardList, 
  ChevronRight, X, Send, CheckCircle, 
  AlertCircle, Search, Filter, User,
  Award, ShieldCheck, CheckSquare, Square,
  Cpu, Sparkles, ExternalLink, RefreshCw,
  BarChart2, Star, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EvaluationService } from '../../services/EvaluationService';
import { InstructorService } from '../../services/InstructorService';
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
  const [gradingForm, setGradingForm] = useState({
    submissionId: null,
    grade: '',
    feedback: '',
    techScore: '80',
    softSkillsScore: '80',
    syncToEvaluation: true,
    evaluationType: 'gate',
    criteriaChecked: {
      correctness: false,
      architecture: false,
      styling: false,
      docs: false,
      performance: false,
    }
  });

  const GATE_CRITERIA = [
    { key: 'correctness', label: 'Functional Correctness', desc: 'Code compiles, runs, and implements all requested features perfectly.' },
    { key: 'architecture', label: 'Architectural Cleanliness', desc: 'Proper modular structure, component separation, clean state management.' },
    { key: 'styling', label: 'Premium Styling & Design', desc: 'Responsive CSS layout, cyberpunk color scheme, smooth micro-animations.' },
    { key: 'docs', label: 'Git & Documentation Best Practices', desc: 'Descriptive commits, meaningful repository README, clear comments.' },
    { key: 'performance', label: 'Performance & Optimization', desc: 'Fast rendering, no memory leaks, efficient Supabase/API calls.' }
  ];


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
      // 1. Update the student submission
      await EvaluationService.gradeSubmission(
        gradingForm.submissionId, 
        parseInt(gradingForm.grade), 
        gradingForm.feedback
      );

      // 2. Direct Sync to Academic Telemetry
      if (gradingForm.syncToEvaluation) {
        const sub = submissions.find(s => s.id === gradingForm.submissionId);
        if (sub?.student_id) {
          try {
            // A. Fetch active cohort_id from cohort_progress for this student
            const { data: cohortData, error: cohortErr } = await supabase
              .from('cohort_progress')
              .select('cohort_id')
              .eq('student_id', sub.student_id)
              .maybeSingle();

            if (cohortErr) console.warn('Could not resolve cohort ID for academic sync:', cohortErr.message);
            const cohortId = cohortData?.cohort_id || null;

            // B. Add evaluation report
            const technicalScore = gradingForm.techScore ? parseInt(gradingForm.techScore) : 80;
            const softSkillsScore = gradingForm.softSkillsScore ? parseInt(gradingForm.softSkillsScore) : 80;
            const evaluatorId = profile?.id;

            if (evaluatorId) {
              await InstructorService.addEvaluationReport(
                evaluatorId,
                sub.student_id,
                cohortId,
                gradingForm.evaluationType,
                technicalScore,
                softSkillsScore,
                `[Assignment Review: "${selectedAssignment?.title || 'Deliverable'}"] - ${gradingForm.feedback}`
              );
            }
          } catch (academicErr) {
            console.error('Academic Evaluation sync failed, but assignment grade was saved:', academicErr.message);
          }
        }
      }

      // Update local state
      setSubmissions(prev => prev.map(s => 
        s.id === gradingForm.submissionId 
          ? { ...s, grade: parseInt(gradingForm.grade), feedback: gradingForm.feedback, status: 'graded' }
          : s
      ));
      
      // Reset expanded form state
      setGradingForm({ 
        submissionId: null, 
        grade: '', 
        feedback: '',
        techScore: '80',
        softSkillsScore: '80',
        syncToEvaluation: true,
        evaluationType: 'gate',
        criteriaChecked: {
          correctness: false,
          architecture: false,
          styling: false,
          docs: false,
          performance: false,
        }
      });
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
                            onClick={() => setGradingForm({ 
                              submissionId: sub.id, 
                              grade: '', 
                              feedback: '',
                              techScore: '80',
                              softSkillsScore: '80',
                              syncToEvaluation: true,
                              evaluationType: 'gate',
                              criteriaChecked: {
                                correctness: false,
                                architecture: false,
                                styling: false,
                                docs: false,
                                performance: false,
                              }
                            })}
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
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            {(() => {
              const sub = submissions.find(s => s.id === gradingForm.submissionId);
              return (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  style={{ 
                    ...cardStyle, 
                    width: '100%', 
                    maxWidth: 950, 
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 16,
                    border: '1px solid rgba(251, 146, 60, 0.15)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(251, 146, 60, 0.03)',
                    overflow: 'hidden'
                  }}
                >
                  <CornerAccents />
                  
                  {/* Modal Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px', background: 'rgba(251, 146, 60, 0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ padding: 8, borderRadius: 8, background: 'rgba(251,146,60,0.1)', color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Cpu size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                          GATE EVALUATION <span style={{ color: '#fb923c' }}>TERMINAL</span>
                        </h3>
                        <span className="code-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2, display: 'inline-block' }}>
                          SECURE ENROLLMENT SYSTEM // INTERACTION ID: {sub?.id?.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setGradingForm(prev => ({ ...prev, submissionId: null }))} 
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Modal Body: Two Columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', flex: 1, overflow: 'hidden' }}>
                    
                    {/* Left Column: Submission Review */}
                    <div style={{ padding: 32, borderRight: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24, background: 'rgba(13, 14, 18, 0.4)' }}>
                      
                      {/* Student Info Profile Card */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: 20, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
                        {sub?.studentAvatar ? (
                          <img src={sub.studentAvatar} alt={sub.studentName} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(251,146,60,0.3)' }} />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(251,146,60,0.1)', color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(251,146,60,0.2)' }}>
                            <User size={24} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{sub?.studentName}</div>
                          <div className="code-label" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{sub?.studentEmail || 'student@pixora.edu'}</div>
                        </div>
                      </div>

                      {/* Assignment details summary card */}
                      <div>
                        <div className="code-label" style={{ color: '#fb923c', marginBottom: 12 }}>// ASSIGNMENT CONTEXT</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 16, borderRadius: 8 }}>
                          <div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'Space Grotesk', monospace" }}>TITLE</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginTop: 2 }}>{selectedAssignment?.title}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'Space Grotesk', monospace" }}>MAX ALLOWABLE POINTS</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#4ade80', marginTop: 2 }}>{selectedAssignment?.max_points} PTS</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'Space Grotesk', monospace" }}>INSTRUCTIONS</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, lineHeight: 1.4 }}>{selectedAssignment?.instructions}</div>
                          </div>
                        </div>
                      </div>

                      {/* Deliverable link block */}
                      <div>
                        <div className="code-label" style={{ color: '#fb923c', marginBottom: 12 }}>// SUBMITTED ASSET</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>
                            The student has submitted the following active asset or code URL for technical review. Launch review before final marking.
                          </div>
                          {sub?.submission_url ? (
                            <a 
                              href={sub.submission_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: 10, 
                                background: 'rgba(195, 244, 0, 0.1)', 
                                border: '1px solid rgba(195, 244, 0, 0.3)', 
                                color: '#c3f400', 
                                padding: '14px 20px', 
                                borderRadius: 8, 
                                textDecoration: 'none', 
                                fontWeight: 700, 
                                fontFamily: "'Space Grotesk', sans-serif", 
                                fontSize: 13,
                                transition: 'all 0.2s',
                                letterSpacing: '0.03em'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(195, 244, 0, 0.18)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(195, 244, 0, 0.1)'; }}
                            >
                              <ExternalLink size={16} />
                              LAUNCH CODE REVIEW
                            </a>
                          ) : (
                            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#f87171', padding: 14, borderRadius: 8, fontSize: 12, textAlign: 'center' }}>
                              No active URL link submitted. Check database entries.
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Right Column: GATE Evaluation Suite */}
                    <form onSubmit={handleGrade} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                      <div style={{ padding: 32, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                        
                        {/* Criteria Validation Checklist */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span className="code-label" style={{ color: '#fb923c' }}>// GATE CRITERIA VALIDATION</span>
                            <span style={{ fontSize: 9, padding: '2px 6px', background: 'rgba(195,244,0,0.1)', color: '#c3f400', border: '1px solid rgba(195,244,0,0.2)', fontWeight: 700 }}>
                              {Object.values(gradingForm.criteriaChecked).filter(Boolean).length}/{GATE_CRITERIA.length} CRITERIA PASSED
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {GATE_CRITERIA.map(criterion => {
                              const isChecked = gradingForm.criteriaChecked[criterion.key];
                              return (
                                <div 
                                  key={criterion.key}
                                  onClick={() => setGradingForm(prev => {
                                    const updatedChecked = {
                                      ...prev.criteriaChecked,
                                      [criterion.key]: !prev.criteriaChecked[criterion.key]
                                    };
                                    
                                    // Dynamic suggested scoring:
                                    // Each check is worth 20 points of technical score!
                                    const checkedCount = Object.values(updatedChecked).filter(Boolean).length;
                                    const suggestedTech = checkedCount * 20;
                                    // Suggest equivalent overall grade
                                    const maxPts = selectedAssignment?.max_points || 100;
                                    const suggestedGrade = Math.round((suggestedTech / 100) * maxPts);

                                    return {
                                      ...prev,
                                      criteriaChecked: updatedChecked,
                                      // Pre-populate scoring fields if user hasn't edited them yet
                                      techScore: prev.techScore === '' || prev.techScore == (Object.values(prev.criteriaChecked).filter(Boolean).length * 20) ? suggestedTech.toString() : prev.techScore,
                                      grade: prev.grade === '' || prev.grade == Math.round(((Object.values(prev.criteriaChecked).filter(Boolean).length * 20) / 100) * maxPts) ? suggestedGrade.toString() : prev.grade
                                    };
                                  })}
                                  style={{ 
                                    padding: '12px 16px', 
                                    background: isChecked ? 'rgba(195,244,0,0.03)' : 'rgba(255,255,255,0.01)', 
                                    border: isChecked ? '1px solid rgba(195,244,0,0.25)' : '1px solid rgba(255,255,255,0.04)', 
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 12,
                                    transition: 'all 0.15s'
                                  }}
                                >
                                  <div style={{ color: isChecked ? '#c3f400' : 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                                    {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: isChecked ? '#fff' : 'rgba(255,255,255,0.7)', transition: 'color 0.15s' }}>{criterion.label}</div>
                                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2, lineHeight: 1.3 }}>{criterion.desc}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Double Dimension Score Matrix */}
                        <div>
                          <span className="code-label" style={{ color: '#fb923c', display: 'block', marginBottom: 12 }}>// DOUBLE-DIMENSION ACADEMIC MATRIX</span>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <label className="code-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>TECHNICAL CODE SCORE (0-100)</label>
                              <input 
                                type="number" 
                                min="0"
                                max="100"
                                required
                                value={gradingForm.techScore}
                                onChange={e => setGradingForm(prev => {
                                  const val = e.target.value;
                                  // Auto calculate proposed final assignment score
                                  const maxPts = selectedAssignment?.max_points || 100;
                                  const currentSoft = parseInt(prev.softSkillsScore) || 80;
                                  const calculatedNormalized = Math.round((((parseInt(val) || 0) + currentSoft) / 200) * maxPts);
                                  return {
                                    ...prev,
                                    techScore: val,
                                    grade: prev.grade === '' || prev.grade == Math.round(((parseInt(prev.techScore || 0) + currentSoft) / 200) * maxPts) ? calculatedNormalized.toString() : prev.grade
                                  };
                                })}
                                className="input-field"
                                placeholder="e.g. 90"
                                style={{ fontFamily: "'Space Grotesk', monospace" }}
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <label className="code-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>SOFT / PRESENTATION SCORE (0-100)</label>
                              <input 
                                type="number" 
                                min="0"
                                max="100"
                                required
                                value={gradingForm.softSkillsScore}
                                onChange={e => setGradingForm(prev => {
                                  const val = e.target.value;
                                  // Auto calculate proposed final assignment score
                                  const maxPts = selectedAssignment?.max_points || 100;
                                  const currentTech = parseInt(prev.techScore) || 80;
                                  const calculatedNormalized = Math.round((((currentTech + (parseInt(val) || 0)) / 200) * maxPts));
                                  return {
                                    ...prev,
                                    softSkillsScore: val,
                                    grade: prev.grade === '' || prev.grade == Math.round(((currentTech + parseInt(prev.softSkillsScore || 0)) / 200) * maxPts) ? calculatedNormalized.toString() : prev.grade
                                  };
                                })}
                                className="input-field"
                                placeholder="e.g. 85"
                                style={{ fontFamily: "'Space Grotesk', monospace" }}
                              />
                            </div>
                          </div>
                          
                          {/* Normalized Helper Tooltip */}
                          <div style={{ display: 'flex', alignItems: 'center', justifySpace: 'space-between', justifyContent: 'space-between', marginTop: 12, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: 8 }}>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Suggested Assignment Score:</span>
                            <button 
                              type="button"
                              onClick={() => {
                                const maxPts = selectedAssignment?.max_points || 100;
                                const currentTech = parseInt(gradingForm.techScore) || 80;
                                const currentSoft = parseInt(gradingForm.softSkillsScore) || 80;
                                const calculatedNormalized = Math.round(((currentTech + currentSoft) / 200) * maxPts);
                                setGradingForm(prev => ({ ...prev, grade: calculatedNormalized.toString() }));
                              }}
                              style={{ background: 'none', border: 'none', color: '#c3f400', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Grotesk', monospace", display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              <RefreshCw size={10} />
                              APPLY {Math.round((((parseInt(gradingForm.techScore) || 80) + (parseInt(gradingForm.softSkillsScore) || 80)) / 200) * (selectedAssignment?.max_points || 100))} PTS
                            </button>
                          </div>
                        </div>

                        {/* Main Desk Grade Input */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label className="code-label" style={{ color: 'rgba(255,255,255,0.4)' }}>FINAL SCORE (0 - {selectedAssignment?.max_points})</label>
                            <input 
                              type="number" 
                              required
                              max={selectedAssignment?.max_points}
                              value={gradingForm.grade}
                              onChange={e => setGradingForm(prev => ({ ...prev, grade: e.target.value }))}
                              className="input-field"
                              placeholder="Enter points..."
                              style={{ fontFamily: "'Space Grotesk', monospace" }}
                            />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label className="code-label" style={{ color: 'rgba(255,255,255,0.4)' }}>EVAL TYPE FOR SYNC</label>
                            <select
                              disabled={!gradingForm.syncToEvaluation}
                              value={gradingForm.evaluationType}
                              onChange={e => setGradingForm(prev => ({ ...prev, evaluationType: e.target.value }))}
                              className="input-field"
                              style={{ 
                                background: '#0d0e12', 
                                color: '#fff', 
                                border: '1px solid rgba(255,255,255,0.08)',
                                fontFamily: "'Space Grotesk', sans-serif"
                              }}
                            >
                              <option value="gate">GATE MILESTONE</option>
                              <option value="project">CAPSTONE PROJECT</option>
                              <option value="midterm">MIDTERM EXAM</option>
                              <option value="final">FINAL COMPREHENSIVE</option>
                            </select>
                          </div>
                        </div>

                        {/* Sync to Database Evaluation Report Checkbox */}
                        <div 
                          onClick={() => setGradingForm(prev => ({ ...prev, syncToEvaluation: !prev.syncToEvaluation }))}
                          style={{ 
                            padding: '16px 20px', 
                            background: gradingForm.syncToEvaluation ? 'rgba(251,146,60,0.03)' : 'rgba(255,255,255,0.01)', 
                            border: gradingForm.syncToEvaluation ? '1px solid rgba(251,146,60,0.3)' : '1px solid rgba(255,255,255,0.04)', 
                            borderRadius: 10,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ color: gradingForm.syncToEvaluation ? '#fb923c' : 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center' }}>
                            {gradingForm.syncToEvaluation ? <CheckSquare size={18} /> : <Square size={18} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: gradingForm.syncToEvaluation ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                              Sync Session to Academic Evaluation Telemetry
                            </div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                              Logs double-dimension scores in the cohort milestone database for realtime analytics.
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', color: gradingForm.syncToEvaluation ? '#fb923c' : 'rgba(255,255,255,0.2)' }}>
                            <ShieldCheck size={18} />
                          </div>
                        </div>

                        {/* Feedback Text Area */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label className="code-label" style={{ color: 'rgba(255,255,255,0.4)' }}>FEEDBACK & COACHING NOTES</label>
                          <textarea 
                            rows={3}
                            value={gradingForm.feedback}
                            onChange={e => setGradingForm(prev => ({ ...prev, feedback: e.target.value }))}
                            className="input-field"
                            placeholder="Provide descriptive, actionable engineering feedback..."
                            style={{ resize: 'none', fontSize: 12, lineHeight: 1.4 }}
                          />
                        </div>

                      </div>

                      {/* Footer Grading Trigger */}
                      <div style={{ padding: '24px 32px', background: 'rgba(13,14,18,0.85)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                        <button 
                          type="button"
                          onClick={() => setGradingForm(prev => ({ ...prev, submissionId: null }))}
                          className="submit-btn" 
                          style={{ width: 'auto', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.06)', padding: '12px 24px' }}
                        >
                          CANCEL
                        </button>
                        <button 
                          type="submit" 
                          disabled={isGrading}
                          className="submit-btn" 
                          style={{ width: 'auto', background: '#fb923c', color: '#1a0800', padding: '12px 28px', gap: 10 }}
                        >
                          {isGrading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                          SUBMIT FINAL MARKING
                        </button>
                      </div>

                    </form>
                  </div>
                </motion.div>
              );
            })()}
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
