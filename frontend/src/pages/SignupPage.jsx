import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

const SignupPage = () => {
  const { user } = useAuth();
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const specs = [
    'Game Engine Dev', 'Smart Contracts', 'AI Training', 
    'Cyber Sec', 'DeFi Arch', 'UI/UX XR'
  ];

  const handleSpecToggle = (spec) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  useEffect(() => {
    if (user) {
      navigate('/application/instructor');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (role === 'student') {
        const { error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: 'student',
              learning_track: formData.specialization
            }
          }
        });

        if (authError) throw authError;
        navigate('/application/success', { state: { role: 'student' } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col xl:flex-row bg-[#051424]">
      {/* Left Section - Hero */}
      <section className="hidden xl:flex xl:w-2/5 relative overflow-hidden bg-slate-900 border-r border-white/5">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#051424]/80 to-transparent"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#051424] via-transparent to-transparent"></div>
        <img 
          alt="Student suiting up" 
          className="absolute inset-0 object-cover w-full h-full opacity-40 mix-blend-luminosity scale-105" 
          src={role === 'student' 
            ? "https://lh3.googleusercontent.com/aida-public/AB6AXuB28wSZqm7ksjWSknPIXZMj1E7mdLAbLaqDhQ_iCRgJ1jSPImTlfA6BJ-XYtFKliZjUr5cIS1DggPBC94C__K64hnS9qsnrPYJYM_v4L5SfH5dFrIIyMIFcxws5dybY30qTkHo11hQg9u1Wbl_i8AZbJlAUcoR_Lcr0SVaSP5Ie-g04OcaW73xsQzRvwHjG5mNfdAFGPFiAc-4AXT_XosBV3-BhcYcwYR9FOGQzb494qBvy6Qw2MylV-DmRmFlS8F2zpE87BXmij_HN"
            : "https://lh3.googleusercontent.com/aida-public/AB6AXuDi5-o_DtItgGyxD_6DecxvsifI4xwCj7g-WFfNCufumLGCtPTev10fSX8juGNTkbUELz7Q89_BYEgVLIyLYKQn8aNfsXGXQBxLNshtQJYi4mJbElRVaJ8q4cCt-6hLLJIITeYv8n5hpZxgk6IrciNfNzyX-kJlq6I8i99ZVQhL0SpJM9FDkqMxj0jrWVQw7K92gTBHrDbzoC_8DWGK-H4YG80TlLaksTXRM7dtuDLTnlDKGK2Y0dJAxxk5SlpUf_JJFFG533qw6FCR"} 
        />
        <div className="relative z-20 flex flex-col justify-end p-12 w-full h-full">
          <div className="space-y-4 max-w-lg">
            <motion.div 
              key={role + "-badge"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-3 py-1 bg-secondary-container/10 border border-secondary-container/20 text-secondary-container font-headline text-[10px] uppercase tracking-widest"
            >
              Protocol: {role === 'student' ? 'Initiated' : 'Faculty_V4.2'}
            </motion.div>
            <motion.h1 
              key={role + "-title"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-headline text-5xl text-white uppercase tracking-tighter leading-[0.9]"
            >
              <>{role === 'student' ? 'FORGING THE ' : ''}<span className="text-secondary-container">{role === 'student' ? 'NEXT FRONTIER' : 'INSTRUCTOR VETTING'}</span></>
            </motion.h1>
            <motion.p 
              key={role + "-desc"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 font-body text-sm max-w-sm"
            >
              {role === 'student' 
                ? "You are about to enter the galaxy's premier institution for neural engineering and decentralized development."
                : "The Academy seeks pioneers in Game Development, Blockchain Engineering, and Neural Interfaces. Submit your credentials for clearance."}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Right Section - Form */}
      <section className="flex-1 flex flex-col min-h-screen bg-[#051424] overflow-y-auto">
        <header className="h-14 flex items-center justify-between px-8 md:px-12 shrink-0">
          <Link to="/" className="flex items-center">
            <Logo height={32} />
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-white/5 border border-white/10 rounded-full p-1 flex">
              <button 
                onClick={() => setRole('student')}
                className={`px-4 py-1.5 rounded-full text-xs font-headline tracking-widest uppercase transition-all ${role === 'student' ? 'bg-secondary-container text-black font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Student
              </button>
              <button 
                type="button"
                onClick={() => navigate('/application/instructor')}
                className={`px-4 py-1.5 rounded-full text-xs font-headline tracking-widest uppercase transition-all ${role === 'instructor' ? 'bg-secondary-container text-black font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Instructor
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-500">
              <span className="text-[10px] font-headline uppercase tracking-widest">Security:</span>
              <span className="text-secondary-container text-[10px] font-headline uppercase tracking-widest">Encrypted</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col px-8 md:px-16 py-4 max-w-5xl mx-auto w-full">
          <div className="mb-4">
            <h2 className="font-headline text-3xl text-white mb-1 uppercase tracking-tight">
              {role === 'student' ? 'Student Onboarding' : 'Instructor Authorization'}
            </h2>
            <p className="text-slate-400 text-sm">
              {role === 'student' ? 'Sync your identity to the academy mainframe.' : 'Submit your credentials for terminal access.'}
            </p>
            <div className="mt-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] font-headline text-secondary-container uppercase tracking-widest">Syncing Neural Data...</span>
                <span className="text-[10px] font-headline text-slate-500 uppercase tracking-widest">{role === 'student' ? '35%' : '78%'} COMPLETE</span>
              </div>
              <div className="h-1 w-full bg-white/5 overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: role === 'student' ? '35%' : '78%' }}
                  className="absolute top-0 left-0 h-full bg-secondary-container shadow-[0_0_10px_rgba(195,244,0,0.5)]"
                ></motion.div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error-container/20 border border-error-container/30 text-error text-[10px] font-headline uppercase tracking-widest rounded flex items-center gap-3">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pb-4">
            
            {/* Identity Fields (Shared) */}
            <div className="glass-panel p-4 rounded-lg relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary-container text-lg">fingerprint</span>
                <h3 className="font-headline text-sm uppercase text-white tracking-tight">Personnel Data</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block font-headline text-[10px] text-slate-500 uppercase tracking-widest" htmlFor="name">Full Name / Alias</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-md focus:border-secondary-container focus:bg-white/10 text-white px-4 py-3 focus:ring-0 transition-all placeholder:text-white/20 font-body text-sm" 
                    id="name" 
                    placeholder="E.G. CASSIAN ANDOR" 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block font-headline text-[10px] text-slate-500 uppercase tracking-widest" htmlFor="neural_link">Neural Link (Email)</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-md focus:border-secondary-container focus:bg-white/10 text-white px-4 py-3 focus:ring-0 transition-all placeholder:text-white/20 font-body text-sm" 
                    id="neural_link" 
                    placeholder="SYNC@PIXORA.ACADEMY" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                {(!user) && (
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="block font-headline text-[10px] text-slate-500 uppercase tracking-widest" htmlFor="password">Secure Protocol (Password)</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-md focus:border-secondary-container focus:bg-white/10 text-white px-4 py-3 focus:ring-0 transition-all placeholder:text-white/20 font-body text-sm" 
                      id="password" 
                      placeholder="••••••••••••" 
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {role === 'student' && (
                <motion.div
                  key="student-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-2">
                    <label className="block font-headline text-[10px] text-slate-500 uppercase tracking-widest" htmlFor="specialization">Operational Sector</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-md focus:border-secondary-container focus:bg-white/10 text-white px-4 py-4 focus:ring-0 transition-all font-body text-sm appearance-none cursor-pointer" 
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        required
                      >
                        <option value="" disabled className="bg-[#051424]">SELECT OPERATIONAL SECTOR</option>
                        <option value="GAME_DEV" className="bg-[#051424]">GAME DEV: ENGINE ARCHITECTURE</option>
                        <option value="BLOCKCHAIN" className="bg-[#051424]">BLOCKCHAIN: PROTOCOL ENGINEERING</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="pt-2">
              <button 
                disabled={loading}
                className="group relative w-full overflow-hidden bg-secondary-container text-black py-4 rounded-lg font-headline text-[12px] font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(195,244,0,0.4)] active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'PROCESSING...' : (role === 'student' ? 'Commence Training' : 'Initialize Vetting')}
                  <span className="material-symbols-outlined text-[20px]">{role === 'student' ? 'bolt' : 'verified_user'}</span>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out"></div>
              </button>
            </div>
            
            <div className="text-center pt-2">
              <p className="text-[10px] font-headline text-slate-500 uppercase tracking-widest">
                Already have clearance? <Link to="/login" className="text-secondary-container hover:underline ml-1">Access Terminal</Link>
              </p>
            </div>
          </form>

          <footer className="mt-auto py-4 border-t border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-headline text-slate-500 tracking-[0.2em] uppercase">
              <span>© 2026 PIXORA ACADEMY</span>
              <div className="flex gap-6">
                <a className="hover:text-secondary-container transition-colors" href="#">Privacy</a>
                <a className="hover:text-secondary-container transition-colors" href="#">Neural Terms</a>
              </div>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
};

export default SignupPage;
