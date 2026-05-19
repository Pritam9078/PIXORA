import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, CheckCircle2, ChevronRight, Download,
  FileText, MessageSquare, Plus,
  SkipForward, ArrowLeft, Award,
  Loader2, Layout, Send, Sparkles, Trophy,
  List, BookOpen, Clock, Info, Lock,
  Maximize2, Minimize2, Volume2, VolumeX, Settings, Code, Terminal
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

  // AI Tutor Conversational State
  const [aiMessages, setAiMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "👋 Welcome to your Pixora AI Learning Tutor! I'm synced with this lesson module and ready to help you master these concepts. Click a quick prompt below or type your questions.",
      timestamp: new Date()
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiInput, setAiInput] = useState('');

  // Code Lab Interactive Editor & Compiler Simulator State
  const [codeText, setCodeText] = useState('');
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Watch progress
  const [watchProgress, setWatchProgress] = useState(0);
  const [watchTimeSpent, setWatchTimeSpent] = useState(0);
  const watchTimerRef = useRef(null);
  const videoRef = useRef(null);
  const mainContentRef = useRef(null);
  const aiChatEndRef = useRef(null);

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

  // Determine active track/theme context
  const isBlockchainTrack = course?.track === 'BLOCKCHAIN' || currentTheme?.id === 'blockchain' || (course?.title || '').toLowerCase().includes('solidity') || (course?.title || '').toLowerCase().includes('blockchain') || (course?.title || '').toLowerCase().includes('web3');
  const isGameDevTrack = course?.track === 'GAME_DEV' || currentTheme?.id === 'game_dev' || (course?.title || '').toLowerCase().includes('unity') || (course?.title || '').toLowerCase().includes('unreal') || (course?.title || '').toLowerCase().includes('game');

  // Initialize Sandbox Code text based on track
  useEffect(() => {
    if (isBlockchainTrack) {
      setCodeText(`// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract PixoraToken {\n    string public name = "Pixora XP Token";\n    string public symbol = "PXP";\n    uint256 public totalSupply = 1000000;\n    \n    mapping(address => uint256) public balances;\n    \n    event Mint(address indexed to, uint256 value);\n    \n    // TODO: Mint rewards to student address\n    function mintReward(address student, uint256 amount) public {\n        balances[student] += amount;\n        totalSupply += amount;\n        emit Mint(student, amount);\n    }\n}`);
      setTerminalOutput([`$ solc contracts/PixoraToken.sol --bin --abi`]);
    } else if (isGameDevTrack) {
      setCodeText(`using UnityEngine;\nusing System.Collections;\n\npublic class HoverCraftController : MonoBehaviour {\n    public float thrust = 20.0f;\n    public float turnSpeed = 2.5f;\n    private Rigidbody rb;\n\n    void Start() {\n        rb = GetComponent<Rigidbody>();\n    }\n\n    // TODO: Complete craft stabilizer physics\n    void FixedUpdate() {\n        float roll = Input.GetAxis("Horizontal");\n        float pitch = Input.GetAxis("Vertical");\n        rb.AddRelativeForce(Vector3.forward * pitch * thrust);\n        rb.AddRelativeTorque(Vector3.up * roll * turnSpeed);\n    }\n}`);
      setTerminalOutput([`$ msbuild HoverCraftController.cs --target:library`]);
    } else {
      setCodeText(`// Pixora Interactive Scripting Playground\nconst lessonTitle = "${activeLesson?.title || 'Sandbox'}";\nconst xpAwarded = 25;\n\nfunction completeLesson() {\n    console.log("Welcome to Pixora Sandbox!");\n    console.log("Successfully compiled lesson: " + lessonTitle);\n    return xpAwarded;\n}\n\ncompleteLesson();`);
      setTerminalOutput([`$ node sandbox.js`]);
    }
  }, [activeLesson, isBlockchainTrack, isGameDevTrack]);

  // Auto-scroll AI chat viewport
  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isAiTyping]);

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

  // Conversational AI Simulated response engine
  const handleAiMessageSubmit = (userText = null) => {
    const text = userText || aiInput;
    if (!text.trim()) return;

    // Append User Message
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date()
    };
    setAiMessages(prev => [...prev, userMessage]);
    if (!userText) setAiInput('');

    setIsAiTyping(true);

    // Simulate AI Thinking and dynamic response assembly
    setTimeout(() => {
      setIsAiTyping(false);
      let responseText = '';

      // Determine smart response context based on user prompts
      const lower = text.toLowerCase();
      if (lower.includes('explain') || lower.includes('simply')) {
        responseText = `Let's break down **${activeLesson?.title || 'this lesson'}** simply! 🚀\n\n1. **Core Concept**: ${activeLesson?.description ? activeLesson.description.substring(0, 160) + '...' : 'This is the main pillar of this lesson structure.'}\n2. **Why it matters**: In a full stack ecosystem, this component handles safe execution decoupling, allowing components to run independently without blocking.\n3. **Simple Analogy**: Think of it as placing an order at a digital cafe. You order (send command), get a ticket, and go sit down. The barista finishes the coffee asynchronously and calls your number when it's ready. You don't stand at the register waiting!\n\nWould you like me to quiz you on this, or suggest related sandbox exercises?`;
      } else if (lower.includes('quiz') || lower.includes('practice')) {
        responseText = `Here is a cohort practice quiz for **${activeLesson?.title || 'this lesson'}**! 📝\n\n**Question 1**: Which aspect is optimized primary by implementing the architecture patterns described in this module?\n- A) Initial load times & static caching\n- B) Performance throughput and isolated component resilience\n- C) Relational schema normalization & transaction rollbacks\n\n*Type A, B, or C below to submit your cohort score!*`;
      } else if (lower.includes('summarize') || lower.includes('key points')) {
        responseText = `Here is your learning summary for **${activeLesson?.title || 'this lesson'}** 📋:\n\n*   **Decoupled Workflows**: Isolation of logic is key to scaling.\n*   **State Telemetry**: Monitor execution delays to avoid performance leaks.\n*   **Defensive Design**: Validate parameters before state changes to guarantee absolute reliability.\n\nType 'Explain simply' if you want me to expand on these!`;
      } else if (lower.includes('suggest') || lower.includes('related')) {
        responseText = `To expand your knowledge beyond **${activeLesson?.title || 'this lesson'}**, I suggest these advanced topics 🌐:\n\n1. **Zero-Knowledge Decoupling**: Proof validations on private networks.\n2. **Multiplayer Telemetry**: Pushing state changes securely at 60 FPS.\n3. **Optimized Garbage Collection**: Preventing memory creep in runtime loops.\n\nWhich of these would you like to study first?`;
      } else if (lower === 'a' || lower === 'b' || lower === 'c') {
        if (lower === 'b') {
          responseText = `🎯 **Perfect! Option B is absolutely correct!**\n\nIsolating execution pipelines protects components from cascaded logic errors and spikes memory efficiency. You've earned +25 XP toward your track milestone! Let me know if you are ready to start coding in the sandbox terminal!`;
        } else {
          responseText = `❌ **Not quite!** But close.\n\nOption B was the correct choice because isolating components guarantees resilience. Don't worry, cohort learning is about iteration! Try summarizing the lesson to reinforce your understanding.`;
        }
      } else {
        responseText = `That is an excellent inquiry about **${activeLesson?.title || 'this lesson'}**! Synthesizing this module is crucial to finishing this track cohort. \n\nI highly recommend opening our **Code Lab** tab next to this chat viewport and running the simulation to see how compiling this logic operates in real-time. Do you have any specific error telemetry you'd like me to debug?`;
      }

      // Append new AI message with word-by-word streaming effect
      const responseMessageId = `ai-${Date.now()}`;
      setAiMessages(prev => [...prev, {
        id: responseMessageId,
        sender: 'ai',
        text: '',
        timestamp: new Date()
      }]);

      let words = responseText.split(' ');
      let currentText = '';
      let wordIdx = 0;

      const streamTimer = setInterval(() => {
        if (wordIdx < words.length) {
          currentText += (wordIdx === 0 ? '' : ' ') + words[wordIdx];
          setAiMessages(prev => prev.map(m => m.id === responseMessageId ? { ...m, text: currentText } : m));
          wordIdx++;
        } else {
          clearInterval(streamTimer);
        }
      }, 60);

    }, 1000);
  };

  // Sandbox Compiler Terminal execution simulation
  const handleCompileSandboxCode = () => {
    if (isRunningCode) return;
    setIsRunningCode(true);

    const logSteps = isBlockchainTrack
      ? [
          `$ solc contracts/PixoraToken.sol --bin --abi --optimize`,
          `[INFO] Initializing Solidity Compiler v0.8.20...`,
          `[INFO] Optimizing assembly instructions (200 compiler runs)`,
          `[INFO] Gas profiling: mintReward() cost estimated at 42,912 gas units.`,
          `[SUCCESS] Solidity source code compiled cleanly with no warnings.`,
          `[DEPLOY] Initializing deployment to local EVM testnet (Ganache RPC)...`,
          `[SUCCESS] Smart contract successfully deployed.`,
          `[CONTRACT] Address: 0x9D5f8C24FFdD1c9B231f822a101B2C690Efe663d`
        ]
      : isGameDevTrack
      ? [
          `$ msbuild HoverCraftController.cs --target:library --optimize`,
          `[INFO] Invoking Roslyn Mono C# Compiler v6.12.0...`,
          `[INFO] Resolving UnityEngine.CoreModule.dll references...`,
          `[INFO] Bundling assembly components (12 scripts, 3 dynamic mesh filters)`,
          `[SUCCESS] Assemblies generated successfully in 1.12s.`,
          `[RUN] Loading active Unity simulation scene...`,
          `[SUCCESS] Simulation engine active. Mesh stabilizers operating at 60 FPS.`
        ]
      : [
          `$ node sandbox.js`,
          `[INFO] Initializing Pixora JavaScript Playground runtime...`,
          `[INFO] Evaluating scope variables...`,
          `[SUCCESS] Runtime execution complete.`,
          `[OUTPUT] Welcome to Pixora Sandbox!`,
          `[OUTPUT] Successfully compiled lesson: ${activeLesson?.title || 'Sandbox'}`,
          `[OUTPUT] XP Reward: 25 XP`
        ];

    setTerminalOutput([logSteps[0]]);
    let stepIdx = 1;

    const timer = setInterval(() => {
      if (stepIdx < logSteps.length) {
        setTerminalOutput(prev => [...prev, logSteps[stepIdx]]);
        stepIdx++;
      } else {
        clearInterval(timer);
        setIsRunningCode(false);
        toast.success('Sandbox build complete! 🚀', {
          style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
        });
      }
    }, 400);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Space: play/pause (if video)
      if (e.code === 'Space' && activeLesson?.type === 'lesson') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'TEXTAREA' || activeTag === 'INPUT') return; // Ignore inside input fields
        
        e.preventDefault();
        const iframe = document.querySelector('iframe');
        if (iframe) {
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
    <div className="h-full flex flex-col bg-gradient-to-br from-[#02070f] via-[#05111f] to-[#01050a] overflow-hidden">
      
      {/* Dynamic Immersive Header */}
      <header className="h-16 flex-shrink-0 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 gap-4 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/student/my-courses')}
            className="flex-shrink-0 p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200 group"
            title="Back to courses"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="h-6 w-px bg-white/10" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-[320px]">
                {course?.title}
              </p>
              {isBlockchainTrack && (
                <span className="hidden sm:inline-block text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  Web3 Track
                </span>
              )}
              {isGameDevTrack && (
                <span className="hidden sm:inline-block text-[9px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                  Game Dev
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/40 truncate flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--st-color-primary)] animate-pulse" />
              {activeLesson?.title}
            </p>
          </div>
        </div>

        {/* Cinematic Trophy Progress Widget */}
        <div className="hidden lg:flex items-center gap-3.5 px-5 py-2 rounded-2xl bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <Trophy size={16} className="text-black" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white/80 tabular-nums">{courseProgressPercentage}% Complete</span>
              <span className="text-[10px] text-white/40">({completedCount}/{totalItems} Lessons)</span>
            </div>
            <div className="w-40 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--st-color-primary)] to-[var(--st-color-secondary)] rounded-full shadow-[0_0_10px_rgba(var(--st-color-primary-rgb),0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${courseProgressPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeLesson?.type === 'lesson' && (
            <>
              {isLessonCompleted ? (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                >
                  <CheckCircle2 size={15} /> Completed
                </motion.span>
              ) : (
                <motion.button
                  whileHover={canMarkComplete ? { scale: 1.02, y: -1 } : {}}
                  whileTap={canMarkComplete ? { scale: 0.98 } : {}}
                  onClick={handleMarkComplete}
                  disabled={!canMarkComplete || completing}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300
                    ${canMarkComplete
                      ? 'bg-[var(--st-color-primary)] text-black hover:opacity-90 shadow-lg shadow-[var(--st-color-primary)]/20'
                      : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                    }`}
                >
                  {completing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  <span>
                    {completing ? 'Securing...' : watchProgress < 90 ? `${Math.floor(watchProgress)}% Watched` : 'Complete'}
                  </span>
                </motion.button>
              )}
            </>
          )}

          <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              onClick={handlePreviousObjective}
              disabled={currentLessonIndex <= 0}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              title="Previous Module (Ctrl+←)"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={handleNextObjective}
              disabled={currentLessonIndex >= lessons.length - 1}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              title="Next Module (Ctrl+→)"
            >
              <SkipForward size={16} />
            </button>
          </div>

          <div className="w-px h-6 bg-white/10" />

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all"
            title="Cinematic Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            onClick={() => setIsCurriculumOpen(v => !v)}
            className={`p-2 rounded-xl border transition-all duration-200 ${isCurriculumOpen ? 'text-[var(--st-color-primary)] bg-[var(--st-color-primary)]/10 border-[var(--st-color-primary)]/20' : 'text-white/40 hover:text-white hover:bg-white/10 border-transparent'}`}
            title={isCurriculumOpen ? 'Close Curriculum' : 'Open Curriculum'}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setIsUtilityOpen(v => !v)}
            className={`p-2 rounded-xl border transition-all duration-200 ${isUtilityOpen ? 'text-[var(--st-color-primary)] bg-[var(--st-color-primary)]/10 border-[var(--st-color-primary)]/20' : 'text-white/40 hover:text-white hover:bg-white/10 border-transparent'}`}
            title={isUtilityOpen ? 'Close Utilities' : 'Open Utilities'}
          >
            <Layout size={18} />
          </button>
        </div>
      </header>

      {/* Main Double-Sidebar Sandbox Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Frosted Curriculum Sidebar */}
        <AnimatePresence mode="wait">
          {isCurriculumOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 330, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-shrink-0 border-r border-white/10 bg-[#02070f]/40 backdrop-blur-md flex flex-col overflow-hidden z-20"
            >
              <div className="px-5 py-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={14} className="text-[var(--st-color-primary)]" /> Curriculum Index
                </h3>
                <span className="text-[10px] font-bold text-white/30 bg-white/5 px-2.5 py-0.5 rounded-full">
                  {lessons.length} Modules
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scroll">
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
                    <div key={module.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-wider">
                            MODULE 0{mIdx + 1}
                          </p>
                          <h4 className="text-xs font-bold text-white/80 leading-relaxed truncate max-w-[220px]">
                            {module.title}
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-white/40 tabular-nums bg-white/5 px-2 py-0.5 rounded-lg">
                          {Math.round(moduleProgress)}%
                        </span>
                      </div>
                      
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[var(--st-color-primary)] to-[var(--st-color-primary)]/40 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${moduleProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>

                      <div className="space-y-1.5 pt-2">
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
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300 text-left group
                                ${isActive
                                  ? 'bg-[var(--st-color-primary)]/10 border-[var(--st-color-primary)]/30 shadow-[0_0_15px_rgba(var(--st-color-primary-rgb),0.05)]'
                                  : locked
                                    ? 'opacity-30 cursor-not-allowed border-transparent'
                                    : 'hover:bg-white/[0.04] border-transparent hover:border-white/10'
                                }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-300
                                ${isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : isActive
                                    ? 'bg-[var(--st-color-primary)]/20 text-[var(--st-color-primary)] border border-[var(--st-color-primary)]/30'
                                    : 'bg-white/5 text-white/30 border border-white/5 group-hover:text-white/60'
                                }`}
                              >
                                {locked ? <Lock size={12} /> : isCompleted ? <CheckCircle2 size={13} /> : <Play size={12} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : locked ? 'text-white/30' : 'text-white/60 group-hover:text-white/80'}`}>
                                  {item.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded
                                    ${item.type === 'lesson'
                                      ? 'text-sky-400 bg-sky-400/5'
                                      : item.type === 'quiz'
                                        ? 'text-purple-400 bg-purple-400/5'
                                        : 'text-orange-400 bg-orange-400/5'}`}
                                  >
                                    {item.type}
                                  </span>
                                  {locked && <span className="text-[9px] text-white/20">Locked</span>}
                                  {isCompleted && <span className="text-[9px] text-emerald-400/60 font-medium">Done</span>}
                                </div>
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

        {/* Center Main HUD Content Panel */}
        <main ref={mainContentRef} className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scroll bg-[#02050a]/20">
          
          {/* Main Video Viewport Cards */}
          <div className="p-6 flex-shrink-0">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black/60 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group/video">
              
              {/* Cinematic Backlit Ambient Glow */}
              <div className={`absolute -inset-20 opacity-20 pointer-events-none blur-[100px] transition-all duration-500
                ${isBlockchainTrack ? 'bg-gradient-to-tr from-emerald-500 via-cyan-500 to-transparent' : isGameDevTrack ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-transparent' : 'bg-gradient-to-tr from-lime-500 via-teal-500 to-transparent'}`}
              />

              {activeLesson ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeLesson.type}-${activeLesson.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full relative z-10"
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
                        
                        {/* Custom HUD Overlays */}
                        {!isLessonCompleted && watchProgress < 100 && (
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-2 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300">
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-[var(--st-color-primary)] to-[var(--st-color-secondary)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${watchProgress}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-white/60">
                              <span>Telemetry tracking synced</span>
                              <span className="font-bold text-white bg-black/50 px-2 py-0.5 rounded">{Math.floor(watchProgress)}% Watched</span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : activeLesson.type === 'lesson' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-white/[0.01] to-black/40 p-12 text-center">
                        <div className="p-8 rounded-full bg-[var(--st-color-primary)]/10 border border-[var(--st-color-primary)]/20 shadow-[0_0_30px_rgba(var(--st-color-primary-rgb),0.15)] animate-pulse">
                          <FileText size={56} className="text-[var(--st-color-primary)]" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-2">{activeLesson.title}</h2>
                          {activeLesson.description && (
                            <p className="text-white/40 text-sm max-w-lg mx-auto leading-relaxed">{activeLesson.description}</p>
                          )}
                        </div>
                        <div className="w-64 space-y-2">
                          <div className="flex justify-between text-[10px] text-white/40 font-bold uppercase tracking-wider">
                            <span>Reading Progress</span>
                            <span className="text-[var(--st-color-primary)]">{Math.floor(watchProgress)}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-[var(--st-color-primary)] to-[var(--st-color-secondary)] rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${watchProgress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : activeLesson.type === 'assignment' ? (
                      <div className="h-full overflow-y-auto p-6 bg-[#030912]">
                        <AssignmentViewer assignment={activeLesson} studentId={user.id} onComplete={fetchCourseData} />
                      </div>
                    ) : activeLesson.type === 'quiz' ? (
                      <div className="h-full overflow-y-auto p-6 bg-[#030912]">
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

          {/* Lesson Metadata details and dropdown assets */}
          <div className="max-w-4xl mx-auto w-full px-8 pb-12 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-white/10">
              <div className="space-y-3.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border
                    ${activeLesson?.type === 'lesson'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      : activeLesson?.type === 'quiz'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}
                  >
                    {activeLesson?.type} MODULE
                  </span>
                  <div className="flex items-center gap-2 text-white/40 text-xs font-semibold">
                    <Clock size={12} />
                    <span>~15 min duration</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <span>Lesson {currentLessonIndex + 1} of {lessons.length}</span>
                  </div>
                </div>

                <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight tracking-tight">
                  {activeLesson?.title}
                </h1>

                {course?.instructor && (
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5 w-fit">
                    <img
                      src={course.instructor.avatar_url}
                      className="w-9 h-9 rounded-full border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                      alt={course.instructor.full_name}
                    />
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase">Assigned Instructor</p>
                      <p className="text-sm font-semibold text-white/80">{course.instructor.full_name}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3.5 flex-shrink-0">
                {activeLesson?.type === 'lesson' && (
                  isLessonCompleted ? (
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                    >
                      <CheckCircle2 size={16} /> Mark Completed
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={canMarkComplete ? { scale: 1.02, y: -1 } : {}}
                      whileTap={canMarkComplete ? { scale: 0.98 } : {}}
                      onClick={handleMarkComplete}
                      disabled={!canMarkComplete || completing}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300
                        ${canMarkComplete
                          ? 'bg-[var(--st-color-primary)] text-black hover:opacity-90 shadow-lg shadow-[var(--st-color-primary)]/20'
                          : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                        }`}
                    >
                      {completing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      <span>{completing ? 'Securing...' : !canMarkComplete ? `${Math.floor(watchProgress)}% Watched` : 'Mark Complete'}</span>
                    </motion.button>
                  )
                )}
              </div>
            </div>

            {/* Description Dropcap Box */}
            {activeLesson?.description && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3 shadow-inner"
              >
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Info size={13} className="text-[var(--st-color-primary)]" /> Lesson Blueprint
                </h3>
                <div className="text-sm text-white/60 leading-relaxed space-y-3 font-medium">
                  {activeLesson.description.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </motion.div>
            )}

            {/* High-end Resource Cards with Glows */}
            {activeLesson?.resources?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Download size={14} className="text-[var(--st-color-primary)]" /> Resources & Materials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeLesson.resources.map((res, i) => (
                    <motion.a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-[var(--st-color-primary)]/10 hover:border-[var(--st-color-primary)]/20 transition-all duration-300 group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[var(--st-color-primary)]/20 transition-colors border border-white/5">
                        <Download size={16} className="text-white/40 group-hover:text-[var(--st-color-primary)] transition-colors animate-pulse" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white/80 group-hover:text-white truncate">
                          {res.title || 'Resource File'}
                        </p>
                        <p className="text-[10px] text-white/30 uppercase mt-0.5 tracking-wider">CLICK TO DOWNLOAD</p>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Bottom Lesson Level Navigation */}
            <div className="flex justify-between items-center pt-8 border-t border-white/10">
              <button
                onClick={handlePreviousObjective}
                disabled={currentLessonIndex <= 0}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-xs font-bold uppercase tracking-wider"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={handleNextObjective}
                disabled={currentLessonIndex >= lessons.length - 1}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all text-xs font-bold uppercase tracking-wider"
              >
                Advance <SkipForward size={14} />
              </button>
            </div>
          </div>
        </main>

        {/* Right Collapsible Interactive Utilities & AI Assistant Sidebar */}
        <AnimatePresence mode="wait">
          {isUtilityOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 370, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex-shrink-0 border-l border-white/10 bg-[#02070f]/40 backdrop-blur-md flex flex-col overflow-hidden z-20"
            >
              
              {/* High-end utilities tab buttons */}
              <div className="flex border-b border-white/10 bg-black/20">
                {[
                  { id: 'notes', icon: <FileText size={14} />, label: 'Notes' },
                  { id: 'ai', icon: <Sparkles size={14} />, label: 'AI Tutor' },
                  { id: 'sandbox', icon: <Code size={14} />, label: 'Code Lab' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 relative
                      ${activeTab === tab.id ? 'text-[var(--st-color-primary)]' : 'text-white/40 hover:text-white/70'}`}
                  >
                    {tab.icon}
                    <span className="mt-1">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.span
                        layoutId="activeUtilityTab"
                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[var(--st-color-primary)] shadow-[0_0_10px_rgba(var(--st-color-primary-rgb),0.8)]"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto custom-scroll flex flex-col">
                <AnimatePresence mode="wait">
                  
                  {/* Notes Workspace */}
                  {activeTab === 'notes' && (
                    <motion.div
                      key="notes"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 space-y-5 flex-1 flex flex-col"
                    >
                      <div className="space-y-3 flex-1 flex flex-col">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                            Lecture Notes Pad
                          </p>
                          <button
                            onClick={() => handleSaveNote(false)}
                            disabled={savingNote || !notes.trim()}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-wider bg-[var(--st-color-primary)]/10 hover:bg-[var(--st-color-primary)]/20 px-3 py-1.5 rounded-xl transition-all disabled:opacity-30 border border-[var(--st-color-primary)]/20"
                          >
                            {savingNote ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                            Save notes
                          </button>
                        </div>
                        <textarea
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          placeholder="Jot down notes here... The system auto-saves as you study."
                          className="w-full flex-1 bg-white/[0.01] border border-white/10 rounded-2xl p-4 text-sm text-white/80 focus:outline-none focus:border-[var(--st-color-primary)]/40 focus:bg-white/[0.04] min-h-[220px] transition-all placeholder:text-white/20 resize-none font-medium leading-relaxed"
                        />
                      </div>

                      {recentNotes.length > 0 && (
                        <div className="space-y-3 flex-shrink-0">
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Saved Notes Repository</p>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scroll pr-1">
                            {recentNotes.slice(0, 4).map(note => (
                              <motion.div
                                key={note.id}
                                whileHover={{ scale: 1.01 }}
                                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer"
                                onClick={() => setNotes(note.content)}
                              >
                                <p className="text-[9px] font-bold text-[var(--st-color-primary)] mb-1 uppercase tracking-wider truncate">
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

                  {/* Simulated Conversational AI Assistant */}
                  {activeTab === 'ai' && (
                    <motion.div
                      key="ai"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 flex flex-col flex-1 h-full overflow-hidden"
                    >
                      {/* Chat Messages Log */}
                      <div className="flex-1 overflow-y-auto custom-scroll space-y-4 mb-4 pr-1">
                        {aiMessages.map(msg => (
                          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-1.5 mb-1 px-1.5">
                              {msg.sender === 'ai' ? (
                                <>
                                  <Sparkles size={11} className="text-[var(--st-color-primary)]" />
                                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Pixora Tutor AI</span>
                                </>
                              ) : (
                                <span className="text-[9px] font-bold text-[var(--st-color-primary)]/70 uppercase tracking-widest">You</span>
                              )}
                            </div>
                            <div className={`p-3.5 rounded-2xl text-xs max-w-[90%] leading-relaxed whitespace-pre-wrap border
                              ${msg.sender === 'user'
                                ? 'bg-[var(--st-color-primary)]/10 text-white border-[var(--st-color-primary)]/20 rounded-tr-none'
                                : 'bg-white/[0.02] text-white/80 border-white/5 rounded-tl-none'}`}
                            >
                              {msg.text || (
                                <span className="flex items-center gap-2 text-white/30">
                                  <Loader2 size={12} className="animate-spin" /> Stream compiling...
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                        {isAiTyping && (
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-1.5 mb-1 px-1.5">
                              <Sparkles size={11} className="text-[var(--st-color-primary)] animate-pulse" />
                              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Pixora Tutor AI is thinking...</span>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 rounded-tl-none">
                              <div className="flex gap-1.5 items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--st-color-primary)]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--st-color-primary)]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--st-color-primary)]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={aiChatEndRef} />
                      </div>

                      {/* Quick Prompts Drawer */}
                      {aiMessages.length === 1 && (
                        <div className="space-y-2 mb-4 bg-white/[0.01] p-3 rounded-2xl border border-white/5 flex-shrink-0">
                          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Synaptic Quick Prompts</p>
                          <div className="space-y-1.5">
                            {[
                              { label: 'Explain this lesson simply', val: 'Explain this lesson simply' },
                              { label: 'Summarize key points', val: 'Summarize key points' },
                              { label: 'Give me a practice quiz', val: 'Give me a practice quiz' },
                              { label: 'Suggest related topics', val: 'Suggest related topics' }
                            ].map(q => (
                              <button
                                key={q.val}
                                onClick={() => handleAiMessageSubmit(q.val)}
                                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-[var(--st-color-primary)]/10 hover:border-[var(--st-color-primary)]/20 transition-all text-left text-xs font-semibold text-white/60 hover:text-white group"
                              >
                                {q.label}
                                <ChevronRight size={13} className="text-white/20 group-hover:text-[var(--st-color-primary)] transition-colors" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Input Dialog Panel */}
                      <div className="relative flex-shrink-0">
                        <input
                          type="text"
                          value={aiInput}
                          onChange={e => setAiInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAiMessageSubmit()}
                          placeholder="Ask the AI Tutor anything about this lesson..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-4 pr-12 text-xs font-medium text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--st-color-primary)]/45 focus:bg-white/[0.08] transition-all"
                        />
                        <button
                          onClick={() => handleAiMessageSubmit()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[var(--st-color-primary)]/10 text-[var(--st-color-primary)] hover:bg-[var(--st-color-primary)] hover:text-black transition-all"
                        >
                          <Send size={13} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Sandboxed Compiler Terminal (Code Lab) */}
                  {activeTab === 'sandbox' && (
                    <motion.div
                      key="sandbox"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 flex flex-col flex-1 h-full overflow-hidden"
                    >
                      {/* Editor Panel Header */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <Code size={14} className="text-[var(--st-color-primary)]" />
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">
                            {isBlockchainTrack ? 'Solidity Compiler IDE' : isGameDevTrack ? 'C# Mono assembly IDE' : 'JavaScript Workspace'}
                          </span>
                        </div>
                        <span className="text-[8px] font-bold text-white/30 uppercase bg-white/5 px-2 py-0.5 rounded">
                          v0.8.20
                        </span>
                      </div>

                      {/* Code Block textarea */}
                      <div className="relative flex-1 min-h-[180px] bg-black/40 border border-white/5 rounded-2xl overflow-hidden font-mono p-3">
                        <textarea
                          value={codeText}
                          onChange={e => setCodeText(e.target.value)}
                          spellCheck="false"
                          className="w-full h-full bg-transparent text-xs text-white/80 focus:outline-none resize-none font-mono leading-relaxed"
                          style={{ tabSize: 4 }}
                        />
                        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 pointer-events-none opacity-40">
                          <span className="inline-block w-2 h-2 rounded-full bg-[var(--st-color-primary)] animate-pulse" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white">Live Editor</span>
                        </div>
                      </div>

                      {/* Terminal Viewport */}
                      <div className="h-44 bg-black border border-white/10 rounded-2xl mt-3 flex flex-col overflow-hidden font-mono shadow-inner relative">
                        <div className="px-3.5 py-1.5 bg-white/5 flex items-center justify-between border-b border-white/5 flex-shrink-0">
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                            <Terminal size={11} className="text-white/40" /> SYSTEM OUTPUT CONSOLE
                          </span>
                          <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                          </div>
                        </div>

                        <div className="p-3.5 flex-1 overflow-y-auto custom-scroll text-[10px] space-y-1.5 select-all">
                          {terminalOutput.map((line, index) => {
                            const lineStr = line ? String(line) : '';
                            return (
                              <div
                                key={index}
                                className={`leading-relaxed whitespace-pre-wrap
                                  ${lineStr.startsWith('$')
                                    ? 'text-white/40 font-bold'
                                    : lineStr.startsWith('[SUCCESS]')
                                      ? 'text-emerald-400 font-extrabold'
                                      : lineStr.startsWith('[ERROR]')
                                        ? 'text-red-400 font-extrabold animate-pulse'
                                        : lineStr.startsWith('[CONTRACT]') || lineStr.startsWith('[DEPLOY]')
                                          ? 'text-cyan-400 font-bold'
                                          : 'text-white/60'
                                  }`}
                              >
                                {lineStr}
                              </div>
                            );
                          })}
                          {isRunningCode && (
                            <div className="text-[10px] text-white/30 italic flex items-center gap-2 animate-pulse">
                              <Loader2 size={11} className="animate-spin" /> Fetching compilation tokens...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Compiler Button */}
                      <motion.button
                        whileHover={!isRunningCode ? { scale: 1.01 } : {}}
                        whileTap={!isRunningCode ? { scale: 0.99 } : {}}
                        onClick={handleCompileSandboxCode}
                        disabled={isRunningCode}
                        className={`w-full py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 border mt-3 transition-all duration-300
                          ${isRunningCode
                            ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-[var(--st-color-primary)] text-black border-transparent hover:opacity-90 shadow-md shadow-[var(--st-color-primary)]/10'}`}
                      >
                        {isRunningCode ? (
                          <>
                            <Loader2 size={13} className="animate-spin" /> COMPILING SOURCE...
                          </>
                        ) : (
                          <>
                            <Code size={13} /> COMPILE & RUN CODE
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Collapsed bottom stats widget */}
              <div className="p-4 border-t border-white/10 bg-black/20 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">COHORT PROGRESS RATE</p>
                  <span className="text-xs font-bold text-[var(--st-color-primary)]">{courseProgressPercentage}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[var(--st-color-primary)] to-[var(--st-color-secondary)] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${courseProgressPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[9px] font-semibold text-white/20 uppercase tracking-widest">
                  <span>{completedCount} Completed</span>
                  <span>{totalItems - completedCount} Left</span>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Embedded styles for beautiful, custom scrollbar tracks */}
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CoursePlayer;