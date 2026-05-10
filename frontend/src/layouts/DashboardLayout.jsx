import { useState, useRef, useEffect } from 'react';
import { Menu, X, Bell, User, Search, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children, role = 'Learner', navigation = [] }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = profile?.full_name || 'Anonymous User';
  const displayRole = profile?.role || role;

  return (
    <div className="min-h-screen bg-primary-container text-on-surface font-body-base antialiased">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0D0E12]/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-8">
            <button 
              className="lg:hidden text-white"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="text-xl font-bold tracking-[0.2em] text-white font-headline uppercase">PIXORA</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center bg-white/5 border border-white/10 px-3 py-1 rounded">
              <span className="material-symbols-outlined text-secondary-container text-sm mr-2">monetization_on</span>
              <span className="font-headline text-[10px] text-white uppercase tracking-widest">1250 SC</span>
            </div>

            {/* Profile Section with Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-white/5 p-1 rounded-lg transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-white uppercase tracking-wider">{displayName}</p>
                  <p className="text-[9px] text-secondary-container uppercase tracking-widest font-medium">{displayRole}</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-secondary-container/30 p-0.5 overflow-hidden">
                  <img 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
                  />
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#16181D] border border-white/10 rounded-lg shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="px-4 py-2 border-b border-white/5 mb-2">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Logged in as</p>
                    <p className="text-xs text-white font-bold truncate">{displayName}</p>
                  </div>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-[10px] text-slate-400 hover:text-white hover:bg-white/5 uppercase tracking-widest transition-all">
                    <User size={14} />
                    <span>My Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-[10px] text-slate-400 hover:text-white hover:bg-white/5 uppercase tracking-widest transition-all">
                    <Settings size={14} />
                    <span>Settings</span>
                  </button>
                  <div className="h-px bg-white/5 my-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-400/5 uppercase tracking-widest transition-all"
                  >
                    <LogOut size={14} />
                    <span>Logout System</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full z-40 flex flex-col w-64 bg-[#16181D] border-r border-white/5 pt-20 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          <p className="text-on-tertiary-container font-black tracking-widest font-headline text-[10px] mb-1 uppercase">PIXORA_OS</p>
          <p className="text-slate-500 text-[9px] tracking-[0.2em] uppercase">Security Level 4</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item, i) => (
            <a 
              key={i}
              className={`flex items-center gap-4 px-4 py-3 transition-all ${item.active ? 'bg-on-tertiary-container/10 text-on-tertiary-container border-r-2 border-on-tertiary-container' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`} 
              href={item.href}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="font-headline text-[10px] tracking-widest uppercase">{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5">
          <button className="w-full py-3 bg-on-tertiary-container text-white font-bold text-[10px] tracking-widest uppercase hover:shadow-[0_0_15px_rgba(87,116,223,0.4)] transition-all">
            GENERATE_LOG
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-20 pb-24 lg:pb-8">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          {children}
        </div>
      </main>

      {/* Mobile Nav Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
