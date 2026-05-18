import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, CheckCircle2, ChevronRight, Download,
  FileText, MessageSquare, Plus,
  SkipForward, ArrowLeft, Award,
  Loader2, Layout, Send, Sparkles, Trophy,
  List, BookOpen, Clock, Info, Lock,
  Maximize2, Minimize2, Volume2, VolumeX, Settings
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

  // Panels
  const [activeTab, setActiveTab] = useState('notes');
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(true);
  const [isUtilityOpen, setIsUtilityOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Notes
  const [notes, setNotes] = useState('');
  const [recentNotes, setRecentNotes] = useState([]);
  const [savingNote, setSavingNote] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

  // Watch progress
  const [watchProgress, setWatchProgress] = useState(0);
  const [watchTimeSpent, setWatchTimeSpent] = useState(0);
  const watchTimerRef = useRef(null);
  const videoRef = useRef(null);
  const mainContentRef = useRef(null);

  const fetchCourseData = useCallback(async () => {
    if (!user || !courseId) return;
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
          ...(m.lessons || []).map(l => ({ ...l, type: 'lesson', moduleId: m.id, moduleTitle: m.title })),
          ...(m.assignments || []).map(a => ({ ...a, type: 'assignment', moduleId: m.id, moduleTitle: m.title })),
          ...(m.quizzes || []).map(q => ({ ...q, type: 'quiz', moduleId: m.id, moduleTitle: m.title })),
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

      // Resume from last accessed lesson
      const lastAccessed = flattened.find(l => pMap[l.id]?.last_accessed_at);
      if (lastAccessed && !activeLesson) {
        setActiveLesson(lastAccessed);
      } else if (!activeLesson && flattened.length > 0) {
        const firstIncomplete = flattened.find(l => !pMap[l.id] || pMap[l.id].status !== 'completed');
        setActiveLesson(firstIncomplete || flattened[0]);
      }
    } catch (error) {
      console.error('Error initializing player:', error);
      toast.error('Failed to load course content');
    } finally {
      setLoading(false);
    }
  }, [user, courseId, activeLesson]);

  useEffect(() => {
    fetchCourseData();

    const curriculumChannel = RealtimeService.subscribeToCurriculum(courseId, fetchCourseData);

    if (user && courseId) {
      NoteService.getCourseNotes(user.id, courseId).then(setRecentNotes);
    }

    // Load saved watch time from localStorage
    const savedTime = localStorage.getItem(`watch-time-${courseId}-${activeLesson?.id}`);
    if (savedTime && activeLesson?.type === 'lesson') {
      setWatchTimeSpent(parseInt(savedTime));
      setWatchProgress(Math.min((parseInt(savedTime) / 600) * 100, 100));
    }

    return () => {
      RealtimeService.unsubscribe(curriculumChannel);
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    };
  }, [courseId, user, fetchCourseData]);

  // Enhanced watch tracker with time-based progress
  useEffect(() => {
    if (!activeLesson || activeLesson.type !== 'lesson') return;

    const isCompleted = progressMap[activeLesson?.id]?.status === 'completed';
    if (isCompleted) {
      setWatchProgress(100);
      return;
    }

    // Load saved progress
    const savedProgress = localStorage.getItem(`lesson-progress-${activeLesson.id}`);
    if (savedProgress) {
      setWatchProgress(parseInt(savedProgress));
    }

    let startTime = Date.now();
    let accumulatedTime = watchTimeSpent;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newTotalTime = accumulatedTime + elapsed;
      const newProgress = Math.min((newTotalTime / 600) * 100, 100); // 10 minutes = 100%

      setWatchTimeSpent(newTotalTime);
      setWatchProgress(newProgress);

      // Save to localStorage every 5 seconds
      localStorage.setItem(`lesson-progress-${activeLesson.id}`, newProgress.toString());
      localStorage.setItem(`watch-time-${courseId}-${activeLesson.id}`, newTotalTime.toString());

      // Auto-save to backend every 30 seconds
      if (newTotalTime % 30 === 0 && newTotalTime > 0) {
        LessonService.updateWatchProgress(user.id, courseId, activeLesson.id, null, newProgress);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      // Final save on unmount
      LessonService.updateWatchProgress(user.id, courseId, activeLesson.id, null, watchProgress);
    };
  }, [activeLesson, courseId, user, progressMap]);

  // Auto-save notes with debounce
  useEffect(() => {
    if (!user || !activeLesson || activeLesson.type !== 'lesson') return;

    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);

    const timeout = setTimeout(() => {
      if (notes.trim()) {
        handleSaveNote(true);
      }
    }, 3000);

    setAutoSaveTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [notes]);

  const loadLessonNotes = useCallback(async () => {
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
  }, [user, activeLesson]);

  useEffect(() => {
    loadLessonNotes();
  }, [loadLessonNotes]);

  const handleSaveNote = async (isAutoSave = false) => {
    if (!user || !activeLesson || !notes.trim() || savingNote) return;
    try {
      setSavingNote(true);
      await NoteService.saveNote(user.id, courseId, activeLesson.id, notes);
      if (!isAutoSave) toast.success('Note saved');
      const updatedNotes = await NoteService.getCourseNotes(user.id, courseId);
      setRecentNotes(updatedNotes);
    } catch (error) {
      if (!isAutoSave) toast.error('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const isItemLocked = (index) => {
    if (index === 0) return false;
    const previousItem = lessons[index - 1];
    if (!previousItem) return false;
    // Only lock if previous item is a lesson and not completed
    if (previousItem.type === 'lesson') {
      return progressMap[previousItem.id]?.status !== 'completed';
    }
    return false;
  };

  const handleLessonSelect = async (item, index) => {
    if (isItemLocked(index)) {
      toast.error('Complete the previous lesson first', {
        icon: '🔒',
        style: { background: '#1a1a1a', color: '#fff' }
      });
      return;
    }

    // Save current lesson progress before switching
    if (activeLesson && activeLesson.type === 'lesson' && watchProgress > 0) {
      await LessonService.updateWatchProgress(user.id, courseId, activeLesson.id, null, watchProgress);
    }

    setActiveLesson(item);
    setWatchProgress(0);
    setWatchTimeSpent(0);

    if (item.type === 'lesson') {
      const savedProgress = localStorage.getItem(`lesson-progress-${item.id}`);
      if (savedProgress) {
        setWatchProgress(parseInt(savedProgress));
      }

      await LessonService.updateLessonProgress(user.id, courseId, item.id, {
        last_accessed_at: new Date().toISOString(),
        status: progressMap[item.id]?.status || 'in_progress',
      });
    }
  };

  const handleNextObjective = () => {
    const currentIndex = lessons.findIndex(l => l.id === activeLesson.id && l.type === activeLesson.type);
    if (currentIndex < lessons.length - 1) {
      handleLessonSelect(lessons[currentIndex + 1], currentIndex + 1);
      // Scroll to top
      if (mainContentRef.current) {
        mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      toast.success('🎉 Congratulations! You\'ve completed the course!', {
        duration: 5000,
        icon: '🏆',
        style: { background: '#10b981', color: '#fff' }
      });
    }
  };

  const handlePreviousObjective = () => {
    const currentIndex = lessons.findIndex(l => l.id === activeLesson.id && l.type === activeLesson.type);
    if (currentIndex > 0) {
      handleLessonSelect(lessons[currentIndex - 1], currentIndex - 1);
      if (mainContentRef.current) {
        mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson || activeLesson.type !== 'lesson' || completing) return;

    if (watchProgress < 90) {
      toast.error(`Please watch ${Math.ceil(90 - watchProgress)}% more to complete`, {
        duration: 3000,
        icon: '⚠️'
      });
      return;
    }

    try {
      setCompleting(true);
      await LessonService.markLessonComplete(user.id, courseId, activeLesson.id);

      setProgressMap(prev => ({
        ...prev,
        [activeLesson.id]: {
          ...(prev[activeLesson.id] || {}),
          status: 'completed',
          completed_at: new Date().toISOString()
        },
      }));

      // Clear local storage for this lesson
      localStorage.removeItem(`lesson-progress-${activeLesson.id}`);

      toast.success('Lesson completed! 🎉', {
        duration: 2000,
        icon: '✅'
      });

      // Auto-advance to next lesson after completion
      setTimeout(() => {
        handleNextObjective();
      }, 1500);
    } catch (error) {
      toast.error('Failed to mark as complete');
    } finally {
      setCompleting(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Space: play/pause (if video)
      if (e.code === 'Space' && activeLesson?.type === 'lesson') {
        e.preventDefault();
        const iframe = document.querySelector('iframe');
        if (iframe) {
          // Post message to YouTube iframe
          iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }
      }
      // Arrow right: next lesson
      if (e.code === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        handleNextObjective();
      }
      // Arrow left: previous lesson
      if (e.code === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        handlePreviousObjective();
      }
      // C key: mark complete
      if (e.code === 'KeyC' && e.ctrlKey && activeLesson?.type === 'lesson') {
        e.preventDefault();
        handleMarkComplete();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeLesson, watchProgress]);

  // Derived state
  const isLessonCompleted = activeLesson && progressMap[activeLesson.id]?.status === 'completed';
  const canMarkComplete = activeLesson?.type === 'lesson' && !isLessonCompleted && watchProgress >= 90;
  const completedCount = Object.values(progressMap).filter(p => p.status === 'completed').length;
  const totalItems = lessons.length || 1;
  const courseProgressPercentage = Math.round((completedCount / totalItems) * 100);
  const currentLessonIndex = lessons.findIndex(l => l.id === activeLesson?.id && l.type === activeLesson?.type);

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#030B14] to-[#0a1620]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[var(--st-color-primary)]/20 border-t-[var(--st-color-primary)] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Play size={20} className="text-[var(--st-color-primary)] animate-pulse" />
          </div>
        </div>
        <p className="text-white/40 text-sm font-medium animate-pulse">Loading course content...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#030B14] to-[#0a1620] p-8 text-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 animate-pulse">
            <Lock className="w-10 h-10 text-red-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping" />
        </div>
        <div className="max-w-md space-y-3">
          <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
          <p className="text-sm text-white/40 leading-relaxed">
            This course is either unpublished or you are not enrolled. Please verify your enrollment status.
          </p>
        </div>
        <button
          onClick={() => navigate('/student/my-courses')}
          className="mt-6 px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to My Courses
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#030B14] to-[#0a1620] overflow-hidden">
      {/* Header */}
      <header className="h-14 flex-shrink-0 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-4 gap-4 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/student/my-courses')}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200 group"
            title="Back to courses"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="h-6 w-px bg-white/20" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white/80 truncate max-w-[180px] sm:max-w-[400px]">
              {course?.title}
            </p>
            <p className="text-[10px] text-white/40 truncate flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-[var(--st-color-primary)]" />
              {activeLesson?.title}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
          <Trophy size={14} className="text-yellow-400" />
          <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--st-color-primary)] to-[var(--st-color-primary)]/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${courseProgressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs font-bold text-white/80 tabular-nums">{courseProgressPercentage}% Complete</span>
        </div>

        <div className="flex items-center gap-2">
          {activeLesson?.type === 'lesson' && (
            <>
              {isLessonCompleted ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold"
                >
                  <CheckCircle2 size={14} /> Completed
                </motion.span>
              ) : (
                <motion.button
                  whileHover={canMarkComplete ? { scale: 1.02 } : {}}
                  whileTap={canMarkComplete ? { scale: 0.98 } : {}}
                  onClick={handleMarkComplete}
                  disabled={!canMarkComplete || completing}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                    ${canMarkComplete
                      ? 'bg-[var(--st-color-primary)] text-black hover:opacity-90 shadow-lg shadow-[var(--st-color-primary)]/20'
                      : 'bg-white/10 border border-white/20 text-white/40 cursor-not-allowed'
                    }`}
                >
                  {completing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  <span className="hidden sm:inline">
                    {completing ? 'Completing...' : watchProgress < 90 ? `${Math.floor(watchProgress)}% Watched` : 'Complete'}
                  </span>
                </motion.button>
              )}
            </>
          )}

          <div className="flex gap-1">
            <button
              onClick={handlePreviousObjective}
              disabled={currentLessonIndex <= 0}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Previous (Ctrl+←)"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={handleNextObjective}
              disabled={currentLessonIndex >= lessons.length - 1}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Next (Ctrl+→)"
            >
              <SkipForward size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-white/20" />

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            onClick={() => setIsCurriculumOpen(v => !v)}
            className={`p-2 rounded-lg transition-all duration-200 ${isCurriculumOpen ? 'text-[var(--st-color-primary)] bg-[var(--st-color-primary)]/10' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
            title={isCurriculumOpen ? 'Hide curriculum' : 'Show curriculum'}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setIsUtilityOpen(v => !v)}
            className={`p-2 rounded-lg transition-all duration-200 ${isUtilityOpen ? 'text-[var(--st-color-primary)] bg-[var(--st-color-primary)]/10' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
            title={isUtilityOpen ? 'Hide utilities' : 'Show utilities'}
          >
            <Layout size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Curriculum Sidebar */}
        <AnimatePresence mode="wait">
          {isCurriculumOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-shrink-0 border-r border-white/10 bg-black/20 backdrop-blur-sm flex flex-col overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-white/10 bg-black/30">
                <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={14} /> Course Curriculum
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scroll">
                {(course?.modules || []).map((module, mIdx) => {
                  const moduleItems = [
                    ...(module.lessons || []).map(l => ({ ...l, type: 'lesson' })),
                    ...(module.assignments || []).map(a => ({ ...a, type: 'assignment' })),
                    ...(module.quizzes || []).map(q => ({ ...q, type: 'quiz' })),
                  ].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

                  const completedInModule = moduleItems.filter(item => {
                    if (item.type === 'lesson') return progressMap[item.id]?.status === 'completed';
                    if (item.type === 'quiz') return (course.quizAttempts || []).some(a => a.quiz_id === item.id && a.status === 'passed');
                    return (course.submissions || []).some(s => s.assignment_id === item.id && s.status === 'graded');
                  }).length;

                  const moduleProgress = (completedInModule / moduleItems.length) * 100;

                  return (
                    <div key={module.id} className="space-y-2">
                      <div className="flex items-center justify-between px-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[var(--st-color-primary)]/70 bg-[var(--st-color-primary)]/10 px-2 py-0.5 rounded">
                            Module {mIdx + 1}
                          </span>
                          <h4 className="text-xs font-semibold text-white/70">{module.title}</h4>
                        </div>
                        <span className="text-[10px] text-white/30">{Math.round(moduleProgress)}%</span>
                      </div>
                      <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--st-color-primary)]/50 rounded-full" style={{ width: `${moduleProgress}%` }} />
                      </div>

                      <div className="space-y-1 mt-3">
                        {moduleItems.map((item) => {
                          const isCompleted = item.type === 'lesson'
                            ? progressMap[item.id]?.status === 'completed'
                            : item.type === 'quiz'
                              ? (course.quizAttempts || []).some(a => a.quiz_id === item.id && a.status === 'passed')
                              : (course.submissions || []).some(s => s.assignment_id === item.id && s.status === 'graded');
                          const isActive = activeLesson?.id === item.id && activeLesson?.type === item.type;
                          const globalIndex = lessons.findIndex(l => l.id === item.id && l.type === item.type);
                          const locked = isItemLocked(globalIndex);

                          return (
                            <button
                              key={`${item.type}-${item.id}`}
                              onClick={() => handleLessonSelect(item, globalIndex)}
                              disabled={locked}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left group
                                ${isActive
                                  ? 'bg-[var(--st-color-primary)]/15 border border-[var(--st-color-primary)]/30 shadow-lg'
                                  : locked
                                    ? 'opacity-40 cursor-not-allowed'
                                    : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                                }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-200
                                ${isCompleted
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : isActive
                                    ? 'bg-[var(--st-color-primary)]/20 text-[var(--st-color-primary)]'
                                    : 'bg-white/5 text-white/30'
                                }`}
                              >
                                {locked ? <Lock size={12} /> : isCompleted ? <CheckCircle2 size={13} /> : <Play size={12} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-medium truncate ${isActive ? 'text-white' : locked ? 'text-white/30' : 'text-white/60'}`}>
                                  {item.title}
                                </p>
                                <span className={`text-[9px] uppercase tracking-wider font-semibold
                                  ${item.type === 'lesson' ? 'text-blue-400/60' : item.type === 'quiz' ? 'text-purple-400/60' : 'text-orange-400/60'}`}
                                >
                                  {item.type}
                                </span>
                              </div>
                              {isActive && (
                                <ChevronRight size={14} className="text-[var(--st-color-primary)] flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main ref={mainContentRef} className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scroll">
          {/* Video/Content Area */}
          <div className="w-full bg-black/50 flex-shrink-0 relative">
            <div className="w-full aspect-video max-h-[70vh] relative overflow-hidden bg-gradient-to-br from-black to-gray-900">
              {activeLesson ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeLesson.type}-${activeLesson.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    {activeLesson.type === 'lesson' && activeLesson.content_url ? (
                      <>
                        <iframe
                          ref={videoRef}
                          className="w-full h-full"
                          src={getYoutubeEmbedUrl(activeLesson.content_url)}
                          title={activeLesson.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                        {!isLessonCompleted && watchProgress < 100 && (
                          <div className="absolute bottom-0 left-0 right-0">
                            <div className="h-1.5 bg-white/10">
                              <motion.div
                                className="h-full bg-gradient-to-r from-[var(--st-color-primary)] to-[var(--st-color-primary)]/70"
                                initial={{ width: 0 }}
                                animate={{ width: `${watchProgress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white/80">
                              {Math.floor(watchProgress)}% watched
                            </div>
                          </div>
                        )}
                      </>
                    ) : activeLesson.type === 'lesson' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-white/5 to-transparent p-12 text-center">
                        <div className="p-8 rounded-full bg-[var(--st-color-primary)]/10 border border-[var(--st-color-primary)]/20 animate-pulse">
                          <FileText size={64} className="text-[var(--st-color-primary)]" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white mb-2">{activeLesson.title}</h2>
                          {activeLesson.description && (
                            <p className="text-white/50 max-w-lg mx-auto">{activeLesson.description}</p>
                          )}
                        </div>
                        <div className="w-64 space-y-2">
                          <div className="flex justify-between text-[10px] text-white/40 font-semibold">
                            <span>Reading Progress</span>
                            <span>{Math.floor(watchProgress)}%</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-[var(--st-color-primary)] rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${watchProgress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : activeLesson.type === 'assignment' ? (
                      <div className="h-full overflow-y-auto p-6">
                        <AssignmentViewer assignment={activeLesson} studentId={user.id} onComplete={fetchCourseData} />
                      </div>
                    ) : activeLesson.type === 'quiz' ? (
                      <div className="h-full overflow-y-auto p-6">
                        <QuizViewer quiz={activeLesson} studentId={user.id} onComplete={fetchCourseData} />
                      </div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[var(--st-color-primary)] animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Lesson Details */}
          <div className="max-w-4xl mx-auto w-full px-6 py-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border
                    ${activeLesson?.type === 'lesson'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : activeLesson?.type === 'quiz'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}
                  >
                    {activeLesson?.type}
                  </span>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Clock size={12} />
                    <span>~15 min</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>Lesson {currentLessonIndex + 1} of {lessons.length}</span>
                  </div>
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
                  {activeLesson?.title}
                </h1>

                {course?.instructor && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 w-fit">
                    <img
                      src={course.instructor.avatar_url}
                      className="w-8 h-8 rounded-full border border-white/20"
                      alt={course.instructor.full_name}
                    />
                    <div>
                      <p className="text-xs text-white/50">Instructor</p>
                      <p className="text-sm font-semibold text-white">{course.instructor.full_name}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {activeLesson?.type === 'lesson' && (
                  isLessonCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold"
                    >
                      <CheckCircle2 size={18} /> Completed
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={canMarkComplete ? { scale: 1.02 } : {}}
                      whileTap={canMarkComplete ? { scale: 0.98 } : {}}
                      onClick={handleMarkComplete}
                      disabled={!canMarkComplete || completing}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                        ${canMarkComplete
                          ? 'bg-[var(--st-color-primary)] text-black hover:opacity-90 shadow-lg'
                          : 'bg-white/10 border border-white/20 text-white/40 cursor-not-allowed'
                        }`}
                    >
                      {completing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      {completing ? 'Completing...' : !canMarkComplete ? `${Math.floor(watchProgress)}% Watched` : 'Mark Complete'}
                    </motion.button>
                  )
                )}
              </div>
            </div>

            {/* Description */}
            {activeLesson?.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Info size={12} /> Lesson Description
                </h3>
                <div className="text-sm text-white/60 leading-relaxed space-y-3">
                  {activeLesson.description.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Resources */}
            {activeLesson?.resources?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <Download size={12} /> Resources & Materials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeLesson.resources.map((res, i) => (
                    <motion.a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-[var(--st-color-primary)]/10 hover:border-[var(--st-color-primary)]/30 transition-all duration-200 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-[var(--st-color-primary)]/20 transition-colors">
                        <Download size={16} className="text-white/50 group-hover:text-[var(--st-color-primary)] transition-colors" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white/70 group-hover:text-white truncate">
                          {res.title || 'Resource File'}
                        </p>
                        <p className="text-[10px] text-white/30">Click to download</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Navigation buttons at bottom */}
            <div className="flex justify-between items-center pt-6 border-t border-white/10">
              <button
                onClick={handlePreviousObjective}
                disabled={currentLessonIndex <= 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft size={16} /> Previous
              </button>
              <button
                onClick={handleNextObjective}
                disabled={currentLessonIndex >= lessons.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next Lesson <SkipForward size={16} />
              </button>
            </div>
          </div>
        </main>

        {/* Utility Panel */}
        <AnimatePresence mode="wait">
          {isUtilityOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-shrink-0 border-l border-white/10 bg-black/20 backdrop-blur-sm flex flex-col overflow-hidden"
            >
              <div className="flex border-b border-white/10">
                {[
                  { id: 'notes', icon: <FileText size={15} />, label: 'Notes' },
                  { id: 'discussions', icon: <MessageSquare size={15} />, label: 'Discuss' },
                  { id: 'ai', icon: <Sparkles size={15} />, label: 'AI Tutor' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 relative
                      ${activeTab === tab.id ? 'text-[var(--st-color-primary)]' : 'text-white/40 hover:text-white/70'}`}
                  >
                    {tab.icon}
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.span
                        layoutId="activeTab"
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[var(--st-color-primary)]"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto custom-scroll">
                <AnimatePresence mode="wait">
                  {activeTab === 'notes' && (
                    <motion.div
                      key="notes"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 space-y-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                            Lesson Notes
                          </p>
                          <button
                            onClick={() => handleSaveNote(false)}
                            disabled={savingNote || !notes.trim()}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--st-color-primary)] uppercase tracking-wider hover:bg-[var(--st-color-primary)]/10 px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
                          >
                            {savingNote ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                            Save
                          </button>
                        </div>
                        <textarea
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          placeholder="Write your notes here... (auto-saves)"
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[var(--st-color-primary)]/50 focus:bg-white/10 min-h-[200px] transition-all placeholder:text-white/20 resize-none"
                        />
                      </div>

                      {recentNotes.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider">Recent Notes</p>
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {recentNotes.slice(0, 5).map(note => (
                              <motion.div
                                key={note.id}
                                whileHover={{ scale: 1.01 }}
                                className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                                onClick={() => setNotes(note.content)}
                              >
                                <p className="text-[10px] font-semibold text-[var(--st-color-primary)]/70 mb-1.5">
                                  {note.lesson?.title}
                                </p>
                                <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                                  {note.content}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'discussions' && (
                    <motion.div
                      key="discussions"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 flex flex-col gap-4 h-full"
                    >
                      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 p-8 bg-white/5 rounded-2xl border border-white/10">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                          <MessageSquare size={32} className="text-white/30" />
                        </div>
                        <p className="text-sm font-semibold text-white/50">Discussions Coming Soon</p>
                        <p className="text-xs text-white/30 leading-relaxed max-w-[220px]">
                          Ask questions and discuss this lesson with fellow students.
                        </p>
                      </div>
                      <div className="relative opacity-50">
                        <input
                          type="text"
                          placeholder="Post a question..."
                          disabled
                          className="w-full bg-white/10 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none cursor-not-allowed"
                        />
                        <button disabled className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/10 text-white/30">
                          <Send size={14} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'ai' && (
                    <motion.div
                      key="ai"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 space-y-4"
                    >
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-[var(--st-color-primary)]/15 to-transparent border border-[var(--st-color-primary)]/30 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[var(--st-color-primary)]/20 flex items-center justify-center">
                            <Sparkles size={16} className="text-[var(--st-color-primary)]" />
                          </div>
                          <h3 className="text-sm font-bold text-white">AI Learning Assistant</h3>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">
                          Get instant help understanding concepts, summaries, and practice questions for this lesson.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full py-2.5 rounded-xl bg-[var(--st-color-primary)] text-black text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all"
                        >
                          Start AI Session
                        </motion.button>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider mb-3 px-1">Quick Prompts</p>
                        <div className="space-y-2">
                          {['Explain this lesson simply', 'Give me a practice quiz', 'Summarize key points', 'Suggest related topics'].map(q => (
                            <motion.button
                              key={q}
                              whileHover={{ x: 4 }}
                              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/5 text-left text-xs font-medium text-white/60 hover:text-white/80 hover:bg-white/10 transition-all group"
                            >
                              {q}
                              <ChevronRight size={13} className="text-white/20 group-hover:text-[var(--st-color-primary)] transition-colors" />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-4 border-t border-white/10 bg-black/30">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Overall Progress</p>
                  <span className="text-xs font-bold text-[var(--st-color-primary)]">{courseProgressPercentage}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--st-color-primary)] to-[var(--st-color-primary)]/70 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${courseProgressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-white/30">
                  <span>{completedCount} completed</span>
                  <span>{totalItems - completedCount} remaining</span>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default CoursePlayer;