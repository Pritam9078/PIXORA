import React, { useMemo } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion } from 'framer-motion';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, 
  School, BookOpen, CreditCard, Calendar,
  ArrowUpRight, ArrowDownRight, Globe, Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, 
  PieChart, Pie, Cell 
} from 'recharts';

const data = [
  { name: 'Jan', revenue: 4500, users: 2100, active: 1800 },
  { name: 'Feb', revenue: 5200, users: 2400, active: 2100 },
  { name: 'Mar', revenue: 4800, users: 2800, active: 2300 },
  { name: 'Apr', revenue: 6100, users: 3200, active: 2900 },
  { name: 'May', revenue: 7500, users: 3800, active: 3400 },
  { name: 'Jun', revenue: 8900, users: 4500, active: 4100 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Analytics = () => {
  const { data: profiles } = useSupabaseData('profiles');
  const { data: colleges } = useSupabaseData('colleges');
  const { data: courses } = useSupabaseData('courses');

  const stats = useMemo(() => {
    const totalUsers = profiles.length;
    const totalColleges = colleges.length;
    const totalCourses = courses.length;
    const activeUsers = profiles.filter(p => p.status === 'active').length;

    return [
      { label: 'Total Users', val: totalUsers, trend: 'up', icon: <Users size={20} />, color: 'blue' },
      { label: 'Active Institutions', val: totalColleges, trend: 'up', icon: <School size={20} />, color: 'emerald' },
      { label: 'Courses Live', val: totalCourses, trend: 'up', icon: <BookOpen size={20} />, color: 'purple' },
      { label: 'Active Learners', val: activeUsers, trend: 'up', icon: <Zap size={20} />, color: 'amber' },
    ];
  }, [profiles, colleges, courses]);

  const categoryData = useMemo(() => {
    const counts = courses.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [courses]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Platform Intelligence</h1>
            <p className="text-slate-500 text-sm">Deep insights into ecosystem growth and user behavior.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-md hover:bg-white/10 transition-all">
              <Calendar size={14} />
              LAST_30_DAYS
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
              DOWNLOAD_ANALYTICS_BDB
            </button>
          </div>
        </div>

        {/* Growth Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-[#111113] border border-white/5 p-6 rounded-xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg bg-${s.color}-500/10 text-${s.color}-500`}>
                  {s.icon}
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold ${s.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {s.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  +12.4%
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{s.val}</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-[#111113] border border-white/5 rounded-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Active Usage & Revenue</h2>
                <p className="text-xs text-slate-500">Cross-channel performance correlation.</p>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111113', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 bg-[#111113] border border-white/5 rounded-xl p-8">
            <h2 className="text-lg font-bold text-white tracking-tight mb-8">Category Distribution</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-xs text-slate-400 font-medium">{cat.name}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
