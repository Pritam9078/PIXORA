import AdminLayout from '../layouts/AdminLayout';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useState, useEffect } from 'react';
import { 
  Users, School, Briefcase, BookOpen, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Activity, Zap, 
  Plus, ShieldCheck, CreditCard, Award, Eye, GraduationCap,
  MessageSquare, Settings, AlertTriangle, Monitor, Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

const chartData = [
  { name: 'Mon', revenue: 4200, users: 2400, retention: 92 },
  { name: 'Tue', revenue: 3100, users: 3100, retention: 94 },
  { name: 'Wed', revenue: 5400, users: 4200, retention: 95 },
  { name: 'Thu', revenue: 4780, users: 5908, retention: 91 },
  { name: 'Fri', revenue: 6890, users: 7800, retention: 96 },
  { name: 'Sat', revenue: 8390, users: 9200, retention: 98 },
  { name: 'Sun', revenue: 9490, users: 11300, retention: 97 },
];

const KPICard = ({ title, value, trend, trendValue, icon: Icon, color }) => (
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
        className={`h-full bg-${color}-500/50`}
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
  const { data: liveSessions } = useSupabaseData('live_sessions', '*');
  const { data: moderationReports } = useSupabaseData('moderation_reports', '*');
  const { data: adminLogs } = useSupabaseData('admin_logs', '*');

  const liveClassesCount = liveSessions ? liveSessions.filter(s => s.status === 'live').length : 0;
  const pendingApprovalsCount = moderationReports ? moderationReports.filter(r => r.status === 'pending').length : 0;

  const [realtimeStats, setRealtimeStats] = useState({
    activeOnline: 47,
    liveClasses: 3,
    newEnrollments: 12,
    failedPayments: 1,
    pendingApprovals: 8
  });

  useEffect(() => {
    // Standard mock heartbeat to mimic realtime Supabase stream triggers
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

  const kpis = [
    { title: 'Total Users', value: studentCount.toLocaleString(), trend: 'up', trendValue: '+14.2%', icon: Users, color: 'blue' },
    { title: 'Active Students', value: (studentCount * 0.85).toFixed(0), trend: 'up', trendValue: '+9.4%', icon: GraduationCap, color: 'emerald' },
    { title: 'Total Revenue', value: '$84,320', trend: 'up', trendValue: '+21.8%', icon: CreditCard, color: 'emerald' },
    { title: 'Active Cohorts', value: '8', trend: 'up', trendValue: '+33.3%', icon: School, color: 'purple' },
    { title: 'Pending Verification', value: realtimeStats.pendingApprovals.toString(), trend: 'down', trendValue: '-15%', icon: ShieldCheck, color: 'amber' },
    { title: 'Course Completions', value: '78.4%', trend: 'up', trendValue: '+4.1%', icon: Award, color: 'blue' },
    { title: 'Mentor Activity', value: '94.2%', trend: 'up', trendValue: '+2.8%', icon: Sparkles, color: 'pink' },
    { title: 'Live Sessions', value: realtimeStats.liveClasses.toString(), trend: 'up', trendValue: '+50%', icon: Monitor, color: 'rose' },
    { title: 'Daily Signups', value: '38', trend: 'up', trendValue: '+18.5%', icon: Plus, color: 'teal' },
    { title: 'Conversion Funnel', value: '64.2%', trend: 'up', trendValue: '+5.3%', icon: TrendingUp, color: 'violet' },
    { title: 'Student Retention', value: '96.8%', trend: 'up', trendValue: '+0.5%', icon: Activity, color: 'emerald' },
    { title: 'Weekly Engagement', value: '82.4%', trend: 'up', trendValue: '+8.1%', icon: MessageSquare, color: 'indigo' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Header command structure */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-headline font-bold text-white tracking-tight uppercase">Ecosystem Command Center</h1>
            <p className="text-slate-500 text-xs tracking-widest font-mono uppercase mt-1">Real-time platform telemetry & operational analytics</p>
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

        {/* Major KPI Deck Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => (
            <KPICard key={idx} {...kpi} />
          ))}
        </div>

        {/* Analytics & Logs Layout */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Revenue and engagement charts */}
          <div className="col-span-12 lg:col-span-8 bg-[#111113]/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-headline font-bold text-white uppercase tracking-wider">Revenue & Signup Metrics</h2>
                <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-0.5">Dual-channel performance evaluation</p>
              </div>
              <select className="bg-[#09090B] border border-white/10 text-slate-400 text-[10px] font-mono font-bold p-2.5 outline-none rounded-xl uppercase tracking-widest">
                <option>WEEKLY_TRACK</option>
                <option>MONTHLY_TRACK</option>
              </select>
            </div>
            
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c3f400" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#c3f400" stopOpacity={0}/>
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
                    dataKey="revenue" 
                    stroke="#c3f400" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRev)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side command deck: Quick Actions and Live Activity */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            <div className="bg-[#111113]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <h2 className="text-sm font-headline font-bold text-white mb-6 uppercase tracking-wider">Quick Actions</h2>
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
              <button className="w-full mt-6 py-2.5 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-all border-t border-white/5 pt-4">
                LAUNCH_AUDIT_EXPLORER
              </button>
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default SuperAdminDashboard;
