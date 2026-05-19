import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Gamepad2, Wallet, ArrowRight, ArrowLeft, 
  CheckCircle2, Cpu, Code, Sparkles, User,
  Calendar, Award, Terminal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { ProfileService } from '../../services/ProfileService';
import { toast } from 'react-hot-toast';

const MENTORS = {
  blockchain: {
    name: 'Vitalik S.',
    title: 'Core Protocol Architect',
    avatar: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=200&auto=format&fit=crop',
    bio: 'Pioneered decentralization logic. Expert in smart contract patterns, EVM scalability, and ZK-proofs.',
    quote: '"Code is law. Let us craft bulletproof architectures."'
  },
  game_dev: {
    name: 'Tim S.',
    title: 'Lead Unreal & Engine Architect',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    bio: '20+ years of high-performance rendering. Veteran developer specializing in UE5, C++, and immersive simulation.',
    quote: '"Design is immersive. Build worlds that live and breathe."'
  }
};

const EnrollNow = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { currentTheme, setTheme } = useStudentTheme();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    learning_track: 'game_dev', // default
    duration: 'immersive', // standard vs immersive (Sprint Student 4 weeks vs Immersive Core 8 weeks)
    cohort: 'June 1, 2026',
    bio: profile?.bio || '',
    github: '',
    discord: ''
  });

  const handleTrackSelect = (track) => {
    setFormData(prev => ({ ...prev, learning_track: track }));
    setTheme(track); // Instantly swap UI theme!
    toast.success(`${track === 'blockchain' ? 'Cyber Ether (Web3)' : 'Neon Void (Game Dev)'} Theme Calibrated!`);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bio.trim()) {
      toast.error('Identity Biography is required.');
      return;
    }
    
    try {
      setLoading(true);
      const updates = {
        learning_track: formData.learning_track,
        bio: formData.bio,
        wallet_address: formData.learning_track === 'blockchain' ? '0x' + Array(40).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join('') : null
      };

      await ProfileService.updateProfile(user.id, updates);
      await refreshProfile();
      
      toast.success('Learning Track Calibrated Successfully!');
      navigate('/student/document-verification');
    } catch (err) {
      console.error('Enrollment error:', err);
      toast.error('Calibration failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const matchedMentor = MENTORS[formData.learning_track];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--st-color-primary)]/10 text-[var(--st-color-primary)] border border-[var(--st-color-primary)]/20 text-[9px] font-headline font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(var(--st-color-primary-rgb),0.1)]">
          <Terminal size={12} />
          Student Initialization Protocol
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-black text-white tracking-tight">
          Calibrate Your <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_8px_var(--st-color-glow)]">Specialization</span>
        </h1>
        <p className="text-on-surface-variant/60 max-w-lg mx-auto text-sm font-medium">
          Select your track, customize program dynamics, and authenticate student handles to begin your LMS journey.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="glass-panel p-4 rounded-3xl border-white/5 max-w-xl mx-auto">
        <div className="flex items-center justify-between relative px-4">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-[var(--st-color-primary)] -translate-y-1/2 z-0 transition-all duration-500 shadow-[0_0_10px_var(--st-color-glow)]"
            style={{ width: `${(step - 1) * 50}%` }}
          ></div>
          
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center gap-1.5">
              <div 
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-headline font-black text-xs transition-all duration-300 border ${
                  s < step 
                    ? 'bg-[var(--st-color-primary)] text-black border-[var(--st-color-primary)] shadow-[0_0_10px_var(--st-color-glow)]' 
                    : s === step
                      ? 'bg-slate-900 text-[var(--st-color-primary)] border-[var(--st-color-primary)]/40 shadow-[0_0_15px_rgba(var(--st-color-primary-rgb),0.2)]'
                      : 'bg-slate-950 text-white/20 border-white/5'
                }`}
              >
                {s < step ? <CheckCircle2 size={16} /> : s}
              </div>
              <span className={`text-[8px] font-headline font-black uppercase tracking-widest ${
                s === step ? 'text-[var(--st-color-primary)]' : 'text-on-surface-variant/30'
              }`}>
                {s === 1 ? 'Select Track' : s === 2 ? 'Set Cohort' : 'Student Details'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-10 rounded-[40px] border-white/5 relative overflow-hidden shadow-2xl space-y-8">
        <div className="absolute inset-0 circuit-bg opacity-[0.03] z-0"></div>
        
        <div className="relative z-10">
          
          {/* STEP 1: TRACK SELECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-headline font-bold text-white uppercase tracking-wider">Choose Learning Stream</h2>
                <p className="text-xs text-on-surface-variant/40 font-semibold uppercase tracking-wider">Select one path. Pixora will auto-calibrate all courses and dashboards.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                
                {/* Game Dev Card */}
                <div 
                  onClick={() => handleTrackSelect('game_dev')}
                  className={`p-6 md:p-8 rounded-3xl border transition-all cursor-pointer text-left relative overflow-hidden group flex flex-col justify-between h-[300px] ${
                    formData.learning_track === 'game_dev' 
                      ? 'bg-cyan-500/[0.04] border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.15)]' 
                      : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                      formData.learning_track === 'game_dev'
                        ? 'bg-cyan-500 text-black border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        : 'bg-white/5 text-white/40 border-white/5'
                    }`}>
                      <Gamepad2 size={24} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-headline font-bold text-white tracking-wide uppercase">Game Development</h3>
                      <p className="text-xs text-on-surface-variant/50 leading-relaxed font-medium">
                        Master high-fidelity real-time rendering, physics, and gameplay simulation using Unreal Engine 5, Unity, and advanced C++.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 pt-4">
                    {['Unreal Engine 5', 'C++', 'AI Physics', 'Vertex Shader'].map((t) => (
                      <span key={t} className="text-[9px] font-semibold bg-white/5 border border-white/5 rounded px-2 py-0.5 text-white/50">{t}</span>
                    ))}
                  </div>

                  {formData.learning_track === 'game_dev' && (
                    <div className="absolute top-4 right-4 animate-bounce">
                      <Sparkles size={16} className="text-cyan-400" />
                    </div>
                  )}
                </div>

                {/* Blockchain / Web3 Card */}
                <div 
                  onClick={() => handleTrackSelect('blockchain')}
                  className={`p-6 md:p-8 rounded-3xl border transition-all cursor-pointer text-left relative overflow-hidden group flex flex-col justify-between h-[300px] ${
                    formData.learning_track === 'blockchain' 
                      ? 'bg-emerald-500/[0.04] border-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
                      : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
                      formData.learning_track === 'blockchain'
                        ? 'bg-emerald-500 text-black border-emerald-400/20 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : 'bg-white/5 text-white/40 border-white/5'
                    }`}>
                      <Wallet size={24} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-headline font-bold text-white tracking-wide uppercase">Blockchain & Web3</h3>
                      <p className="text-xs text-on-surface-variant/50 leading-relaxed font-medium">
                        Build decentralized protocols, custom consensus engines, gas-optimized smart contracts, and dApps with Solidity and Rust.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 pt-4">
                    {['Solidity', 'EVM Logic', 'Zero Knowledge', 'Rust'].map((t) => (
                      <span key={t} className="text-[9px] font-semibold bg-white/5 border border-white/5 rounded px-2 py-0.5 text-white/50">{t}</span>
                    ))}
                  </div>

                  {formData.learning_track === 'blockchain' && (
                    <div className="absolute top-4 right-4 animate-bounce">
                      <Sparkles size={16} className="text-emerald-400" />
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: PROGRAM SETTINGS */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-headline font-bold text-white uppercase tracking-wider">Calibration Matrix</h2>
                <p className="text-xs text-on-surface-variant/40 font-semibold uppercase tracking-wider">Configure duration parameters and select starting window.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                
                {/* Settings Inputs */}
                <div className="space-y-6">
                  
                  {/* Duration selection */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-headline font-black text-on-surface-variant/30 uppercase tracking-[0.2em] ml-2">Program Track Tier</label>
                    <div className="grid grid-cols-1 gap-3">
                      
                      <div 
                        onClick={() => setFormData(prev => ({ ...prev, duration: 'sprint' }))}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          formData.duration === 'sprint' 
                            ? 'bg-[var(--st-color-primary)]/10 border-[var(--st-color-primary)]/40' 
                            : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="space-y-1">
                          <h4 className="font-headline font-black text-xs text-white uppercase tracking-wider">Sprint Student (4 Weeks)</h4>
                          <p className="text-[10px] text-on-surface-variant/50 font-medium">Core outcomes, accelerated development sprint.</p>
                        </div>
                        <CheckCircle2 size={18} className={formData.duration === 'sprint' ? 'text-[var(--st-color-primary)]' : 'text-white/10'} />
                      </div>

                      <div 
                        onClick={() => setFormData(prev => ({ ...prev, duration: 'immersive' }))}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          formData.duration === 'immersive' 
                            ? 'bg-[var(--st-color-primary)]/10 border-[var(--st-color-primary)]/40 shadow-[0_0_15px_rgba(var(--st-color-primary-rgb),0.05)]' 
                            : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="space-y-1">
                          <h4 className="font-headline font-black text-xs text-white uppercase tracking-wider">Immersive Core (8 Weeks)</h4>
                          <p className="text-[10px] text-on-surface-variant/50 font-medium">Deep architectural mastery, industry internship preparation.</p>
                        </div>
                        <CheckCircle2 size={18} className={formData.duration === 'immersive' ? 'text-[var(--st-color-primary)]' : 'text-white/10'} />
                      </div>

                    </div>
                  </div>

                  {/* Starting cycle selector */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-headline font-black text-on-surface-variant/30 uppercase tracking-[0.2em] ml-2">Target Cohort Cycle</label>
                    <div className="relative">
                      <select 
                        value={formData.cohort}
                        onChange={(e) => setFormData(prev => ({ ...prev, cohort: e.target.value }))}
                        className="w-full glass-card border-white/5 rounded-2xl p-4 text-sm font-semibold text-white focus:outline-none focus:border-[var(--st-color-primary)]/30 appearance-none cursor-pointer"
                      >
                        <option value="June 1, 2026" className="bg-slate-950 text-white">June 1, 2026 (Space Student Cohort)</option>
                        <option value="July 1, 2026" className="bg-slate-950 text-white">July 1, 2026 (Orbit Core Cohort)</option>
                        <option value="August 1, 2026" className="bg-slate-950 text-white">August 1, 2026 (Nebula Prime Cohort)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/40">
                        <Calendar size={18} />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Mentor Allocation Preview */}
                <div className="glass-card border-white/5 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--st-color-primary)]/5 rounded-full blur-2xl"></div>
                  
                  <div className="space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] font-headline font-black uppercase tracking-widest">
                      <Award size={10} />
                      Mentor Assigned
                    </span>
                    
                    <div className="flex items-center gap-4">
                      <img 
                        src={matchedMentor.avatar} 
                        className="w-14 h-14 rounded-2xl object-cover border border-white/10 shadow-lg shadow-black/40"
                        alt={matchedMentor.name}
                      />
                      <div>
                        <h4 className="font-headline font-black text-sm text-white tracking-wide uppercase">{matchedMentor.name}</h4>
                        <p className="text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-wider">{matchedMentor.title}</p>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant/50 leading-relaxed font-medium italic">
                      {matchedMentor.bio}
                    </p>
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-4">
                    <p className="text-xs font-bold text-[var(--st-color-primary)] font-headline tracking-wide uppercase">
                      {matchedMentor.quote}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 3: STUDENT PROFILE HANDLES */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-headline font-bold text-white uppercase tracking-wider">Student Credentials</h2>
                <p className="text-xs text-on-surface-variant/40 font-semibold uppercase tracking-wider">Secure handles and tell us about your background context.</p>
              </div>

              <div className="space-y-6 pt-4">
                
                {/* Handles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-headline font-black text-on-surface-variant/30 uppercase tracking-[0.2em] ml-2">GitHub Profile Handle</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. github.com/student"
                        value={formData.github}
                        onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                        className="w-full glass-card border-white/5 rounded-2xl p-4 pl-12 text-sm font-medium text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 transition-all"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 font-bold">
                        <Code size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-headline font-black text-on-surface-variant/30 uppercase tracking-[0.2em] ml-2">Discord Alias Handle</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="e.g. student#1337"
                        value={formData.discord}
                        onChange={(e) => setFormData(prev => ({ ...prev, discord: e.target.value }))}
                        className="w-full glass-card border-white/5 rounded-2xl p-4 pl-12 text-sm font-medium text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 transition-all"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 font-bold">
                        <User size={18} />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Identity Biography */}
                <div className="space-y-3">
                  <label className="text-[10px] font-headline font-black text-on-surface-variant/30 uppercase tracking-[0.2em] ml-2">Student Identity Biography</label>
                  <textarea 
                    rows="4"
                    required
                    placeholder="Describe your coding experience and what you want to achieve with Pixora..."
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full glass-card border-white/5 rounded-2xl p-4 text-sm font-medium text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 transition-all resize-none"
                  ></textarea>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Wizard Controls */}
        <div className="flex items-center justify-between border-t border-white/5 pt-8 z-10 relative">
          <button 
            type="button"
            onClick={handlePrev}
            disabled={step === 1 || loading}
            className="flex items-center gap-2 text-xs font-headline font-black text-on-surface-variant/40 uppercase tracking-widest hover:text-white disabled:opacity-20 transition-all py-3 px-6"
          >
            <ArrowLeft size={16} />
            <span>Decrypt Prev</span>
          </button>

          {step < 3 ? (
            <button 
              type="button"
              onClick={handleNext}
              className="btn-primary py-3.5 px-8 flex items-center gap-2 shadow-[0_0_15px_var(--st-color-glow)]"
            >
              <span>Compile Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button 
              type="submit"
              disabled={loading}
              className="btn-primary py-3.5 px-10 flex items-center gap-2 shadow-[0_0_20px_var(--st-color-glow)] disabled:opacity-50"
            >
              <span>{loading ? 'Initializing Identity...' : 'Initialize Onboarding'}</span>
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>

      </form>
    </div>
  );
};

export default EnrollNow;
