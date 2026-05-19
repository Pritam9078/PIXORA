import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Grid, List as ListIcon, 
  Play, BookOpen, Clock, Star, 
  ChevronRight, MoreVertical, Trophy, Sparkles,
  Loader2, Zap, Target, TrendingUp, History,
  Compass, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { useAuth } from '../../context/AuthContext';
import { CourseService } from '../../services/CourseService';
import AnalyticsDashboard from '../../components/student/AnalyticsDashboard';
import { RealtimeService } from '../../services/RealtimeService';
import { formatDistanceToNow } from 'date-fns';

const MyCourses = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { currentTheme } = useStudentTheme();
  const [activeFilter, setActiveFilter] = useState('all');
  const [courses, setCourses] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('missions'); // 'missions' | 'intelligence'
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completedCount: 0,
    avgProgress: 0,
    xp: 0,
    streak: 0
  });
  const [lastLesson, setLastLesson] = useState(null);

  const fetchData = async () => {
    if (!user || !profile) return;
    try {
      setLoading(true);
      const userTrack = profile?.track || (profile?.learning_track ? profile.learning_track.toUpperCase() : null);
      const [enrolledData, statsData, resumeData, availableData] = await Promise.all([
        CourseService.getEnrolledCourses(user.id),
        CourseService.getStudentLearningStats(user.id),
        CourseService.getContinueLearning(user.id),
        CourseService.getAvailableCourses(profile?.college_id, userTrack)
      ]);
      
      setCourses(enrolledData);
      setStats(statsData);
      setLastLesson(resumeData);

      // Filter recommended (courses not enrolled in)
      const enrolledIds = new Set(enrolledData.map(e => e.course_id));
      const recommended = availableData.filter(c => !enrolledIds.has(c.id)).slice(0, 3);
      setRecommendedCourses(recommended);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime progress updates
    const progressChannel = RealtimeService.subscribeToProgress(user?.id, fetchData);
    
    return () => {
      RealtimeService.unsubscribe(progressChannel);
    };
  }, [user, profile]);

  const filteredCourses = courses.filter(item => {
    const matchesSearch = item.course?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' 
      ? true 
      : activeFilter === 'completed' 
        ? item.progress >= 100 
        : item.progress < 100 && item.progress > 0;
    
    return matchesSearch && matchesFilter;
  });

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-[var(--st-color-primary)]/20 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-[var(--st-color-primary)] animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-[var(--st-color-primary)] font-headline font-bold text-xs uppercase tracking-[0.2em] animate-pulse">Establishing Secure Uplink...</p>
          <p className="text-white/40 text-[10px] uppercase tracking-widest">Synchronizing Neural Archives</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 py-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[800px] h-[800px] bg-[var(--st-color-primary)] opacity-[0.02] blur-[120px] rounded-full"></div>
      </div>

      {/* 1. ENTERPRISE ANALYTICS HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel border-white/5 text-[var(--st-color-primary)] font-headline font-bold text-[10px] uppercase tracking-[0.2em] shadow-[0_0_15px_var(--st-color-glow)]">
            <div className="w-2 h-2 rounded-full bg-[var(--st-color-primary)] animate-pulse"></div>
            Operational Status: Online
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-headline font-bold text-white tracking-tight leading-none">
              Welcome, <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_15px_var(--st-color-glow)]">{userName}</span>
            </h1>
            <p className="text-on-surface-variant/60 text-lg font-medium max-w-lg leading-relaxed">
              Your neural pathways are primed. You have {courses.filter(c => c.progress < 100).length} active missions requiring your attention.
            </p>
          </div>

          {/* TAB SWITCHER */}
          <div className="flex gap-1 p-1.5 bg-white/[0.03] rounded-2xl border border-white/5 w-fit backdrop-blur-xl">
            {[
              { id: 'missions', label: 'Active Missions', icon: <Grid size={16} /> },
              { id: 'intelligence', label: 'Intelligence Matrix', icon: <TrendingUp size={16} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-headline font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[var(--st-color-primary)] text-black shadow-[0_0_15px_var(--st-color-glow)]' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <div className="glass-panel p-6 rounded-[24px] border-white/5 flex flex-col justify-between hover:border-[var(--st-color-primary)]/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <Zap size={48} />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Zap size={20} />
              </div>
              <div className="text-right">
                <p className="text-[9px] font-headline font-black text-on-surface-variant/30 uppercase tracking-widest mb-1">Streak</p>
                <p className="text-xl font-headline font-bold text-white tracking-tight">{stats.streak} <span className="text-[10px] text-white/40">Days</span></p>

              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
              <div className="h-full bg-orange-500 w-2/3 shadow-[0_0_10px_rgba(249,115,22,0.4)] rounded-full"></div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-[24px] border-white/5 flex flex-col justify-between hover:border-[var(--st-color-primary)]/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <Sparkles size={48} />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 rounded-xl bg-[var(--st-color-primary)]/10 text-[var(--st-color-primary)] border border-[var(--st-color-primary)]/20">
                <Sparkles size={20} />
              </div>
              <div className="text-right">
                <p className="text-[9px] font-headline font-black text-on-surface-variant/30 uppercase tracking-widest mb-1">Experience</p>
                <p className="text-xl font-headline font-bold text-white tracking-tight">{stats.xp} <span className="text-[10px] text-white/40">XP</span></p>

              </div>
            </div>
            <div className="mt-4 flex gap-1 relative z-10">
              {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 3 ? 'bg-[var(--st-color-primary)] shadow-[0_0_8px_var(--st-color-glow)]' : 'bg-white/5'}`}></div>)}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-[24px] border-white/5 flex flex-col justify-between hover:border-[var(--st-color-primary)]/30 transition-all duration-500 group col-span-2 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <TrendingUp size={64} />
            </div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <TrendingUp size={28} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-end">
                  <p className="text-[9px] font-headline font-black text-on-surface-variant/40 uppercase tracking-widest">Global Completion Matrix</p>
                  <p className="text-xl font-headline font-bold text-white">{stats.avgProgress}%</p>

                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.avgProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                  ></motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTINUE LEARNING SECTION */}
      {lastLesson && (
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <div className="p-2 rounded-xl bg-[var(--st-color-primary)]/10 text-[var(--st-color-primary)]">
              <History size={20} />
            </div>
            <h2 className="text-xl font-headline font-bold text-white uppercase tracking-widest">Resume Deployment</h2>
          </div>
          
          <div 
            className="group relative overflow-hidden glass-panel rounded-[40px] border-white/10 hover:border-[var(--st-color-primary)]/30 transition-all duration-500 cursor-pointer shadow-2xl"
            onClick={() => navigate(`/student/course/${lastLesson.lesson?.course_id || lastLesson.course_id}`)}
          >
            <div className="absolute inset-0 bg-[var(--st-color-primary)] opacity-0 group-hover:opacity-[0.02] transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#051424] via-[#051424]/90 to-transparent z-10"></div>
            
            <div className="relative z-20 flex flex-col md:flex-row items-center gap-10 p-10">
              <div className="w-full md:w-80 h-48 rounded-3xl overflow-hidden relative shadow-2xl border border-white/10">
                <img src={lastLesson.lesson?.course?.thumbnail_url || lastLesson.course?.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/30 transition-all">
                  <div className="w-16 h-16 rounded-full bg-[var(--st-color-primary)] text-black flex items-center justify-center shadow-[0_0_30px_var(--st-color-glow)] group-hover:scale-110 transition-transform">
                    <Play size={28} fill="currentColor" className="ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                  <span className="text-[10px] font-bold text-white tracking-wider">RESUME</span>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-headline font-black text-[var(--st-color-primary)] uppercase tracking-[0.3em]">Last Accessed Objective</p>
                    {lastLesson.last_accessed_at && (
                      <span className="text-[10px] text-white/30">• {formatDistanceToNow(new Date(lastLesson.last_accessed_at), { addSuffix: true })}</span>
                    )}
                  </div>
                  <h3 className="text-3xl font-headline font-bold text-white leading-tight tracking-tight">{lastLesson.lesson?.title || lastLesson.course?.title || 'System Core'}</h3>
                  <p className="text-on-surface-variant/50 font-medium text-lg">Course: {lastLesson.lesson?.course?.title || lastLesson.course?.title}</p>
                </div>
                
                <div className="flex items-center gap-10 bg-white/[0.02] p-4 rounded-2xl border border-white/5 w-fit">
                  <div className="space-y-1">
                    <p className="text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest">Current Progress</p>
                    <p className="text-2xl font-headline font-bold text-white">{lastLesson.completion_percentage || lastLesson.progress || 0}%</p>
                  </div>
                  <div className="h-10 w-px bg-white/10"></div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest">Est. Time Left</p>
                    <p className="text-2xl font-headline font-bold text-white">45m</p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto mt-6 md:mt-0">
                <button className="w-full md:w-auto btn-primary px-10 py-5 shadow-[0_0_30px_var(--st-color-glow)] group-hover:px-12 transition-all flex items-center justify-center gap-3 text-sm">
                  Initialize Link <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CONDITIONAL RENDERING BASED ON ACTIVE TAB */}
      <AnimatePresence mode="wait">
        {activeTab === 'missions' ? (
          <motion.div
            key="missions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-16"
          >
            {/* 3. SEARCH & MATRIX FILTERS */}
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 px-2">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <Grid size={20} className="text-white/60" />
                  </div>
                  <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-wider">Mission Catalog</h2>
                  <span className="px-4 py-1.5 rounded-xl bg-[var(--st-color-primary)]/10 text-[var(--st-color-primary)] text-[10px] font-headline font-black uppercase tracking-widest border border-[var(--st-color-primary)]/20 shadow-[0_0_10px_var(--st-color-glow)]">
                    {filteredCourses.length} Active
                  </span>
                </div>

                <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl border-white/5 bg-white/[0.02]">
                  {['all', 'in-progress', 'completed'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`px-8 py-3.5 rounded-xl text-[10px] font-headline font-bold uppercase tracking-wider transition-all ${
                        activeFilter === f 
                          ? 'bg-[var(--st-color-primary)] text-black shadow-[0_0_15px_var(--st-color-glow)]' 
                          : 'text-on-surface-variant/40 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {f.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 p-2 bg-white/[0.02] rounded-[32px] border border-white/5 shadow-inner">
                <div className="relative flex-1 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[var(--st-color-primary)] transition-colors" size={22} />
                  <input 
                    type="text" 
                    placeholder="Search neural archives by designation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none py-5 pl-16 pr-8 text-base font-medium text-white focus:outline-none focus:ring-0 transition-all placeholder:text-white/20"
                  />
                </div>
                <div className="hidden sm:block w-px bg-white/10 my-2"></div>
                <button className="px-8 rounded-2xl text-xs font-headline font-bold uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                  <Filter size={18} />
                  Filters
                </button>
              </div>

              {/* 4. COURSE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredCourses.map((enrollment) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={enrollment.id} 
                      className="glass-panel rounded-[32px] border-white/5 overflow-hidden flex flex-col group hover:border-[var(--st-color-primary)]/40 hover:shadow-[0_0_30px_rgba(var(--st-color-primary-rgb),0.1)] transition-all duration-500 cursor-pointer"
                      onClick={() => navigate(`/student/course/${enrollment.course_id}`)}
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img src={enrollment.course.thumbnail_url} alt={enrollment.course.title} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-transparent to-transparent"></div>
                        
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                          <span className="text-[9px] font-headline font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg backdrop-blur-md border bg-black/40 text-white/80 border-white/10 shadow-lg">
                            {enrollment.course.category}
                          </span>
                          <button className="p-2 rounded-xl backdrop-blur-md bg-black/40 border border-white/10 text-white/50 hover:text-white hover:bg-white/20 transition-all">
                            <MoreVertical size={16} />
                          </button>
                        </div>

                        {enrollment.progress === 100 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                            <div className="bg-[var(--st-color-primary)] text-black px-6 py-3 rounded-full font-headline font-black uppercase tracking-widest text-sm flex items-center gap-2 shadow-[0_0_30px_var(--st-color-glow)]">
                              <Trophy size={18} />
                              Certified
                            </div>
                          </div>
                        )}
                        
                        {enrollment.progress < 100 && (
                          <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--st-color-primary)] text-black flex items-center justify-center shadow-[0_0_20px_var(--st-color-glow)] hover:scale-110 transition-transform">
                              <Play size={20} fill="currentColor" className="ml-1" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6 flex-1 flex flex-col space-y-5 bg-[#051424]">
                        <div className="space-y-3">
                          <h3 className="font-headline font-bold text-xl leading-snug text-white group-hover:text-[var(--st-color-primary)] transition-colors line-clamp-2 tracking-tight">
                            {enrollment.course.title}
                          </h3>
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10">
                              <img src={enrollment.course.instructor?.avatar_url || `https://ui-avatars.com/api/?name=${enrollment.course.instructor?.full_name || 'Instructor'}&background=random`} alt="" />
                            </div>
                            <span className="text-xs font-bold text-on-surface-variant/50">{enrollment.course.instructor?.full_name || 'Expert Instructor'}</span>
                          </div>
                        </div>

                        <div className="mt-auto space-y-4">
                          <div className="flex justify-between items-end">
                            <div className="space-y-1">
                               <p className="text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest">Progress</p>
                               <p className="text-lg font-headline font-black text-white">{enrollment.progress}%</p>
                            </div>
                            {enrollment.updated_at && (
                               <div className="text-right space-y-1">
                                  <p className="text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest">Last Sync</p>
                                  <p className="text-xs font-bold text-white/60">{formatDistanceToNow(new Date(enrollment.updated_at), { addSuffix: true })}</p>
                               </div>
                            )}
                          </div>
                          
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${enrollment.progress}%` }}
                              className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.2)] ${
                                enrollment.progress === 100 ? 'bg-yellow-500' : 'bg-gradient-to-r from-[var(--st-color-primary)]/50 to-[var(--st-color-primary)]'
                              }`}
                            ></motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredCourses.length === 0 && (
                  <div className="col-span-full py-32 text-center glass-panel rounded-[40px] border-white/5 space-y-8">
                    <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto text-on-surface-variant/10">
                      <BookOpen size={48} />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-headline font-bold text-white uppercase tracking-[0.2em]">Matrix Empty</h3>
                      <p className="text-on-surface-variant/40 max-w-md mx-auto text-lg font-medium leading-relaxed">
                        No active learning threads matching your parameters.
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate('/student/courses')}
                      className="btn-primary px-10 py-4 shadow-[0_0_30px_var(--st-color-glow)]"
                    >
                      Browse Catalog
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 5. RECOMMENDED COURSES */}
            {recommendedCourses.length > 0 && (
              <div className="space-y-8 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4 px-2">
                  <div className="p-2 rounded-xl bg-[var(--st-color-primary)]/10 text-[var(--st-color-primary)]">
                    <Compass size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-headline font-bold text-white uppercase tracking-widest">Recommended Deployment</h2>
                    <p className="text-xs text-white/40 mt-1">Based on your current skill matrix</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendedCourses.map(course => (
                    <div key={course.id} onClick={() => navigate(`/student/courses/${course.id}`)} className="glass-panel p-4 rounded-[24px] border-white/5 hover:border-[var(--st-color-primary)]/30 transition-all cursor-pointer flex gap-4 group">
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                        <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                      </div>
                      <div className="flex flex-col justify-center space-y-2">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--st-color-primary)]">{course.category}</span>
                        <h4 className="text-sm font-bold text-white group-hover:text-[var(--st-color-primary)] transition-colors line-clamp-2">{course.title}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-white/40 font-bold">
                          <Clock size={12} />
                          <span>Level {course.level || '01'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="intelligence"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AnalyticsDashboard data={stats} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyCourses;
