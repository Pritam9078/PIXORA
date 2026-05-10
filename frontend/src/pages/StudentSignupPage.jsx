import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const StudentSignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: 'student',
            specialization: formData.specialization
          }
        }
      });

      if (authError) throw authError;

      // Navigate to success
      navigate('/application/success', { state: { role: 'student' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-[#051424]">
      {/* Left Section - Hero */}
      <section className="hidden md:flex md:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#051424]/40 to-transparent"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#051424] via-transparent to-transparent"></div>
        <img 
          alt="Cadet suiting up" 
          className="absolute inset-0 object-cover w-full h-full opacity-60 mix-blend-luminosity scale-110" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB28wSZqm7ksjWSknPIXZMj1E7mdLAbLaqDhQ_iCRgJ1jSPImTlfA6BJ-XYtFKliZjUr5cIS1DggPBC94C__K64hnS9qsnrPYJYM_v4L5SfH5dFrIIyMIFcxws5dybY30qTkHo11hQg9u1Wbl_i8AZbJlAUcoR_Lcr0SVaSP5Ie-g04OcaW73xsQzRvwHjG5mNfdAFGPFiAc-4AXT_XosBV3-BhcYcwYR9FOGQzb494qBvy6Qw2MylV-DmRmFlS8F2zpE87BXmij_HN" 
        />
        <div className="relative z-20 flex flex-col justify-end p-12 w-full h-full">
          <div className="space-y-4 max-w-lg">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-3 py-1 bg-secondary-container/10 border border-secondary-container/20 text-secondary-container font-headline text-[10px] uppercase tracking-widest"
            >
              Protocol: Initiated
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-headline text-5xl text-white uppercase tracking-tighter leading-[0.9]"
            >
              FORGING THE <span className="text-secondary-container">NEXT FRONTIER</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 font-body text-sm max-w-sm"
            >
              You are about to enter the galaxy's premier institution for neural engineering and decentralized development.
            </motion.p>
          </div>
          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-[#051424] bg-slate-800"></div>)}
            </div>
            <span className="text-[10px] font-headline text-slate-500 uppercase tracking-widest">
              +1,204 Cadets Syncing
            </span>
          </div>
        </div>
      </section>

      {/* Right Section - Form */}
      <section className="flex-1 flex flex-col min-h-screen bg-[#051424]">
        <header className="h-20 flex items-center justify-between px-8 md:px-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-8 w-1 bg-secondary-container"></div>
            <span className="font-headline text-xl text-white tracking-tighter uppercase font-bold">PIXORA</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-slate-500">
            <span className="text-[10px] font-headline uppercase tracking-widest">Security:</span>
            <span className="text-secondary-container text-[10px] font-headline uppercase tracking-widest">Encrypted</span>
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center px-8 md:px-24 py-12 max-w-3xl mx-auto w-full">
          <div className="mb-10">
            <h2 className="font-headline text-4xl text-white mb-2 uppercase tracking-tight">Cadet Onboarding</h2>
            <p className="text-slate-400 text-sm">Sync your identity to the academy mainframe.</p>
            <div className="mt-8">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-headline text-secondary-container uppercase tracking-widest">Syncing Neural Data...</span>
                <span className="text-[10px] font-headline text-slate-500 uppercase tracking-widest">35% COMPLETE</span>
              </div>
              <div className="h-1 w-full bg-white/5 overflow-hidden relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '35%' }}
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

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block font-headline text-[10px] text-slate-500 uppercase tracking-widest" htmlFor="name">Full Name</label>
                <input 
                  className="w-full bg-transparent border-b border-white/10 focus:border-secondary-container text-white px-0 py-3 focus:ring-0 transition-all placeholder:text-white/10 font-body text-sm" 
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
                  className="w-full bg-transparent border-b border-white/10 focus:border-secondary-container text-white px-0 py-3 focus:ring-0 transition-all placeholder:text-white/10 font-body text-sm" 
                  id="neural_link" 
                  placeholder="SYNC@PIXORA.ACADEMY" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-headline text-[10px] text-slate-500 uppercase tracking-widest" htmlFor="specialization">Specialization Track</label>
              <select 
                className="w-full bg-transparent border-b border-white/10 focus:border-secondary-container text-white px-0 py-3 focus:ring-0 transition-all font-body text-sm appearance-none cursor-pointer" 
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                required
              >
                <option value="" disabled className="bg-[#051424]">SELECT OPERATIONAL SECTOR</option>
                <option value="gamedev" className="bg-[#051424]">GAME DEV: ENGINE ARCHITECTURE</option>
                <option value="blockchain" className="bg-[#051424]">BLOCKCHAIN: PROTOCOL ENGINEERING</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block font-headline text-[10px] text-slate-500 uppercase tracking-widest" htmlFor="password">Secure Protocol (Password)</label>
              <input 
                className="w-full bg-transparent border-b border-white/10 focus:border-secondary-container text-white px-0 py-3 focus:ring-0 transition-all placeholder:text-white/10 font-body text-sm" 
                id="password" 
                placeholder="••••••••••••" 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            
            <div className="pt-6">
              <button 
                disabled={loading}
                className="group relative w-full overflow-hidden bg-secondary-container text-black py-5 font-headline text-[12px] font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(195,244,0,0.4)] active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'SYNCING...' : 'Commence Training'}
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out"></div>
              </button>
            </div>
          </form>

          <footer className="mt-auto pt-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-headline text-slate-500 tracking-[0.2em] uppercase">
              <span>© 2024 PIXORA ACADEMY</span>
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

export default StudentSignupPage;
