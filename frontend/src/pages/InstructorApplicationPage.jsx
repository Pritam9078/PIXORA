import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const InstructorApplicationPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specializations: [],
    motivation: '',
    experience: 'Mid',
    portfolio: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: Math.random().toString(36).slice(-12), // Temporary random password for lead
        options: {
          data: {
            full_name: formData.name,
            role: 'instructor',
            specializations: formData.specializations,
            experience_level: formData.experience,
            application_status: 'pending'
          }
        }
      });

      if (authError) throw authError;

      navigate('/application/success', { state: { role: 'instructor' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051424] text-white selection:bg-secondary-container selection:text-black">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-5 pointer-events-none">
          <img 
            alt="Cyberpunk blueprints" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDi5-o_DtItgGyxD_6DecxvsifI4xwCj7g-WFfNCufumLGCtPTev10fSX8juGNTkbUELz7Q89_BYEgVLIyLYKQn8aNfsXGXQBxLNshtQJYi4mJbElRVaJ8q4cCt-6hLLJIITeYv8n5hpZxgk6IrciNfNzyX-kJlq6I8i99ZVQhL0SpJM9FDkqMxj0jrWVQw7K92gTBHrDbzoC_8DWGK-H4YG80TlLaksTXRM7dtuDLTnlDKGK2Y0dJAxxk5SlpUf_JJFFG533qw6FCR" 
          />
        </div>

        {/* Page Header */}
        <div className="relative z-10 mb-16 border-l-4 border-secondary-container pl-8">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-headline text-[10px] text-secondary-container mb-2 block uppercase tracking-[0.3em]"
          >
            SECURE PROTOCOL // FACULTY_RECRUITMENT_v4.2
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-headline text-5xl text-white uppercase mb-4 tracking-tight"
          >
            Instructor Vetting
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl text-slate-400 font-body"
          >
            The Academy seeks pioneers in Game Development, Blockchain Engineering, and Neural Interfaces. Submit your credentials for clearance and eventual terminal access.
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="glass-panel p-8 rounded-lg relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-secondary-container">fingerprint</span>
                <h2 className="font-headline text-xl uppercase text-white tracking-tight">Personnel Data</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-headline text-[10px] uppercase text-slate-500 tracking-widest">Full Name / Alias</label>
                  <input 
                    className="w-full bg-white/5 border-b border-white/10 focus:border-secondary-container text-white px-4 py-3 focus:ring-0 transition-all font-body text-sm" 
                    placeholder="ENTER IDENTITY" 
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-headline text-[10px] uppercase text-slate-500 tracking-widest">Secure Communication Link</label>
                  <input 
                    className="w-full bg-white/5 border-b border-white/10 focus:border-secondary-container text-white px-4 py-3 focus:ring-0 transition-all font-body text-sm" 
                    placeholder="EMAIL_ENCRYPTED@DOMAIN.COM" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-lg">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-secondary-container">terminal</span>
                <h2 className="font-headline text-xl uppercase text-white tracking-tight">Professional Expertise</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {specs.map(spec => (
                  <label key={spec} className={`flex items-center gap-3 p-4 bg-white/5 border transition-all cursor-pointer group ${formData.specializations.includes(spec) ? 'border-secondary-container bg-secondary-container/10' : 'border-white/5 hover:border-white/20'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={formData.specializations.includes(spec)}
                      onChange={() => handleSpecToggle(spec)}
                    />
                    <span className={`font-headline text-[10px] uppercase tracking-widest ${formData.specializations.includes(spec) ? 'text-secondary-container' : 'text-slate-400 group-hover:text-white'}`}>{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="glass-panel p-8 rounded-lg">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-secondary-container">psychology</span>
                <h2 className="font-headline text-xl uppercase text-white tracking-tight">Motivation</h2>
              </div>
              <textarea 
                className="w-full bg-white/5 border border-white/10 focus:border-secondary-container focus:ring-0 text-white p-4 font-body text-sm rounded-lg" 
                placeholder="DESCRIBE YOUR VISION FOR THE FUTURE OF TECH EDUCATION..." 
                rows="4"
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                required
              ></textarea>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass-panel p-8 rounded-lg border-l-4 border-secondary-container">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-headline text-[10px] uppercase text-white tracking-widest">Experience Level</h3>
                <span className="text-secondary-container font-headline text-[10px] tracking-widest uppercase">{formData.experience.toUpperCase()}_TIER</span>
              </div>
              <input 
                className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-secondary-container" 
                type="range"
                min="0"
                max="3"
                step="1"
                onChange={(e) => {
                  const levels = ['Entry', 'Mid', 'Master', 'Oracle'];
                  setFormData({ ...formData, experience: levels[e.target.value] });
                }}
              />
              <div className="flex justify-between mt-4 font-headline text-[8px] text-slate-500 uppercase tracking-widest">
                <span>Entry</span>
                <span>Mid</span>
                <span>Master</span>
                <span>Oracle</span>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-lg">
              <label className="font-headline text-[10px] uppercase text-slate-500 tracking-widest mb-4 block">Portfolio Terminal Link</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 px-4 py-3 flex items-center gap-3 rounded-lg focus-within:border-secondary-container transition-all">
                  <span className="material-symbols-outlined text-slate-500 text-sm">link</span>
                  <input 
                    className="bg-transparent border-none focus:ring-0 text-white font-body text-sm w-full" 
                    placeholder="https://terminal.io/alias" 
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-secondary-container text-black p-8 rounded-lg flex flex-col gap-8 shadow-[0_0_40px_rgba(195,244,0,0.2)]">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined font-bold">verified_user</span>
                  <h3 className="font-headline text-lg font-bold uppercase tracking-tight">Final Authorization</h3>
                </div>
                <p className="text-[10px] font-bold uppercase leading-relaxed opacity-70">By initializing vetting, you consent to neural-background verification and academic integrity protocols.</p>
              </div>
              <button 
                disabled={loading}
                className="w-full py-5 bg-black text-secondary-container font-headline font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-900 transition-all flex items-center justify-center gap-4 group"
              >
                {loading ? 'INITIALIZING...' : 'Initialize Instructor Vetting'}
                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-panel p-6 flex flex-col items-center justify-center text-center rounded-lg">
                <div className="w-2 h-2 rounded-full bg-secondary-container mb-3 animate-pulse"></div>
                <span className="font-headline text-[8px] text-slate-500 uppercase tracking-widest">Uplink Active</span>
              </div>
              <div className="glass-panel p-6 flex flex-col items-center justify-center text-center rounded-lg">
                <span className="font-headline text-xs text-white mb-1">08:44:21</span>
                <span className="font-headline text-[8px] text-slate-500 uppercase tracking-widest">Session Time</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default InstructorApplicationPage;
