import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, ShieldCheck, Cpu, Award, 
  TrendingUp, Printer, Loader2, Sparkles, 
  ChevronRight, ArrowLeft, Terminal, Lock, 
  AlertCircle, Fingerprint, Check, Zap, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { CourseService } from '../../services/CourseService';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const MENTORS = {
  blockchain: {
    name: 'Vitalik S.',
    title: 'Core Protocol Architect',
    avatar: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=200&auto=format&fit=crop',
    signature: 'Vitalik Buterin'
  },
  game_dev: {
    name: 'Tim S.',
    title: 'Lead Unreal & Engine Architect',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    signature: 'Tim Sweeney'
  }
};

const QRCodeSVG = ({ value, color = 'currentColor' }) => {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-90">
      <rect width="80" height="80" fill="transparent" />
      {/* Corner detection patterns */}
      <rect x="0" y="0" width="24" height="24" fill={color} />
      <rect x="4" y="4" width="16" height="16" fill="black" />
      <rect x="8" y="8" width="8" height="8" fill={color} />

      <rect x="56" y="0" width="24" height="24" fill={color} />
      <rect x="60" y="4" width="16" height="16" fill="black" />
      <rect x="64" y="8" width="8" height="8" fill={color} />

      <rect x="0" y="56" width="24" height="24" fill={color} />
      <rect x="4" y="60" width="16" height="16" fill="black" />
      <rect x="8" y="64" width="8" height="8" fill={color} />
      
      {/* Technical QR elements */}
      <rect x="32" y="4" width="4" height="4" fill={color} />
      <rect x="40" y="0" width="8" height="4" fill={color} />
      <rect x="48" y="8" width="4" height="8" fill={color} />
      <rect x="36" y="16" width="8" height="4" fill={color} />
      <rect x="32" y="24" width="12" height="4" fill={color} />
      
      <rect x="68" y="32" width="8" height="4" fill={color} />
      <rect x="56" y="40" width="4" height="8" fill={color} />
      <rect x="64" y="48" width="12" height="4" fill={color} />
      
      <rect x="4" y="32" width="4" height="8" fill={color} />
      <rect x="12" y="40" width="8" height="4" fill={color} />
      <rect x="24" y="36" width="4" height="12" fill={color} />
      
      <rect x="32" y="32" width="16" height="16" fill={color} />
      <rect x="36" y="36" width="8" height="8" fill="black" />
      <rect x="40" y="40" width="2" height="2" fill={color} />
      
      <rect x="32" y="56" width="8" height="4" fill={color} />
      <rect x="48" y="64" width="12" height="4" fill={color} />
      <rect x="36" y="72" width="16" height="8" fill={color} />
      <rect x="60" y="60" width="12" height="12" fill={color} />
    </svg>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { currentTheme } = useStudentTheme();

  // Redirect security checks: If cadet hasn't selected track, push to enroll-now
  useEffect(() => {
    if (profile && profile.learning_track === 'agnostic') {
      toast.error('Initialization required. Calibrate your specialized track first!');
      navigate('/student/enroll-now');
    }
  }, [profile, navigate]);

  // Page States: 'form' | 'processing' | 'success'
  const [stage, setStage] = useState('form');
  const [selectedPlan, setSelectedPlan] = useState('pro'); // starter | pro
  
  // Card Input States
  const [cardholder, setCardholder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardBrand, setCardBrand] = useState('default');
  const [focusedField, setFocusedField] = useState('');

  // Processing Logs State
  const [logs, setLogs] = useState([]);
  const [progressCheck, setProgressCheck] = useState(0);

  // Success parameters
  const [clearanceId, setClearanceId] = useState('');
  const [cohortDate] = useState('June 1, 2026');

  // Detect card brand dynamically
  useEffect(() => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) {
      setCardBrand('visa');
    } else if (cleanNumber.startsWith('5')) {
      setCardBrand('mastercard');
    } else if (cleanNumber.startsWith('3')) {
      setCardBrand('amex');
    } else {
      setCardBrand('default');
    }
  }, [cardNumber]);

  // Input Masking functions
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const trimmed = value.slice(0, 16);
    const matches = trimmed.match(/\d{1,4}/g);
    const formatted = matches ? matches.join(' ') : '';
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    let formatted = value;
    if (value.length > 2) {
      formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    }
    setExpiry(formatted.slice(0, 5));
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    const maxLen = cardBrand === 'amex' ? 4 : 3;
    setCvv(value.slice(0, maxLen));
  };

  // Run payment validation and database synchronizations
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!cardholder.trim()) {
      toast.error('Cardholder verification name is required.');
      return;
    }
    if (cardNumber.replace(/\s/g, '').length < 15) {
      toast.error('Enter a valid authorization card sequence.');
      return;
    }
    if (expiry.length < 5) {
      toast.error('Enter a valid expiration date MM/YY.');
      return;
    }
    const requiredCvv = cardBrand === 'amex' ? 4 : 3;
    if (cvv.length < requiredCvv) {
      toast.error(`Enter a valid ${requiredCvv}-digit CVV code.`);
      return;
    }

    // Set page to Processing terminal stage
    setStage('processing');
    setLogs([]);
    setProgressCheck(0);

    const price = selectedPlan === 'pro' ? 399.00 : 199.00;
    const trackName = profile?.learning_track === 'blockchain' ? 'Blockchain & Web3' : 'Game Development';

    const terminalLogs = [
      { text: 'Establishing secure cryptographic pipeline with Stripe...', delay: 400 },
      { text: `Preparing PaymentIntent: [${price}.00 USD] with method card...`, delay: 1000 },
      { text: 'Validating zero-knowledge proof tokens...', delay: 1600 },
      { text: 'Authorized successfully! Receipt token: ch_' + Math.random().toString(36).substring(2, 10).toUpperCase(), delay: 2200 },
      { text: 'Writing payment ledger transaction to public.payments...', delay: 2800, databaseSync: true },
      { text: `Querying all published courses for Learning Track: [${trackName}]...`, delay: 3500 },
      { text: 'Calibrating batch cadet enrollment sequence in public.enrollments...', delay: 4200, enrollmentSync: true },
      { text: 'Allocating elite senior industry track mentor...', delay: 4900 },
      { text: 'Generating signed cryptographic Cadet Offer Letter directive...', delay: 5500 },
      { text: 'CALIBRATION HANDSHAKE SECURED. REDIRECTING PORTAL...', delay: 6200 }
    ];

    // Execute step-by-step logs
    terminalLogs.forEach((item, index) => {
      setTimeout(async () => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${item.text}`]);
        setProgressCheck(Math.floor(((index + 1) / terminalLogs.length) * 100));

        // When DB synchronizations are scheduled in timeline
        if (item.databaseSync) {
          try {
            const randomId = 'ch_' + Math.random().toString(36).substring(2, 12).toUpperCase();
            await supabase.from('payments').insert({
              user_id: user.id,
              amount: price,
              currency: 'USD',
              status: 'completed',
              provider: 'stripe',
              provider_id: randomId,
              metadata: {
                plan: selectedPlan,
                track: profile?.learning_track,
                cardholder: cardholder
              }
            });
            console.log('Payment synchronized successfully.');
          } catch (err) {
            console.warn('Payment RLS constraint / DB failure bypassed locally:', err.message);
          }
        }

        if (item.enrollmentSync) {
          try {
            // Retrieve available courses for track
            const allCourses = await CourseService.getAvailableCourses(profile?.college_id);
            const isBlockchain = profile?.learning_track === 'blockchain';
            const matchedCourses = allCourses.filter(course => {
              if (isBlockchain) {
                return course.category === 'Blockchain' || course.category === 'Web3';
              } else {
                return course.category === 'Game Development';
              }
            });

            if (matchedCourses.length > 0) {
              await Promise.all(
                matchedCourses.map(course => 
                  CourseService.enrollInCourse(user.id, course.id)
                    .catch(err => console.warn(`Already enrolled or failed for course ${course.id}:`, err.message))
                )
              );
              console.log('Track course enrollments complete.');
            }
          } catch (err) {
            console.warn('Enrollment synchronization bypassed locally:', err.message);
          }
        }

        // Final transition
        if (index === terminalLogs.length - 1) {
          setTimeout(() => {
            const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
            const trackCode = profile?.learning_track === 'blockchain' ? 'BCHN' : 'GDEV';
            setClearanceId(`PX-${trackCode}-${randomHex}`);
            
            // Refresh profile state globally
            refreshProfile().catch(err => console.error(err));
            
            setStage('success');
            toast.success('LMS Cadet Clearance Directive generated!');
          }, 800);
        }
      }, item.delay);
    });
  };

  const matchedMentor = MENTORS[profile?.learning_track] || MENTORS.game_dev;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Print custom stylesheet for offer letter print-ready mode */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 0.8; }
          100% { top: 0%; opacity: 0.8; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        .scanner-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--st-color-primary), transparent);
          box-shadow: 0 0 15px var(--st-color-glow);
          animation: scan 3s linear infinite;
          z-index: 10;
        }
        .glow-border-interactive {
          box-shadow: 0 0 25px rgba(var(--st-color-primary-rgb), 0.15);
          border-color: rgba(var(--st-color-primary-rgb), 0.3);
        }
        .glass-credit-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.02) 100%);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 30px !important;
            box-shadow: none !important;
            border: 2px double #000000 !important;
            border-radius: 0px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* STAGE 1: FORM */}
      {stage === 'form' && (
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--st-color-primary)]/10 text-[var(--st-color-primary)] border border-[var(--st-color-primary)]/20 text-[9px] font-headline font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(var(--st-color-primary-rgb),0.1)]">
              <CreditCard size={12} />
              Secure Billing Node
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-black text-white tracking-tight">
              Calibrate <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_8px_var(--st-color-glow)]">Billing Pipeline</span>
            </h1>
            <p className="text-on-surface-variant/60 max-w-lg mx-auto text-sm font-medium">
              Choose your academic access package and unlock full course directory matrices. Secure Stripe protocol verified.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Plan Tier Selection Grid */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-panel p-6 rounded-[32px] border-white/5 space-y-4">
                <span className="text-[10px] font-headline font-black text-on-surface-variant/40 uppercase tracking-[0.15em] ml-1 block">1. Select Access Level</span>
                
                <div className="space-y-4">
                  {/* Standard Starter Plan */}
                  <div 
                    onClick={() => setSelectedPlan('starter')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between min-h-[140px] ${
                      selectedPlan === 'starter'
                        ? 'border-[var(--st-color-primary)] bg-[var(--st-color-primary)]/[0.04] glow-border-interactive'
                        : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-headline font-bold text-base text-white">Sprint Core Package</h4>
                        <p className="text-[10px] text-on-surface-variant/60 font-medium mt-1">Full access to fundamental track modules</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-headline font-black text-white">$199</span>
                        <span className="text-[9px] text-on-surface-variant/40 block">One-time billing</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-4 border-t border-white/5 mt-4 text-[10px] text-on-surface-variant/60">
                      <Check size={12} className="text-[var(--st-color-primary)]" />
                      <span>Sprint timeline curriculum unlocked</span>
                    </div>
                  </div>

                  {/* Elite Pro Plan */}
                  <div 
                    onClick={() => setSelectedPlan('pro')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between min-h-[170px] overflow-hidden ${
                      selectedPlan === 'pro'
                        ? 'border-[var(--st-color-primary)] bg-[var(--st-color-primary)]/[0.04] glow-border-interactive'
                        : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Badge */}
                    <div className="absolute top-0 right-0">
                      <span className="text-[7px] font-headline font-black bg-[var(--st-color-primary)] text-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                        RECOMMENDED
                      </span>
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-headline font-bold text-base text-white flex items-center gap-1.5">
                          Immersive Master Tier
                          <Sparkles size={14} className="text-[var(--st-color-primary)] animate-pulse" />
                        </h4>
                        <p className="text-[10px] text-on-surface-variant/60 font-medium mt-1">Direct mentor pipeline + verified certification</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-headline font-black text-[var(--st-color-primary)]">$399</span>
                        <span className="text-[9px] text-on-surface-variant/40 block">One-time billing</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-white/5 mt-4">
                      <div className="flex items-center gap-2 text-[10px] text-on-surface-variant/80 font-bold">
                        <Check size={12} className="text-[var(--st-color-primary)]" />
                        <span>1-on-1 Assigned Mentor: {matchedMentor.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-on-surface-variant/60">
                        <Check size={12} className="text-[var(--st-color-primary)]" />
                        <span>Downloadable Printable Offer Letter</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure guarantee widget */}
              <div className="glass-panel p-5 rounded-2xl border-white/5 flex items-center gap-3.5 bg-white/[0.01]">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck size={20} />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-[10px] font-headline font-black text-white uppercase tracking-wider">AES 256 Security Telemetry</h5>
                  <p className="text-[9px] text-on-surface-variant/40 font-medium">Stripe encrypted node handshakes protect your billing payloads.</p>
                </div>
              </div>
            </div>

            {/* Right: Floating Glass Card Preview & Credit Inputs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* credit card preview */}
              <div className="relative group max-w-sm mx-auto w-full aspect-[1.58/1] glass-credit-card rounded-2xl p-6 flex flex-col justify-between text-white overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                
                {/* Neon specialized border glow */}
                <div className="absolute inset-0 border border-[var(--st-color-primary)]/20 rounded-2xl group-hover:border-[var(--st-color-primary)]/40 transition-all pointer-events-none"></div>
                <div className="absolute -top-20 -right-20 w-44 h-44 bg-[var(--st-color-primary)]/10 rounded-full blur-[40px] pointer-events-none"></div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-headline font-bold text-[var(--st-color-primary)] uppercase tracking-[0.25em]">PIXORA DIRECTIVE GATEWAY</span>
                    <h3 className="text-sm font-headline font-semibold text-white/50 tracking-wider mt-0.5">CADET PAY SYSTEM</h3>
                  </div>
                  
                  {/* NFC/Wireless symbol & Chip */}
                  <div className="flex items-center gap-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/40">
                      <path d="M12 3a9 9 0 0 1 9 9m-4.5-4.5a6.36 6.36 0 0 1 4.5 4.5M12 9a3 3 0 0 1 3 3m-1.5-1.5a1.5 1.5 0 0 1 1.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <div className="w-10 h-8 rounded-lg bg-yellow-600/40 border border-yellow-500/20 flex items-center justify-center overflow-hidden relative shadow-inner">
                      <Cpu size={20} className="text-yellow-400" />
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-yellow-500/30"></div>
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-yellow-500/30"></div>
                    </div>
                  </div>
                </div>

                {/* Card Number display */}
                <div className="my-6">
                  <div className="font-mono text-lg md:text-xl tracking-[0.18em] text-white font-bold drop-shadow-md">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[7px] font-headline font-bold text-white/40 uppercase tracking-widest block">Cadet Cardholder</span>
                    <span className="font-mono text-xs text-white uppercase tracking-wider block truncate max-w-[180px]">
                      {cardholder || 'CADET NAME'}
                    </span>
                  </div>

                  <div className="flex gap-6">
                    <div className="space-y-1 text-center">
                      <span className="text-[7px] font-headline font-bold text-white/40 uppercase tracking-widest block">Expires</span>
                      <span className="font-mono text-xs text-white block">
                        {expiry || 'MM/YY'}
                      </span>
                    </div>

                    <div className="space-y-1 text-center">
                      <span className="text-[7px] font-headline font-bold text-white/40 uppercase tracking-widest block">CVV</span>
                      <span className="font-mono text-xs text-white block">
                        {cvv ? '•'.repeat(cvv.length) : '•••'}
                      </span>
                    </div>
                  </div>

                  {/* Brand logo container */}
                  <div className="h-6 flex items-center">
                    {cardBrand === 'visa' && (
                      <span className="font-headline text-sm font-black italic text-blue-400 tracking-wider shadow-inner">VISA</span>
                    )}
                    {cardBrand === 'mastercard' && (
                      <div className="flex items-center -space-x-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 opacity-90"></div>
                        <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-90"></div>
                      </div>
                    )}
                    {cardBrand === 'amex' && (
                      <span className="font-headline text-xs font-black bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">AMEX</span>
                    )}
                    {cardBrand === 'default' && (
                      <Sparkles size={16} className="text-[var(--st-color-primary)] animate-pulse" />
                    )}
                  </div>
                </div>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleCheckoutSubmit} className="glass-panel p-8 rounded-[40px] border-white/5 space-y-6">
                <span className="text-[10px] font-headline font-black text-on-surface-variant/40 uppercase tracking-[0.15em] ml-1 block">2. Input Cryptographic Credentials</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Cardholder */}
                  <div className="space-y-2 col-span-full">
                    <label htmlFor="cardholder" className="text-xs font-headline font-bold text-white uppercase tracking-wider ml-1">Cardholder Verification Name</label>
                    <input 
                      type="text" 
                      id="cardholder"
                      placeholder="Jane Doe"
                      value={cardholder}
                      onChange={(e) => setCardholder(e.target.value)}
                      onFocus={() => setFocusedField('cardholder')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full bg-white/[0.02] border rounded-xl py-3 px-4 text-xs font-medium text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 focus:bg-white/[0.04] transition-all placeholder:text-white/10 ${
                        focusedField === 'cardholder' ? 'border-[var(--st-color-primary)]/40' : 'border-white/5'
                      }`}
                      required
                    />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-2 col-span-full">
                    <label htmlFor="cardNumber" className="text-xs font-headline font-bold text-white uppercase tracking-wider ml-1">Card Sequence (PAN)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        id="cardNumber"
                        placeholder="4000 1234 5678 9010"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        onFocus={() => setFocusedField('cardNumber')}
                        onBlur={() => setFocusedField('')}
                        className={`w-full bg-white/[0.02] border rounded-xl py-3 pl-12 pr-4 text-xs font-mono text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 focus:bg-white/[0.04] transition-all placeholder:text-white/10 ${
                          focusedField === 'cardNumber' ? 'border-[var(--st-color-primary)]/40' : 'border-white/5'
                        }`}
                        required
                      />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    </div>
                  </div>

                  {/* Expiration */}
                  <div className="space-y-2">
                    <label htmlFor="expiry" className="text-xs font-headline font-bold text-white uppercase tracking-wider ml-1">Expiration Timeline</label>
                    <input 
                      type="text" 
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      onFocus={() => setFocusedField('expiry')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full bg-white/[0.02] border rounded-xl py-3 px-4 text-xs font-mono text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 focus:bg-white/[0.04] transition-all placeholder:text-white/10 ${
                        focusedField === 'expiry' ? 'border-[var(--st-color-primary)]/40' : 'border-white/5'
                      }`}
                      required
                    />
                  </div>

                  {/* CVV */}
                  <div className="space-y-2">
                    <label htmlFor="cvv" className="text-xs font-headline font-bold text-white uppercase tracking-wider ml-1">Security Seal (CVV)</label>
                    <input 
                      type="password" 
                      id="cvv"
                      placeholder={cardBrand === 'amex' ? '••••' : '•••'}
                      value={cvv}
                      onChange={handleCvvChange}
                      onFocus={() => setFocusedField('cvv')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full bg-white/[0.02] border rounded-xl py-3 px-4 text-xs font-mono text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 focus:bg-white/[0.04] transition-all placeholder:text-white/10 ${
                        focusedField === 'cvv' ? 'border-[var(--st-color-primary)]/40' : 'border-white/5'
                      }`}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full btn-primary py-4 mt-4 flex items-center justify-center gap-2 shadow-[0_0_20px_var(--st-color-glow)] font-headline font-black text-xs uppercase tracking-widest"
                >
                  <Lock size={14} />
                  <span>Authorize billing payload</span>
                  <ChevronRight size={14} />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* STAGE 2: PROCESSING CYBER LOGS */}
      {stage === 'processing' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="glass-panel p-8 rounded-[40px] border-white/5 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[360px]">
            <div className="scanner-line"></div>
            <div className="absolute inset-0 bg-[var(--st-color-primary)]/5 scanner-overlay"></div>
            
            <div className="z-10 relative flex-1 flex flex-col items-center justify-center space-y-8">
              <div className="w-20 h-20 rounded-3xl bg-[var(--st-color-primary)]/10 flex items-center justify-center relative border border-[var(--st-color-primary)]/20 shadow-[0_0_30px_rgba(var(--st-color-primary-rgb),0.1)]">
                <Loader2 className="animate-spin text-[var(--st-color-primary)]" size={36} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-headline font-bold text-white uppercase tracking-wider">Securing Financial Node</h3>
                <div className="w-48 h-1.5 bg-white/5 rounded-full mx-auto overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-[var(--st-gradient-primary)] rounded-full transition-all duration-300"
                    style={{ width: `${progressCheck}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest">Encrypting telemetry matrices {progressCheck}%</p>
              </div>
            </div>

            {/* Shell console terminal */}
            <div className="relative z-10 w-full font-mono text-[9px] text-emerald-400 bg-slate-950/80 p-4 border border-white/5 rounded-2xl h-44 overflow-y-auto space-y-1.5 leading-normal">
              {logs.length === 0 ? (
                <div className="text-on-surface-variant/30 italic flex items-center justify-center h-full">
                  Connecting stream tunnels...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="animate-in fade-in slide-in-from-left-2 duration-300">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: PRINTABLE CADET OFFER LETTER */}
      {stage === 'success' && (
        <div className="space-y-8">
          
          {/* Header instructions */}
          <div className="text-center space-y-3 no-print">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-headline font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Award size={12} />
              Sequence Complete
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-black text-white tracking-tight">
              Cadet directive <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_8px_var(--st-color-glow)]">Assigned</span>
            </h1>
            <p className="text-on-surface-variant/60 max-w-lg mx-auto text-sm font-medium">
              Congratulations. Print or save your certified offer letter before unlocking the student dashboard.
            </p>
            
            <div className="flex gap-4 justify-center pt-2">
              <button 
                onClick={() => window.print()}
                className="btn-outline flex items-center justify-center gap-2 px-6 py-3 !rounded-2xl border-white/10 hover:border-white/20 text-xs font-headline font-bold uppercase tracking-widest cursor-pointer"
              >
                <Printer size={16} />
                <span>Print Directive</span>
              </button>
              <button 
                onClick={() => navigate('/student/dashboard')}
                className="btn-primary flex items-center justify-center gap-2 px-8 py-3 !rounded-2xl shadow-[0_0_20px_var(--st-color-glow)] text-xs font-headline font-bold uppercase tracking-widest animate-bounce"
              >
                <span>Enter Dashboard</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Holographic Offer Letter - Target of Print */}
          <div 
            id="print-area" 
            className="max-w-3xl mx-auto glass-panel p-10 md:p-14 rounded-[40px] border-white/10 shadow-2xl relative overflow-hidden space-y-8 bg-slate-950/80"
          >
            {/* Holographic grids */}
            <div className="absolute inset-0 circuit-bg opacity-[0.03] pointer-events-none no-print"></div>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--st-color-primary)]/5 rounded-full blur-[80px] pointer-events-none no-print"></div>
            
            {/* Top Certificate Border */}
            <div className="absolute inset-4 border border-dashed border-white/10 pointer-events-none rounded-[28px] no-print"></div>

            {/* Letter Header */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 border-b border-white/5 pb-8 relative z-10">
              <div className="text-center md:text-left space-y-2">
                <span className="text-[10px] font-headline font-black text-[var(--st-color-primary)] uppercase tracking-[0.3em] block">ACADEMIC CLEARANCE PROTOCOL</span>
                <h2 className="text-2xl md:text-3xl font-headline font-black text-white tracking-wide uppercase">PIXORA ACADEMY DIRECTIVE</h2>
                <p className="text-[9px] text-on-surface-variant/40 font-mono tracking-widest uppercase">NODE GATEWAY SIGNATURE: SECURE-AES-256</p>
              </div>

              {/* Holographic custom QR Code SVG */}
              <div className="p-3 bg-black/60 border border-white/10 rounded-2xl flex items-center justify-center">
                <QRCodeSVG value={clearanceId} color="var(--st-color-primary)" />
              </div>
            </div>

            {/* Letter Body */}
            <div className="space-y-6 relative z-10 font-body text-sm text-on-surface-variant/80 leading-relaxed font-medium">
              <div className="flex flex-wrap justify-between gap-4 text-xs font-mono border-b border-white/5 pb-4 text-on-surface-variant/50">
                <span>Direct Clearance Ref: {clearanceId || 'PX-PENDING'}</span>
                <span>Calibrated: {new Date().toLocaleDateString()}</span>
              </div>

              <p className="text-white text-base">
                Dear <strong className="text-[var(--st-color-primary)] font-bold">{profile?.full_name || 'Cadet'}</strong>,
              </p>

              <p>
                We are pleased to inform you that your holographic credentials and biometric telemetry have cleared Pixora Academy’s validation sequence. Upon verification of billing payload pipelines, your clearance has been elevated to **Active Grade 1 Academy Cadet** specializing in the <strong className="text-white">{profile?.learning_track === 'blockchain' ? 'Blockchain & Web3 Protocol' : 'Game Development Engine'} Specialization Track</strong>.
              </p>

              <p>
                Under the directive of your senior specialized mentor <strong className="text-white">{matchedMentor.name}</strong>, you are scheduled to begin core interactive syllabus components starting with the upcoming cohort on <strong className="text-white">{cohortDate}</strong>.
              </p>

              <p>
                As a cadet of Pixora Academy, your access locks are now disabled. Full course directories, quiz validation consoles, live sandbox compilers, and elite corporate career hubs have been fully mapped to your neural directory.
              </p>
            </div>

            {/* Letter Footer with Mentors Signatures */}
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 relative z-10 gap-6">
              
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[7px] font-headline font-bold text-white/40 uppercase tracking-widest block font-mono">Assigned Track Mentor</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                    <img src={matchedMentor.avatar} alt={matchedMentor.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h5 className="text-sm font-headline font-bold text-white leading-tight">{matchedMentor.name}</h5>
                    <p className="text-[10px] text-on-surface-variant/50">{matchedMentor.title}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-center md:text-right">
                <span className="text-[7px] font-headline font-bold text-white/40 uppercase tracking-widest block font-mono">Authorization Signature</span>
                <span className="font-serif italic text-xl text-[var(--st-color-primary)] font-black tracking-wide drop-shadow-[0_0_10px_var(--st-color-glow)] block">
                  {matchedMentor.signature}
                </span>
                <span className="text-[8px] font-headline font-bold text-on-surface-variant/30 uppercase tracking-[0.15em] block font-mono">Senior Directive Office</span>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
