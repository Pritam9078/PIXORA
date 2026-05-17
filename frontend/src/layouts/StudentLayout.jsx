import React, { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useStudentTheme } from '../context/StudentThemeContext';
import { useAuth } from '../context/AuthContext';
import GlobalSidebar from '../components/student/GlobalSidebar';
import StudentTopNavbar from '../components/student/StudentTopNavbar';

const StudentLayout = () => {
  const { currentTheme } = useStudentTheme();
  const { profile } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const isAgnostic = profile && profile.learning_track === 'agnostic';
  const allowedAgnosticPaths = [
    '/student/dashboard',
    '/student/enroll-now',
    '/student/document-verification',
    '/student/checkout',
    '/student/settings'
  ];

  // Gatekeeper: if agnostic cadet tries to access locked tabs, redirect to dashboard
  if (isAgnostic && !allowedAgnosticPaths.some(path => location.pathname === path || location.pathname.startsWith(path))) {
    return <Navigate to="/student/dashboard" replace />;
  }

  // Check if we are in the course player (which needs a specialized layout)
  const isCoursePlayer = location.pathname.includes('/student/course/');

  return (
    <div className={`flex h-screen overflow-hidden bg-[var(--st-color-background)] font-body student-theme-${currentTheme.id}`}>
      {/* Global Sidebar */}
      <GlobalSidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Navbar - Hide if in focused mode or if preferred */}
        {!isCoursePlayer && (
          <StudentTopNavbar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}

        {/* Dynamic Content */}
        <main className={`flex-1 overflow-y-auto ${isCoursePlayer ? 'p-0' : 'p-4 md:p-8'} custom-scrollbar`}>
          <Outlet />
        </main>
      </div>

      {/* CSS Utilities for Themes */}
      <style>{`
        .student-theme-game_dev {
          --st-glow-effect: 0 0 15px rgba(0, 209, 255, 0.3);
        }
        .student-theme-blockchain {
          --st-glow-effect: 0 0 15px rgba(0, 255, 148, 0.2);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default StudentLayout;
