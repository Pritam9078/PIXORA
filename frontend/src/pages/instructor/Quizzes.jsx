import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, HelpCircle, Trophy, Users, 
  ChevronRight, Search, Filter, Loader2,
  AlertCircle, CheckCircle2, BarChart, Clock, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
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

const Quizzes = () => {
  const { profile } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ avgScore: 0, completions: 0, passRate: 0, recentSuccess: [] });

  const loadQuizzes = useCallback(async () => {
    if (!profile?.id) return;
    setIsLoading(true);
    try {
      // Load Quizzes
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', profile.id);

      if (coursesError) throw coursesError;

      if (courses && courses.length > 0) {
        const courseIds = courses.map(c => c.id);
        const courseMap = Object.fromEntries(courses.map(c => [c.id, c.title]));

        const { data, error: quizzesError } = await supabase
          .from('quizzes')
          .select('*')
          .in('course_id', courseIds)
          .order('created_at', { ascending: false });

        if (quizzesError) throw quizzesError;

        setQuizzes((data || []).map(q => ({
          ...q,
          courseName: courseMap[q.course_id] || 'Unknown Course'
        })));
      }

      // Load Stats
      const quizStats = await InstructorService.getQuizStats();
      if (quizStats) {
        setStats(quizStats);
      }
    } catch (err) {
      console.error("Quiz fetch error:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  // Real-time subscription
  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase
      .channel(`quizzes-page:${profile.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quiz_attempts' }, () => {
        loadQuizzes();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, loadQuizzes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div className="code-label" style={{ color: 'rgba(195,244,0,0.5)', marginBottom: 10 }}>// Intellectual Assessment Module</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Quiz <span style={{ color: '#c3f400' }}>Matrix</span>
          </h1>
          <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Verify Knowledge Retention</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={loadQuizzes} className="register-btn" style={{ width: 'auto', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
            <RefreshCw size={13} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button className="submit-btn" style={{ width: 'auto', padding: '16px 28px', gap: 10 }}>
            <Plus size={16} /> New Quiz
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {[
          { label: 'Avg Score', value: `${stats.avgScore || 0}%`, icon: BarChart, color: '#c3f400' },
          { label: 'Quiz Completions', value: stats.completions || 0, icon: Users, color: '#60a5fa' },
          { label: 'Passing Rate', value: `${stats.passRate || 0}%`, icon: Trophy, color: '#4ade80' },
        ].map((stat) => (
          <div key={stat.label} style={{ ...cardStyle, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
            <CornerAccents />
            <div style={{ width: 42, height: 42, background: `${stat.color}10`, border: `1px solid ${stat.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div>
              <div className="code-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>{stat.label}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, color: stat.color }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isLoading ? (
            <div style={{ ...cardStyle, padding: 60, display: 'flex', justifyContent: 'center' }}>
              <Loader2 size={32} className="animate-spin" style={{ color: '#c3f400' }} />
            </div>
          ) : quizzes.length > 0 ? (
            quizzes.map(quiz => (
              <div key={quiz.id} style={{ ...cardStyle, padding: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CornerAccents />
                <div>
                  <div className="code-label" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginBottom: 4 }}>{quiz.courseName}</div>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: '#fff' }}>{quiz.title}</h3>
                  <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HelpCircle size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{quiz.questions_count || 10} Questions</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={12} style={{ color: 'rgba(255,255,255,0.2)' }} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{quiz.time_limit || 20} Min</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="register-btn" style={{ width: 'auto', padding: '10px 20px' }}>EDIT</button>
                  <button className="submit-btn" style={{ width: 'auto', padding: '10px 20px' }}>ANALYSIS</button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ ...cardStyle, padding: 60, textAlign: 'center' }}>
              <HelpCircle size={48} style={{ color: 'rgba(255,255,255,0.05)', margin: '0 auto 20px' }} />
              <p className="code-label">No active assessments found in matrix</p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Recent Results */}
        <div style={{ ...cardStyle, padding: 28, height: 'fit-content' }}>
          <CornerAccents />
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart size={16} style={{ color: '#c3f400' }} />
            Recent Success
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.recentSuccess && stats.recentSuccess.length > 0 ? (
              stats.recentSuccess.map((res, i) => (
                <div key={i} style={{ padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 12 }}>{res.name}</div>
                    <div className="code-label" style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{res.quiz}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: res.score >= 80 ? '#4ade80' : '#fb923c', fontWeight: 800 }}>{res.score}%</div>
                    <div className="code-label" style={{ fontSize: 7 }}>{res.time}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)' }} className="code-label">
                No recent attempts
              </div>
            )}
          </div>
          <button className="register-btn" style={{ marginTop: 20, fontSize: 10 }}>View All Results</button>
        </div>
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Quizzes;
