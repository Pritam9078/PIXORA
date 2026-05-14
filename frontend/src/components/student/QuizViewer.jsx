import React, { useState, useEffect } from 'react';
import { 
  Trophy, ChevronRight, ChevronLeft, 
  CheckCircle2, XCircle, Timer, Award,
  Loader2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizService from '../../services/QuizService';
import { toast } from 'react-hot-toast';

const QuizViewer = ({ quiz, studentId, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [quiz.id]);

  useEffect(() => {
    let timer;
    if (started && !completed && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !completed) {
      handleComplete();
    }
    return () => clearInterval(timer);
  }, [started, completed, timeLeft]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await QuizService.getQuizQuestions(quiz.id);
      setQuestions(data || []);
      if (quiz.time_limit_minutes) {
        setTimeLeft(quiz.time_limit_minutes * 60);
      }
    } catch (error) {
      toast.error('Failed to load assessment questions');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setStarted(true);
  };

  const handleAnswerSelect = (questionId, optionIdx) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleComplete = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    // Calculate score
    let correctCount = 0;
    questions.forEach(q => {
      // Assuming correct_answer stores the index for MCQs
      if (answers[q.id]?.toString() === q.correct_answer?.toString()) {
        correctCount++;
      }
    });

    const finalScore = (correctCount / questions.length) * 100;
    const status = finalScore >= (quiz.passing_score || 70) ? 'passed' : 'failed';

    try {
      await QuizService.submitQuizAttempt(studentId, quiz.id, finalScore, status);
      setScore(finalScore);
      setCompleted(true);
      toast.success(status === 'passed' ? 'Assessment Passed! Promotion Secured.' : 'Assessment Failed. Review and retry.');
      if (onComplete) onComplete();
    } catch (error) {
      toast.error('Failed to synchronize results');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 max-w-xl w-full space-y-8 text-center border-t-4 border-primary"
        >
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Award className="text-primary" size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-black text-white uppercase italic tracking-tight">
              Assessment Ready
            </h1>
            <p className="text-on-surface-variant/60 text-sm font-sans leading-relaxed">
              Objective: {quiz.title}<br />
              Synchronize your neural links. This assessment will test your proficiency in current sector modules.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] font-headline font-black text-on-surface-variant/40 uppercase tracking-widest">Questions</span>
              <p className="text-xl font-black text-white">{questions.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] font-headline font-black text-on-surface-variant/40 uppercase tracking-widest">Time Limit</span>
              <p className="text-xl font-black text-white">{quiz.time_limit_minutes ? `${quiz.time_limit_minutes}m` : 'Unlimited'}</p>
            </div>
          </div>

          <button 
            onClick={handleStart}
            className="btn-primary w-full !py-4 shadow-[0_0_30px_rgba(var(--st-color-glow-rgb),0.3)]"
          >
            <span className="text-xs uppercase tracking-widest font-black">Initiate Synchronous Link</span>
          </button>
        </motion.div>
      </div>
    );
  }

  if (completed) {
    const isPassed = score >= (quiz.passing_score || 70);
    return (
      <div className="h-full flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-12 max-w-xl w-full space-y-8 text-center"
        >
          <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${isPassed ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            {isPassed ? <Trophy className="text-green-500" size={48} /> : <AlertTriangle className="text-red-500" size={48} />}
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-headline font-black text-white uppercase italic tracking-tight">
              {isPassed ? 'Assessment Successful' : 'Assessment Failed'}
            </h1>
            <p className="text-on-surface-variant/60 text-sm font-sans">
              Neural synchronization complete. Sector proficiency results finalized.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-[10px] font-headline font-black text-on-surface-variant/40 uppercase tracking-[0.3em] mb-2">Final Proficiency Score</span>
            <div className="relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle 
                  cx="80" cy="80" r="70" 
                  className="stroke-white/5" 
                  strokeWidth="8" fill="transparent" 
                />
                <motion.circle 
                  cx="80" cy="80" r="70" 
                  className={isPassed ? 'stroke-green-500' : 'stroke-red-500'}
                  strokeWidth="8" fill="transparent"
                  strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * score) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-black text-white">{Math.round(score)}%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {!isPassed && (
              <button 
                onClick={() => window.location.reload()}
                className="btn-secondary flex-1 !py-4 flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                <span className="text-xs uppercase tracking-widest font-black">Retry Link</span>
              </button>
            )}
            <button 
              onClick={() => window.location.reload()} // Simplified for now
              className="btn-primary flex-1 !py-4"
            >
              <span className="text-xs uppercase tracking-widest font-black">Continue Mission</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Quiz Progress Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between glass-panel rounded-none">
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-headline font-black text-on-surface-variant/40 uppercase tracking-widest block">Question</span>
            <div className="flex items-center gap-2">
               <span className="text-lg font-black text-white">{currentQuestionIdx + 1}</span>
               <span className="text-on-surface-variant/40">/</span>
               <span className="text-sm font-bold text-on-surface-variant/60">{questions.length}</span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/5" />

          {timeLeft !== null && (
            <div className="space-y-1">
              <span className="text-[10px] font-headline font-black text-on-surface-variant/40 uppercase tracking-widest block">Time Remaining</span>
              <div className={`flex items-center gap-2 ${timeLeft < 60 ? 'text-red-500' : 'text-primary'}`}>
                <Timer size={18} />
                <span className="text-lg font-black font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {questions.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                idx === currentQuestionIdx ? 'bg-primary w-10 shadow-[0_0_10px_var(--st-color-glow)]' :
                answers[questions[idx].id] !== undefined ? 'bg-green-500/40' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Body */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-3xl mx-auto space-y-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <h2 className="text-2xl lg:text-3xl font-headline font-black text-white leading-tight">
                {currentQuestion.content}
              </h2>

              <div className="grid gap-4">
                {(currentQuestion.options || []).map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                    className={`group relative flex items-center p-6 rounded-2xl border transition-all duration-300 text-left ${
                      answers[currentQuestion.id] === idx 
                        ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--st-color-glow-rgb),0.1)]' 
                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-6 font-black transition-colors ${
                      answers[currentQuestion.id] === idx ? 'bg-primary text-black' : 'bg-white/10 text-on-surface-variant/60'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={`text-base font-medium transition-colors ${
                      answers[currentQuestion.id] === idx ? 'text-white' : 'text-on-surface-variant/80'
                    }`}>
                      {option.text || option}
                    </span>
                    {answers[currentQuestion.id] === idx && (
                      <motion.div 
                        layoutId="active-option"
                        className="absolute right-6"
                      >
                        <CheckCircle2 size={24} className="text-primary" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-8 border-t border-white/5 bg-surface/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIdx === 0}
            className="p-4 rounded-xl glass-panel border-white/5 text-white disabled:opacity-30 flex items-center gap-2 group transition-all"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-headline font-black uppercase tracking-widest">Back</span>
          </button>

          {currentQuestionIdx === questions.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={submitting || Object.keys(answers).length < questions.length}
              className="btn-primary !px-10 !py-4 flex items-center gap-3 shadow-[0_0_30px_var(--st-color-glow)] disabled:opacity-50"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
              <span className="text-xs uppercase tracking-widest font-black">Finalize Assessment</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIdx(prev => Math.min(questions.length - 1, prev + 1))}
              className="btn-primary !px-10 !py-4 flex items-center gap-3 shadow-[0_0_30px_var(--st-color-glow)]"
            >
              <span className="text-xs uppercase tracking-widest font-black">Next Objective</span>
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizViewer;
