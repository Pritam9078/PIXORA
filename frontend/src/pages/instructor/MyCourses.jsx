import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Filter, MoreVertical, 
  Users, Star, BookOpen,
  Edit, BarChart2, Loader2, Book,
  Trash2, Copy, Globe, Lock, Eye, Zap,
  Layers
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
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', ...new Set(courses.map(c => c.category).filter(Boolean))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (course.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await InstructorService.getMyCourses();
      setCourses(data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently deconstruct this course from the protocol archives?")) return;
    try {
      await InstructorService.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      alert(`Deletion failed: ${error.message}`);
    }
  };

  const handleStatusToggle = async (course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    try {
      await InstructorService.updateCourse(course.id, { status: newStatus });
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: newStatus } : c));
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const handleCopyLink = (id) => {
    const link = `${window.location.origin}/student/course/${id}`;
    navigator.clipboard.writeText(link);
    alert("Course synchronization link copied to neuro-link.");
  };

  return (
    <div style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <div>
          <div className="code-label" style={{ color: '#c3f400', marginBottom: 12 }}>REPOS_MANAGER_V2.0</div>
          <h1 className="font-headline" style={{ fontSize: 32, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            My Courses
          </h1>
        </div>
        <button 
          onClick={() => navigate('/instructor/builder')}
          className="register-btn" 
          style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <Plus size={18} />
          Architect New Module
        </button>
      </div>

      {/* Search/Filter Bar */}
      <div style={{ ...cardStyle, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
        <CornerAccents />
        <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(195,244,0,0.4)' }} />
          <input
            type="text"
            placeholder="Search through archives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="register-input"
            style={{ width: '100%', paddingLeft: 40, height: 42, fontSize: 11 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="code-label" style={{ fontSize: 9, opacity: 0.4 }}>FILTER BY:</span>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="register-btn" 
            style={{ 
              width: 'auto', 
              padding: '0 20px', 
              fontSize: 10, 
              height: 42, 
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              outline: 'none'
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat} style={{ background: '#0D0E12', color: '#fff' }}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: 80 }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#c3f400' }} />
          </div>
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{ ...cardStyle, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <CornerAccents />
              
              {/* Thumbnail Container */}
              <div style={{ height: 180, position: 'relative', overflow: 'hidden', background: '#0a0f1a' }}>
                <img
                  src={course.thumbnail_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${course.id}`}
                  alt={course.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0D0E12, transparent 70%)' }} />
                
                {/* Status Badge */}
                <div style={{ position: 'absolute', top: 14, left: 14 }}>
                  <span 
                    onClick={() => handleStatusToggle(course)}
                    className="code-label" style={{
                      padding: '4px 10px', fontSize: 9,
                      background: course.status === 'published' ? 'rgba(74,222,128,0.1)' : 'rgba(251,146,60,0.1)',
                      border: `1px solid ${course.status === 'published' ? 'rgba(74,222,128,0.3)' : 'rgba(251,146,60,0.3)'}`,
                      color: course.status === 'published' ? '#4ade80' : '#fb923c',
                      cursor: 'pointer',
                      borderRadius: 2
                    }}>
                    {(course.status || 'DRAFT').toUpperCase()}
                  </span>
                </div>

                {/* Quick Actions */}
                <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 8 }}>
                  <button 
                    onClick={() => handleCopyLink(course.id)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: 6, color: '#fff', cursor: 'pointer', borderRadius: 4 }}
                    title="Copy Share Link"
                  >
                    <Copy size={12} />
                  </button>
                  <button 
                    onClick={() => handleDelete(course.id)}
                    style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', padding: 6, color: '#f87171', cursor: 'pointer', borderRadius: 4 }}
                    title="Decommission Course"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Course Info */}
              <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="code-label" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, marginBottom: 8 }}>{course.category?.toUpperCase() || 'UNCLASSIFIED'}</div>
                <h3 className="font-headline" style={{ color: '#fff', fontSize: 16, marginBottom: 12, lineHeight: 1.3 }}>{course.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: 1.5, marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {course.description || "No description provided for this protocol module."}
                </p>

                {/* Micro Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24, padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#c3f400', fontSize: 15, fontWeight: 'bold', fontFamily: 'Space Grotesk' }}>{course.students_count}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>Enrolled</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#fff', fontSize: 15, fontWeight: 'bold', fontFamily: 'Space Grotesk' }}>{course.modules_count}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>Modules</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#fff', fontSize: 15, fontWeight: 'bold', fontFamily: 'Space Grotesk' }}>{course.lessons_count}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>Lessons</div>
                  </div>
                </div>

                {/* Primary Actions */}
                <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                  <button 
                    onClick={() => navigate(`/instructor/builder?edit=${course.id}`)}
                    className="register-btn"
                    style={{ flex: 1.5, padding: '10px 0', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <Edit size={14} />
                    MANAGE ARCHITECTURE
                  </button>
                  <button 
                    onClick={() => navigate(`/student/course/${course.id}`)}
                    style={{ 
                      flex: 1, 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid rgba(255,255,255,0.08)', 
                      color: '#fff',
                      fontSize: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      borderRadius: 4,
                      transition: 'all 0.2s',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '0.05em'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  >
                    <Eye size={14} />
                    PREVIEW
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', border: '1px dashed rgba(255,255,255,0.1)', padding: 100, textAlign: 'center', background: 'rgba(255,255,255,0.01)' }}>
            <Layers size={48} style={{ color: 'rgba(255,255,255,0.1)', margin: '0 auto 24px' }} />
            <h4 style={{ color: '#fff', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 2 }}>Empty Repository</h4>
            <p className="code-label" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>No active modules found matching your current parameters.</p>
            <button 
              className="register-btn" 
              style={{ width: 'auto', margin: '32px auto 0', padding: '12px 24px' }} 
              onClick={() => { setSearchQuery(''); setCategoryFilter('All'); }}
            >
              Reset Protocols
            </button>
          </div>
        )}
      </div>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .register-input::placeholder { color: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
};

export default MyCourses;
