import AdminLayout from '../layouts/AdminLayout';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { 
  Users, School, Briefcase, BookOpen, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Activity, Zap, 
  Plus, ShieldCheck, CreditCard, Award
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';

const data = [
  { name: 'Mon', revenue: 4000, users: 2400 },
  { name: 'Tue', revenue: 3000, users: 1398 },
  { name: 'Wed', revenue: 2000, users: 9800 },
  { name: 'Thu', revenue: 2780, users: 3908 },
  { name: 'Fri', revenue: 1890, users: 4800 },
  { name: 'Sat', revenue: 2390, users: 3800 },
  { name: 'Sun', revenue: 3490, users: 4300 },
];

const KPICard = ({ title, value, trend, trendValue, icon: Icon, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#111113] border border-white/5 p-6 rounded-xl hover:border-white/10 transition-all group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
        <Icon size={20} />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trendValue}
      </div>
    </div>
    <div>
      <p className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
    </div>
    <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: '70%' }}
        className={`h-full bg-${color}-500/50`}
      />
    </div>
  </motion.div>
);

const SuperAdminDashboard = () => {
  const { data: students } = useSupabaseData('profiles', 'id');
  const { data: colleges } = useSupabaseData('colleges', 'id');
  const { data: courses } = useSupabaseData('courses', 'id');
  const { data: enrollments } = useSupabaseData('enrollments', 'id');

  const studentCount = students.length;
  const collegeCount = colleges.length;
  const courseCount = courses.length;
  const enrollmentCount = enrollments.length;

  const kpis = [
    { title: 'Total Users', value: studentCount.toLocaleString(), trend: 'up', trendValue: '+12.5%', icon: Users, color: 'blue' },
    { title: 'Institutions', value: collegeCount.toLocaleString(), trend: 'up', trendValue: '+3.2%', icon: School, color: 'purple' },
    { title: 'Active Courses', value: courseCount.toLocaleString(), trend: 'up', trendValue: '+18.4%', icon: BookOpen, color: 'emerald' },
    { title: 'Platform Reach', value: enrollmentCount.toLocaleString(), trend: 'up', trendValue: '+24.1%', icon: CreditCard, color: 'amber' },
  ];

  const quickActions = [
    { label: 'Create Course', icon: <Plus size={16} />, color: 'blue' },
    { label: 'Verify College', icon: <ShieldCheck size={16} />, color: 'emerald' },
    { label: 'Issue Certificate', icon: <Award size={16} />, color: 'purple' },
    { label: 'Send Alert', icon: <Zap size={16} />, color: 'rose' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with Greeting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Command Center</h1>
            <p className="text-slate-500 text-sm">Real-time platform overview and management.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-md hover:bg-white/10 transition-all">
              DOWNLOAD_REPORT
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
              CREATE_ANNOUNCEMENT
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => (
            <KPICard key={idx} {...kpi} />
          ))}
        </div>

        {/* Charts & Activity Section */}
        <div className="grid grid-cols-12 gap-8">
          {/* Revenue Area Chart */}
          <div className="col-span-12 lg:col-span-8 bg-[#111113] border border-white/5 rounded-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight uppercase">Revenue Analytics</h2>
                <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">Historical data across all channels</p>
              </div>
              <select className="bg-[#09090B] border border-white/10 text-slate-400 text-[10px] font-bold p-2 outline-none rounded-md uppercase tracking-widest">
                <option>LAST_7_DAYS</option>
                <option>LAST_30_DAYS</option>
              </select>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#64748b' }}
                  />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111113', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-[#111113] border border-white/5 rounded-xl p-6">
              <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, i) => (
                  <button 
                    key={i}
                    className="flex flex-col items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className={`p-2 rounded-md bg-${action.color}-500/10 text-${action.color}-500 group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#111113] border border-white/5 rounded-xl p-6">
              <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Live Activity</h2>
              <div className="space-y-4">
                {[
                  { user: 'Kenji Sato', action: 'Published Course', time: '2m ago', icon: <Plus size={12} />, color: 'emerald' },
                  { user: 'Neo Tech', action: 'New Institution', time: '12m ago', icon: <School size={12} />, color: 'blue' },
                  { user: 'Alice Vance', action: 'Enrolled in Web3', time: '45m ago', icon: <Users size={12} />, color: 'amber' },
                  { user: 'Admin_Core', action: 'Security Patch', time: '1h ago', icon: <ShieldCheck size={12} />, color: 'rose' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-500`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.user}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{item.action}</p>
                    </div>
                    <span className="text-[9px] text-slate-600 font-mono">{item.time}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-all border-t border-white/5 pt-4">
                View All Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SuperAdminDashboard;
