import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, MoreVertical, 
  Users, Star, BookOpen,
  Edit, BarChart2, Loader2, Book
} from 'lucide-react';
import { InstructorService } from '../../services/InstructorService';
import { useNavigate } from 'react-router-dom';

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

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await InstructorService.getMyCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to load instructor courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCourses();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div className="code-label" style={{ color: 'rgba(195,244,0,0.5)', marginBottom: 10 }}>// Academic Content Repository</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Academic <span style={{ color: '#c3f400' }}>Inventory</span>
          </h1>
          <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Managing {courses.length} Active Tracks</p>
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '16px 28px', gap: 10 }} onClick={() => navigate('/instructor/builder')}>
          <Plus size={16} />
          Architect New Track
        </button>
      </div>

      {/* Search/Filter Bar */}
      <div style={{ ...cardStyle, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <CornerAccents />
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
          <input
            type="text"
            placeholder="SEARCH YOUR LIBRARY..."
            className="input-field"
            style={{ paddingLeft: 42, borderRadius: 0, fontSize: 11 }}
          />
        </div>
        <button className="register-btn" style={{ width: 'auto', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
          <Filter size={12} />
          Category
        </button>
      </div>

      {/* Courses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: 80 }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#c3f400' }} />
          </div>
        ) : courses.length > 0 ? (
          courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              style={{ ...cardStyle, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              <CornerAccents />
              {/* Thumbnail */}
              <div style={{ height: 180, position: 'relative', overflow: 'hidden', background: '#0a0f1a' }}>
                <img
                  src={course.thumbnail_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${course.id}`}
                  alt={course.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0D0E12, transparent 60%)' }} />
                <div style={{ position: 'absolute', top: 14, left: 14 }}>
                  <span className="code-label" style={{
                    padding: '4px 10px', fontSize: 9,
                    background: course.status === 'published' ? 'rgba(74,222,128,0.1)' : 'rgba(251,146,60,0.1)',
                    border: `1px solid ${course.status === 'published' ? 'rgba(74,222,128,0.3)' : 'rgba(251,146,60,0.3)'}`,
                    color: course.status === 'published' ? '#4ade80' : '#fb923c',
                  }}>
                    {(course.status || 'DRAFT').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div className="code-label" style={{ color: '#c3f400', fontSize: 10, marginBottom: 8 }}>{course.category || 'GENERAL'}</div>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.3 }}>
                    {course.title}
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="code-label" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, marginBottom: 6 }}>Price</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: '#fff' }}>${course.price || '0'}</div>
                  </div>
                  <div style={{ padding: '12px 14px', background: 'rgba(195,244,0,0.03)', border: '1px solid rgba(195,244,0,0.1)' }}>
                    <div className="code-label" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, marginBottom: 6 }}>Rating</div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: '#c3f400' }}>{course.rating || 'N/A'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Users size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <span className="code-label" style={{ fontSize: 10 }}>{course.students_count || 0} Students</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: 8, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                      <Edit size={14} />
                    </button>
                    <button className="submit-btn" style={{ padding: '8px 16px', fontSize: 10, gap: 6, width: 'auto' }}>
                      <Book size={12} /> Enter
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', border: '2px dashed rgba(255,255,255,0.06)', padding: 100, textAlign: 'center' }}>
            <BookOpen size={48} style={{ color: 'rgba(255,255,255,0.1)', margin: '0 auto 24px' }} />
            <p className="code-label">No courses found in your repository.</p>
            <button className="submit-btn" style={{ width: 'auto', margin: '24px auto 0' }} onClick={() => navigate('/instructor/builder')}>
              Architect First Course
            </button>
          </div>
        )}
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MyCourses;
