import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { CourseService } from '../services/CourseService';
import { Play, Shield, Layers, BookOpen, Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [courseData, assignmentData, submissionData] = await Promise.all([
          CourseService.getEnrolledCourses(user.id),
          CourseService.getStudentAssignments(user.id),
          CourseService.getStudentSubmissions(user.id)
        ]);
        setCourses(courseData);
        setAssignments(assignmentData);
        setSubmissions(submissionData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const totalProgress = courses.reduce((acc, c) => acc + (c.progress || 0), 0);
  const avgProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;
  const completedCount = courses.filter(c => c.progress === 100).length;
  
  // XP calculation (mock logic: 100 XP per 10% progress)
  const totalXP = Math.round(totalProgress * 10);

  // Filter for pending assignments (not submitted)
  const submittedIds = new Set(submissions.map(s => s.assignment_id));
  const pendingDirectives = assignments.filter(a => !submittedIds.has(a.id)).slice(0, 3);

  const stats = [
    { label: 'Enrolled Tracks', value: courses.length, trend: 'Active Sequences', color: 'lime' },
    { label: 'Completed', value: completedCount, sub: `${courses.length - completedCount} in progress`, color: 'purple' },
    { label: 'Experience', value: `${totalXP} XP`, progress: Math.min(100, (totalXP % 1000) / 10), color: 'cyan' },
  ];

  const activeTracks = courses.slice(0, 2).map(item => ({
    id: item.course.id,
    title: item.course.title,
    desc: item.course.description || 'No description provided for this mission.',
    progress: item.progress || 0,
    color: Math.random() > 0.5 ? 'lime' : 'purple',
    icon: Math.random() > 0.5 ? 'shield' : 'layers'
  }));

  if (loading) {
    return (
      <DashboardLayout role="Senior Learner">
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-lime-400/20 border-t-lime-400 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-headline font-bold text-[10px] uppercase tracking-[0.2em]">Synchronizing Neural Network...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="Senior Learner">
      <div className="space-y-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 rounded relative overflow-hidden group"
            >
              <p className="font-headline text-slate-500 uppercase tracking-widest text-[10px] mb-1">{stat.label}</p>
              <h3 className="font-headline text-3xl text-white">{stat.value}</h3>
              {stat.trend && (
                <div className="mt-4 flex items-center text-secondary-container gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span>
                  <span className="text-[9px] font-bold uppercase">{stat.trend}</span>
                </div>
              )}
              {stat.sub && (
                <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase">{stat.sub}</p>
              )}
              {stat.progress && (
                <div className="mt-4 w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full transition-all duration-1000" style={{ width: `${stat.progress}%` }}></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bento Dashboard Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Active Tracks */}
          <section className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-white uppercase tracking-tighter flex items-center gap-2">
                <span className="w-1 h-5 bg-secondary-container"></span>
                Active Tracks
              </h2>
              <button className="font-headline text-[10px] text-slate-500 hover:text-white uppercase tracking-widest transition-colors">View all tracks</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTracks.map((track, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/student/course/${track.id}`)}
                  className="glass-panel p-5 rounded group transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`p-2 rounded ${track.color === 'lime' ? 'bg-secondary-container/10' : 'bg-on-tertiary-container/10'}`}>
                      {track.icon === 'shield' ? (
                        <Shield className={track.color === 'lime' ? 'text-secondary-container' : 'text-on-tertiary-container'} size={18} />
                      ) : (
                        <Layers className={track.color === 'lime' ? 'text-secondary-container' : 'text-on-tertiary-container'} size={18} />
                      )}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border ${track.color === 'lime' ? 'text-secondary-container border-secondary-container/20 bg-secondary-container/5' : 'text-on-tertiary-container border-on-tertiary-container/20 bg-on-tertiary-container/5'}`}>
                      In Progress
                    </span>
                  </div>
                  <h4 className="font-headline text-white text-lg mb-2">{track.title}</h4>
                  <p className="text-slate-400 text-xs mb-6 leading-relaxed">{track.desc}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] uppercase font-bold tracking-widest">
                      <span className="text-slate-500">Mastery Level</span>
                      <span className={track.color === 'lime' ? 'text-secondary-container' : 'text-on-tertiary-container'}>{track.progress}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${track.color === 'lime' ? 'bg-secondary-container shadow-[0_0_10px_rgba(195,244,0,0.5)]' : 'bg-on-tertiary-container shadow-[0_0_10px_rgba(87,116,223,0.5)]'}`} 
                        style={{ width: `${track.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Sidebar Content */}
          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <div className="glass-panel rounded p-6">
              <h3 className="font-headline text-white text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-tertiary-container text-lg">event_note</span>
                Pending Directives
              </h3>
              <div className="space-y-4">
                {pendingDirectives.length > 0 ? pendingDirectives.map((directive, idx) => (
                  <div key={directive.id} className={`bg-white/5 p-4 rounded border-l-2 ${idx === 0 ? 'border-secondary-container' : 'border-slate-700'}`}>
                    <p className={`text-[9px] font-bold uppercase mb-1 ${idx === 0 ? 'text-secondary-container' : 'text-slate-500'}`}>
                      {directive.due_date ? `Due ${new Date(directive.due_date).toLocaleDateString()}` : 'No Deadline'}
                    </p>
                    <h4 className="text-sm font-bold text-white mb-1">{directive.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{directive.course?.title || 'Unknown Course'}</p>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500 text-center py-4">All directives synchronized. Neutral state achieved.</p>
                )}
              </div>
            </div>

            <div className="glass-panel rounded p-6">
              <h3 className="font-headline text-white text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container text-lg">military_tech</span>
                Rankings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs p-2 bg-secondary-container/5 rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-secondary-container">01</span>
                    <span className="text-white font-medium uppercase">Learner_Xenon</span>
                  </div>
                  <span className="text-slate-400 font-headline text-[10px]">4500 XP</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 bg-white/5 rounded border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-white">08</span>
                    <span className="text-white font-bold uppercase">You</span>
                  </div>
                  <span className="text-secondary-container font-headline text-[10px]">{totalXP} XP</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
