import React, { useEffect, useState, useRef } from 'react';

import { 
  Play, Clock, Award, TrendingUp, 
  ChevronRight, Calendar, MessageSquare, 
  Zap, Trophy, Target, BookOpen,
  Flame, Gamepad2, Wallet, Loader2,
  PlusCircle, Star, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { CourseService } from '../../services/CourseService';
import { SubmissionService } from '../../services/SubmissionService';
import { QuizService } from '../../services/QuizService';
import { RealtimeService } from '../../services/RealtimeService';
import { supabase } from '../../lib/supabase';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-white/5 text-[var(--st-color-primary)] shadow-inner">
        <Icon size={22} className="group-hover:scale-110 transition-transform" />
      </div>
      {trend && (
        <span className="text-[10px] font-headline font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/10">
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-on-surface-variant/60 font-headline text-[10px] uppercase tracking-[0.2em] mb-1">{title}</h3>
    <p className="text-2xl font-headline font-bold text-white">{value}</p>
    
    {/* Animated Background Pulse */}
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--st-color-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--st-color-primary)]/10 transition-colors"></div>
  </div>
);

const CourseCard = ({ title, instructor, progress, image, category, onResume }) => (
  <div className="glass-card rounded-2xl overflow-hidden group">
    <div className="relative h-44 overflow-hidden">
      <img src={image || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop'} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-transparent to-transparent"></div>
      <div className="absolute top-4 left-4">
        <span className="text-[9px] font-headline font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md text-white px-2 py-1 rounded border border-white/10">
          {category}
        </span>
      </div>
    </div>
    <div className="p-5 space-y-4">
      <div>
        <h3 className="font-headline font-bold text-white text-base leading-snug line-clamp-2 group-hover:text-[var(--st-color-primary)] transition-colors">{title}</h3>
        <p className="text-xs text-on-surface-variant/60 mt-1 font-medium">{instructor}</p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] font-headline font-bold uppercase tracking-wider">
          <span className="text-on-surface-variant/40">Progress</span>
          <span className="text-[var(--st-color-primary)]">{progress}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--st-gradient-primary)] rounded-full transition-all duration-1000 shadow-[0_0_10px_var(--st-color-glow)]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <button onClick={onResume} className="w-full btn-outline py-2.5 !text-xs !rounded-xl group/btn">
        <Play size={14} className="group-hover/btn:fill-current" />
        <span>Resume Mission</span>
      </button>
    </div>
  </div>
);

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { currentTheme } = useStudentTheme();
  
  console.log('--- PIXORA DASHBOARD V3 ---');

  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [learningStats, setLearningStats] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetching = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id || isFetching.current) return;
      
      const safetyTimeout = setTimeout(() => {
        if (mounted.current && isLoading) {
          console.warn('Dashboard: Safety timeout reached, forcing render');
          setIsLoading(false);
        }
      }, 3000);

      try {
        isFetching.current = true;
        setIsLoading(true);
        
        console.log('Dashboard: Initializing data fetch for:', user.id);
        
        // Fetch core data with a race against a timeout to prevent hanging
        const fetchData = async () => {
          try {
            const [coursesData, availableData, assignmentsData, quizzesData, statsData, lastLesson] = await Promise.all([
              CourseService.getEnrolledCourses(user.id).catch(e => { console.warn(e); return []; }),
              profile?.college_id ? CourseService.getAvailableCourses(profile.college_id).catch(e => { console.warn(e); return []; }) : CourseService.getAvailableCourses().catch(e => { console.warn(e); return []; }),
              SubmissionService.getAssignments(user.id).catch(e => { console.warn(e); return []; }),
              QuizService.getQuizzes(user.id).catch(e => { console.warn(e); return []; }),
              CourseService.getStudentLearningStats(user.id).catch(e => { console.warn(e); return null; }),
              CourseService.getContinueLearning(user.id).catch(e => { console.warn(e); return null; })
            ]);
            return { coursesData, availableData, assignmentsData, quizzesData, statsData, lastLesson };
          } catch (e) {
            console.error('Dashboard: Data fetch failed', e);
            return null;
          }
        };

        const result = await fetchData();

        if (mounted.current && result) {
          const { coursesData, availableData, assignmentsData, quizzesData, statsData, lastLesson } = result;
          setEnrolledCourses(coursesData || []);
          setLearningStats(statsData);
          setResumeData(lastLesson);
          
          const enrolledIds = new Set((coursesData || []).map(c => c.course_id));
          const filteredAvailable = (availableData || []).filter(c => !enrolledIds.has(c.id));
          setAvailableCourses(filteredAvailable.slice(0, 3));
          
          setAssignments(assignmentsData || []);
          setQuizzes(quizzesData || []);

          
          if (coursesData && coursesData.length > 0) {
            try {
              const { data: live } = await supabase
                .from('live_classes')
                .select('*')
                .eq('course_id', coursesData[0].course_id)
                .eq('status', 'scheduled')
                .limit(3);
              setLiveClasses(live || []);
            } catch (err) {
              console.warn('Dashboard: Live classes fetch failed', err);
            }
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        clearTimeout(safetyTimeout);
        if (mounted.current) {
          setIsLoading(false);
          isFetching.current = false;
        }
      }
    };

    loadDashboardData();
  }, [user?.id, profile?.id]);

  // --- Real-time Subscriptions ---
  useEffect(() => {
    if (!user?.id || enrolledCourses.length === 0) return;

    console.log('Dashboard: Initializing real-time synchronization...');
    
    // 1. Subscribe to progress updates
    const progressSub = RealtimeService.subscribeToProgress(user.id, (payload) => {
      console.log('Dashboard: Progress update received', payload);
      // Refresh only the affected course if possible, or reload all
      setEnrolledCourses(prev => prev.map(c => 
        c.id === payload.new.id ? { ...c, ...payload.new } : c
      ));
    });

    // 2. Subscribe to all course-related changes
    const courseIds = enrolledCourses.map(c => c.course_id);
    const multiSub = RealtimeService.subscribeToAllCourses(courseIds, (payload) => {
      console.log('Dashboard: Course update received', payload);
      // For curriculum/assessment changes, we usually want to refresh relevant states
      // but for now we'll just log and let the user know data is fresh.
    });

    return () => {
      RealtimeService.unsubscribe(progressSub);
      multiSub.unsubscribe();
    };
  }, [user?.id, enrolledCourses.length]);





  const isGameDev = currentTheme.id === 'game_dev';
  const isBlockchain = currentTheme.id === 'blockchain';

  const level = Math.floor((profile?.xp_points || 0) / 1000) + 1;
  const nextLevelXP = level * 1000;
  const currentLevelXP = profile?.xp_points || 0;
  const levelProgress = ((currentLevelXP % 1000) / 1000) * 100;

  const stats = [
    { title: 'Enrolled Tracks', value: (learningStats?.totalEnrolled || 0).toString().padStart(2, '0'), icon: BookOpen, color: 'var(--st-color-primary)' },
    { title: 'Knowledge XP', value: (learningStats?.xp || 0).toLocaleString(), icon: Zap, color: 'var(--st-color-primary)' },
    { title: 'Learning Streak', value: `${learningStats?.streak || 0} Days`, icon: Flame, color: 'var(--st-color-primary)' },
    { title: 'Pending Tasks', value: assignments.filter(a => !a.mySubmission).length.toString().padStart(2, '0'), icon: Target, color: 'var(--st-color-primary)' },
  ];



  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Premium Welcome Header */}
      <section className="relative glass-panel rounded-3xl overflow-hidden border-white/5">
        <div className="absolute inset-0 bg-[var(--st-gradient-surface)] opacity-40"></div>
        <div className="absolute inset-0 circuit-bg opacity-20"></div>
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--st-color-primary)] animate-pulse shadow-[0_0_8px_var(--st-color-glow)]"></span>
              <span className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Systems Operational</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-white mb-4 leading-tight">
              Welcome back, <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_15px_var(--st-color-glow)]">{profile?.full_name?.split(' ')[0] || 'Explorer'}</span>
            </h1>
            <p className="text-on-surface-variant/80 text-base md:text-lg mb-8 leading-relaxed font-body">
              {isGameDev 
                ? "Your engine builds are synchronized and the creative pipeline is active. Ready to forge another world?"
                : isBlockchain 
                  ? "The blocks are confirming and your protocol nodes are stable. Let's engineer the decentralized future."
                  : "Your academic sequence is performing optimally. Continue your progress to maintain system dominance."}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button 
                onClick={() => resumeData ? navigate(`/student/course/${resumeData.course_id}?lesson=${resumeData.lesson_id}`) : navigate('/student/courses')}
                className="btn-primary !px-8"
              >
                <Play size={18} fill="currentColor" />
                <span>{resumeData ? 'Jump Back In' : 'Start Mission'}</span>
              </button>
              <button 
                onClick={() => navigate('/student/community')}
                className="btn-outline !px-8"
              >
                <Calendar size={18} />
                <span>Sync Community</span>
              </button>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
            <div className="w-64 h-64 relative group">
              <div className="absolute inset-0 bg-[var(--st-color-primary)]/10 rounded-full blur-[80px] animate-pulse"></div>
              <div className="relative z-10 w-full h-full glass-card rounded-full flex items-center justify-center border-white/10">
                {isGameDev ? (
                  <Gamepad2 size={100} className="text-[var(--st-color-primary)] drop-shadow-[0_0_20px_var(--st-color-glow)]" />
                ) : (
                  <Wallet size={100} className="text-[var(--st-color-primary)] drop-shadow-[0_0_20px_var(--st-color-glow)]" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} trend={12} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-10">
        {/* Main Content: Courses */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <div>
              <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Active Tracks</span>
              <h2 className="text-2xl font-headline font-bold text-white mt-1">Continue Learning</h2>
            </div>
            <button 
              onClick={() => navigate('/student/courses')}
              className="text-[10px] font-headline font-bold text-on-surface-variant/60 hover:text-[var(--st-color-primary)] flex items-center gap-1 transition-all uppercase tracking-widest"
            >
              Explore All <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.slice(0, 2).map((enrollment) => (
                <CourseCard 
                  key={enrollment.id}
                  title={enrollment.course?.title}
                  instructor={enrollment.course?.instructor?.full_name || 'Expert Instructor'}
                  progress={enrollment.progress}
                  category={enrollment.course?.category}
                  image={enrollment.course?.thumbnail_url}
                  onResume={() => enrollment.course_id && navigate(`/student/course/${enrollment.course_id}`)}
                />
              ))
            ) : availableCourses.length > 0 ? (
              availableCourses.slice(0, 2).map((course) => (
                <div key={course.id} className="relative group glass-card overflow-hidden hover-glow transition-all duration-500 border-white/5">
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-1 rounded-md bg-[var(--st-color-primary)]/10 border border-[var(--st-color-primary)]/20 text-[8px] font-headline font-bold text-[var(--st-color-primary)] uppercase tracking-wider">Recommended Mission</span>
                  </div>
                  <div className="aspect-video relative overflow-hidden">
                    <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60'} alt={course.title} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-110 group-hover:scale-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-headline font-bold text-white group-hover:text-[var(--st-color-primary)] transition-colors">{course.title}</h3>
                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant/60 font-headline uppercase tracking-widest">
                      <span>{course.category || 'Tech'}</span>
                      <button onClick={() => navigate('/student/courses')} className="text-[var(--st-color-primary)] hover:underline">Enroll Now</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 glass-card p-10 text-center space-y-4 border-dashed border-white/5 bg-white/[0.01]">
                <BookOpen size={40} className="mx-auto text-on-surface-variant/10" />
                <p className="text-on-surface-variant/40 font-headline text-[10px] uppercase tracking-[0.2em]">No active sequences detected.</p>
                <button onClick={() => navigate('/student/courses')} className="btn-primary !px-6 mx-auto !py-2.5 !text-[10px]">Initialize Sequence</button>
              </div>
            )}
          </div>

          {/* New: Featured/Discovery Section in Dashboard */}
          <div className="space-y-8 pt-4">
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
              <div>
                <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Available Missions</span>
                <h2 className="text-2xl font-headline font-bold text-white mt-1">Recommended for You</h2>
              </div>
              <button 
                onClick={() => navigate('/student/courses')}
                className="text-[10px] font-headline font-bold text-on-surface-variant/60 hover:text-[var(--st-color-primary)] flex items-center gap-1 transition-all uppercase tracking-widest"
              >
                Discovery Hub <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {availableCourses.length > 0 ? (
                availableCourses.slice(0, 2).map((course) => (
                  <div 
                    key={course.id}
                    onClick={() => navigate('/student/courses')}
                    className="glass-card rounded-2xl overflow-hidden group cursor-pointer border-white/5 hover:border-[var(--st-color-primary)]/30 transition-all shadow-xl"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop'} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-transparent to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-[var(--st-color-primary)]/20 backdrop-blur-md border border-[var(--st-color-primary)]/30 p-1.5 rounded-lg text-[var(--st-color-primary)]">
                          <PlusCircle size={16} />
                        </div>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[8px] font-headline font-black uppercase tracking-[0.2em] text-[var(--st-color-primary)] mb-1 block">{course.category}</span>
                        <h3 className="font-headline font-bold text-white text-base line-clamp-1 group-hover:text-[var(--st-color-primary)] transition-colors">{course.title}</h3>
                      </div>
                      <p className="text-[10px] text-on-surface-variant/60 line-clamp-2 leading-relaxed">
                        {course.description || "Initialize this module to explore advanced architectural concepts."}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[9px] font-headline font-black uppercase tracking-widest text-[var(--st-color-primary)]">Enroll Now</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-yellow-500/80 font-bold">
                          <Star size={12} fill="currentColor" />
                          <span>4.9</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-10 glass-card text-center border-dashed border-white/5 bg-white/[0.01]">
                   <Sparkles size={32} className="mx-auto text-on-surface-variant/10 mb-4" />
                   <p className="text-on-surface-variant/40 font-headline text-[9px] uppercase tracking-[0.2em]">Scanning for new missions...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-10">
          {/* Upcoming Live Session */}
          <div className="glass-panel rounded-2xl p-6 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container/5 blur-2xl rounded-full"></div>
            <h3 className="font-headline font-bold text-white text-sm mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Calendar size={16} className="text-[var(--st-color-primary)]" />
              Live Directives
            </h3>
            <div className="space-y-4">
              {liveClasses.length > 0 ? (
                liveClasses.map((session) => (
                  <div key={session.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[var(--st-color-primary)]/30 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-headline font-bold text-[var(--st-color-primary)] uppercase tracking-widest">
                        {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h4 className="font-headline font-bold text-white text-sm mb-3 line-clamp-1 group-hover:text-[var(--st-color-primary)] transition-colors">
                      {session.title}
                    </h4>
                    <button className="text-[10px] font-headline font-bold text-white/40 group-hover:text-white transition-colors">JOIN PROTOCOL</button>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-on-surface-variant/40 font-headline uppercase tracking-widest text-center py-4">No scheduled transmissions.</p>
              )}
            </div>
          </div>

          {/* Achievement Progress */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <Trophy className="absolute -top-6 -right-6 text-[var(--st-color-primary)] opacity-5 rotate-12" size={120} />
            <h3 className="font-headline font-bold text-white text-sm mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Target size={16} className="text-[var(--st-color-primary)]" />
              Goal Alignment
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end text-[10px] font-headline font-bold uppercase tracking-widest">
                <div className="space-y-1">
                  <span className="text-on-surface-variant/40 block">Mastery Level</span>
                  <span className="text-white text-lg">LEVEL {level.toString().padStart(2, '0')}</span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-on-surface-variant/40 block">Next Milestone</span>
                  <span className="text-[var(--st-color-primary)] text-lg">{currentLevelXP % 1000} / 1000 XP</span>
                </div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--st-gradient-primary)] rounded-full shadow-[0_0_15px_var(--st-color-glow)] transition-all duration-1000"
                  style={{ width: `${levelProgress}%` }}
                ></div>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                <p className="text-[10px] text-on-surface-variant/60 italic font-medium leading-relaxed">
                  "Only <span className="text-white font-bold">{1000 - (currentLevelXP % 1000)} XP</span> remains to unlock the 
                  <span className="text-[var(--st-color-primary)] font-bold"> Level {(level + 1).toString().padStart(2, '0')}</span> status."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
