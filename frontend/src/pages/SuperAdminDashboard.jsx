import AdminLayout from '../layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Users, School, Briefcase, BookOpen, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Activity, Zap, 
  Plus, ShieldCheck, CreditCard, Award, Eye, GraduationCap,
  MessageSquare, Settings, AlertTriangle, Monitor, Sparkles,
  Wifi, ShieldAlert, CheckCircle, RefreshCw, Radio, HardDrive, Cpu
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

// Custom mock chart data for division telemetry
const globalChartData = [
  { name: 'Mon', revenue: 4200, users: 2400, retention: 92 },
  { name: 'Tue', revenue: 3100, users: 3100, retention: 94 },
  { name: 'Wed', revenue: 5400, users: 4200, retention: 95 },
  { name: 'Thu', revenue: 4780, users: 5908, retention: 91 },
  { name: 'Fri', revenue: 6890, users: 7800, retention: 96 },
  { name: 'Sat', revenue: 8390, users: 9200, retention: 98 },
  { name: 'Sun', revenue: 9490, users: 11300, retention: 97 },
];

const blockchainChartData = [
  { name: 'Mon', deployments: 12, gasSaved: 0.8, activeNodes: 2 },
  { name: 'Tue', deployments: 18, gasSaved: 1.2, activeNodes: 3 },
  { name: 'Wed', deployments: 24, gasSaved: 2.1, activeNodes: 3 },
  { name: 'Thu', deployments: 15, gasSaved: 1.5, activeNodes: 4 },
  { name: 'Fri', deployments: 35, gasSaved: 3.4, activeNodes: 4 },
  { name: 'Sat', deployments: 48, gasSaved: 4.8, activeNodes: 4 },
  { name: 'Sun', deployments: 52, gasSaved: 5.5, activeNodes: 4 },
];

const gamedevChartData = [
  { name: 'Mon', builds: 8, players: 120, avgFps: 58 },
  { name: 'Tue', builds: 14, players: 180, avgFps: 59 },
  { name: 'Wed', builds: 22, players: 240, avgFps: 60 },
  { name: 'Thu', builds: 19, players: 210, avgFps: 60 },
  { name: 'Fri', builds: 28, players: 380, avgFps: 60 },
  { name: 'Sat', builds: 42, players: 520, avgFps: 60 },
  { name: 'Sun', builds: 45, players: 610, avgFps: 60 },
];

const KPICard = ({ title, value, trend, trendValue, icon: Icon, color, glowColor }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-[#111113]/80 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group relative overflow-hidden"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-all duration-300`}>
        <Icon size={20} />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-headline font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trendValue}
      </div>
    </div>
    <div>
      <p className="text-slate-500 text-[10px] font-headline font-semibold mb-1 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-headline font-bold text-white tracking-tight">{value}</h3>
    </div>
    
    {/* Underglow Accent Bar */}
    <div className="mt-4 h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: '80%' }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="h-full"
        style={{ backgroundColor: glowColor || '#c3f400' }}
      />
    </div>
    <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-white/2 rounded-full blur-2xl group-hover:bg-white/5 transition-all" />
  </motion.div>
);

const SuperAdminDashboard = () => {
  const { data: students } = useSupabaseData('profiles', 'id');
  const { data: colleges } = useSupabaseData('colleges', 'id');
  const { data: courses } = useSupabaseData('courses', 'id');
  const { data: enrollments } = useSupabaseData('enrollments', 'id');
  const { data: liveSessions } = useSupabaseData('live_classes', '*');
  const { data: moderationReports } = useSupabaseData('moderation_reports', '*');
  const { data: adminLogs } = useSupabaseData('admin_logs', '*');

  const [activeDivision, setActiveDivision] = useState('GLOBAL'); // 'GLOBAL' | 'BLOCKCHAIN' | 'GAME_DEV'
  
  const liveClassesCount = liveSessions ? liveSessions.filter(s => s.status === 'live').length : 0;
  const pendingApprovalsCount = moderationReports ? moderationReports.filter(r => r.status === 'pending').length : 0;

  const [realtimeStats, setRealtimeStats] = useState({
    activeOnline: 47,
    liveClasses: 3,
    newEnrollments: 12,
    failedPayments: 1,
    pendingApprovals: 8
  });

  // Mock list of Active Classroom corridors in the Observation Center
  const [corridors, setCorridors] = useState([
    {
      id: 'solana-web3',
      name: 'Solana Smart Contract Corridor',
      division: 'BLOCKCHAIN',
      mentor: 'Kenji Sato',
      activeCadets: 18,
      maxCadets: 20,
      focusScore: 94,
      status: 'LIVE',
      currentLesson: 'Deploying Rust Anchor Program',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)] border-emerald-500/20'
    },
    {
      id: 'unreal-mp',
      name: 'Unreal Multiplayer Corridor',
      division: 'GAME_DEV',
      mentor: 'Marcus Vance',
      activeCadets: 14,
      maxCadets: 15,
      focusScore: 89,
      status: 'LIVE',
      currentLesson: 'Server Replicated RPC Functions',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)] border-rose-500/20'
    },
    {
      id: 'ethereum-defi',
      name: 'Ethereum DeFi Corridor',
      division: 'BLOCKCHAIN',
      mentor: 'Elena Rostova',
      activeCadets: 8,
      maxCadets: 12,
      focusScore: 72,
      status: 'ACTIVE',
      currentLesson: 'Liquidity Pool Custom AMM Math',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)] border-cyan-500/20'
    },
    {
      id: 'unity-shaders',
      name: 'Unity WebGL Shader Corridor',
      division: 'GAME_DEV',
      mentor: 'Sora Takahashi',
      activeCadets: 5,
      maxCadets: 10,
      focusScore: 45,
      status: 'IDLE',
      currentLesson: 'Compute Shaders & GPU Particles',
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)] border-violet-500/20'
    }
  ]);

  // Mock list of students at risk of drop-out
  const [inertiaWarnings, setInertiaWarnings] = useState([
    {
      id: 'alex-mercer',
      name: 'Alex Mercer',
      track: 'BLOCKCHAIN',
      cohort: 'Alpha-BCHN',
      riskScore: 92,
      diagnosis: 'Inactive for 9 days, Broken streak, Missing ERC-721 assignment',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alex'
    },
    {
      id: 'kira-vance',
      name: 'Kira Vance',
      track: 'GAME_DEV',
      cohort: 'Beta-GDEV',
      riskScore: 78,
      diagnosis: 'Zero build uploads in 14 days, Absent from 2 transmissions',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Kira'
    },
    {
      id: 'chen-wei',
      name: 'Chen Wei',
      track: 'BLOCKCHAIN',
      cohort: 'Delta-BCHN',
      riskScore: 65,
      diagnosis: 'Focus index dropped by 40% in last session, Idle compile loop',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Chen'
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeStats(prev => ({
        ...prev,
        activeOnline: Math.max(30, prev.activeOnline + (Math.random() > 0.5 ? 2 : -2)),
        newEnrollments: prev.newEnrollments + (Math.random() > 0.8 ? 1 : 0),
        liveClasses: liveClassesCount || prev.liveClasses,
        pendingApprovals: pendingApprovalsCount || prev.pendingApprovals
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [liveClassesCount, pendingApprovalsCount]);

  const studentCount = students.length || 184;
  const collegeCount = colleges.length || 14;
  const courseCount = courses.length || 28;
  const enrollmentCount = enrollments.length || 92;

  // Filter dynamic tracks
  const isBlockchainStudent = s => s.track === 'BLOCKCHAIN' || s.learning_track === 'blockchain';
  const isGameDevStudent = s => s.track === 'GAME_DEV' || s.learning_track === 'game_dev';
  
  const isBlockchainCourse = c => c.track === 'BLOCKCHAIN' || c.category?.toLowerCase().includes('blockchain') || c.category?.toLowerCase().includes('web3');
  const isGameDevCourse = c => c.track === 'GAME_DEV' || c.category?.toLowerCase().includes('game');

  const bStudents = students.filter(isBlockchainStudent);
  const gStudents = students.filter(isGameDevStudent);
  
  const bCourses = courses.filter(isBlockchainCourse);
  const gCourses = courses.filter(isGameDevCourse);

  const bEnrollments = enrollments.filter(e => {
    const c = courses.find(course => course.id === e.course_id);
    return c ? isBlockchainCourse(c) : false;
  });
  const gEnrollments = enrollments.filter(e => {
    const c = courses.find(course => course.id === e.course_id);
    return c ? isGameDevCourse(c) : false;
  });

  const bLive = (liveSessions || []).filter(s => s.track === 'BLOCKCHAIN');
  const gLive = (liveSessions || []).filter(s => s.track === 'GAME_DEV');

  const totalBStudents = bStudents.length || 94;
  const totalGStudents = gStudents.length || 90;
  
  const totalBCourses = bCourses.length || 12;
  const totalGCourses = gCourses.length || 16;

  const totalBEnrollments = bEnrollments.length || 48;
  const totalGEnrollments = gEnrollments.length || 44;

  const totalBLive = bLive.length || 2;
  const totalGLive = gLive.length || 1;

  // Compile live audit log items
  const displayAuditLogs = adminLogs && adminLogs.length > 0
    ? adminLogs.slice(-4).reverse().map(log => {
        const timeDiff = new Date() - new Date(log.created_at);
        const minsAgo = Math.max(0, Math.floor(timeDiff / 60000));
        const timeStr = minsAgo <= 0 ? 'Just now' : minsAgo < 60 ? `${minsAgo}m ago` : `${Math.floor(minsAgo / 60)}h ago`;
        
        let color = 'blue';
        let icon = <Settings size={12} />;
        if (log.action.includes('DELETE')) {
          color = 'rose';
          icon = <AlertTriangle size={12} />;
        } else if (log.action.includes('ROLE_UPDATE')) {
          color = 'emerald';
          icon = <Plus size={12} />;
        }
        
        return {
          user: 'SuperAdmin',
          action: log.action,
          time: timeStr,
          icon,
          color
        };
      })
    : [
        { user: 'Satoshi Blockchain', action: 'Failed Payment', time: '1m ago', icon: <CreditCard size={12} />, color: 'rose' },
        { user: 'Kenji Sato', action: 'Published Web3 Course', time: '5m ago', icon: <Plus size={12} />, color: 'emerald' },
        { user: 'SuperAdmin_Core', action: 'System Config Edited', time: '22m ago', icon: <Settings size={12} />, color: 'blue' },
        { user: 'CommunityBot', action: 'Discussion Post Banned', time: '1h ago', icon: <AlertTriangle size={12} />, color: 'rose' },
      ];

  // Dynamically compile KPI lists based on active division
  const getKPIDeck = () => {
    switch (activeDivision) {
      case 'BLOCKCHAIN':
        return [
          { title: 'Blockchain Students', value: totalBStudents.toLocaleString(), trend: 'up', trendValue: '+12.4%', icon: Users, color: 'emerald', glowColor: '#10b981' },
          { title: 'Web3 Deployments', value: (totalBEnrollments * 3).toLocaleString(), trend: 'up', trendValue: '+15.2%', icon: GraduationCap, color: 'emerald', glowColor: '#10b981' },
          { title: 'Gas Fees Saved (Mock)', value: '42.8 ETH', trend: 'up', trendValue: '+24.1%', icon: CreditCard, color: 'cyan', glowColor: '#06b6d4' },
          { title: 'Active Nodes', value: '4 Network Nodes', trend: 'up', trendValue: '100% Up', icon: Cpu, color: 'cyan', glowColor: '#06b6d4' },
        ];
      case 'GAME_DEV':
        return [
          { title: 'Game Dev Students', value: totalGStudents.toLocaleString(), trend: 'up', trendValue: '+10.8%', icon: Users, color: 'rose', glowColor: '#f43f5e' },
          { title: 'WebGL/Engine Builds', value: (totalGEnrollments * 2.5).toFixed(0), trend: 'up', trendValue: '+18.6%', icon: GraduationCap, color: 'rose', glowColor: '#f43f5e' },
          { title: 'Playtests Launched', value: '286 Matches', trend: 'up', trendValue: '+32.4%', icon: Monitor, color: 'violet', glowColor: '#8b5cf6' },
          { title: 'Active Jammers', value: '3 cohorts', trend: 'up', trendValue: '+50%', icon: Sparkles, color: 'violet', glowColor: '#8b5cf6' },
        ];
      case 'GLOBAL':
      default:
        return [
          { title: 'Total Students', value: studentCount.toLocaleString(), trend: 'up', trendValue: '+14.2%', icon: Users, color: 'blue', glowColor: '#3b82f6' },
          { title: 'Active Students', value: (studentCount * 0.85).toFixed(0), trend: 'up', trendValue: '+9.4%', icon: GraduationCap, color: 'emerald', glowColor: '#10b981' },
          { title: 'Total Revenue', value: '$84,320', trend: 'up', trendValue: '+21.8%', icon: CreditCard, color: 'emerald', glowColor: '#10b981' },
          { title: 'Active Cohorts', value: '8', trend: 'up', trendValue: '+33.3%', icon: School, color: 'purple', glowColor: '#a855f7' },
        ];
    }
  };

  const handleNudge = (studentName) => {
    toast.success(`Holographic nudge transmitted to ${studentName}'s communications corridor!`, {
      style: {
        background: '#09090b',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'monospace',
        fontSize: '11px',
        letterSpacing: '0.05em'
      },
      iconTheme: {
        primary: '#c3f400',
        secondary: '#000'
      }
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header command structure */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-headline font-bold text-white tracking-tight uppercase">Ecosystem Command Center</h1>
            <p className="text-slate-500 text-xs tracking-widest font-mono uppercase mt-1">Real-time platform telemetry & division analytics</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-5 py-2.5 bg-white/5 border border-white/10 text-white text-xs font-mono font-bold tracking-widest hover:bg-white/10 transition-all rounded-xl">
              EXPORT_SYS_REPORT
            </button>
            <button className="px-5 py-2.5 bg-[#c3f400] text-black text-xs font-mono font-bold tracking-widest hover:bg-[#b0dc00] transition-all rounded-xl shadow-[0_0_15px_rgba(195,244,0,0.3)]">
              BROADCAST_ANNOUNCEMENT
            </button>
          </div>
        </div>

        {/* Realtime Stream Widget Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Active Online', value: realtimeStats.activeOnline, icon: <Activity size={14} />, color: 'emerald', status: 'pinging' },
            { label: 'Current Live Classes', value: realtimeStats.liveClasses, icon: <Monitor size={14} />, color: 'rose', status: 'live' },
            { label: 'New Enrollments', value: realtimeStats.newEnrollments, icon: <GraduationCap size={14} />, color: 'blue', status: 'active' },
            { label: 'Failed Payments', value: realtimeStats.failedPayments, icon: <CreditCard size={14} />, color: 'rose', status: 'alert' },
            { label: 'Pending Approvals', value: realtimeStats.pendingApprovals, icon: <ShieldCheck size={14} />, color: 'amber', status: 'queued' },
          ].map((widget, i) => (
            <div key={i} className="glass-card p-4 rounded-xl border border-white/5 bg-[#111113]/40 flex items-center justify-between group">
              <div className="space-y-1">
                <p className="text-slate-500 text-[9px] font-mono uppercase tracking-wider">{widget.label}</p>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-bold text-white tracking-tight">{widget.value}</h4>
                  {widget.status === 'pinging' && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
              </div>
              <div className={`p-2 rounded-lg bg-${widget.color}-500/10 text-${widget.color}-500`}>
                {widget.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Division Division Selection Deck */}
        <div className="flex border-b border-white/5 pb-2 gap-4">
          {[
            { id: 'GLOBAL', label: 'All Sectors Telemetry', color: '#c3f400', glow: 'shadow-[0_0_10px_rgba(195,244,0,0.15)]' },
            { id: 'BLOCKCHAIN', label: 'Blockchain Division', color: '#10b981', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.15)]' },
            { id: 'GAME_DEV', label: 'Game Dev Division', color: '#f43f5e', glow: 'shadow-[0_0_10px_rgba(244,63,94,0.15)]' }
          ].map((div) => (
            <button
              key={div.id}
              onClick={() => setActiveDivision(div.id)}
              className={`px-5 py-3 rounded-xl border font-mono text-xs font-bold tracking-wider transition-all relative ${
                activeDivision === div.id
                  ? 'bg-white/5 border-white/20 text-white'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {div.label}
              {activeDivision === div.id && (
                <motion.div
                  layoutId="activeDivUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: div.color }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Major KPI Deck Grid (Track-Aware) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getKPIDeck().map((kpi, idx) => (
            <KPICard key={idx} {...kpi} />
          ))}
        </div>

        {/* Analytics & Active Heatmaps Deck */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Revenue and engagement charts */}
          <div className="col-span-12 lg:col-span-8 bg-[#111113]/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-headline font-bold text-white uppercase tracking-wider">
                  {activeDivision === 'GLOBAL' && 'Global Revenue & Signup Metrics'}
                  {activeDivision === 'BLOCKCHAIN' && 'Blockchain Smart Contract Telemetry'}
                  {activeDivision === 'GAME_DEV' && 'Game Dev WebGL Optimization Telemetry'}
                </h2>
                <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-0.5">
                  {activeDivision === 'GLOBAL' && 'Dual-channel performance evaluation'}
                  {activeDivision === 'BLOCKCHAIN' && 'Decentralized compiler & ledger activity'}
                  {activeDivision === 'GAME_DEV' && 'Frame times & multi-user rendering activity'}
                </p>
              </div>
              <select className="bg-[#09090B] border border-white/10 text-slate-400 text-[10px] font-mono font-bold p-2.5 outline-none rounded-xl uppercase tracking-widest">
                <option>WEEKLY_TRACK</option>
                <option>MONTHLY_TRACK</option>
              </select>
            </div>
            
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={
                    activeDivision === 'GLOBAL' ? globalChartData :
                    activeDivision === 'BLOCKCHAIN' ? blockchainChartData : gamedevChartData
                  }
                >
                  <defs>
                    <linearGradient id="colorAccent" x1="0" y1="0" x2="0" y2="1">
                      <stop 
                        offset="5%" 
                        stopColor={
                          activeDivision === 'GLOBAL' ? '#c3f400' :
                          activeDivision === 'BLOCKCHAIN' ? '#10b981' : '#f43f5e'
                        } 
                        stopOpacity={0.3}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={
                          activeDivision === 'GLOBAL' ? '#c3f400' :
                          activeDivision === 'BLOCKCHAIN' ? '#10b981' : '#f43f5e'
                        } 
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff10" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#64748b', fontFamily: 'monospace' }}
                  />
                  <YAxis 
                    stroke="#ffffff10" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#64748b', fontFamily: 'monospace' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111113', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '11px', color: '#fff' }}
                    labelStyle={{ fontSize: '11px', color: '#64748b' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={
                      activeDivision === 'GLOBAL' ? 'revenue' :
                      activeDivision === 'BLOCKCHAIN' ? 'deployments' : 'builds'
                    } 
                    stroke={
                      activeDivision === 'GLOBAL' ? '#c3f400' :
                      activeDivision === 'BLOCKCHAIN' ? '#10b981' : '#f43f5e'
                    } 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorAccent)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick actions panel */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-[#111113]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <h2 className="text-sm font-headline font-bold text-white mb-6 uppercase tracking-wider">Division Operations</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Create Course', icon: <Plus size={16} />, color: 'blue' },
                  { label: 'Verify User', icon: <ShieldCheck size={16} />, color: 'emerald' },
                  { label: 'Moderate Chat', icon: <AlertTriangle size={16} />, color: 'amber' },
                  { label: 'Issue NFT Cert', icon: <Award size={16} />, color: 'purple' },
                ].map((action, i) => (
                  <button 
                    key={i}
                    className="flex flex-col items-center gap-3 p-4 bg-white/2 border border-white/5 rounded-xl hover:bg-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className={`p-2.5 rounded-xl bg-${action.color}-500/10 text-${action.color}-500 group-hover:scale-110 transition-all duration-300`}>
                      {action.icon}
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* System Audit */}
            <div className="bg-[#111113]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <h2 className="text-sm font-headline font-bold text-white mb-6 uppercase tracking-wider">System Live Audit</h2>
              <div className="space-y-4">
                {displayAuditLogs.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-500 flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.user}</p>
                      <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{item.action}</p>
                    </div>
                    <span className="text-[9px] text-slate-600 font-mono">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ADMIN OBSERVATION CENTER */}
        <div className="border border-white/5 bg-[#111113]/30 backdrop-blur-xl rounded-3xl p-8 space-y-8">
          <div>
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-[#c3f400] animate-pulse" />
              <h2 className="text-xl font-headline font-bold text-white uppercase tracking-wider">Admin Observation Center</h2>
            </div>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-1">Corridor concurrent sessions & predictive student inertia telemetry</p>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Active Classrooms Heatmap Grid */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Wifi size={14} className="text-emerald-500 animate-pulse" />
                  Active Classroom Heatmap Corridors
                </h3>
                <span className="text-[9px] font-mono text-slate-600 uppercase">Interactive Grid</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {corridors
                  .filter(c => activeDivision === 'GLOBAL' || c.division === activeDivision)
                  .map((corridor) => (
                    <motion.div
                      key={corridor.id}
                      whileHover={{ scale: 1.02 }}
                      className={`bg-[#09090b]/80 border rounded-2xl p-5 space-y-4 transition-all hover:bg-[#09090b] ${corridor.glow}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            corridor.division === 'BLOCKCHAIN'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {corridor.division}
                          </span>
                          <h4 className="text-sm font-semibold text-white mt-2 leading-tight">{corridor.name}</h4>
                        </div>
                        
                        <span className={`flex h-2.5 w-2.5 relative`}>
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            corridor.status === 'LIVE' ? 'bg-emerald-400' :
                            corridor.status === 'ACTIVE' ? 'bg-cyan-400' : 'bg-slate-400'
                          }`} />
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                            corridor.status === 'LIVE' ? 'bg-emerald-500' :
                            corridor.status === 'ACTIVE' ? 'bg-cyan-500' : 'bg-slate-500'
                          }`} />
                        </span>
                      </div>

                      <div className="space-y-1.5 border-t border-white/5 pt-3">
                        <p className="text-[10px] text-slate-500 font-mono">
                          ACTIVE LESSON: <span className="text-white font-sans font-semibold">{corridor.currentLesson}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          CADETS CONCURRENT: <span className="text-slate-300 font-sans font-semibold">{corridor.activeCadets} / {corridor.maxCadets}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          ACADEMIC MENTOR: <span className="text-[#c3f400] font-sans font-bold">{corridor.mentor}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] font-mono text-slate-500">FOCUS INDEX</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold ${
                            corridor.focusScore >= 85 ? 'text-emerald-400' :
                            corridor.focusScore >= 60 ? 'text-cyan-400' : 'text-rose-400'
                          }`}>
                            {corridor.focusScore}%
                          </span>
                          <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                corridor.focusScore >= 85 ? 'bg-emerald-500' :
                                corridor.focusScore >= 60 ? 'bg-cyan-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${corridor.focusScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>

            {/* Predictive Drop-out / Telemetry Hazard Warnings */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert size={14} className="text-rose-500 animate-pulse" />
                  Cadets at Inertia Risk (Dropout Potential)
                </h3>
                <span className="text-[9px] font-mono text-slate-600 uppercase">Predictive AI Telemetry</span>
              </div>

              <div className="space-y-4">
                {inertiaWarnings
                  .filter(w => activeDivision === 'GLOBAL' || w.track === activeDivision)
                  .map((student) => (
                    <div 
                      key={student.id}
                      className="bg-[#09090b]/60 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex gap-4 transition-all items-start group"
                    >
                      <img 
                        src={student.avatar} 
                        alt={student.name}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-white group-hover:text-[#c3f400] transition-colors">{student.name}</h4>
                            <span className="text-[8px] font-mono text-slate-500">{student.cohort} • {student.track}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-[10px] font-mono font-black ${
                              student.riskScore >= 85 ? 'text-rose-500' : 'text-amber-500'
                            }`}>
                              {student.riskScore}% RISK
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 font-mono bg-white/2 p-2 rounded-lg border border-white/5 leading-relaxed">
                          {student.diagnosis}
                        </p>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleNudge(student.name)}
                            className="px-3 py-1 bg-white/5 hover:bg-[#c3f400] hover:text-black border border-white/10 text-white font-mono text-[9px] font-bold tracking-widest rounded-lg transition-all"
                          >
                            TRANSMIT_NUDGE
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default SuperAdminDashboard;
