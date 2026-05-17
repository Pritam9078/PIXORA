import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, PlusCircle, Library, 
  FileText, Target, Users, BarChart, Monitor, 
  MessageSquare, Bell, Wallet, Settings, LogOut,
  Menu, X, Search, Zap, GraduationCap, ChevronRight,
  Calendar, CheckSquare, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

const InstructorLayout = () => {
  const { profile, signOut } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const coreItems = [
    { name: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
    { name: 'My Courses', path: '/instructor/courses', icon: BookOpen },
    { name: 'Course Builder', path: '/instructor/builder', icon: PlusCircle },
    { name: 'Assignments', path: '/instructor/assignments', icon: FileText },
    { name: 'Quizzes', path: '/instructor/quizzes', icon: Target },
    { name: 'Students', path: '/instructor/students', icon: Users },
  ];

  const coachingItems = [
    { name: 'Mentorship', path: '/instructor/mentorship', icon: Calendar },
    { name: 'Deliverables', path: '/instructor/deliverables', icon: CheckSquare },
    { name: 'Evaluations', path: '/instructor/evaluations', icon: Award },
  ];

  const operationsItems = [
    { name: 'Analytics', path: '/instructor/analytics', icon: BarChart },
    { name: 'Live Classes', path: '/instructor/live', icon: Monitor },
    { name: 'Community', path: '/instructor/community', icon: MessageSquare },
    { name: 'Notifications', path: '/instructor/notifications', icon: Bell },
    { name: 'Resources', path: '/instructor/resources', icon: Library },
  ];

  const financialItems = [
    { name: 'Certificates', path: '/instructor/certificates', icon: GraduationCap },
    { name: 'Earnings', path: '/instructor/earnings', icon: Wallet },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0D0E12', fontFamily: "'Inter', sans-serif", color: '#d4e4fa', position: 'relative' }}>
      {/* Background grid */}
      <div className="grid-overlay" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.4 }} />
      {/* Radial glow top-left */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: 600, height: 600, background: 'radial-gradient(circle at 0% 0%, rgba(195,244,0,0.06) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />
      
      {/* Sidebar */}
      <aside 
        style={{
          width: isSidebarOpen ? 260 : 72,
          flexShrink: 0,
          background: 'rgba(13, 14, 18, 0.95)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transition: 'width 0.3s ease',
          position: 'relative',
        }}
      >
        {/* Corner accent */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTop: '2px solid #c3f400', borderRight: '2px solid #c3f400', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ padding: '28px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, background: '#c3f400', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: 18, color: '#283500', flexShrink: 0 }}>
              P
            </div>
            {isSidebarOpen && (
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '0.08em', lineHeight: 1 }}>PIXORA</div>
                <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 9, color: '#c3f400', letterSpacing: '0.3em', textTransform: 'uppercase', marginTop: 3 }}>INSTRUCTOR</div>
              </div>
            )}
          </Link>
          {isSidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 20 }} className="custom-scrollbar">
          <div>
            {isSidebarOpen && (
              <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>Ecosystem Core</div>
            )}
            {coreItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    marginBottom: 2,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    color: isActive ? '#c3f400' : 'rgba(255,255,255,0.4)',
                    background: isActive ? 'rgba(195,244,0,0.08)' : 'transparent',
                    borderLeft: isActive ? '2px solid #c3f400' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <item.icon size={16} style={{ flexShrink: 0, color: isActive ? '#c3f400' : 'rgba(255,255,255,0.3)' }} />
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>

          <div>
            {isSidebarOpen && (
              <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>Coaching</div>
            )}
            {coachingItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    marginBottom: 2,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    color: isActive ? '#c3f400' : 'rgba(255,255,255,0.4)',
                    background: isActive ? 'rgba(195,244,0,0.08)' : 'transparent',
                    borderLeft: isActive ? '2px solid #c3f400' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <item.icon size={16} style={{ flexShrink: 0, color: isActive ? '#c3f400' : 'rgba(255,255,255,0.3)' }} />
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>

          <div>
            {isSidebarOpen && (
              <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>Operations</div>
            )}
            {operationsItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    marginBottom: 2,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    color: isActive ? '#c3f400' : 'rgba(255,255,255,0.4)',
                    background: isActive ? 'rgba(195,244,0,0.08)' : 'transparent',
                    borderLeft: isActive ? '2px solid #c3f400' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <item.icon size={16} style={{ flexShrink: 0, color: isActive ? '#c3f400' : 'rgba(255,255,255,0.3)' }} />
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>

          <div>
            {isSidebarOpen && (
              <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 6 }}>Rewards</div>
            )}
            {financialItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    marginBottom: 2,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: 12,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    color: isActive ? '#c3f400' : 'rgba(255,255,255,0.4)',
                    background: isActive ? 'rgba(195,244,0,0.08)' : 'transparent',
                    borderLeft: isActive ? '2px solid #c3f400' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <item.icon size={16} style={{ flexShrink: 0, color: isActive ? '#c3f400' : 'rgba(255,255,255,0.3)' }} />
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px' }}>
          <Link to="/instructor/settings" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
            <Settings size={16} style={{ flexShrink: 0 }} />
            {isSidebarOpen && 'Settings'}
          </Link>
          <button 
            onClick={() => signOut()}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', color: 'rgba(255,100,100,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}
          >
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {isSidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        {/* Top Navbar */}
        <header style={{ height: 72, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', background: 'rgba(13,14,18,0.9)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flex: 1 }}>
            {!isSidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4 }}>
                <Menu size={20} />
              </button>
            )}
            <div style={{ position: 'relative', maxWidth: 400, width: '100%' }}>
              <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
              <input
                type="text"
                placeholder="SEARCH COURSES, STUDENTS..."
                className="input-field"
                style={{ paddingLeft: 42, borderRadius: 0, fontSize: 11 }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Status badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 24, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c3f400', boxShadow: '0 0 8px #c3f400', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 10, color: '#c3f400', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>Verified Instructor</span>
            </div>

            <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', position: 'relative' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: '#c3f400', boxShadow: '0 0 6px #c3f400' }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: '#fff', letterSpacing: '0.05em' }}>{profile?.full_name || 'Instructor'}</div>
                <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 2 }}>Enterprise Mode</div>
              </div>
              <img 
                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=1A1D23&color=c3f400`} 
                alt="Avatar" 
                style={{ width: 36, height: 36, objectFit: 'cover', border: '1px solid rgba(195,244,0,0.3)' }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
          <div style={{ maxWidth: 1600, margin: '0 auto', padding: '40px 40px' }}>
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: { background: '#0D0E12', color: '#d4e4fa', border: '1px solid rgba(255,255,255,0.1)', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, letterSpacing: '0.05em' },
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(195,244,0,0.15); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(195,244,0,0.3); }
      `}</style>
    </div>
  );
};

export default InstructorLayout;
