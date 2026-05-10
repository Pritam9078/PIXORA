import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const CollegeAdminApplicationPage = () => {
  const [formData, setFormData] = useState({
    collegeName: '',
    website: '',
    capacity: 'SELECT CAPACITY',
    email: '',
    goals: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      navigate('/application/success', { state: { role: 'college_admin' } });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#051424] text-white selection:bg-secondary-container selection:text-black">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 md:px-8 max-w-7xl mx-auto grid grid-cols-12 gap-12 relative overflow-hidden">
        {/* Background circuit lines */}
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[1px] h-96 bg-secondary-container blur-[1px]"></div>
          <div className="absolute bottom-1/4 left-10 w-[1px] h-96 bg-secondary-container blur-[1px]"></div>
        </div>

        {/* Sidebar Info */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative p-8 glass-panel rounded-xl border border-white/5"
          >
            <div className="absolute -left-2 top-10 h-24 w-[2px] bg-secondary-container shadow-[0_0_10px_rgba(195,244,0,0.5)]"></div>
            <h2 className="font-headline text-5xl text-white mb-6 uppercase tracking-tighter leading-tight">Institutional <br/>Nexus</h2>
            <p className="text-slate-400 font-body text-sm leading-relaxed mb-12">
              Apply for administrative access to the Pixora Neural Terminal. Bridge your institution's talent with off-world engineering protocols.
            </p>
            
            <div className="flex flex-col gap-6">
              {[
                { icon: 'verified_user', text: 'Verification Required', color: 'text-secondary-container' },
                { icon: 'account_balance', text: 'Tier 1 Academic Node', color: 'text-slate-500' },
                { icon: 'hub', text: 'Decentralized Integration', color: 'text-slate-500' }
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-4 ${item.color}`}>
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span className="font-headline text-[10px] uppercase tracking-widest">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-xl overflow-hidden group border border-white/5"
          >
            <img 
              className="w-full h-48 object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
              alt="Modern university building" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA120FXurtqs2vC9gskSDt2Xj0XC89aa77jLMMKVAsaahq-WU8qHs4cXjOtLLNkjYn6MRjXAs-x2IFvcm2m9lCM3l3ZYNSVM7CwY8MyfUclqLIDPqijAwFwFa3w-JbqG38h05rvvfty_EVwTwwIekmOfQ_jltsItNwOen4Vog34eHPxNDaxuxj-w2znfmZQpTsbsCG56OXC6XK4MHmzpO82e70TVVn9vLeWmK9xG-NTRNKNdFf6KoXMqtws2w21o9h0DSLby3cJ2-T5" 
            />
            <div className="p-8">
              <span className="font-headline text-[10px] text-secondary-container uppercase tracking-widest">Documentation</span>
              <h3 className="font-headline text-xl text-white mt-2 uppercase tracking-tight">Neural Terminal Protocol</h3>
              <p className="text-slate-400 text-xs mt-4 leading-relaxed font-body">Read about how we synchronize campus local nets with Pixora mainframes.</p>
            </div>
          </motion.div>
        </aside>

        {/* Main Form */}
        <section className="col-span-12 lg:col-span-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 md:p-12 rounded-xl relative overflow-hidden border border-white/5 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
              <span className="material-symbols-outlined text-[120px]">terminal</span>
            </div>
            
            <div className="mb-12 border-l-4 border-secondary-container pl-8">
              <h3 className="font-headline text-3xl text-white uppercase tracking-tight">Admin Enrollment Terminal</h3>
              <p className="font-headline text-[10px] text-secondary-container mt-1 uppercase tracking-widest opacity-60">Process ID: REQ_ALPHA_SYNC</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group">
                  <label className="font-headline text-[10px] text-slate-500 uppercase tracking-widest ml-1">College Name</label>
                  <input 
                    className="w-full bg-white/5 border-b border-white/10 focus:border-secondary-container text-white py-4 px-1 transition-all outline-none font-body text-sm" 
                    placeholder="e.g. Neo-Tokyo Tech" 
                    type="text"
                    required
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  />
                </div>
                <div className="space-y-2 group">
                  <label className="font-headline text-[10px] text-slate-500 uppercase tracking-widest ml-1">Official Website</label>
                  <input 
                    className="w-full bg-white/5 border-b border-white/10 focus:border-secondary-container text-white py-4 px-1 transition-all outline-none font-body text-sm" 
                    placeholder="https://..." 
                    type="url"
                    required
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 group">
                  <label className="font-headline text-[10px] text-slate-500 uppercase tracking-widest ml-1">Estimated Student Count</label>
                  <select 
                    className="w-full bg-white/5 border-b border-white/10 focus:border-secondary-container text-white py-4 px-1 transition-all outline-none font-body text-sm appearance-none"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                  >
                    <option className="bg-[#051424]">SELECT CAPACITY</option>
                    <option className="bg-[#051424]">100 - 500 UNITS</option>
                    <option className="bg-[#051424]">500 - 2,500 UNITS</option>
                    <option className="bg-[#051424]">2,500 - 10,000 UNITS</option>
                    <option className="bg-[#051424]">10,000+ GLOBAL CLUSTER</option>
                  </select>
                </div>
                <div className="space-y-2 group">
                  <label className="font-headline text-[10px] text-slate-500 uppercase tracking-widest ml-1">Primary Admin Contact</label>
                  <input 
                    className="w-full bg-white/5 border-b border-white/10 focus:border-secondary-container text-white py-4 px-1 transition-all outline-none font-body text-sm" 
                    placeholder="admin@domain.edu" 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-headline text-[10px] text-slate-500 uppercase tracking-widest ml-1">Institutional Goals</label>
                <textarea 
                  className="w-full bg-white/5 border-b border-white/10 focus:border-secondary-container text-white py-4 px-1 transition-all outline-none font-body text-sm resize-none" 
                  placeholder="Describe how your institution plans to leverage blockchain engineering..." 
                  rows="4"
                  required
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                ></textarea>
              </div>

              <div className="flex items-center gap-4 p-5 bg-secondary-container/5 rounded-lg border border-secondary-container/10">
                <span className="material-symbols-outlined text-secondary-container">info</span>
                <p className="text-[10px] text-slate-400 font-body leading-relaxed uppercase tracking-wider">
                  Requesting institutional status initiates a 72-hour validation sequence. Ensure all academic credentials are cryptographically signed.
                </p>
              </div>

              <div className="pt-8">
                <button 
                  disabled={loading}
                  className="w-full md:w-auto bg-secondary-container text-black font-headline font-black py-5 px-16 uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_40px_rgba(195,244,0,0.3)] transition-all flex items-center justify-center gap-4 group"
                >
                  {loading ? 'PROCESSING...' : 'Submit Request for Verification'}
                  <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-2">send</span>
                </button>
              </div>
            </form>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'api', title: 'API Access', desc: 'Full integration suite for local student portals.' },
              { icon: 'shield_person', title: 'Admin Dashboard', desc: 'Centralized monitoring of neural tracks.' },
              { icon: 'badge', title: 'Dual Degrees', desc: 'Accredited certifications across lines.' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="glass-panel p-6 rounded-xl border border-white/5"
              >
                <span className="material-symbols-outlined text-secondary-container mb-4 text-2xl">{feature.icon}</span>
                <h4 className="font-headline text-[10px] text-white uppercase tracking-widest mb-2">{feature.title}</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed font-body uppercase">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CollegeAdminApplicationPage;
