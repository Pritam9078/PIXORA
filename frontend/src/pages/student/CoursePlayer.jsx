import React, { useState, useEffect, useRef } from 'react';
import {
  Play, CheckCircle2, ChevronRight, Download,
  FileText, MessageSquare, Plus,
  SkipForward, ArrowLeft, Award,
  Loader2, Layout, Send, Sparkles, Trophy,
  Search, ChevronDown, List, BookOpen, Clock, Info, Lock
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';
import CourseService from '../../services/CourseService';
import { LessonService } from '../../services/LessonService';
import AssignmentViewer from '../../components/student/AssignmentViewer';
import QuizViewer from '../../components/student/QuizViewer';
import { RealtimeService } from '../../services/RealtimeService';
import { toast } from 'react-hot-toast';
import { getYoutubeEmbedUrl } from '../../utils/videoUtils';
import { NoteService } from '../../services/NoteService';

const CoursePlayer = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();
  const { currentTheme } = useStudentTheme();

  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  
  // Panels State
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'ai' | 'discussions'
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(true);
  const [isUtilityOpen, setIsUtilityOpen] = useState(true);
  
  // Notes State
  const [notes, setNotes] = useState('');
  const [recentNotes, setRecentNotes] = useState([]);
  const [savingNote, setSavingNote] = useState(false);

  // Watch Tracking State
  const [watchProgress, setWatchProgress] = useState(0); // 0 to 100
  const watchTimerRef = useRef(null);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const data = await CourseService.getCourseWithFullProgress(user.id, courseId);
      
      if (!data) {
        setCourse(null);
        setLoading(false);
        return;
      }

      const flattened = (data.modules || []).reduce((acc, m) => {
        const items = [
          ...(m.lessons || []).map(l => ({ ...l, type: 'lesson' })),
          ...(m.assignments || []).map(a => ({ ...a, type: 'assignment' })),
          ...(m.quizzes || []).map(q => ({ ...q, type: 'quiz' }))
        ].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        return [...acc, ...items];
      }, []);

      const pMap = (data.studentProgress || []).reduce((acc, p) => {
        acc[p.lesson_id] = p;
        return acc;
      }, {});

      setCourse(data);
      setLessons(flattened);
      setProgressMap(pMap);

      if (!activeLesson && flattened.length > 0) {
        // Find first incomplete lesson
        const firstIncomplete = flattened.find(l => !pMap[l.id] || pMap[l.id].status !== 'completed');
        setActiveLesson(firstIncomplete || flattened[0]);
      }
    } catch (error) {
      console.error('Error initializing player:', error);
      toast.error('Initialization failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && courseId) fetchCourseData();
    const curriculumChannel = RealtimeService.subscribeToCurriculum(courseId, fetchCourseData);
    if (user && courseId) {
      NoteService.getCourseNotes(user.id, courseId).then(setRecentNotes);
    }
    return () => RealtimeService.unsubscribe(curriculumChannel);
  }, [courseId, user]);

  // Handle Watch Tracker logic
  useEffect(() => {
    if (!activeLesson || progressMap[activeLesson.id]?.status === 'completed') {
      setWatchProgress(100);
      return;
    }

    setWatchProgress(0); // reset when switching lesson
    
    // Simulate watching the video/reading the lesson (1% every 2 seconds for demo)
    // In a real app, this would tie to the YouTube Player API 'onStateChange'
    watchTimerRef.current = setInterval(() => {
      setWatchProgress(prev => {
        if (prev >= 100) {
          clearInterval(watchTimerRef.current);
          return 100;
        }
        return prev + 5; // increment 5% per interval for faster testing
      });
    }, 2000);

    return () => clearInterval(watchTimerRef.current);
  }, [activeLesson]);

  // Auto-save progress
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (activeLesson?.type === 'lesson' && watchProgress > 0 && watchProgress < 100) {
         LessonService.updateWatchProgress(user.id, courseId, activeLesson.id, null, watchProgress);
      }
    }, 15000); // Autosave every 15s

    return () => clearInterval(saveInterval);
  }, [watchProgress, activeLesson]);

  useEffect(() => {
    const loadLessonNotes = async () => {
      if (!user || !activeLesson || activeLesson.type !== 'lesson') {
        setNotes('');
        return;
      }
      try {
        const lessonNotes = await NoteService.getLessonNotes(user.id, activeLesson.id);
        setNotes(lessonNotes.length > 0 ? lessonNotes[0].content : '');
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    };
    loadLessonNotes();
  }, [activeLesson, user]);

  const handleSaveNote = async () => {
    if (!user || !activeLesson || !notes.trim() || savingNote) return;
    try {
      setSavingNote(true);
      await NoteService.saveNote(user.id, courseId, activeLesson.id, notes);
      toast.success('Archived');
      const updatedNotes = await NoteService.getCourseNotes(user.id, courseId);
      setRecentNotes(updatedNotes);
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSavingNote(false);
    }
  };

  const isItemLocked = (index) => {
    if (index === 0) return false;
    // Sequential learning: locked if previous is not completed
    const previousItem = lessons[index - 1];
    if (!previousItem) return false;

    if (previousItem.type === 'lesson') {
      return progressMap[previousItem.id]?.status !== 'completed';
    }
    // Simple check for now, can be expanded for quizzes/assignments
    return false;
  };

  const handleLessonSelect = (item, index) => {
    if (isItemLocked(index)) {
      toast.error('Complete previous objectives to unlock this node.');
      return;
    }
    setActiveLesson(item);
    if (item.type === 'lesson') {
      LessonService.updateLessonProgress(user.id, courseId, item.id, {
        last_accessed_at: new Date().toISOString(),
        status: progressMap[item.id]?.status || 'in_progress'
      });
    }
  };

  const handleNextObjective = () => {
    const currentIndex = lessons.findIndex(l => l.id === activeLesson.id && l.type === activeLesson.type);
    if (currentIndex < lessons.length - 1) {
      handleLessonSelect(lessons[currentIndex + 1], currentIndex + 1);
    } else {
      toast.success('Course Completed! Generating Certificate...');
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson || activeLesson.type !== 'lesson' || completing) return;
    if (watchProgress < 90) {
       toast.error('Analyze at least 90% of the material to proceed.');
       return;
    }
    
    try {
      setCompleting(true);
      await LessonService.markLessonComplete(user.id, courseId, activeLesson.id);
      setProgressMap(prev => ({
        ...prev,
        [activeLesson.id]: { ...(prev[activeLesson.id] || {}), status: 'completed' }
      }));
      toast.success('Objective Synchronized');
      setTimeout(handleNextObjective, 1500);
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 bg-[#030B14]">
        <Loader2 className="w-12 h-12 text-[var(--st-color-primary)] animate-spin" />
        <p className="text-[var(--st-color-primary)] font-headline font-bold text-xs uppercase tracking-widest animate-pulse">Decrypting Neural Core...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 bg-[#030B14] p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-headline font-bold text-white uppercase tracking-wider">Access Denied / Not Found</h2>
          <p className="text-sm text-white/40 leading-relaxed">
            The requested course module is either unpublished or restricted to authorized personnel only. 
            Please verify your enrollment status or contact central command.
          </p>
        </div>
        <button 
          onClick={() => navigate('/student/my-courses')}
          className="mt-8 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-headline font-bold text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
      </div>
    );
  }

  const completedCount = Object.values(progressMap).filter(p => p.status === 'completed').length;
  const totalItems = lessons.length || 1;
  const courseProgressPercentage = Math.round((completedCount / totalItems) * 100);

  return (
    <div className="h-full flex flex-col bg-[#030B14] overflow-hidden">
      {/* 4-COLUMN INNER HEADER */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-xl z-30 flex-shrink-0 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/student/my-courses')}
            className="p-2.5 rounded-xl hover:bg-white/5 text-on-surface-variant transition-colors border border-transparent hover:border-white/10"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          <div>
            <h2 className="text-sm font-headline font-bold text-white truncate max-w-[250px] md:max-w-[400px] tracking-tight">{course?.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-widest">{activeLesson?.title}</span>
               {watchProgress > 0 && watchProgress < 100 && (
                  <span className="text-[9px] text-white/40">({watchProgress}% Analyzed)</span>
               )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 shadow-inner">
            <Trophy size={16} className="text-yellow-500" />
            <div className="flex items-center gap-2">
               <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: `${courseProgressPercentage}%`}}></div>
               </div>
               <span className="text-[11px] font-bold text-white">{courseProgressPercentage}%</span>
            </div>
          </div>

          {activeLesson?.type === 'lesson' && (
            <button
              onClick={handleMarkComplete}
              disabled={progressMap[activeLesson?.id]?.status === 'completed' || completing || watchProgress < 90}
              className={`px-5 py-2.5 rounded-xl font-headline font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${
                progressMap[activeLesson?.id]?.status === 'completed'
                  ? 'bg-[var(--st-color-primary)] text-black shadow-[0_0_20px_var(--st-color-glow)]'
                  : watchProgress < 90
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-[var(--st-color-primary)]/20 hover:border-[var(--st-color-primary)]/40 hover:text-[var(--st-color-primary)] border border-white/5'
              }`}
            >
              {completing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {progressMap[activeLesson?.id]?.status === 'completed' ? 'Completed' : 'Mark Done'}
            </button>
          )}

          <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
            <button 
              onClick={() => setIsCurriculumOpen(!isCurriculumOpen)}
              className={`p-2.5 rounded-xl transition-all ${isCurriculumOpen ? 'text-[var(--st-color-primary)] bg-[var(--st-color-primary)]/10 shadow-[inset_0_0_10px_rgba(var(--st-color-primary-rgb),0.2)]' : 'text-on-surface-variant hover:bg-white/5'}`}
              title="Toggle Curriculum"
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setIsUtilityOpen(!isUtilityOpen)}
              className={`p-2.5 rounded-xl transition-all ${isUtilityOpen ? 'text-[var(--st-color-primary)] bg-[var(--st-color-primary)]/10 shadow-[inset_0_0_10px_rgba(var(--st-color-primary-rgb),0.2)]' : 'text-on-surface-variant hover:bg-white/5'}`}
              title="Toggle Utility Panel"
            >
              <Layout size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* COLUMN 2: CURRICULUM SIDEBAR */}
        <AnimatePresence initial={false}>
          {isCurriculumOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-white/5 bg-black/40 flex flex-col overflow-hidden flex-shrink-0 z-20 shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-white/5 bg-white/[0.01]">
                <h3 className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] flex items-center gap-2">
                   <BookOpen size={14} /> Course Curriculum
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
                {(course?.modules || []).map((module, mIdx) => (
                  <div key={module.id} className="space-y-4">
                    <div className="px-2 flex items-center gap-3">
                      <span className="text-[10px] font-black text-[var(--st-color-primary)]/50 uppercase tracking-widest border border-[var(--st-color-primary)]/20 px-2 py-0.5 rounded-md bg-[var(--st-color-primary)]/5">PHASE {mIdx + 1}</span>
                      <h4 className="text-xs font-bold text-white/80 uppercase tracking-widest truncate">{module.title}</h4>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        ...(module.lessons || []).map(l => ({ ...l, type: 'lesson' })),
                        ...(module.assignments || []).map(a => ({ ...a, type: 'assignment' })),
                        ...(module.quizzes || []).map(q => ({ ...q, type: 'quiz' }))
                      ].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map((item, idx) => {
                        const isCompleted = item.type === 'lesson'
                          ? progressMap[item.id]?.status === 'completed'
                          : item.type === 'quiz'
                            ? (course.quizAttempts || []).some(a => a.quiz_id === item.id && a.status === 'passed')
                            : (course.submissions || []).some(s => s.assignment_id === item.id && s.status === 'graded');
                        const isActive = activeLesson?.id === item.id && activeLesson?.type === item.type;
                        
                        // Need global index for lock logic
                        const globalIndex = lessons.findIndex(l => l.id === item.id && l.type === item.type);
                        const locked = isItemLocked(globalIndex);

                        return (
                          <button
                            key={`${item.type}-${item.id}`}
                            onClick={() => handleLessonSelect(item, globalIndex)}
                            disabled={locked}
                            className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group border ${
                              isActive 
                                ? 'bg-[var(--st-color-primary)]/10 border-[var(--st-color-primary)]/30 shadow-[inset_0_0_15px_rgba(var(--st-color-primary-rgb),0.1)]' 
                                : locked
                                  ? 'opacity-40 cursor-not-allowed border-transparent'
                                  : 'hover:bg-white/[0.03] border-transparent hover:border-white/5'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl border flex flex-shrink-0 items-center justify-center transition-all ${
                              isCompleted 
                                ? 'bg-[var(--st-color-primary)] border-[var(--st-color-primary)] text-black shadow-[0_0_10px_var(--st-color-glow)]' 
                                : isActive 
                                  ? 'border-[var(--st-color-primary)]/50 text-[var(--st-color-primary)] bg-[var(--st-color-primary)]/5' 
                                  : locked
                                     ? 'border-white/5 text-white/20 bg-white/5'
                                     : 'border-white/10 text-white/30 bg-white/[0.02] group-hover:text-white/60'
                            }`}>
                              {locked ? <Lock size={14} /> : isCompleted ? <CheckCircle2 size={16} strokeWidth={2.5} /> : <Play size={14} className={isActive ? "ml-1" : ""} />}
                            </div>
                            <div className="flex flex-col items-start min-w-0">
                               <span className={`text-xs font-bold text-left truncate w-full ${isActive ? 'text-white' : locked ? 'text-white/30' : 'text-white/60 group-hover:text-white/90'}`}>
                                 {item.title}
                               </span>
                               <span className="text-[9px] font-black uppercase tracking-widest text-[var(--st-color-primary)]/50 mt-1">{item.type}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* COLUMN 3: MAIN LEARNING AREA */}
        <main className="flex-1 flex flex-col min-w-0 relative overflow-y-auto custom-scrollbar">
          {/* VIDEO CONTAINER */}
          <div className="w-full bg-[#02060A] relative group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="w-full max-w-[1200px] mx-auto aspect-video max-h-[70vh] relative overflow-hidden rounded-b-[40px] border-b border-white/5 bg-black/80">
              {activeLesson ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeLesson.type}-${activeLesson.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full relative"
                  >
                    {activeLesson.type === 'lesson' ? (
                      (activeLesson.content_type === 'video' || (!activeLesson.content_type && activeLesson.content_url)) ? (
                        <>
                           <iframe
                             className="w-full h-full"
                             src={getYoutubeEmbedUrl(activeLesson.content_url)}
                             title={activeLesson.title}
                             frameBorder="0"
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                             allowFullScreen
                           ></iframe>
                           {/* Watch Progress Indicator */}
                           {progressMap[activeLesson.id]?.status !== 'completed' && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                                 <div className="h-full bg-[var(--st-color-primary)] shadow-[0_0_10px_var(--st-color-glow)] transition-all duration-1000" style={{ width: `${watchProgress}%`}}></div>
                              </div>
                           )}
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-8 bg-gradient-to-b from-white/[0.02] to-transparent">
                          <div className="p-10 rounded-[48px] bg-[var(--st-color-primary)]/5 border border-[var(--st-color-primary)]/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[var(--st-color-primary)]/20 blur-2xl"></div>
                            <FileText size={80} className="text-[var(--st-color-primary)] opacity-80 relative z-10" />
                          </div>
                          <div className="space-y-4">
                             <h2 className="text-4xl font-headline font-bold text-white tracking-tight">{activeLesson.title}</h2>
                             <p className="text-white/40 max-w-xl mx-auto text-lg">{activeLesson.description}</p>
                          </div>
                          
                          {/* Reading Timer */}
                          <div className="w-64 space-y-2 mt-8">
                             <div className="flex justify-between text-[10px] font-black uppercase text-white/30 tracking-widest">
                                <span>Analysis</span>
                                <span>{watchProgress}%</span>
                             </div>
                             <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-[var(--st-color-primary)] transition-all duration-1000" style={{ width: `${watchProgress}%`}}></div>
                             </div>
                          </div>
                        </div>
                      )
                    ) : activeLesson.type === 'assignment' ? (
                      <div className="h-full overflow-y-auto custom-scrollbar p-8">
                         <AssignmentViewer assignment={activeLesson} studentId={user.id} onComplete={fetchCourseData} />
                      </div>
                    ) : activeLesson.type === 'quiz' ? (
                      <div className="h-full overflow-y-auto custom-scrollbar p-8">
                         <QuizViewer quiz={activeLesson} studentId={user.id} onComplete={fetchCourseData} />
                      </div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-[var(--st-color-primary)] animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* CONTENT DETAILS */}
          <div className="max-w-[1200px] mx-auto w-full px-8 py-12 space-y-12">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 rounded-full bg-[var(--st-color-primary)]/10 text-[var(--st-color-primary)] text-[10px] font-black uppercase tracking-[0.2em] border border-[var(--st-color-primary)]/20 shadow-[0_0_15px_var(--st-color-glow)]">
                    {activeLesson?.type}
                  </span>
                  <div className="flex items-center gap-1.5 text-white/30 text-xs font-bold bg-white/[0.02] px-3 py-1 rounded-full border border-white/5">
                    <Clock size={14} />
                    <span>Est. 15 min</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tight leading-tight">{activeLesson?.title}</h1>
                <div className="flex items-center gap-5 pt-2">
                  <div className="flex items-center gap-3 bg-white/[0.02] pr-4 rounded-full border border-white/5">
                    <img src={course?.instructor?.avatar_url} className="w-10 h-10 rounded-full border-2 border-black/50" alt="" />
                    <span className="text-sm font-bold text-white/80">{course?.instructor?.full_name}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-white/20"></div>
                  <div className="flex items-center gap-2 text-white/40 text-xs font-medium">
                    <BookOpen size={16} />
                    <span>Module Sequence {lessons.findIndex(l => l.id === activeLesson?.id) + 1} / {lessons.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-2">
                {activeLesson?.type === 'lesson' && (
                  <button 
                    onClick={handleMarkComplete} 
                    disabled={progressMap[activeLesson?.id]?.status === 'completed' || completing || watchProgress < 90}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs transition-all border ${
                       progressMap[activeLesson?.id]?.status === 'completed'
                        ? 'bg-[var(--st-color-primary)]/10 border-[var(--st-color-primary)]/30 text-[var(--st-color-primary)]'
                        : watchProgress < 90
                          ? 'bg-white/5 border-white/5 text-white/30 cursor-not-allowed'
                          : 'bg-white/[0.02] border-white/10 text-white hover:bg-white/5'
                    }`}
                  >
                    <CheckCircle2 size={18} /> {progressMap[activeLesson?.id]?.status === 'completed' ? 'Objective Cleared' : 'Complete Objective'}
                  </button>
                )}
                <button onClick={handleNextObjective} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all border border-white/10 shadow-lg">
                  Next Sequence <SkipForward size={18} />
                </button>
              </div>
            </div>

            {activeLesson?.description && (
              <div className="glass-panel p-10 rounded-[40px] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden group hover:border-[var(--st-color-primary)]/20 transition-colors duration-500">
                <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:scale-110 transition-transform duration-700 group-hover:text-[var(--st-color-primary)]/5">
                  <Info size={80} />
                </div>
                <h3 className="text-xs font-black text-[var(--st-color-primary)] uppercase tracking-[0.3em] mb-6 relative z-10 flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-[var(--st-color-primary)] animate-pulse"></div>
                   Mission Briefing
                </h3>
                <div className="prose prose-invert max-w-none text-base text-white/70 leading-relaxed font-medium relative z-10">
                   {activeLesson.description.split('\n').map((para, i) => (
                      <p key={i} className="mb-4">{para}</p>
                   ))}
                </div>
              </div>
            )}

            {activeLesson?.resources?.length > 0 && (
              <div className="space-y-6 pt-4">
                <h4 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] px-2 flex items-center gap-3">
                   <Download size={16} /> Asset Downloads
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeLesson.resources.map((res, i) => (
                    <a key={i} href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-5 p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-[var(--st-color-primary)]/10 hover:border-[var(--st-color-primary)]/30 transition-all group shadow-lg">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-[var(--st-color-primary)] group-hover:scale-110 transition-all">
                        <Download size={24} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate group-hover:text-[var(--st-color-primary)] transition-colors">{res.title || 'Resource File'}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Encrypted Asset</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* COLUMN 4: UTILITY PANEL */}
        <AnimatePresence initial={false}>
          {isUtilityOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-white/5 bg-black/40 flex flex-col overflow-hidden flex-shrink-0 z-20 shadow-2xl"
            >
              <div className="flex border-b border-white/5 bg-white/[0.01]">
                {[
                  { id: 'notes', icon: <FileText size={18} />, label: 'Archives' },
                  { id: 'discussions', icon: <MessageSquare size={18} />, label: 'Comms' },
                  { id: 'ai', icon: <Sparkles size={18} />, label: 'AI Tutor' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center gap-2 py-5 text-[10px] font-black uppercase tracking-widest transition-all relative ${
                      activeTab === tab.id ? 'text-[var(--st-color-primary)] bg-white/[0.02]' : 'text-on-surface-variant/40 hover:text-white/60 hover:bg-white/[0.01]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {activeTab === tab.id && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--st-color-primary)] shadow-[0_0_15px_var(--st-color-glow)]" />}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <AnimatePresence mode="wait">
                  {/* ARCHIVES / NOTES TAB */}
                  {activeTab === 'notes' && (
                    <motion.div key="notes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                             <FileText size={14} /> Tactical Notes
                          </h3>
                          <button onClick={handleSaveNote} disabled={savingNote || !notes.trim()} className="text-[9px] font-black text-[var(--st-color-primary)] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-[var(--st-color-primary)]/10 px-3 py-1.5 rounded-lg transition-colors">
                            {savingNote ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />} Save Entry
                          </button>
                        </div>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Log your mission findings here..."
                          className="w-full bg-white/[0.02] border border-white/10 rounded-3xl p-6 text-sm text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 focus:bg-white/[0.04] min-h-[300px] transition-all placeholder:text-white/10 resize-none shadow-inner"
                        ></textarea>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest px-2">Recent Logs</h4>
                        <div className="space-y-3">
                          {recentNotes.slice(0, 4).map(note => (
                            <div key={note.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-[var(--st-color-primary)]/20 transition-colors cursor-pointer group">
                              <p className="text-[10px] font-bold text-[var(--st-color-primary)]/60 uppercase tracking-wider group-hover:text-[var(--st-color-primary)] transition-colors">{note.lesson?.title}</p>
                              <p className="text-xs text-white/50 line-clamp-3 leading-relaxed">{note.content}</p>
                            </div>
                          ))}
                          {recentNotes.length === 0 && (
                             <div className="text-center p-8 border border-dashed border-white/10 rounded-2xl">
                                <p className="text-xs text-white/30 uppercase tracking-widest font-bold">No logs detected</p>
                             </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* COMMS / DISCUSSIONS TAB */}
                  {activeTab === 'discussions' && (
                    <motion.div key="discussions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col space-y-6">
                       <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-8 bg-white/[0.02] rounded-3xl border border-white/5">
                          <MessageSquare size={48} className="text-[var(--st-color-primary)] opacity-30" />
                          <div className="space-y-2">
                             <h4 className="text-sm font-bold text-white uppercase tracking-wider">Secure Comms Channel</h4>
                             <p className="text-xs text-white/40 leading-relaxed">The communication link for this objective is currently being established. Standby for instructor broadcast.</p>
                          </div>
                       </div>
                       <div className="relative">
                          <input type="text" placeholder="Transmit message..." disabled className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm text-white focus:outline-none opacity-50 cursor-not-allowed" />
                          <button disabled className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/5 text-white/30">
                             <Send size={16} />
                          </button>
                       </div>
                    </motion.div>
                  )}

                  {/* AI TUTOR TAB */}
                  {activeTab === 'ai' && (
                    <motion.div key="ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                      <div className="p-8 rounded-[40px] bg-gradient-to-br from-[var(--st-color-primary)]/10 to-transparent border border-[var(--st-color-primary)]/20 relative overflow-hidden group">
                        <Sparkles className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700" size={100} />
                        <h3 className="text-xl font-headline font-bold text-white mb-2 relative z-10">Neural Intelligence</h3>
                        <p className="text-xs text-white/50 leading-relaxed mb-8 relative z-10 font-medium">Link with the central AI core for advanced tactical analysis of the current objective.</p>
                        <button className="w-full py-4 rounded-2xl bg-[var(--st-color-primary)] text-black font-headline font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_0_20px_var(--st-color-glow)] relative z-10">
                           Initialize Link
                        </button>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-widest px-2 mt-8 mb-4">Suggested Queries</h4>
                        {['Analyze this objective', 'Explain core concepts', 'Generate practice scenario'].map(q => (
                          <button key={q} className="w-full p-5 rounded-2xl border border-white/5 bg-white/[0.02] text-left text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all flex items-center justify-between group">
                            {q}
                            <ChevronRight size={16} className="text-white/20 group-hover:text-[var(--st-color-primary)] transition-colors" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* OVERALL PROGRESS FOOTER */}
              <div className="p-8 bg-black/60 border-t border-white/5 mt-auto relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--st-color-primary)]/5 to-transparent"></div>
                <div className="relative z-10">
                   <div className="flex items-center justify-between mb-4 px-1">
                     <p className="text-[10px] font-headline font-black text-white/40 uppercase tracking-[0.2em]">Deployment Sync</p>
                     <span className="text-[11px] font-headline font-black text-[var(--st-color-primary)] uppercase tracking-[0.2em] drop-shadow-[0_0_10px_var(--st-color-glow)]">{courseProgressPercentage}%</span>
                   </div>
                   <div className="h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
                     <div className="h-full bg-gradient-to-r from-[var(--st-color-primary)]/50 to-[var(--st-color-primary)] rounded-full shadow-[0_0_15px_var(--st-color-glow)] transition-all duration-1000" style={{ width: `${courseProgressPercentage}%`}}></div>
                   </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CoursePlayer;
