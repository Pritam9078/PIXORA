import React, { useState, useEffect } from 'react';
import { 
  Zap, Clock, Award, 
  Brain, Target, Play, 
  ChevronRight, Sparkles, BarChart3,
  Loader2, AlertCircle, CheckCircle2,
  Search, X, ArrowLeft, ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { QuizService } from '../../services/QuizService';
import { toast } from 'react-hot-toast';

const QuizPlayer = ({ quiz, onClose, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const questions = quiz.questions || [
    { id: 1, text: "What is the primary consensus mechanism in Ethereum 2.0?", options: ["Proof of Work", "Proof of Stake", "Proof of Authority", "Proof of History"] },
    { id: 2, text: "Which component is responsible for rendering geometry in a game engine?", options: ["Physics Engine", "GPU", "Rasterizer", "Audio Mixer"] },
    { id: 3, text: "In Solidity, what keyword is used to define a constant variable?", options: ["const", "immutable", "fixed", "permanent"] }
  ];

  const handleAnswer = (option) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: option }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate scoring logic
    const mockScore = Math.floor(Math.random() * 40) + 60; // 60-100%
    setScore(mockScore);
    
    try {
      await QuizService.submitQuizAttempt(quiz.student_id, quiz.id, mockScore, answers);
      setIsFinished(true);
      toast.success('Cognitive scan complete. Data synchronized.');
    } catch (error) {
      toast.error('Data synchronization failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFinished) {
    const isPassed = score >= quiz.passing_score;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 animate-in fade-in duration-500">
        <div className="absolute inset-0 bg-[#051424]/95 backdrop-blur-2xl"></div>
        <div className="relative z-10 w-full max-w-2xl glass-panel p-12 rounded-[48px] border-white/5 text-center space-y-8 overflow-hidden">
          <div className="absolute inset-0 circuit-bg opacity-5"></div>
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center shadow-2xl relative ${isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {isPassed ? <ShieldCheck size={48} className="drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" /> : <AlertCircle size={48} />}
            <div className={`absolute -inset-4 rounded-full animate-ping opacity-20 ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-headline font-bold text-white">Evaluation <span className={isPassed ? 'text-emerald-400' : 'text-red-400'}>{isPassed ? 'Successful' : 'Incomplete'}</span></h2>
            <p className="text-on-surface-variant/60 font-medium">Your cognitive retention has been mapped to the professional matrix.</p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="glass-card p-6 rounded-3xl border-white/5">
              <p className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest mb-1">Final Score</p>
              <p className={`text-3xl font-headline font-bold ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>{score}%</p>
            </div>
            <div className="glass-card p-6 rounded-3xl border-white/5">
              <p className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest mb-1">Threshold</p>
              <p className="text-3xl font-headline font-bold text-white">{quiz.passing_score}%</p>
            </div>
          </div>

          <button onClick={onClose} className="w-full btn-primary !py-5 !rounded-2xl shadow-[0_0_30px_rgba(var(--st-color-primary-rgb),0.3)]">
            RETURN TO ACADEMY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-[#051424]/90 backdrop-blur-3xl"></div>
      
      <div className="relative z-10 w-full max-w-4xl glass-panel rounded-[48px] border-white/5 flex flex-col max-h-[90vh] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-[var(--st-color-primary)]/10 flex items-center justify-center text-[var(--st-color-primary)] shadow-inner">
               <Brain size={24} />
            </div>
            <div>
              <h3 className="font-headline font-bold text-white tracking-tight">{quiz.title}</h3>
              <p className="text-[10px] font-headline font-bold text-on-surface-variant/30 uppercase tracking-widest mt-1">Cognitive Scan in Progress</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl glass-card border-white/5 flex items-center justify-center text-on-surface-variant/40 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-white/5">
           <div 
             className="h-full bg-[var(--st-gradient-primary)] shadow-[0_0_10px_var(--st-color-glow)] transition-all duration-500"
             style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
           ></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
          <div className="space-y-6">
            <span className="text-[11px] font-headline font-black text-[var(--st-color-primary)] uppercase tracking-[0.3em] block">Question {currentQuestion + 1} of {questions.length}</span>
            <h2 className="text-3xl font-headline font-bold text-white leading-tight">
              {questions[currentQuestion].text}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {questions[currentQuestion].options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className={`p-8 rounded-[32px] border text-left transition-all duration-300 relative group overflow-hidden ${
                  answers[currentQuestion] === option 
                    ? 'bg-[var(--st-color-primary)]/10 border-[var(--st-color-primary)] shadow-[0_0_30px_rgba(var(--st-color-primary-rgb),0.1)]' 
                    : 'glass-card border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-headline font-black text-xs border transition-all ${
                    answers[currentQuestion] === option 
                      ? 'bg-[var(--st-color-primary)] border-[var(--st-color-primary)] text-black' 
                      : 'border-white/10 text-on-surface-variant/40'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`font-medium ${answers[currentQuestion] === option ? 'text-white' : 'text-on-surface-variant/60 group-hover:text-white'}`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
          <button 
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            className="btn-outline !py-3.5 !px-8 !rounded-xl !text-[10px] !tracking-[0.2em] disabled:opacity-20"
          >
            <ArrowLeft size={16} />
            <span>PREVIOUS</span>
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !answers[currentQuestion]}
              className="btn-primary !py-3.5 !px-10 !rounded-xl !text-[10px] !tracking-[0.2em] shadow-[0_0_30px_rgba(var(--st-color-primary-rgb),0.3)]"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
              <span>INITIALIZE SYNC</span>
            </button>
          ) : (
            <button 
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              disabled={!answers[currentQuestion]}
              className="btn-primary !py-3.5 !px-10 !rounded-xl !text-[10px] !tracking-[0.2em]"
            >
              <span>NEXT STEP</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Quizzes = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuiz, setActiveQuiz] = useState(null);

  const fetchQuizzes = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await QuizService.getQuizzes(user.id);
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to synchronize cognitive assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [user]);

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[var(--st-color-primary)] animate-spin" />
        <p className="text-on-surface-variant/40 font-headline font-bold text-[10px] uppercase tracking-[0.2em]">Synchronizing Cognitive Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-white/5 text-[var(--st-color-primary)] font-headline font-bold text-[9px] uppercase tracking-[0.2em]">
            <Brain size={14} />
            Cognitive Assessment
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white">Knowledge <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_10px_var(--st-color-glow)]">Synapse</span></h1>
          <p className="text-on-surface-variant/60 font-medium">Verify your neural retention and earn mastery badges through tactical evaluations.</p>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--st-color-primary)] transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-card border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 transition-all placeholder:text-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => {
            const bestScore = quiz.myAttempts?.length > 0 
              ? Math.max(...quiz.myAttempts.map(a => a.score)) 
              : null;
            const isPassed = bestScore !== null && bestScore >= quiz.passing_score;

            return (
              <div key={quiz.id} className="glass-panel p-8 rounded-[40px] border-white/5 flex flex-col group hover:border-[var(--st-color-primary)]/30 transition-all shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent"></div>
                
                <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--st-color-primary)]/10 flex items-center justify-center text-[var(--st-color-primary)] group-hover:scale-110 transition-transform shadow-[inset_0_0_15px_rgba(var(--st-color-primary-rgb),0.2)]">
                      <Brain size={28} />
                    </div>
                    <span className={`text-[9px] font-headline font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${
                      bestScore !== null 
                        ? isPassed 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-[var(--st-color-primary)]/10 text-[var(--st-color-primary)] border-[var(--st-color-primary)]/20'
                     }`}>
                      {bestScore !== null ? `BEST: ${bestScore}%` : 'PENDING'}
                    </span>
                </div>
    
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-headline font-bold text-xl text-white tracking-tight leading-tight group-hover:text-[var(--st-color-primary)] transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-[10px] font-headline font-bold text-on-surface-variant/30 uppercase tracking-[0.15em] mt-2">
                      {quiz.course?.title || 'General Curriculum'}
                    </p>
                  </div>
    
                  <div className="flex items-center gap-6 text-on-surface-variant/40 py-4 border-y border-white/5">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span className="text-xs font-bold">{quiz.time_limit / 60} MIN</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 size={14} />
                      <span className="text-xs font-bold">{quiz.passing_score}% PASS</span>
                    </div>
                  </div>
    
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                       <Award size={18} />
                    </div>
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-none">
                       Neural Reward:<br/><span className="text-white">PRO PROTOCOL ACCESS</span>
                    </span>
                  </div>
                </div>
    
                <button 
                  onClick={() => setActiveQuiz({ ...quiz, student_id: user.id })}
                  className="btn-outline w-full mt-8 py-4 group/btn"
                >
                    <span className="flex items-center justify-center gap-2">
                      {bestScore !== null ? 'Retry Evaluation' : 'Initialize Scan'}
                      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center glass-panel rounded-[40px] border-white/5 space-y-6">
            <Target size={48} className="mx-auto text-on-surface-variant/20" />
            <p className="text-on-surface-variant/40 font-headline font-bold text-sm uppercase tracking-widest">No cognitive assessments scheduled.</p>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <section className="glass-panel p-10 rounded-[48px] border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 circuit-bg opacity-5"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="w-20 h-20 rounded-3xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
            <Sparkles size={40} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h3 className="text-2xl font-headline font-bold text-white tracking-tight">Performance Analytics</h3>
            <p className="text-on-surface-variant/60 font-medium">
              Your cognitive data is being aggregated. Complete more evaluations to unlock your personalized expertise radar.
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-[10px] font-headline font-black text-on-surface-variant/20 uppercase tracking-widest mb-1">Rank</p>
              <p className="text-2xl font-headline font-bold text-white">#--</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-headline font-black text-on-surface-variant/20 uppercase tracking-widest mb-1">Avg Score</p>
              <p className="text-2xl font-headline font-bold text-[var(--st-color-primary)]">
                {quizzes.some(q => q.myAttempts?.length > 0) 
                  ? Math.round(quizzes.reduce((acc, q) => {
                      const best = q.myAttempts?.length > 0 ? Math.max(...q.myAttempts.map(a => a.score)) : 0;
                      return acc + best;
                    }, 0) / quizzes.filter(q => q.myAttempts?.length > 0).length) 
                  : '--'}%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Modal */}
      {activeQuiz && (
        <QuizPlayer 
          quiz={activeQuiz} 
          onClose={() => {
            setActiveQuiz(null);
            fetchQuizzes();
          }} 
        />
      )}
    </div>
  );
};

export default Quizzes;
