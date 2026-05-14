import React from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  TrendingUp, Clock, Target, Award, 
  Brain, Zap, Activity, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

const AnalyticsDashboard = ({ data }) => {
  // Map real progress data if available, otherwise fallback to mock for visual demo
  const learningProgress = data?.analytics?.length > 0 
    ? data.analytics.map(item => ({
        day: new Date(item.last_synced_at).toLocaleDateString('en-US', { weekday: 'short' }),
        progress: item.lessons_completed * 10, // Scaled for visual
        hours: item.total_learning_time / 60
      }))
    : [
        { day: 'Mon', progress: 12, hours: 1.2 },
        { day: 'Tue', progress: 25, hours: 2.5 },
        { day: 'Wed', progress: 18, hours: 1.8 },
        { day: 'Thu', progress: 45, hours: 3.2 },
        { day: 'Fri', progress: 55, hours: 2.1 },
        { day: 'Sat', progress: 75, hours: 4.5 },
        { day: 'Sun', progress: 92, hours: 3.8 },
      ];

  const masteryData = [
    { subject: 'Logic', A: 120, fullMark: 150 },
    { subject: 'Assets', A: 98, fullMark: 150 },
    { subject: 'UI/UX', A: 86, fullMark: 150 },
    { subject: 'Optimization', A: 99, fullMark: 150 },
    { subject: 'Physics', A: 85, fullMark: 150 },
    { subject: 'Shaders', A: 65, fullMark: 150 },
  ];

  return (
    <div className="space-y-8 p-1">
      {/* 1. TOP METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Neural Velocity', value: data?.averageProgress || '0', unit: 'SYNC %', icon: <Activity size={20}/>, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Mastery Status', value: data?.completedCourses || '0', unit: 'MISSION', icon: <Brain size={20}/>, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Deployment Time', value: data?.totalLearningTime || '12', unit: 'hrs', icon: <Clock size={20}/>, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Total Archives', value: data?.totalCourses || '0', unit: 'UNITS', icon: <Award size={20}/>, color: 'text-[var(--st-color-primary)]', bg: 'bg-[var(--st-color-primary)]/10' },
        ].map((metric, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 rounded-[32px] border-white/5 relative overflow-hidden group hover:border-[var(--st-color-primary)]/20 transition-all"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              {metric.icon}
            </div>
            <div className="flex items-center gap-4 mb-4">
               <div className={`p-3 rounded-2xl ${metric.bg} ${metric.color}`}>
                  {metric.icon}
               </div>
               <p className="text-[10px] font-headline font-black text-on-surface-variant/30 uppercase tracking-widest">{metric.label}</p>
            </div>
            <div className="flex items-baseline gap-2">
               <p className="text-3xl font-headline font-bold text-white">{metric.value}</p>
               <p className="text-[9px] font-headline font-bold text-white/20 uppercase tracking-widest">{metric.unit}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. MAIN CHARTS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Learning Velocity Area Chart */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-[40px] border-white/5 bg-white/[0.01]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-headline font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <TrendingUp size={20} className="text-blue-400" />
                Learning Velocity Matrix
              </h3>
              <p className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest mt-1">7-Day Neural Progression Index</p>
            </div>
            <div className="flex gap-2">
               <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[9px] font-headline font-bold uppercase">Live Sync</span>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={learningProgress}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--st-color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--st-color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  fontFamily="Inter"
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  fontFamily="Inter"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="var(--st-color-primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorProgress)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Mastery Radar Chart */}
        <div className="glass-panel p-8 rounded-[40px] border-white/5 bg-white/[0.01]">
          <div className="mb-8">
            <h3 className="text-lg font-headline font-bold text-white uppercase tracking-wider flex items-center gap-3">
              <Zap size={20} className="text-orange-400" />
              Skill Distribution
            </h3>
            <p className="text-[10px] font-headline font-bold text-white/20 uppercase tracking-widest mt-1">Sector Competency Breakdown</p>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={masteryData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  stroke="rgba(255,255,255,0.4)" 
                  fontSize={10}
                  fontFamily="Inter"
                />
                <Radar
                  name="Mastery"
                  dataKey="A"
                  stroke="var(--st-color-primary)"
                  fill="var(--st-color-primary)"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. PERFORMANCE INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass-panel p-8 rounded-[40px] border-white/5 bg-white/[0.01]">
            <h4 className="text-xs font-headline font-black text-[var(--st-color-primary)] uppercase tracking-[0.2em] mb-6">Strategic Strength</h4>
            <div className="space-y-4">
               {[
                 { label: 'System Logic', percentage: 94, color: 'bg-blue-400' },
                 { label: '3D Optimization', percentage: 82, color: 'bg-emerald-400' },
                 { label: 'Network Protocols', percentage: 76, color: 'bg-purple-400' }
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <span className="text-sm font-bold text-white/80">{item.label}</span>
                       <span className="text-[10px] font-headline font-black text-white/40 uppercase">{item.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${item.percentage}%` }}
                         transition={{ duration: 1, delay: i * 0.1 }}
                         className={`h-full ${item.color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                       ></motion.div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="glass-panel p-8 rounded-[40px] border-white/5 bg-[var(--st-color-primary)]/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <ShieldCheck size={120} />
            </div>
            <h4 className="text-xs font-headline font-black text-[var(--st-color-primary)] uppercase tracking-[0.2em] mb-6">Elite Certification Progress</h4>
            <div className="flex items-center gap-10">
               <div className="w-32 h-32 rounded-full border-8 border-white/5 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-8 border-t-[var(--st-color-primary)] border-r-[var(--st-color-primary)] border-b-[var(--st-color-primary)] rotate-[45deg] shadow-[0_0_20px_var(--st-color-glow)]"></div>
                  <div className="text-center">
                     <p className="text-2xl font-headline font-bold text-white">75%</p>
                     <p className="text-[8px] font-headline font-black text-white/40 uppercase">Synced</p>
                  </div>
               </div>
               <div className="flex-1 space-y-4">
                  <p className="text-on-surface-variant/70 text-sm leading-relaxed">
                     You are <strong>3 modules away</strong> from achieving Level-05 Senior Architect status. Maintain your <strong>7-day streak</strong> to unlock the final certification node.
                  </p>
                  <button className="btn-primary px-8 py-3 text-[10px]">
                     View Roadmap
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
