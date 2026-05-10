import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Mail,
  MessageSquare, GraduationCap, Target,
  ChevronRight, AlertCircle, Loader2, RefreshCw,
  CheckCircle2, Clock, TrendingUp
} from 'lucide-react';
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

const statusConfig = {
  active:     { bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.25)',  text: '#4ade80',  icon: TrendingUp },
  struggling: { bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.25)',  text: '#fb923c',  icon: AlertCircle },
  completed:  { bg: 'rgba(195,244,0,0.08)',   border: 'rgba(195,244,0,0.25)',   text: '#c3f400',  icon: CheckCircle2 },
};

const Students = () => {
  const { profile } = useAuth();
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [liveUpdate, setLiveUpdate] = useState(false);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await InstructorService.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  // Real-time enrollment subscription
  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase
      .channel(`students-page:${profile.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'enrollments' }, () => {
        setLiveUpdate(true);
        setTimeout(() => setLiveUpdate(false), 3000);
        loadStudents();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'enrollments' }, () => {
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
                ⚡ NEW ENROLLMENT
              </motion.span>
            )}
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Student <span style={{ color: '#c3f400' }}>Roster</span>
          </h1>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
            {isLoading ? 'Loading...' : `${stats.total} student${stats.total !== 1 ? 's' : ''} enrolled across your courses`}
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
          <button className="submit-btn" style={{ width: 'auto', padding: '12px 20px', gap: 8 }}>
            <Target size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { icon: Users,       label: 'Total',      value: stats.total,       color: '#fff' },
          { icon: TrendingUp,  label: 'Active',     value: stats.active,      color: '#c3f400' },
          { icon: CheckCircle2,label: 'Completed',  value: stats.completed,   color: '#4ade80' },
          { icon: AlertCircle, label: 'Struggling', value: stats.struggling,  color: '#fb923c' },
          { icon: GraduationCap,label: 'Avg Progress', value: `${stats.avgProgress}%`, color: '#60a5fa' },
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
              {['Student', 'Course', 'Progress', 'Status', 'Joined', 'Actions'].map(h => (
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
                    >
                      <td style={{ padding: '16px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1A1D23&color=c3f400&size=64`}
                            alt={student.name}
                            style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, border: '1px solid rgba(195,244,0,0.15)', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{student.name}</div>
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
                        <span style={{ fontFamily: 'monospace', fontSize: 9, padding: '3px 10px', background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          {student.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 22px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                          {student.joinedAt ? new Date(student.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 22px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button title="Message student" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '7px 8px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)'; e.currentTarget.style.color = '#60a5fa'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
                            <MessageSquare size={13} />
                          </button>
                          <button title="View details" style={{ background: 'rgba(195,244,0,0.05)', border: '1px solid rgba(195,244,0,0.15)', padding: '7px 8px', color: '#c3f400', cursor: 'pointer', transition: 'all 0.15s ease' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(195,244,0,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(195,244,0,0.05)'; }}>
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
                  {!searchQuery && statusFilter === 'all' && (
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.12)', marginTop: 8 }}>
                      Students will appear here once they enroll in your courses
                    </p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
          Showing {filtered.length} of {students.length} students
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80', animation: 'pulse 2s infinite' }} />
          <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#4ade80' }}>Real-time sync active</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes shimmer { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
      `}</style>
    </div>
  );
};

export default Students;
