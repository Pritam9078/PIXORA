import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Terminal, ShieldAlert } from 'lucide-react';

const DashboardRedirect = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState('Initializing terminal sequence...');
  const [errorOccurred, setErrorOccurred] = useState(false);

  useEffect(() => {
    let messageTimer1, messageTimer2, messageTimer3;

    if (!loading) {
      if (!user) {
        setStatusMessage('Unauthenticated. Redirecting to Command Center...');
        messageTimer1 = setTimeout(() => {
          navigate('/login?redirect=dashboard');
        }, 1000);
      } else if (profile) {
        setStatusMessage('Syncing authorization protocols...');
        messageTimer2 = setTimeout(() => {
          const role = profile.role;
          setStatusMessage(`Protocol verified. Accessing ${role.toUpperCase()} terminal...`);
          
          messageTimer3 = setTimeout(() => {
            switch (role) {
              case 'student':
                navigate('/student/dashboard');
                break;
              case 'instructor':
                navigate('/instructor/dashboard');
                break;
              case 'college_admin':
                navigate('/dashboard/college');
                break;
              case 'partner':
                navigate('/dashboard/partner');
                break;
              case 'super_admin':
                navigate('/dashboard/admin');
                break;
              default:
                console.warn('DashboardRedirect: Unknown role, defaulting to student', role);
                navigate('/student/dashboard');
            }
          }, 800);
        }, 600);
      } else {
        // Logged in but profile is loading or missing
        setStatusMessage('Synthesizing identity parameters...');
        const timeout = setTimeout(() => {
          setErrorOccurred(true);
          setStatusMessage('Sync failure: profile data unavailable. Defaulting to student...');
          setTimeout(() => navigate('/student/dashboard'), 2000);
        }, 3000);
        return () => clearTimeout(timeout);
      }
    } else {
      // Auth context is loading
      setStatusMessage('Establishing secure connection to core database...');
    }

    return () => {
      clearTimeout(messageTimer1);
      clearTimeout(messageTimer2);
      clearTimeout(messageTimer3);
    };
  }, [user, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-[#0D0E12] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative scanline background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] pointer-events-none opacity-40"></div>
      
      {/* Immersive technical card */}
      <div className="relative z-10 glass-panel p-10 rounded-[32px] border border-white/5 bg-white/[0.01] max-w-md w-full text-center space-y-8 shadow-2xl backdrop-blur-2xl">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#c3f400]/10 blur-2xl rounded-full"></div>
            {errorOccurred ? (
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 relative">
                <ShieldAlert size={28} />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#c3f400]/10 border border-[#c3f400]/20 flex items-center justify-center text-[#c3f400] relative">
                <Terminal size={28} className="animate-pulse" />
                <Loader2 size={48} className="absolute text-[#c3f400]/30 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-headline text-lg font-bold uppercase tracking-[0.25em] text-white">
            Workspace Link
          </h2>
          <div className="flex items-center justify-center space-x-2 text-xs font-headline font-medium text-[#c3f400]/80 bg-[#c3f400]/5 border border-[#c3f400]/15 rounded-full py-1.5 px-4 w-fit mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c3f400] animate-ping"></span>
            <span className="tracking-widest uppercase text-[10px]">Active Session Protocol</span>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6">
          <p className="text-xs font-mono text-slate-400 min-h-[20px] transition-all duration-300">
            {statusMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardRedirect;
