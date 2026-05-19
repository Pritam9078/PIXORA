import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const ApplicationSuccessPage = () => {
  const location = useLocation();
  const role = location.state?.role || 'Applicant';

  const roleText = {
    instructor: 'Faculty Recruitment',
    partner: 'Global Alliance',
    college_admin: 'Institutional Nexus',
    student: 'Student Enrollment'
  };

  return (
    <div className="min-h-screen bg-[#051424] text-white selection:bg-secondary-container selection:text-black overflow-hidden">
      <Navbar />
      
      <main className="relative pt-16 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Abstract Background Element */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-secondary-container/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-on-tertiary-container/5 blur-[150px] rounded-full"></div>
        </div>

        {/* Success Content Container */}
        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center">
          {/* Icon Hero */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-12 relative group"
          >
            <div className="absolute -inset-8 bg-secondary-container/20 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>
            <div className="relative w-28 h-28 glass-panel border border-secondary-container/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(195,244,0,0.15)]">
              <span className="material-symbols-outlined text-6xl text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            </div>
            
            {/* Circuit Detail */}
            <div className="absolute top-1/2 left-full w-40 h-px bg-gradient-to-r from-secondary-container/50 to-transparent -translate-y-1/2 ml-6 hidden lg:block"></div>
            <div className="absolute top-1/2 right-full w-40 h-px bg-gradient-to-l from-secondary-container/50 to-transparent -translate-y-1/2 mr-6 hidden lg:block"></div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-headline text-5xl text-white mb-6 uppercase tracking-tighter">Application Logged</h1>
            <p className="text-slate-400 font-body text-base max-w-xl mb-12 leading-relaxed">
              Your application to join the high-performance tier of Pixora is now entering phase two of security verification.
            </p>
          </motion.div>

          {/* Status Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel p-8 rounded-xl border-l-4 border-on-tertiary-container relative group hover:border-on-tertiary-container transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-on-tertiary-container">psychology</span>
                <span className="font-headline text-[10px] text-on-tertiary-container uppercase tracking-[0.2em]">Neural Council Review</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-body">
                Credentials are being vetted by the Pixora Neural Council for authorization clearance.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel p-8 rounded-xl border-l-4 border-secondary-container relative group hover:border-secondary-container transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-secondary-container">schedule</span>
                <span className="font-headline text-[10px] text-secondary-container uppercase tracking-[0.2em]">Transmission Window</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-body">
                Expect a secure transmission within <span className="text-secondary-container font-bold">72 hours</span> to your registered terminal.
              </p>
            </motion.div>
          </div>

          {/* Transaction Detail Strip */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full mt-6 glass-panel px-8 py-5 rounded-xl flex flex-wrap items-center justify-between gap-4 border border-white/5"
          >
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase text-slate-500 font-bold tracking-[0.2em] mb-1">Request Hash</span>
              <span className="font-mono text-[10px] text-slate-300">PX-ADM-{Math.random().toString(36).slice(2, 10).toUpperCase()}-DELTA-V</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-1.5 bg-secondary-container/10 border border-secondary-container/20 rounded-full">
              <div className="w-2 h-2 bg-secondary-container rounded-full animate-pulse"></div>
              <span className="text-[9px] font-bold text-secondary-container uppercase tracking-widest">Encryption Active</span>
            </div>
          </motion.div>

          {/* Action Cluster */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-4"
          >
            <Link to="/student/dashboard" className="bg-on-tertiary-container/20 text-on-tertiary-container border border-on-tertiary-container/30 px-8 py-3 font-headline text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-on-tertiary-container hover:text-white transition-all duration-300">
              Student Hub
            </Link>
            <Link to="/" className="border border-white/10 text-white px-8 py-3 font-headline text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-white/5 transition-all duration-300">
              Return Home
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApplicationSuccessPage;
