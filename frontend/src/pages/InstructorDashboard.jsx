import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';

const InstructorDashboard = () => {
  const navigation = [
    { label: 'Command Center', icon: 'dashboard', href: '#', active: true },
    { label: 'Onboarding Status', icon: 'verified_user', href: '#' },
    { label: 'Academic Tracks', icon: 'account_tree', href: '#' },
    { label: 'Engine Analytics', icon: 'query_stats', href: '#' },
    { label: 'Network Nodes', icon: 'hub', href: '#' },
    { label: 'Documentation', icon: 'menu_book', href: '#' },
  ];

  const metrics = [
    { label: 'Active Students', value: '1,248', trend: '+12%', icon: 'group', color: 'purple' },
    { label: 'Avg Progress', value: '68.2%', status: 'STABLE', icon: 'bolt', color: 'lime' },
    { label: 'Sessions Today', value: '04', trend: '3 PENDING', icon: 'hourglass_empty', color: 'cyan' },
    { label: 'Submissions', value: '142', status: 'URGENT', icon: 'assignment_turned_in', color: 'lime' },
  ];

  const courses = [
    {
      title: 'ORBITAL MECHANICS & SIMULATION',
      level: 'LEVEL 101',
      progress: 84,
      students: 42,
      color: 'lime',
      img: 'https://api.dicebear.com/7.x/shapes/svg?seed=Orbital'
    },
    {
      title: 'PROPULSION SYSTEMS: ION DRIVE',
      level: 'ADVANCED',
      progress: 42,
      students: 18,
      color: 'purple',
      img: 'https://api.dicebear.com/7.x/shapes/svg?seed=Propulsion'
    }
  ];

  return (
    <DashboardLayout role="Operator | Level 4" navigation={navigation}>
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="font-headline text-3xl text-white uppercase tracking-tight">COMMAND CENTER</h1>
            <p className="text-slate-400 font-body mt-2 text-sm">Welcome back, Instructor. System integrity at 98.4%.</p>
          </div>
          <button className="px-8 py-4 bg-secondary-container text-black font-bold font-headline text-[10px] tracking-widest uppercase rounded-sm hover:shadow-[0_0_20px_rgba(195,244,0,0.4)] transition-all flex items-center gap-3">
            <span className="material-symbols-outlined">add_box</span>
            Build New Module
          </button>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {metrics.map((metric, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 rounded-lg relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`material-symbols-outlined ${metric.color === 'purple' ? 'text-on-tertiary-container' : 'text-secondary-container'}`}>{metric.icon}</span>
                <span className={`text-[9px] font-headline font-bold px-2 py-1 rounded ${metric.color === 'purple' ? 'bg-on-tertiary-container/10 text-on-tertiary-container' : 'bg-secondary-container/10 text-secondary-container'}`}>
                  {metric.trend || metric.status}
                </span>
              </div>
              <p className="text-slate-500 text-[10px] font-headline uppercase tracking-widest">{metric.label}</p>
              <h2 className="font-headline text-2xl text-white mt-1">{metric.value}</h2>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-12 gap-6">
          {/* Courses & Analytics */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-white text-lg flex items-center gap-3 uppercase tracking-tight">
                <span className="w-1 h-6 bg-secondary-container"></span>
                Assigned Courses
              </h3>
              <button className="text-[10px] font-headline text-secondary-container uppercase tracking-widest hover:underline">View All Trackers</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -4 }}
                  className="glass-panel rounded-lg overflow-hidden group"
                >
                  <div className="h-32 w-full relative overflow-hidden bg-slate-900">
                    <img alt={course.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-all duration-500 group-hover:scale-110" src={course.img} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#16181D] to-transparent"></div>
                    <div className="absolute bottom-4 left-6">
                      <span className={`px-2 py-1 text-[9px] font-bold font-headline uppercase ${course.color === 'lime' ? 'bg-secondary-container text-black' : 'bg-on-tertiary-container text-white'}`}>
                        {course.level}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <h4 className="font-headline text-white leading-tight uppercase text-sm">{course.title}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[9px] font-headline uppercase tracking-widest">
                        <span className="text-slate-500">Batch Progress</span>
                        <span className={course.color === 'lime' ? 'text-secondary-container' : 'text-on-tertiary-container'}>{course.progress}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${course.color === 'lime' ? 'bg-secondary-container' : 'bg-on-tertiary-container'}`} style={{ width: `${course.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(j => <div key={j} className="w-6 h-6 rounded-full border border-[#16181D] bg-slate-800"></div>)}
                        <div className="w-6 h-6 flex items-center justify-center rounded-full border border-[#16181D] bg-white/5 text-[8px] font-bold text-slate-400">+{course.students}</div>
                      </div>
                      <button className={`text-[10px] font-headline uppercase tracking-widest hover:text-white transition-colors ${course.color === 'lime' ? 'text-secondary-container' : 'text-on-tertiary-container'}`}>Enter Lab</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Performance Analytics */}
            <div className="glass-panel p-8 rounded-lg">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="font-headline text-white uppercase tracking-wider text-sm">Performance Analytics</h4>
                  <p className="text-[10px] text-slate-500 font-body uppercase">Aggregate student output across all active batches</p>
                </div>
                <div className="flex gap-2">
                  {['7D', '30D', 'ALL'].map(t => (
                    <span key={t} className={`px-3 py-1 text-[9px] font-headline rounded-sm cursor-pointer transition-all ${t === '30D' ? 'bg-secondary-container/10 text-secondary-container border border-secondary-container/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-48 flex items-end justify-between gap-2">
                {[40, 55, 48, 62, 80, 92, 65, 70].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-t-sm transition-all cursor-help relative group ${i === 5 ? 'bg-secondary-container h-[92%]' : 'bg-slate-800/50 h-['+h+'%] hover:bg-secondary-container/40'}`}>
                    {i === 5 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0D0E12] border border-secondary-container px-2 py-1 text-[8px] rounded whitespace-nowrap text-secondary-container font-headline uppercase">CURRENT: 92%</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity & Support */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-lg">
              <h3 className="font-headline text-white text-sm flex items-center gap-3 mb-6 uppercase tracking-wider">
                <span className="w-1 h-6 bg-on-tertiary-container"></span>
                Live Sessions
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Quantum Encryption Debugging', time: '14:00 UTC', exp: 128, status: 'Starting in 42m', active: true },
                  { title: 'Mars Habitat Life Support UI', time: 'Tomorrow 09:30', exp: 45, status: 'Scheduled' },
                ].map((session, i) => (
                  <div key={i} className={`p-4 bg-white/5 border-l-2 flex flex-col gap-2 group cursor-pointer hover:bg-white/10 transition-all ${session.active ? 'border-on-tertiary-container' : 'border-white/10 opacity-60'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-headline uppercase tracking-widest ${session.active ? 'text-on-tertiary-container' : 'text-slate-500'}`}>{session.status}</span>
                      <span className="material-symbols-outlined text-sm text-slate-500 group-hover:text-white">open_in_new</span>
                    </div>
                    <h5 className="font-headline text-xs text-white uppercase">{session.title}</h5>
                    <div className="flex items-center gap-4 text-[9px] text-slate-500 font-headline uppercase tracking-widest">
                      <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">schedule</span> {session.time}</div>
                      <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">group</span> {session.exp} Expected</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-lg">
              <h3 className="font-headline text-white text-sm mb-6 uppercase tracking-wider">Action Required</h3>
              <div className="space-y-4">
                {[
                  { label: 'Orbital Sim Lab-04', sub: '24 Ungraded submissions', icon: 'priority_high', urgent: true },
                  { label: 'Student Q&A Forum', sub: '12 New threads in \'Ion Drive\'', icon: 'forum' },
                ].map((action, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-sm ${action.urgent ? 'text-red-500' : 'text-slate-500'}`}>{action.icon}</span>
                      <div>
                        <p className="text-white font-bold text-xs uppercase tracking-tight">{action.label}</p>
                        <p className="text-[9px] text-slate-500 font-headline uppercase tracking-widest">{action.sub}</p>
                      </div>
                    </div>
                    <button className="text-secondary-container hover:bg-secondary-container/10 px-2 py-1 rounded transition-all"><span className="material-symbols-outlined text-sm">edit</span></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-on-tertiary-container/5 border border-on-tertiary-container/20 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-secondary-container rounded-full animate-pulse"></div>
                <span className="text-[9px] font-headline text-white uppercase tracking-[0.2em]">Server Status: Nominal</span>
              </div>
              <p className="text-[8px] text-on-tertiary-container font-headline uppercase tracking-widest">PIXORA-CORE-01 // ASIA-PACIFIC-NODE</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstructorDashboard;
