import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';

const StudentDashboard = () => {
  const stats = [
    { label: 'Combat Hours', value: '120', trend: '+12% vs last cycle', color: 'lime' },
    { label: 'Assignments', value: '15', sub: '2 pending submission', color: 'purple' },
    { label: 'Avg Score', value: '92%', progress: 92, color: 'cyan' },
  ];

  const activeTracks = [
    {
      title: 'Blockchain Engineering',
      desc: 'Advanced consensus algorithms and smart contract security in hostile environments.',
      progress: 85,
      color: 'lime',
      icon: 'shield'
    },
    {
      title: 'Unreal Engine 5 Deep Systems',
      desc: 'Spatial computing and physics-based rendering for tactical simulation environments.',
      progress: 42,
      color: 'purple',
      icon: 'layers'
    }
  ];

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
                  className="glass-panel p-5 rounded group transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`p-2 rounded ${track.color === 'lime' ? 'bg-secondary-container/10' : 'bg-on-tertiary-container/10'}`}>
                      <span className={`material-symbols-outlined ${track.color === 'lime' ? 'text-secondary-container' : 'text-on-tertiary-container'}`}>{track.icon}</span>
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
                <div className="bg-white/5 p-4 rounded border-l-2 border-secondary-container">
                  <p className="text-[9px] font-bold text-secondary-container uppercase mb-1">Due in 4h</p>
                  <h4 className="text-sm font-bold text-white mb-1">Smart Contract Audit</h4>
                  <p className="text-xs text-slate-500">Secure the vault prototype against reentrancy.</p>
                </div>
                <div className="bg-white/5 p-4 rounded border-l-2 border-slate-700">
                  <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Due in 2 days</p>
                  <h4 className="text-sm font-bold text-white mb-1">Physics Engine Stress Test</h4>
                  <p className="text-xs text-slate-500">Calculate projectile trajectories in high gravity.</p>
                </div>
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
                  <span className="text-secondary-container font-headline text-[10px]">1250 XP</span>
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
