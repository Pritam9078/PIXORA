import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const PartnerApplicationPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    type: 'Referral',
    proposal: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const types = ['Corporate', 'Referral', 'Institutional'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      navigate('/application/success', { state: { role: 'partner' } });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#051424] text-white selection:bg-secondary-container selection:text-black">
      <Navbar />
      
      <main className="pt-32 pb-24 min-h-screen relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-accent-lime/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          {/* Left Column: Form */}
          <section className="lg:col-span-5 flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 flex items-center gap-3"
            >
              <span className="w-12 h-[1px] bg-secondary-container"></span>
              <span className="font-headline text-[10px] text-secondary-container uppercase tracking-[0.3em]">Global Alliance</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-headline text-5xl text-white mb-8 leading-tight uppercase tracking-tighter"
            >
              Expand the <br/><span className="text-secondary-container">Neural Network.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 max-w-md mb-12 leading-relaxed font-body"
            >
              Join an elite tier of institutional pioneers. Pixora seeks global partners to architect the next evolution of game engineering and decentralized research.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-8 rounded-xl relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <span className="material-symbols-outlined text-7xl">language</span>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="font-headline text-[10px] text-secondary-container uppercase tracking-widest opacity-70">Company Name</label>
                  <input 
                    className="w-full bg-white/5 border-b border-white/10 focus:border-secondary-container text-white py-4 px-1 transition-all outline-none placeholder:text-slate-700 font-body text-sm" 
                    placeholder="ENTER ENTITY IDENTIFIER" 
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <label className="font-headline text-[10px] text-secondary-container uppercase tracking-widest opacity-70">Partnership Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {types.map(type => (
                      <button 
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`py-3 px-2 text-[10px] font-headline uppercase transition-all tracking-widest border ${formData.type === type ? 'border-secondary-container bg-secondary-container/10 text-secondary-container' : 'border-white/10 text-slate-500 hover:border-white/30'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-headline text-[10px] text-secondary-container uppercase tracking-widest opacity-70">Brief Proposal</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 focus:border-secondary-container text-white p-4 transition-all outline-none placeholder:text-slate-700 font-body text-sm rounded-lg resize-none" 
                    placeholder="DEFINE COLLABORATION OBJECTIVES..." 
                    rows="4"
                    required
                    value={formData.proposal}
                    onChange={(e) => setFormData({ ...formData, proposal: e.target.value })}
                  ></textarea>
                </div>

                <button 
                  disabled={loading}
                  className="w-full bg-secondary-container text-black py-5 font-headline font-black text-xs tracking-[0.2em] hover:brightness-110 transition-all flex items-center justify-center gap-4 group shadow-[0_0_30px_rgba(195,244,0,0.3)]"
                >
                  {loading ? 'UPLOADING...' : 'PROPOSE PARTNERSHIP'}
                  <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-45">rocket_launch</span>
                </button>
              </form>
            </motion.div>
          </section>

          {/* Right Column: Visuals */}
          <section className="lg:col-span-7 flex flex-col justify-center gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-xl p-1 aspect-video relative overflow-hidden group shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-transparent to-transparent z-10"></div>
              <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                <span className="font-headline text-[10px] text-white bg-black/80 px-3 py-1 border border-white/10 uppercase tracking-widest backdrop-blur-md">SYSTEM_STATUS: ACTIVE</span>
                <span className="font-headline text-[10px] text-secondary-container bg-black/80 px-3 py-1 border border-secondary-container/20 uppercase tracking-widest backdrop-blur-md">NODE_COUNT: 4,102</span>
              </div>
              
              <div className="w-full h-full relative">
                <img 
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[2000ms]" 
                  alt="Global network map" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvWm-fTBrHS8CYAyZugl8EHFKRuYWMChnb4wq5_4jTsWbt2Vv6VEZ3pgs-VywVUsfJK4NpnXltTnfluRrJhdKjM6Dme5RXxe-kgYPaHa2jxIwHuQkqRTji0dooyuHiaWwMunUoVu3vN2P9CJkR_35E3I07O6PbJmG_UUosN32fECp-SMxJJmwVvF6tublFcjbKvElwkI_eTwTxanNBZ950gTPwwuiuCNh0y8JHWFV-FOaobchHrQeAkalxKdLp9UUq48R9EvlUwH2a" 
                />
                
                {/* Overlay Animations */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border border-secondary-container/20 rounded-full animate-ping opacity-20"></div>
                  <div className="w-96 h-96 border border-secondary-container/10 rounded-full animate-pulse absolute opacity-10"></div>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 z-20">
                <div className="glass-panel p-4 border border-white/10 backdrop-blur-xl">
                  <h4 className="font-headline text-[10px] text-secondary-container mb-3 uppercase tracking-widest">Network Map v2.4</h4>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-secondary-container rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                    <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div 
                whileHover={{ y: -5 }}
                className="glass-panel p-8 rounded-xl border border-white/5 hover:border-secondary-container/30 transition-all"
              >
                <span className="material-symbols-outlined text-secondary-container mb-6 text-4xl">hub</span>
                <h3 className="font-headline text-lg text-white mb-3 uppercase tracking-tight">Shared Infrastructure</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-body">Access the Academy's proprietary SDKs and neural computation modules for your team.</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                className="glass-panel p-8 rounded-xl border border-white/5 hover:border-secondary-container/30 transition-all"
              >
                <span className="material-symbols-outlined text-secondary-container mb-6 text-4xl">public</span>
                <h3 className="font-headline text-lg text-white mb-3 uppercase tracking-tight">Global Mobility</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-body">Seamless student and researcher exchange programs across our partner constellations.</p>
              </motion.div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PartnerApplicationPage;
