import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, FileEdit, TrendingUp,
  Activity, Plus, Video, Calendar, Send,
  ArrowUpRight, ArrowDownRight, MoreVertical, Zap,
  GraduationCap, Award, Loader2, RefreshCw, Layers, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { InstructorService } from '../../services/InstructorService';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const S = {
  card: {
    background: 'rgba(13, 14, 18, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.06)',
    position: 'relative',
  },
};

const CornerAccents = () => (
  <>
    <div style={{ position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderTop: '1px solid rgba(195,244,0,0.4)', borderLeft: '1px solid rgba(195,244,0,0.4)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderBottom: '1px solid rgba(195,244,0,0.2)', borderRight: '1px solid rgba(195,244,0,0.2)', pointerEvents: 'none' }} />
  </>
);

const typeConfig = {
  enrollment: { icon: Users, color: '#c3f400', label: 'ENROLLED' },
  completion: { icon: GraduationCap, color: '#4ade80', label: 'COMPLETED' },
  submission: { icon: FileEdit, color: '#fb923c', label: 'SUBMITTED' },
  review: { icon: Award, color: '#60a5fa', label: 'REVIEWED' },
};

const InstructorDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalStudents: 0, activeCourses: 0,
    pendingGrading: 0, totalRevenue: 0,
    completedStudents: 0, avgProgress: 0
  });
  const [activity, setActivity] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [liveIndicator, setLiveIndicator] = useState(false);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) setShowRetry(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setShowRetry(false);
    try {
      const results = await Promise.all([
        InstructorService.getDashboardMetrics(),
        InstructorService.getPerformanceTrend(),
        InstructorService.getRecentActivity(),
        InstructorService.getMyCourses()
      ]);
      console.log("Dashboard: Data loaded successfully", results);
      setMetrics(results[0]);
      setTrendData(results[1]);
      setActivity(results[2]);
      setCourses(results[3]);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Dashboard: Load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSeed = async () => {
    if (!confirm("This will create a sample course and mock enrollments for you. Proceed?")) return;
    const toastId = toast.loading('Seeding data...');
    try {
      await InstructorService.seedInstructorData();
      toast.success("Database seeded! Refreshing...", { id: toastId });
      loadData();
    } catch (err) {
      console.error('Seed Error:', err);
      const msg = err.message || (typeof err === 'object' ? JSON.stringify(err) : 'Unknown error during seeding');
      toast.error(`Seeding failed: ${msg.substring(0, 100)}${msg.length > 100 ? '...' : ''}`, { id: toastId });
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time subscription
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`instructor-dashboard:${profile.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'enrollments' }, () => {
        setLiveIndicator(true);
        setTimeout(() => setLiveIndicator(false), 3000);
        loadData();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'submissions' }, () => {
        setLiveIndicator(true);
        setTimeout(() => setLiveIndicator(false), 3000);
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, loadData]);

  const kpis = [
    { label: 'Total Students', value: metrics.totalStudents.toLocaleString(), trend: 'ENROLLED', icon: Users, up: true, color: '#c3f400' },
    { label: 'Active Courses', value: metrics.activeCourses, trend: 'LIVE', icon: BookOpen, up: true, color: '#60a5fa' },
    { label: 'Pending Grading', value: metrics.pendingGrading, trend: metrics.pendingGrading > 0 ? 'URGENT' : 'CLEAR', icon: FileEdit, up: metrics.pendingGrading === 0, color: '#fb923c' },
    { label: 'Completions', value: metrics.completedStudents, trend: 'ALL TIME', icon: GraduationCap, up: true, color: '#4ade80' },
  ];

  const quickActions = [
    { label: 'Create Course', icon: Plus, primary: true, onClick: () => navigate('/instructor/builder') },
    { label: 'Refresh Data', icon: RefreshCw, primary: false, onClick: loadData, loading: isLoading },
    { label: 'New Assignment', icon: FileEdit, primary: false },
    ...(metrics.totalStudents === 0 ? [{ label: 'Seed Mock Data', icon: Sparkles, primary: false, onClick: handleSeed, color: '#c3f400' }] : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: liveIndicator ? '#4ade80' : '#c3f400',
              boxShadow: `0 0 10px ${liveIndicator ? '#4ade80' : '#c3f400'}`,
              transition: 'all 0.3s ease',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 10, color: 'rgba(195,244,0,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
              {liveIndicator ? '⚡ Live Update Received' : 'Session Active · Instructor'}
            </span>
            {lastRefresh && (
              <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
                · Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="code-label" style={{ color: 'rgba(195,244,0,0.5)', marginBottom: 10 }}>// Instructor Command Center</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Control <span style={{ color: '#c3f400' }}>Panel</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)' }}>Welcome back, {profile?.full_name || 'Architect'}</p>
            {profile?.is_temporary && (
              <span style={{ 
                fontFamily: 'monospace', 
                fontSize: 9, 
                padding: '2px 8px', 
                background: 'rgba(251, 146, 60, 0.1)', 
                border: '1px solid rgba(251, 146, 60, 0.2)', 
                color: '#fb923c',
                borderRadius: 4
              }}>
                LIMITED SYNC
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={handleSeed}
            style={{ background: 'rgba(195,244,0,0.05)', border: '1px solid rgba(195,244,0,0.2)', padding: '12px 18px', color: '#c3f400', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Space Grotesk', monospace", fontSize: 10, letterSpacing: '0.1em', fontWeight: 700 }}
          >
            <Sparkles size={14} />
            SEED DATA
          </button>
          <button 
            onClick={loadData}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 18px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Space Grotesk', monospace", fontSize: 10, letterSpacing: '0.1em' }}
          >
            <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            REFRESH
          </button>
          <button 
            className="submit-btn" 
            style={{ width: 'auto', padding: '16px 32px', gap: 10 }}
            onClick={() => navigate('/instructor/builder')}
          >
            <Plus size={16} /> NEW PROJECT
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ ...S.card, padding: 28, overflow: 'hidden' }}
          >
            <CornerAccents />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ width: 42, height: 42, background: `${kpi.color}12`, border: `1px solid ${kpi.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
                <kpi.icon size={20} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Space Grotesk', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: kpi.up ? '#4ade80' : '#fb923c' }}>
                {kpi.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {kpi.trend}
              </div>
            </div>
            <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>{kpi.label}</div>
            {isLoading
              ? <div style={{ height: 36, background: 'rgba(255,255,255,0.04)', animation: 'shimmer 1.5s infinite' }} />
              : <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 32, color: '#fff', letterSpacing: '-0.02em' }}>{kpi.value}</div>
            }
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Actions */}
          <div style={{ ...S.card, padding: 32 }}>
            <CornerAccents />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{ width: 3, height: 20, background: '#c3f400' }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Rapid Deployment</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 12, padding: '24px 12px',
                    background: action.primary ? '#c3f400' : 'rgba(255,255,255,0.03)',
                    border: action.primary ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    color: action.primary ? '#283500' : 'rgba(255,255,255,0.5)',
                    fontFamily: "'Space Grotesk', monospace", fontSize: 10,
                    letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { if (!action.primary) { e.currentTarget.style.borderColor = 'rgba(195,244,0,0.3)'; e.currentTarget.style.color = '#c3f400'; } }}
                  onMouseLeave={e => { if (!action.primary) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
                >
                  <action.icon size={24} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Performance Trend Chart */}
          <div style={{ ...S.card, padding: 32 }}>
            <CornerAccents />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 3, height: 20, background: '#c3f400' }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Performance Growth</span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>7-DAY ENROLLMENT TREND</div>
            </div>
            
            <div style={{ height: 240, width: '100%' }}>
              {isLoading ? (
                <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.02)', animation: 'shimmer 1.5s infinite' }} />
              ) : trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c3f400" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#c3f400" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.2)" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ background: '#0D0E12', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, fontFamily: 'monospace' }}
                      itemStyle={{ color: '#c3f400' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#c3f400" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)' }}>
                  <TrendingUp size={24} style={{ color: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>No trend data available</span>
                </div>
              )}
            </div>
          </div>

          {/* Your Courses List */}
          <div style={{ ...S.card, padding: 32 }}>
            <CornerAccents />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 3, height: 20, background: '#60a5fa' }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Active Modules</span>
              </div>
              <button 
                onClick={() => navigate('/instructor/courses')}
                style={{ background: 'none', border: 'none', color: '#60a5fa', fontFamily: 'monospace', fontSize: 10, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                View All
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} style={{ height: 160, background: 'rgba(255,255,255,0.03)', animation: 'shimmer 1.5s infinite' }} />
                ))
              ) : courses.length > 0 ? (
                courses.slice(0, 4).map((course, i) => (
                  <motion.div
                    key={course.id}
                    whileHover={{ y: -4 }}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}
                  >
                    <div style={{ height: 100, position: 'relative', background: '#1A1D23' }}>
                      <img 
                        src={course.thumbnail_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(course.title)}`} 
                        alt={course.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0D0E12, transparent)' }} />
                      <div style={{ position: 'absolute', bottom: 10, left: 12 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 8, padding: '2px 8px', background: '#c3f400', color: '#000', fontWeight: 800 }}>{course.level?.toUpperCase() || 'BEGINNER'}</span>
                      </div>
                    </div>
                    <div style={{ padding: 16 }}>
                      <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, color: '#fff', textTransform: 'uppercase', marginBottom: 12, height: 32, overflow: 'hidden' }}>{course.title}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Users size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
                          <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{course.enrolled_count || 0}</span>
                        </div>
                        <button style={{ background: 'none', border: 'none', color: '#c3f400', fontFamily: 'monospace', fontSize: 9, cursor: 'pointer', fontWeight: 700 }}>MANAGE</button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)' }}>
                  <Layers size={32} style={{ color: 'rgba(255,255,255,0.05)', margin: '0 auto 12px' }} />
                  <p style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 10, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>No courses created</p>
                  <button 
                    onClick={() => navigate('/instructor/builder')}
                    style={{ marginTop: 12, background: 'none', border: '1px solid rgba(195,244,0,0.3)', color: '#c3f400', padding: '8px 16px', fontSize: 10, fontFamily: 'monospace', cursor: 'pointer', marginRight: 10 }}
                  >
                    DEPLOY FIRST MODULE
                  </button>
                  <button 
                    onClick={handleSeed}
                    style={{ marginTop: 12, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', padding: '8px 16px', fontSize: 10, fontFamily: 'monospace', cursor: 'pointer' }}
                  >
                    SEED MOCK DATA
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Live Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ ...S.card, padding: 28, flex: 1 }}>
            <CornerAccents />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 3, height: 20, background: 'rgba(96,165,250,0.8)' }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live Pulse</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80', animation: 'pulse 2s infinite' }} />
                <span style={{ fontFamily: 'monospace', fontSize: 9, color: '#4ade80' }}>REALTIME</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ height: 58, background: 'rgba(255,255,255,0.03)', animation: 'shimmer 1.5s infinite', animationDelay: `${i * 0.1}s` }} />
                ))
              ) : activity.length > 0 ? (
                activity.map((item, i) => {
                  const tc = typeConfig[item.type] || typeConfig.enrollment;
                  return (
                    <motion.div
                      key={item.id || i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ display: 'flex', gap: 12, padding: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'border-color 0.15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = `${tc.color}30`}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                    >
                      <div style={{ width: 34, height: 34, flexShrink: 0, background: `${tc.color}10`, border: `1px solid ${tc.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tc.color }}>
                        <tc.icon size={15} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.user}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', marginLeft: 8, whiteSpace: 'nowrap' }}>{item.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 8, color: tc.color, padding: '1px 6px', background: `${tc.color}10`, border: `1px solid ${tc.color}25` }}>{tc.label}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.course}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <Activity size={32} style={{ color: 'rgba(255,255,255,0.1)', margin: '0 auto 12px' }} />
                  <p style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 10, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>No activity yet</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.15)', marginTop: 8 }}>Students will appear here when they enroll</p>
                </div>
              )}
            </div>
          </div>

          {/* Teaching Streak */}
          <div style={{ padding: 24, background: 'rgba(195,244,0,0.04)', border: '1px solid rgba(195,244,0,0.12)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.05 }}>
              <Zap size={120} fill="#c3f400" style={{ color: '#c3f400' }} />
            </div>
            <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 9, color: 'rgba(195,244,0,0.5)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>// Teaching Stats</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 16 }}>
              {metrics.activeCourses} <span style={{ color: '#c3f400' }}>Active</span> Course{metrics.activeCourses !== 1 ? 's' : ''}
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: '#4ade80' }}>{metrics.totalStudents}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>students</div>
              </div>
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700, color: '#fb923c' }}>{metrics.pendingGrading}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>pending</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { opacity: 0.4; } 50% { opacity: 0.7; } 100% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};

export default InstructorDashboard;
