import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const CheckEmailPage = () => {
  return (
    <div className="min-h-screen bg-[#051424] text-white selection:bg-secondary-container selection:text-black overflow-hidden">
      <Navbar />
      
      <main className="relative pt-16 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Abstract Background Element */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-secondary-container/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-on-tertiary-container/5 blur-[150px] rounded-full"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
          {/* Icon Hero */}
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-10 relative group"
          >
            <div className="absolute -inset-8 bg-secondary-container/20 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>
            <div className="relative w-28 h-28 glass-panel border border-secondary-container/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(195,244,0,0.15)]">
              <span className="material-symbols-outlined text-6xl text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_unread</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-headline text-4xl md:text-5xl text-white mb-6 uppercase tracking-tighter">Verify Your Neural Link</h1>
            <p className="text-slate-400 font-body text-base max-w-xl mx-auto mb-10 leading-relaxed">
              We've transmitted a verification sequence to your email. You must authorize this connection before accessing the Pixora network.
            </p>
          </motion.div>

          {/* Status Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full glass-panel p-8 rounded-xl border border-white/10 mb-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-secondary-container"></div>
            <div className="flex flex-col md:flex-row items-center gap-6 text-left">
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-secondary-container/10 border border-secondary-container/20">
                <span className="material-symbols-outlined text-secondary-container">outgoing_mail</span>
              </div>
              <div>
                <h3 className="font-headline text-lg text-white mb-1 uppercase">Check Your Inbox</h3>
                <p className="text-sm text-slate-400">Click the secure link in the email to confirm your identity. If you don't see it, check your spam or junk folder.</p>
              </div>
            </div>
          </motion.div>

          {/* Action Cluster */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/login" className="bg-secondary-container text-[#283500] px-8 py-3 font-headline text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#abd600] transition-all duration-300 shadow-[0_0_20px_rgba(195,244,0,0.3)]">
              Return to Login
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckEmailPage;
