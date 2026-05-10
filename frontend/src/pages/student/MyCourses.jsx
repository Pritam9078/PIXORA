import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Grid, List as ListIcon, 
  Play, BookOpen, Clock, Star, 
  ChevronRight, MoreVertical, Trophy, Sparkles,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { useAuth } from '../../context/AuthContext';
import { CourseService } from '../../services/CourseService';

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTheme } = useStudentTheme();
  const [activeFilter, setActiveFilter] = useState('all');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await CourseService.getEnrolledCourses(user.id);
        setCourses(data);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  const filteredCourses = courses.filter(item => {
    const matchesSearch = item.course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' 
      ? true 
      : activeFilter === 'completed' 
        ? item.progress === 100 
        : item.progress < 100 && item.progress > 0;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[var(--st-color-primary)] animate-spin" />
        <p className="text-on-surface-variant/40 font-headline font-bold text-[10px] uppercase tracking-[0.2em]">Synchronizing Archive...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-white/5 text-[var(--st-color-primary)] font-headline font-bold text-[9px] uppercase tracking-[0.2em]">
            <BookOpen size={14} />
            Mission Archives
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white">My Learning <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_10px_var(--st-color-glow)]">Catalog</span></h1>
          <p className="text-on-surface-variant/60 font-medium">Continue your high-fidelity mastery journey and deploy new skills.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl border-white/5 bg-white/[0.02]">
          {['all', 'in-progress', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-headline font-bold uppercase tracking-wider transition-all ${
                activeFilter === f 
                  ? 'bg-[var(--st-color-primary)] text-black shadow-[0_0_15px_var(--st-color-glow)]' 
                  : 'text-on-surface-variant/40 hover:text-white'
              }`}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-6 p-1 bg-white/[0.01] rounded-[24px]">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--st-color-primary)] transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search mission parameters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-card border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 transition-all placeholder:text-white/10"
          />
        </div>
        <button className="btn-outline flex items-center justify-center gap-3 px-8 group">
          <Filter size={18} className="text-white/40 group-hover:text-[var(--st-color-primary)] transition-colors" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-widest">Filter Matrix</span>
        </button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((enrollment) => (
            <div 
              key={enrollment.id} 
              className="glass-panel rounded-[32px] border-white/5 overflow-hidden flex flex-col group hover:border-[var(--st-color-primary)]/30 transition-all cursor-pointer shadow-2xl relative"
              onClick={() => navigate(`/student/course/${enrollment.course_id}`)}
            >
              <div className="absolute inset-0 circuit-bg opacity-0 group-hover:opacity-[0.03] transition-opacity -z-10"></div>
              
              <div className="relative h-56 overflow-hidden">
                <img src={enrollment.course.thumbnail_url} alt={enrollment.course.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-[#051424]/20 to-transparent opacity-90"></div>
                
                <div className="absolute top-5 left-5">
                  <span className="text-[9px] font-headline font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl backdrop-blur-xl border bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {enrollment.course.category}
                  </span>
                </div>

                <div className="absolute bottom-6 right-6 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--st-color-primary)] text-black flex items-center justify-center shadow-[0_0_30px_var(--st-color-glow)]">
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col space-y-6">
                <div className="space-y-3">
                  <h3 className="font-headline font-bold text-xl leading-tight text-white group-hover:text-[var(--st-color-primary)] transition-colors line-clamp-2 tracking-tight">
                    {enrollment.course.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10">
                       <img src={enrollment.course.instructor?.avatar_url || `https://ui-avatars.com/api/?name=${enrollment.course.instructor?.full_name || 'Instructor'}&background=random`} alt="" />
                    </div>
                    <span className="text-xs font-bold text-on-surface-variant/40">{enrollment.course.instructor?.full_name || 'Expert Instructor'}</span>
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-yellow-500/80 font-bold">
                      <Star size={14} fill="currentColor" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-auto bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center text-[9px] font-headline font-black uppercase tracking-[0.2em]">
                    <span className="text-[var(--st-color-primary)]">{enrollment.progress}% SYNCHRONIZED</span>
                    <span className="text-on-surface-variant/30">ACTIVE MISSION</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[var(--st-color-primary)]/40 to-[var(--st-color-primary)] rounded-full transition-all duration-1000 shadow-[0_0_10px_var(--st-color-glow)]" 
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-on-surface-variant/30">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span className="text-[10px] font-headline font-bold uppercase tracking-widest">CONTINUE MISSION</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Trophy size={16} className={enrollment.progress === 100 ? "text-yellow-500" : "opacity-20"} />
                     <span className="text-[9px] font-headline font-bold uppercase tracking-[0.2em]">{enrollment.progress === 100 ? 'COMPLETE' : 'ACTIVE'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center glass-panel rounded-[40px] border-white/5 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto text-on-surface-variant/20">
              <BookOpen size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-headline font-bold text-white uppercase tracking-wider">Archive is Empty</h3>
              <p className="text-on-surface-variant/40 max-w-sm mx-auto text-sm leading-relaxed">
                No missions matching your current parameters were found in the neural archives.
              </p>
            </div>
            <button 
              onClick={() => navigate('/student/courses')}
              className="btn-primary px-8"
            >
              Initialize New Mission
            </button>
          </div>
        )}
      </div>

      {/* Recommended Section */}
      <section className="glass-panel p-1 border-white/5 rounded-[40px] shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--st-color-primary)]/[0.03] to-transparent"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--st-color-primary)] opacity-[0.02] blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-[10s]"></div>
        <div className="absolute inset-0 circuit-bg opacity-[0.02]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 p-12">
          <div className="w-24 h-24 rounded-3xl bg-[var(--st-color-primary)]/10 flex items-center justify-center text-[var(--st-color-primary)] flex-shrink-0 shadow-[inset_0_0_20px_rgba(var(--st-color-primary-rgb),0.2)] border border-[var(--st-color-primary)]/20 animate-pulse">
            <Sparkles size={48} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <h3 className="text-2xl md:text-3xl font-headline font-bold text-white tracking-tight">Ascend to the Next Matrix Level</h3>
            <p className="text-on-surface-variant/60 text-lg max-w-2xl font-medium leading-relaxed">
              Complete your active curriculum to unlock exclusive {currentTheme.id.replace('_', ' ')} terminal badges and priority access to elite masterclass modules.
            </p>
          </div>
          <button className="btn-primary px-12 py-5 whitespace-nowrap shadow-[0_0_30px_var(--st-color-glow)]">
            Explore All Missions
          </button>
        </div>
      </section>
    </div>
  );
};

export default MyCourses;
