import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Mail,
  MessageSquare, GraduationCap, Target,
  ChevronRight, AlertCircle, Loader2, RefreshCw,
  CheckCircle2, Clock, TrendingUp, X, Star,
  Award, GitCommit, Briefcase, Plus, Send, Check
} from 'lucide-react';
import { InstructorService } from '../../services/InstructorService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

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

const statusConfig = {
  active:     { bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)',  text: '#4ade80',  icon: TrendingUp },
  struggling: { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',   text: '#ef4444',  icon: AlertCircle },
  completed:  { bg: 'rgba(195,244,0,0.08)',   border: 'rgba(195,244,0,0.25)',   text: '#c3f400',  icon: CheckCircle2 },
};

const Students = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [liveUpdate, setLiveUpdate] = useState(false);

  // Mentor Feedback Form state
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, text: '' });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Academic Evaluation Form state
  const [evalForm, setEvalForm] = useState({ type: 'gate', techScore: 80, softScore: 80, remarks: '' });
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await InstructorService.getStudents();
      setStudents(data);
      // Update selectedStudent if it is currently open
      if (selectedStudent) {
        const updated = data.find(s => s.id === selectedStudent.id && s.courseId === selectedStudent.courseId);
        if (updated) setSelectedStudent(updated);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStudent]);

  useEffect(() => { loadStudents(); }, []);

  // Real-time enrollment and feedback subscription
  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase
      .channel(`students-page-realtime:${profile.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, () => {
        setLiveUpdate(true);
        setTimeout(() => setLiveUpdate(false), 3000);
        loadStudents();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mentor_feedback' }, () => {
        loadStudents();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'evaluation_reports' }, () => {
        loadStudents();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, loadStudents]);

  // Filter + search
  const filtered = useMemo(() => {
    return students.filter(s => {
      const matchSearch = !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.course.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    completed: students.filter(s => s.status === 'completed').length,
    struggling: students.filter(s => s.status === 'struggling').length,
    avgProgress: students.length > 0
      ? Math.round(students.reduce((a, s) => a + s.progress, 0) / students.length)
      : 0,
  }), [students]);

  // Actions
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.id || !selectedStudent) return;
    setIsSubmittingFeedback(true);
    const toastId = toast.loading('Submitting mentor feedback...');
    try {
      await InstructorService.addMentorFeedback(
        profile.id,
        selectedStudent.id,
        feedbackForm.text,
        feedbackForm.rating
      );
      toast.success('Mentor feedback logged successfully!', { id: toastId });
      setFeedbackForm({ rating: 5, text: '' });
      await loadStudents();
    } catch (err) {
      toast.error('Failed to log feedback: ' + err.message, { id: toastId });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleEvalSubmit = async (e) => {
    e.preventDefault();
    if (!profile?.id || !selectedStudent) return;
    setIsSubmittingEval(true);
    const toastId = toast.loading('Issuing academic evaluation...');
    try {
      await InstructorService.addEvaluationReport(
        profile.id,
        selectedStudent.id,
        selectedStudent.cohortId,
        evalForm.type,
        evalForm.techScore,
        evalForm.softScore,
        evalForm.remarks
      );
      toast.success('Academic evaluation report issued!', { id: toastId });
      setEvalForm({ type: 'gate', techScore: 80, softScore: 80, remarks: '' });
      await loadStudents();
    } catch (err) {
      toast.error('Failed to issue evaluation: ' + err.message, { id: toastId });
    } finally {
      setIsSubmittingEval(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 10, color: 'rgba(195,244,0,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
              // Student Intelligence Network
            </div>
            {liveUpdate && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ fontFamily: 'monospace', fontSize: 9, color: '#4ade80', padding: '2px 8px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}
              >
                ⚡ REALTIME UPDATE
              </motion.span>
            )}
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Student <span style={{ color: '#c3f400' }}>Roster</span>
          </h1>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
            {isLoading ? 'Loading...' : `${stats.total} student${stats.total !== 1 ? 's' : ''} monitored with intelligent risk telemetry`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={loadStudents} className="register-btn" style={{ width: 'auto', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
            <RefreshCw size={13} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button className="register-btn" style={{ width: 'auto', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
            <Mail size={14} /> Bulk Email
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { icon: Users,       label: 'Total Students', value: stats.total,       color: '#fff' },
          { icon: TrendingUp,  label: 'Active Track',   value: stats.active,      color: '#60a5fa' },
          { icon: CheckCircle2,label: 'Completions',    value: stats.completed,   color: '#4ade80' },
          { icon: AlertCircle, label: 'Critical Risk',  value: stats.struggling,  color: '#ef4444' },
          { icon: GraduationCap,label: 'Avg Progress',  value: `${stats.avgProgress}%`, color: '#c3f400' },
        ].map((stat) => (
          <div key={stat.label} style={{ ...cardStyle, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <CornerAccents />
            <div style={{ width: 38, height: 38, flexShrink: 0, background: `${stat.color}10`, border: `1px solid ${stat.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              <stat.icon size={18} />
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: stat.color, letterSpacing: '-0.02em' }}>
                {isLoading ? '—' : stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search / Filter Bar */}
      <div style={{ ...cardStyle, padding: '12px 18px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <CornerAccents />
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={13} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="SEARCH BY NAME, EMAIL OR COURSE..."
            className="input-field"
            style={{ paddingLeft: 40, borderRadius: 0, fontSize: 11, background: 'rgba(255,255,255,0.03)' }}
          />
        </div>
        {['all', 'active', 'completed', 'struggling'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '9px 16px', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700,
              fontFamily: "'Space Grotesk', monospace", cursor: 'pointer', border: 'none',
              background: statusFilter === status ? '#c3f400' : 'rgba(255,255,255,0.04)',
              color: statusFilter === status ? '#283500' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            {status}
          </button>
        ))}
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', marginLeft: 'auto' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Student Table */}
      <div style={{ ...cardStyle, overflowX: 'auto' }}>
        <CornerAccents />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              {['Student', 'Course', 'Progress', 'Cohort / Git', 'Risk Telemetry', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 22px', textAlign: 'left', fontFamily: "'Space Grotesk', monospace", fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} style={{ padding: '18px 22px' }}>
                      <div style={{ height: 16, background: 'rgba(255,255,255,0.04)', animation: 'shimmer 1.5s infinite', animationDelay: `${j * 0.05}s` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length > 0 ? (
              <AnimatePresence>
                {filtered.map((student, i) => {
                  const sc = statusConfig[student.status] || statusConfig.active;
                  return (
                    <motion.tr
                      key={`${student.id}-${student.courseId}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(195,244,0,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <td style={{ padding: '16px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1A1D23&color=c3f400&size=64`}
                            alt={student.name}
                            style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, border: '1px solid rgba(195,244,0,0.15)', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{student.name}</div>
                              {student.riskScore > 0 && (
                                <span title={student.riskReasons.join(', ')} style={{ color: student.riskScore === 2 ? '#ef4444' : '#fb923c', animation: 'pulse 1.5s infinite' }}>
                                  <AlertCircle size={12} />
                                </span>
                              )}
                            </div>
                            <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 22px' }}>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{student.course}</span>
                      </td>
                      <td style={{ padding: '16px 22px' }}>
                        <div style={{ width: 110 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>Progress</span>
                            <span style={{ fontFamily: 'monospace', fontSize: 9, color: student.progress === 100 ? '#4ade80' : '#c3f400' }}>{student.progress}%</span>
                          </div>
                          <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                            <div style={{ height: '100%', width: `${student.progress}%`, background: student.progress >= 100 ? '#4ade80' : '#c3f400', boxShadow: `0 0 6px ${student.progress >= 100 ? 'rgba(74,222,128,0.4)' : 'rgba(195,244,0,0.3)'}`, borderRadius: 2, transition: 'width 0.4s ease' }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 22px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                            Attendance: <span style={{ color: student.cohortAttendance < 90 ? '#ef4444' : '#fff', fontWeight: 600 }}>{student.cohortAttendance}%</span>
                          </div>
                          <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                            Git: {student.totalCommits} commits, {student.totalPRs} PRs
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 22px' }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: 9, padding: '4px 10px',
                          background: student.riskScore === 2 ? 'rgba(239,68,68,0.1)' : student.riskScore === 1 ? 'rgba(251,146,60,0.1)' : 'rgba(74,222,128,0.1)',
                          border: `1px solid ${student.riskScore === 2 ? '#ef4444' : student.riskScore === 1 ? '#fb923c' : '#4ade80'}`,
                          color: student.riskScore === 2 ? '#ef4444' : student.riskScore === 1 ? '#fb923c' : '#4ade80',
                          textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600
                        }}>
                          {student.riskScore === 2 ? 'CRITICAL RISK' : student.riskScore === 1 ? 'WARNING' : 'SECURE'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 22px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            title="View details"
                            style={{ background: 'rgba(195,244,0,0.05)', border: '1px solid rgba(195,244,0,0.15)', padding: '7px 10px', color: '#c3f400', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(195,244,0,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(195,244,0,0.05)'; }}
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '60px 22px', textAlign: 'center' }}>
                  <Users size={36} style={{ color: 'rgba(255,255,255,0.08)', margin: '0 auto 16px' }} />
                  <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 11, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    {searchQuery || statusFilter !== 'all' ? 'No students match your filters' : 'No students enrolled yet'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sliding Side Drawer for Student Details & Admin Actions */}
      <AnimatePresence>
        {selectedStudent && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedStudent(null)}>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                width: '100%', maxWidth: '850px', height: '100vh',
                background: 'rgba(10, 11, 15, 0.98)', borderLeft: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.5)', overflowY: 'auto', padding: '36px 40px',
                display: 'flex', flexDirection: 'column', gap: 30
              }}
              onClick={e => e.stopPropagation()}
            >
              <CornerAccents />

              {/* Drawer Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <img
                    src={selectedStudent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=1A1D23&color=c3f400&size=64`}
                    alt={selectedStudent.name}
                    style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid #c3f400' }}
                  />
                  <div>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>{selectedStudent.name}</h2>
                    <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{selectedStudent.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: 10, cursor: 'pointer', borderRadius: '50%' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Interactive Telemetry Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                  { label: 'Progress', value: `${selectedStudent.progress}%`, color: '#c3f400' },
                  { label: 'Attendance', value: `${selectedStudent.cohortAttendance}%`, color: '#60a5fa' },
                  { label: 'Git Commits', value: selectedStudent.totalCommits, color: '#4ade80' },
                  { label: 'Risk Profile', value: selectedStudent.riskScore === 2 ? 'CRITICAL' : selectedStudent.riskScore === 1 ? 'WARNING' : 'SECURE', color: selectedStudent.riskScore === 2 ? '#ef4444' : selectedStudent.riskScore === 1 ? '#fb923c' : '#4ade80' },
                ].map(item => (
                  <div key={item.label} style={{ ...cardStyle, padding: '14px 18px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 8, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {selectedStudent.riskScore > 0 && (
                <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.03)', padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ef4444', fontFamily: "'Space Grotesk', monospace", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    <AlertCircle size={14} /> Risk Assessment Flagged
                  </div>
                  <ul style={{ marginTop: 8, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selectedStudent.riskReasons.map((reason, idx) => (
                      <li key={idx} style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main Content Split */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>

                {/* Left Area: Read Telemetry */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  
                  {/* Internship Status */}
                  <div style={{ ...cardStyle, padding: 20 }}>
                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Briefcase size={14} /> Internship Operations
                    </h3>
                    {selectedStudent.internship ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: '#fff' }}>{selectedStudent.internship.role_title}</span>
                          <span style={{ fontSize: 9, padding: '3px 8px', background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>{selectedStudent.internship.status.toUpperCase()}</span>
                        </div>
                        <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Company: {selectedStudent.internship.company_name}</p>
                      </div>
                    ) : (
                      <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>No active internship tracked for this student.</p>
                    )}
                  </div>

                  {/* Academic Evaluations History */}
                  <div style={{ ...cardStyle, padding: 20 }}>
                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700, color: '#c3f400', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Award size={14} /> Academic Milestone History
                    </h3>
                    {selectedStudent.evals && selectedStudent.evals.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {selectedStudent.evals.map((report, idx) => (
                          <div key={idx} style={{ padding: 12, border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                              <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#c3f400', textTransform: 'uppercase', fontWeight: 700 }}>
                                [{report.evaluation_type}] Evaluated
                              </span>
                              <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                                {new Date(report.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                              <div>
                                <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>TECH SCORE</span>
                                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{report.technical_score}/100</div>
                              </div>
                              <div>
                                <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>SOFT SKILLS</span>
                                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{report.soft_skills_score}/100</div>
                              </div>
                            </div>
                            {report.remarks && (
                              <p style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                                "{report.remarks}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>No milestone reviews issued yet.</p>
                    )}
                  </div>
                </div>

                {/* Right Area: Action Center Form Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  
                  {/* Submit Mentor Feedback */}
                  <div style={{ ...cardStyle, padding: 20 }}>
                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                      Log Mentor Session Feedback
                    </h3>
                    <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Rating</label>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedbackForm(prev => ({ ...prev, rating: star }))}
                              style={{ background: 'none', border: 'none', color: star <= feedbackForm.rating ? '#fb923c' : 'rgba(255,255,255,0.1)', cursor: 'pointer', padding: 0 }}
                            >
                              <Star size={16} fill={star <= feedbackForm.rating ? '#fb923c' : 'none'} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Session Summary</label>
                        <textarea
                          rows={2}
                          value={feedbackForm.text}
                          onChange={e => setFeedbackForm(prev => ({ ...prev, text: e.target.value }))}
                          required
                          className="input-field"
                          placeholder="What did you focus on..."
                          style={{ resize: 'none', fontSize: 11, background: 'rgba(255,255,255,0.03)', padding: 10 }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingFeedback}
                        className="submit-btn"
                        style={{ background: '#fb923c', color: '#1a0800', fontSize: 9, padding: '10px 14px', width: '100%', gap: 6 }}
                      >
                        {isSubmittingFeedback ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        Log Feedback
                      </button>
                    </form>
                  </div>

                  {/* Submit Evaluation Report */}
                  <div style={{ ...cardStyle, padding: 20 }}>
                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700, color: '#c3f400', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                      Issue Milestone Review
                    </h3>
                    <form onSubmit={handleEvalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Type</label>
                          <select
                            value={evalForm.type}
                            onChange={e => setEvalForm(prev => ({ ...prev, type: e.target.value }))}
                            className="input-field"
                            style={{ fontSize: 10, background: 'rgba(25, 26, 30, 0.9)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 8px' }}
                          >
                            <option value="gate">Gate Review</option>
                            <option value="midterm">Midterm</option>
                            <option value="final">Final Exam</option>
                            <option value="project">Project Defense</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Tech Score</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={evalForm.techScore}
                            onChange={e => setEvalForm(prev => ({ ...prev, techScore: parseInt(e.target.value) || 0 }))}
                            className="input-field"
                            style={{ fontSize: 11, background: 'rgba(255,255,255,0.03)', padding: '6px 8px' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Soft Skills Score</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={evalForm.softScore}
                          onChange={e => setEvalForm(prev => ({ ...prev, softScore: parseInt(e.target.value) || 0 }))}
                          className="input-field"
                          style={{ fontSize: 11, background: 'rgba(255,255,255,0.03)', padding: '6px 8px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Remarks</label>
                        <textarea
                          rows={2}
                          value={evalForm.remarks}
                          onChange={e => setEvalForm(prev => ({ ...prev, remarks: e.target.value }))}
                          required
                          className="input-field"
                          placeholder="Strengths, focus areas..."
                          style={{ resize: 'none', fontSize: 11, background: 'rgba(255,255,255,0.03)', padding: 10 }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingEval}
                        className="submit-btn"
                        style={{ background: '#c3f400', color: '#1a0800', fontSize: 9, padding: '10px 14px', width: '100%', gap: 6 }}
                      >
                        {isSubmittingEval ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        Log Evaluation
                      </button>
                    </form>
                  </div>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default Students;
