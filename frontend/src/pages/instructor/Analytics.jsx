import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart2, TrendingUp, Clock, 
  ArrowUpRight, ArrowDownRight, Calendar,
  Download, MousePointer2, Play, CheckCircle2, 
  MessageSquare, Loader2, Info
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { InstructorService } from '../../services/InstructorService';

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

const Analytics = () => {
  const [metricsData, setMetricsData] = useState(null);
  const [retentionData, setRetentionData] = useState([]);
  const [courseInfo, setCourseInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        // If courseId is provided, fetch specific analytics, else fetch overall
        const promises = [
          courseId 
            ? InstructorService.getCourseAnalytics(courseId)
            : InstructorService.getAnalyticsMetrics(),
          courseId
            ? InstructorService.getCourseRetention(courseId)
            : InstructorService.getRetentionData(),
        ];

        if (courseId) {
          // Fetch course details
          promises.push(InstructorService.getCourseById(courseId).catch(() => null));
        }

        const [m, r, c] = await Promise.all(promises);
        setMetricsData(m);
        setRetentionData(r);
        if (c) setCourseInfo(c);
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalytics();
  }, [courseId]);

  const metrics = [
    { label: 'Watch Time', value: metricsData?.watchTime || '0h', trend: '+18.2%', icon: Play, up: true },
    { label: 'Avg. Retention', value: metricsData?.retention || '0%', trend: '+5.4%', icon: Clock, up: true },
    { label: 'Quiz Pass Rate', value: metricsData?.passRate || '0%', trend: '-2.1%', icon: CheckCircle2, up: false },
    { label: 'Engagement', value: metricsData?.engagement || '0/10', trend: '+1.2%', icon: MessageSquare, up: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div className="code-label" style={{ color: 'rgba(195,244,0,0.5)', marginBottom: 10 }}>// Real-Time Data Synthesis Engine</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {courseInfo ? `Intelligence: ${courseInfo.title}` : 'Performance Intelligence'}
          </h1>
          <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
            {courseInfo 
              ? `Real-time synchronization for CID: ${courseInfo.id.slice(0, 8)}`
              : 'Real-time synchronization across all your active learning sequences.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="register-btn" style={{ width: 'auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
            <Calendar size={15} />
            Last 30 Days
          </button>
          <button className="submit-btn" style={{ width: 'auto', padding: '12px 20px', gap: 8 }}>
            <Download size={15} />
            Export Data
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <Loader2 size={28} style={{ color: '#c3f400', animation: 'spin 1s linear infinite' }} />
              <span className="code-label" style={{ color: 'rgba(255,255,255,0.3)' }}>Synthesizing Data...</span>
            </div>
          </div>
        ) : metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ ...cardStyle, padding: 26 }}
          >
            <CornerAccents />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, background: 'rgba(195,244,0,0.07)', border: '1px solid rgba(195,244,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c3f400' }}>
                <m.icon size={18} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Space Grotesk', monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: m.up ? '#4ade80' : '#fb923c' }}>
                {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {m.trend}
              </div>
            </div>
            <div className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>{m.label}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: '#fff', letterSpacing: '-0.02em' }}>{m.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Main chart section */}
        <div style={{ ...cardStyle, padding: 32, minHeight: 420 }}>
          <CornerAccents />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 3, height: 20, background: '#c3f400' }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Retention Matrix</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>User Distribution by Progress</span>
            </div>
          </div>

          <div style={{ height: 300, width: '100%' }}>
            {isLoading ? (
              <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.02)', animation: 'shimmer 1.5s infinite' }} />
            ) : retentionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={retentionData}>
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
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ background: '#0D0E12', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, fontFamily: 'monospace' }}
                    itemStyle={{ color: '#c3f400' }}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {retentionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === retentionData.length - 1 ? '#c3f400' : 'rgba(195,244,0,0.3)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.05)' }}>
                <TrendingUp size={24} style={{ color: 'rgba(255,255,255,0.05)', marginBottom: 12 }} />
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Insufficient data for matrix mapping</span>
              </div>
            )}
          </div>
          
          <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(195,244,0,0.03)', borderLeft: '2px solid #c3f400' }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              <span style={{ color: '#c3f400', fontWeight: 700 }}>AI ANALYTICS:</span> Most students are reaching the <span style={{ color: '#fff' }}>60% milestone</span> before slowing down. Consider adding a milestone reward at this stage to boost final completion rates.
            </p>
          </div>
        </div>

        {/* Right side panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Content Efficacy */}
          <div style={{ ...cardStyle, padding: 26, flex: 1 }}>
            <CornerAccents />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <MousePointer2 size={15} style={{ color: '#60a5fa' }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Content Efficacy</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { label: 'UE5 Lighting Basics', val: 94, color: '#c3f400' },
                { label: 'Blockchain Security', val: 82, color: '#60a5fa' },
                { label: 'Advanced C++ Concepts', val: 68, color: '#fb923c' },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span className="code-label" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>{item.label}</span>
                    <span className="code-label" style={{ color: item.color, fontSize: 9 }}>{item.val}%</span>
                  </div>
                  <div style={{ height: 2, background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{ height: '100%', width: `${item.val}%`, background: item.color, boxShadow: `0 0 6px ${item.color}50`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insight AI */}
          <div style={{ padding: 24, background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 18, height: 18, borderTop: '1px solid rgba(96,165,250,0.4)', borderLeft: '1px solid rgba(96,165,250,0.4)' }} />
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Insight AI</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 18 }}>
              Based on recent patterns, increasing quiz frequency in{' '}
              <span style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>Module 3</span>{' '}
              could boost retention by 15%.
            </p>
            <button className="register-btn" style={{ borderColor: 'rgba(96,165,250,0.25)', color: '#60a5fa', fontSize: 10 }}>
              Apply Strategy
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Analytics;
