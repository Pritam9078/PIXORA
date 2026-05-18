import { useState, useRef, useEffect } from 'react';
import { 
  Menu, X, Bell, User, Search, LogOut, Settings, ChevronDown, 
  LayoutDashboard, ShieldCheck, Users, School, GraduationCap, 
  Briefcase, BookOpen, FileText, CheckSquare, Award, CreditCard, 
  BarChart3, MessageSquare, Image, Activity, HelpCircle, 
  Search as SearchIcon, Command, FileCheck, Eye, Layers,
  Sparkles, Hash, Video, Cpu, Compass, AlertTriangle, Terminal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogoMark } from '../components/common/Logo';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navSections = [
    {
      title: 'Platform',
      items: [
        { label: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/dashboard/admin' },
        { label: 'Analytics', icon: <BarChart3 size={18} />, href: '/admin/analytics' },
      ]
    },
    {
      title: 'Management',
      items: [
        { label: 'Users', icon: <Users size={18} />, href: '/admin/users' },
        { label: 'Applications', icon: <FileCheck size={18} />, href: '/admin/applications' },
        { label: 'Verification', icon: <Eye size={18} />, href: '/admin/verification' },
        { label: 'Enrollment', icon: <Layers size={18} />, href: '/admin/enrollment' },
        { label: 'Payments', icon: <CreditCard size={18} />, href: '/admin/payments' },
      ]
    },
    {
      title: 'LMS Core',
      items: [
        { label: 'Courses', icon: <BookOpen size={18} />, href: '/admin/courses' },
        { label: 'Instructors', icon: <Briefcase size={18} />, href: '/admin/instructors' },
        { label: 'Mentors', icon: <Sparkles size={18} />, href: '/admin/mentors' },
        { label: 'Students', icon: <GraduationCap size={18} />, href: '/admin/students' },
        { label: 'Colleges', icon: <School size={18} />, href: '/admin/colleges' },
        { label: 'Community', icon: <Hash size={18} />, href: '/admin/community' },
        { label: 'Live Classes', icon: <Video size={18} />, href: '/admin/live-classes' },
      ]
    },
    {
      title: 'Credentials & Careers',
      items: [
        { label: 'Certificates', icon: <Award size={18} />, href: '/admin/certificates' },
        { label: 'NFT Certificates', icon: <Cpu size={18} />, href: '/admin/nft-certificates' },
        { label: 'Career Hub', icon: <Compass size={18} />, href: '/admin/career-hub' },
      ]
    },
    {
      title: 'Security & Operations',
      items: [
        { label: 'Notifications', icon: <Bell size={18} />, href: '/admin/notifications' },
        { label: 'Content Moderation', icon: <AlertTriangle size={18} />, href: '/admin/moderation' },
        { label: 'Audit Logs', icon: <Activity size={18} />, href: '/admin/audit-logs' },
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'Support', icon: <HelpCircle size={18} />, href: '/admin/support' },
        { label: 'Settings', icon: <Settings size={18} />, href: '/admin/settings' },
        { label: 'System Control', icon: <Terminal size={18} />, href: '/admin/system-control' },
      ]
    }
  ];

  const displayName = profile?.full_name || 'Super Admin';

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-200 font-sans antialiased">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full z-50 flex flex-col w-64 bg-[#09090B] border-r border-white/5 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center gap-3">
          <LogoMark size={28} />
          <span className="text-lg font-bold tracking-tight text-white uppercase">PIXORA<span className="text-slate-500 ml-1 font-medium">OS</span></span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, i) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link 
                      key={i}
                      to={item.href}
                      className={`flex items-center gap-3 px-4 py-2 rounded-md transition-all group ${
                        isActive 
                          ? 'bg-white/10 text-white' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
              {displayName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">pixora_core_admin</p>
            </div>
            <Command size={14} className="text-slate-600" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#09090B]/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center px-8 justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="relative max-w-md w-full hidden md:block">
              <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Global Command Search... (⌘K)"
                className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#09090B]"></span>
            </button>
            
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-md transition-all text-xs font-semibold"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">TERMINATE_SESSION</span>
            </button>
          </div>
        </header>

        {/* Dynamic Breadcrumbs Area */}
        <div className="px-8 pt-6">
          <nav className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            <span>PIXORA_CORE</span>
            <span className="opacity-20">/</span>
            <span className="text-slate-300">ADMIN</span>
            <span className="opacity-20">/</span>
            <span className="text-white">DASHBOARD</span>
          </nav>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>

        {/* System Status Footer */}
        <footer className="border-t border-white/5 px-8 py-3 flex items-center justify-between text-[9px] font-mono text-slate-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>SYSTEM_HEALTH: STABLE</span>
            </div>
            <span>LATENCY: 24MS</span>
          </div>
          <div>
            <span>PIXORA_OS V1.0.4_BETA</span>
          </div>
        </footer>
      </div>

      {/* Mobile Nav Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
