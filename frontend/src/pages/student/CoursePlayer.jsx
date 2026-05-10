import React, { useState, useEffect } from 'react';
import { 
  Play, CheckCircle2, ChevronRight, Download, 
  FileText, MessageSquare, Plus, Bookmark, 
  Maximize2, Volume2, Settings as SettingsIcon,
  SkipForward, SkipBack, Lock, Globe,
  ArrowLeft, List, Info, Cpu, Clock, Award,
  Loader2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { CourseService } from '../../services/CourseService';
import { LessonService } from '../../services/LessonService';
import { toast } from 'react-hot-toast';

const CoursePlayer = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();
  const { currentTheme } = useStudentTheme();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const [courseData, completedData] = await Promise.all([
          CourseService.getCourseDetails(courseId),
          LessonService.getCompletedLessons(user.id, courseId)
        ]);
        
        const allLessons = (courseData.modules || []).reduce((acc, m) => {
          return [...acc, ...(m.lessons || [])];
        }, []);
        
        setCourse(courseData);
        setLessons(allLessons);
        setCompletedLessons(completedData);
        
        // Set first uncompleted lesson as current, or just the first one
        const firstUncompleted = allLessons.findIndex(l => !completedData.includes(l.id));
        setCurrentLessonIndex(firstUncompleted !== -1 ? firstUncompleted : 0);
        
      } catch (error) {
        console.error('Error fetching course data:', error);
        toast.error('Failed to load course data');
      } finally {
        setLoading(false);
      }
    };

    if (user && courseId) {
      fetchCourseData();
    }
  }, [courseId, user]);

  const currentLesson = lessons[currentLessonIndex];

  const handleMarkComplete = async () => {
    if (!currentLesson || completing) return;
    
    try {
      setCompleting(true);
      await LessonService.markLessonComplete(user.id, courseId, currentLesson.id);
      setCompletedLessons(prev => [...prev, currentLesson.id]);
      toast.success('Lesson validated and synchronized');
      
      // Move to next lesson if available
      if (currentLessonIndex < lessons.length - 1) {
        setCurrentLessonIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Validation failed');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[var(--st-color-primary)] animate-spin" />
        <p className="text-on-surface-variant/40 font-headline font-bold text-[10px] uppercase tracking-[0.2em]">Initializing Learning Sequence...</p>
      </div>
    );
  }

  if (!course) return <div className="text-white p-20 text-center">Course not found in protocol archives.</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header / Breadcrumbs */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 group text-on-surface-variant/60 hover:text-white transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <ArrowLeft size={16} />
          </div>
          <span className="font-headline font-bold text-[10px] uppercase tracking-[0.2em]">Exit Portal</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 glass-panel rounded-full border-white/5 text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/40">
            <span>Lesson {String(currentLessonIndex + 1).padStart(2, '0')}</span>
            <ChevronRight size={12} className="text-white/10" />
            <span className="text-white">{currentLesson?.title || 'System Core'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* Left Side: Video & Tabs */}
        <div className="flex-1 flex flex-col min-w-0 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
          {/* Video Player Container */}
          <div className="relative aspect-video glass-panel rounded-[32px] overflow-hidden shadow-2xl border-white/5 group ring-1 ring-white/5">
            <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-transparent to-transparent z-10 opacity-60"></div>
            {currentLesson?.content_type === 'video' ? (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <iframe
                  className="w-full h-full"
                  src={currentLesson.content_url?.replace('watch?v=', 'embed/')}
                  title={currentLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <img 
                src={course.thumbnail_url || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop"} 
                className="w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-[2000ms]"
                alt="Lesson Preview"
              />
            )}
            
            {!currentLesson?.content_url && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <button className="w-24 h-24 rounded-full glass-panel border-white/20 text-[var(--st-color-primary)] flex items-center justify-center shadow-[0_0_30px_var(--st-color-glow)] hover:scale-110 transition-all duration-500 group/play">
                  <Play size={36} fill="currentColor" className="ml-2 drop-shadow-[0_0_10px_var(--st-color-glow)]" />
                </button>
              </div>
            )}
          </div>

          {/* Lesson Details & Tabs */}
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
              <div>
                <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em] mb-2 block">Current Transmission</span>
                <h1 className="text-3xl font-headline font-bold text-white tracking-tight">{currentLesson?.title}</h1>
                <p className="text-on-surface-variant/40 text-sm font-medium mt-2 flex items-center gap-2">
                  <Cpu size={14} className="text-[var(--st-color-primary)]" />
                  Course: {course.title}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 mr-4 border-r border-white/5 pr-6">
                  <button 
                    onClick={() => setCurrentLessonIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentLessonIndex === 0}
                    className="w-10 h-10 rounded-xl glass-card border-white/5 flex items-center justify-center text-on-surface-variant/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Previous Lesson"
                  >
                    <SkipBack size={18} />
                  </button>
                  <button 
                    onClick={() => setCurrentLessonIndex(prev => Math.min(lessons.length - 1, prev + 1))}
                    disabled={currentLessonIndex === lessons.length - 1}
                    className="w-10 h-10 rounded-xl glass-card border-white/5 flex items-center justify-center text-on-surface-variant/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Next Lesson"
                  >
                    <SkipForward size={18} />
                  </button>
                </div>
                <button className="w-12 h-12 rounded-2xl glass-card border-white/5 flex items-center justify-center text-on-surface-variant/60 hover:text-[var(--st-color-primary)] hover:border-[var(--st-color-primary)]/30 transition-all">
                  <Bookmark size={20} />
                </button>
                <button 
                  onClick={handleMarkComplete}
                  disabled={completing || completedLessons.includes(currentLesson?.id)}
                  className="btn-primary !px-8 !py-3 !text-xs !rounded-2xl shadow-xl disabled:opacity-50"
                >
                  {completing ? <Loader2 className="animate-spin" size={18} /> : completedLessons.includes(currentLesson?.id) ? <CheckCircle2 size={18} className="text-black" /> : <Play size={18} />}
                  <span>{completedLessons.includes(currentLesson?.id) ? 'Validated' : 'Validate Objective'}</span>
                </button>
              </div>
            </div>

            {/* Premium Tabs */}
            <div className="space-y-8">
              <div className="flex gap-10 border-b border-white/5 px-2">
                {['notes', 'resources', 'discussion'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-5 text-[10px] font-headline font-bold uppercase tracking-[0.25em] transition-all relative ${
                      activeTab === tab ? 'text-[var(--st-color-primary)]' : 'text-on-surface-variant/40 hover:text-white'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--st-color-primary)] shadow-[0_0_10px_var(--st-color-glow)]"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[300px] px-2 pb-10">
                {activeTab === 'notes' && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-[var(--st-gradient-primary)] opacity-0 group-focus-within:opacity-20 rounded-[24px] blur-sm transition-opacity"></div>
                      <textarea 
                        placeholder="Log dynamic system observation..."
                        className="relative w-full bg-[#0d1c2d] border border-white/5 rounded-[24px] p-6 text-sm text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 min-h-[160px] transition-all placeholder:text-white/10 shadow-inner"
                      ></textarea>
                      <button className="absolute bottom-5 right-5 w-12 h-12 rounded-2xl bg-[var(--st-color-primary)] text-black shadow-[0_0_20px_var(--st-color-glow)] flex items-center justify-center hover:scale-110 transition-transform">
                        <Plus size={24} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="col-span-2 py-10 text-center glass-card rounded-[32px] border-white/5 border-dashed">
                      <p className="text-on-surface-variant/40 text-[10px] font-headline font-bold uppercase tracking-widest">No additional technical documentation found for this node.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Course Navigation */}
        <div className="w-full lg:w-[400px] flex flex-col glass-panel border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 bg-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-[var(--st-color-primary)] opacity-5">
               <Award size={100} />
            </div>
            <h3 className="font-headline font-bold text-white text-xs uppercase tracking-[0.2em] flex items-center gap-3 mb-6 relative z-10">
              <List size={16} className="text-[var(--st-color-primary)]" />
              Manifest Grid
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end text-[10px] font-headline font-bold uppercase tracking-widest mb-1.5">
                <span className="text-on-surface-variant/40">Portal Coverage</span>
                <span className="text-white">{Math.round((completedLessons.length / lessons.length) * 100) || 0}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--st-gradient-primary)] rounded-full shadow-[0_0_10px_var(--st-color-glow)] transition-all duration-1000"
                  style={{ width: `${(completedLessons.length / lessons.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.15em]">
                <span>{completedLessons.length} / {lessons.length} OBJECTIVES</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {(course.modules || []).map((module, mIdx) => (
              <div key={module.id} className="border-b border-white/5 last:border-0">
                <div className="px-8 py-4 bg-white/[0.02] flex items-center justify-between">
                  <span className="text-[9px] font-headline font-black text-on-surface-variant/30 uppercase tracking-[0.2em]">Module {mIdx + 1}: {module.title}</span>
                </div>
                {module.lessons?.map((lesson) => {
                  const flatIndex = lessons.findIndex(l => l.id === lesson.id);
                  const isActive = currentLessonIndex === flatIndex;
                  const isCompleted = completedLessons.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonIndex(flatIndex)}
                      className={`w-full flex items-center gap-5 px-8 py-6 transition-all relative group ${
                        isActive ? 'bg-[var(--st-color-primary)]/5' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[var(--st-color-primary)] rounded-r-full shadow-[0_0_15px_var(--st-color-glow)]"></div>
                      )}
                      
                      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                        isCompleted 
                          ? 'bg-[var(--st-color-primary)] border-[var(--st-color-primary)] text-black shadow-[0_0_10px_var(--st-color-glow)]' 
                          : isActive
                            ? 'border-[var(--st-color-primary)] text-[var(--st-color-primary)] shadow-[inner_0_0_10px_rgba(var(--st-color-primary-rgb),0.2)]'
                            : 'border-white/10 text-on-surface-variant/40 group-hover:border-white/20'
                      }`}>
                        {isCompleted ? <CheckCircle2 size={16} /> : <span className="text-[10px] font-headline font-bold">{String(flatIndex + 1).padStart(2, '0')}</span>}
                      </div>

                      <div className="text-left flex-1 min-w-0">
                        <p className={`text-sm font-headline font-bold truncate tracking-wide ${isActive ? 'text-white' : 'text-on-surface-variant/60 group-hover:text-white'}`}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                           <span className="text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-1.5">
                              <Clock size={12} /> {lesson.content_type?.toUpperCase()}
                           </span>
                        </div>
                      </div>

                      {isActive && (
                        <div className="relative">
                           <div className="absolute -inset-2 bg-[var(--st-color-primary)]/20 blur-md rounded-full animate-pulse"></div>
                           <Play size={14} className="text-[var(--st-color-primary)] relative z-10" fill="currentColor" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
