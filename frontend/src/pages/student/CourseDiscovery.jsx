import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Grid, List as ListIcon, 
  Play, BookOpen, Clock, Star, 
  ChevronRight, Trophy, Sparkles,
  Loader2, PlusCircle, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { useAuth } from '../../context/AuthContext';
import { CourseService } from '../../services/CourseService';
import { toast } from 'react-hot-toast';

const CourseDiscovery = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { currentTheme } = useStudentTheme();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Fetch all available courses
        const availableData = await CourseService.getAvailableCourses(profile?.college_id);
        
        // Fetch enrolled courses to mark them
        const enrolledData = await CourseService.getEnrolledCourses(user.id);
        const ids = new Set(enrolledData.map(e => e.course_id));
        
        setCourses(availableData || []);
        setEnrolledIds(ids);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error("Failed to sync with course matrix.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, profile]);

  const handleEnroll = async (courseId) => {
    if (!user) return;
    setEnrollingId(courseId);
    try {
      await CourseService.enrollInCourse(user.id, courseId);
      setEnrolledIds(prev => new Set([...prev, courseId]));
      toast.success("Successfully synchronized with mission track!");
      
      // Optional: Redirect to course player after enrollment
      setTimeout(() => navigate(`/student/course/${courseId}`), 1000);
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error("Failed to initialize enrollment sequence.");
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[var(--st-color-primary)] animate-spin" />
        <p className="text-on-surface-variant/40 font-headline font-bold text-[10px] uppercase tracking-[0.2em]">Accessing Course Matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-white/5 text-[var(--st-color-primary)] font-headline font-bold text-[9px] uppercase tracking-[0.2em]">
            <Sparkles size={14} />
            Discovery Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white">Explore <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_10px_var(--st-color-glow)]">New Missions</span></h1>
          <p className="text-on-surface-variant/60 font-medium text-lg">Initialize your next high-fidelity learning sequence from our global archive.</p>
        </div>
        
        <button 
          onClick={() => navigate('/student/dashboard')}
          className="btn-outline !rounded-2xl px-6 py-3 !text-[10px]"
        >
          <ChevronRight size={14} className="rotate-180" />
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-6 p-1 bg-white/[0.01] rounded-[24px]">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--st-color-primary)] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search mission parameters (Title, Category...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-card border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 transition-all placeholder:text-white/10"
          />
        </div>
        <div className="flex items-center glass-panel border-white/5 rounded-2xl overflow-hidden p-1">
          <button className="p-3.5 text-[var(--st-color-primary)] bg-[var(--st-color-primary)]/10 rounded-xl">
            <Grid size={20} />
          </button>
          <button className="p-3.5 text-on-surface-variant/30 hover:text-white transition-colors">
            <ListIcon size={20} />
          </button>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div 
              key={course.id} 
              className="glass-panel rounded-[32px] border-white/5 overflow-hidden flex flex-col group hover:border-[var(--st-color-primary)]/30 transition-all shadow-2xl relative"
            >
              <div className="absolute inset-0 circuit-bg opacity-0 group-hover:opacity-[0.03] transition-opacity -z-10"></div>
              
              <div className="relative h-56 overflow-hidden">
                <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop'} alt={course.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-[#051424]/20 to-transparent opacity-90"></div>
                
                <div className="absolute top-5 left-5">
                  <span className="text-[9px] font-headline font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl backdrop-blur-xl border bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {course.category}
                  </span>
                </div>

                <div className="absolute top-5 right-5">
                  <span className="text-[9px] font-headline font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg backdrop-blur-xl border border-white/10 bg-white/5 text-white/60">
                    {course.level}
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 flex gap-2">
                  <span className={`text-[10px] font-headline font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg backdrop-blur-xl border shadow-lg ${
                    !course.price || course.price === 0
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/5'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-amber-500/5'
                  }`}>
                    {!course.price || course.price === 0 ? 'FREE' : `$${course.price}`}
                  </span>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col space-y-6">
                <div className="space-y-3">
                  <h3 className="font-headline font-bold text-xl leading-tight text-white group-hover:text-[var(--st-color-primary)] transition-colors line-clamp-2 tracking-tight">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 bg-white/5">
                       <img src={course.instructor?.avatar_url || `https://ui-avatars.com/api/?name=${course.instructor?.full_name || 'Instructor'}&background=random`} alt="" />
                    </div>
                    <span className="text-xs font-bold text-on-surface-variant/40">{course.instructor?.full_name || 'Expert Instructor'}</span>
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-yellow-500/80 font-bold">
                      <Star size={14} fill="currentColor" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-on-surface-variant/60 line-clamp-2 font-medium leading-relaxed">
                  {course.description || "Initialize this module to explore advanced architectural concepts and deployment strategies."}
                </p>

                <div className="pt-4 mt-auto">
                  {enrolledIds.has(course.id) ? (
                    <button 
                      onClick={() => navigate(`/student/course/${course.id}`)}
                      className="w-full btn-outline flex items-center justify-center gap-2 py-4 !rounded-2xl border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/5 transition-all"
                    >
                      <CheckCircle2 size={18} />
                      <span className="text-[10px] font-headline font-bold uppercase tracking-widest">Already Synchronized</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        if (course.price > 0) {
                          navigate(`/student/checkout?courseId=${course.id}`, { state: { course } });
                        } else {
                          handleEnroll(course.id);
                        }
                      }}
                      disabled={enrollingId === course.id}
                      className="w-full btn-primary flex items-center justify-center gap-2 py-4 !rounded-2xl shadow-[0_0_20px_var(--st-color-glow)] hover:shadow-[0_0_40px_var(--st-color-glow)] transition-all"
                    >
                      {enrollingId === course.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <PlusCircle size={18} />
                      )}
                      <span className="text-[10px] font-headline font-bold uppercase tracking-widest">
                        {course.price > 0 ? `Unlock Mission ($${course.price})` : 'Initialize Mission (FREE)'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center glass-panel rounded-[40px] border-white/5 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto text-on-surface-variant/20">
              <Search size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-headline font-bold text-white uppercase tracking-wider">No Missions Found</h3>
              <p className="text-on-surface-variant/40 max-w-sm mx-auto text-sm leading-relaxed">
                We couldn't find any courses matching your search in the current sector.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDiscovery;
