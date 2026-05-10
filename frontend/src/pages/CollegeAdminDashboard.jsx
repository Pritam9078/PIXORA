import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';

const CollegeAdminDashboard = () => {
  const navigation = [
    { label: 'Command', icon: 'dashboard', href: '#', active: true },
    { label: 'Analytics', icon: 'insights', href: '#' },
    { label: 'Faculty', icon: 'supervisor_account', href: '#' },
    { label: 'Students', icon: 'school', href: '#' },
    { label: 'Infrastructure', icon: 'account_balance', href: '#' },
    { label: 'Directives', icon: 'hub', href: '#' },
  ];

  const metrics = [
    { label: 'TOTAL_STUDENTS', value: '3,842', trend: '+12% this cycle', icon: 'school', color: 'lime' },
    { label: 'FACULTY_COUNT', value: '158', trend: '98% approved', icon: 'supervisor_account', color: 'purple' },
    { label: 'ACTIVE_COURSES', value: '84', trend: '12 New units', icon: 'terminal', color: 'slate' },
    { label: 'COMPLETION_RATE', value: '94%', progress: 94, icon: 'data_exploration', color: 'lime' },
  ];

  const faculty = [
    { name: 'Dr. Kenji Sato', role: 'Faculty Head', spec: 'Quantum Systems', status: 'ACTIVE', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji' },
    { name: 'Elena Vance', role: 'Associate Prof.', spec: 'Neural Interfaces', status: 'PENDING', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
    { name: 'Marcus Thorne', role: 'Contractor', spec: 'Deep Space Logistics', status: 'ACTIVE', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
  ];

  return (
    <DashboardLayout role="Institution Admin" navigation={navigation}>
      <div className="space-y-10">
        {/* Header Info */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-headline text-3xl text-white">Neo-Tokyo Tech</h1>
              <span className="px-2 py-0.5 border border-secondary-container/50 text-secondary-container text-[10px] font-bold tracking-tighter uppercase bg-secondary-container/5">Verified</span>
            </div>
            <div className="flex gap-6 text-slate-400 text-sm font-headline uppercase tracking-widest text-[10px]">
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-base">groups</span> 4,200 MEMBERS</span>
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-base">location_on</span> SECTOR 07_HUB</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-transparent border border-white/20 text-white font-headline text-[10px] tracking-widest hover:border-white transition-all uppercase">Audit Log</button>
            <button className="px-6 py-2 bg-secondary-container text-black font-headline font-bold text-[10px] tracking-widest hover:scale-95 active:scale-90 transition-all uppercase">New Announcement</button>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#16181D] border border-white/5 p-6 relative overflow-hidden group"
            >
              <div className="relative z-10">
                <p className="font-headline text-slate-500 mb-1 text-[10px] tracking-widest uppercase">{metric.label}</p>
                <h3 className={`text-3xl font-headline ${metric.color === 'lime' && i === 3 ? 'text-secondary-container' : 'text-white'}`}>{metric.value}</h3>
                {metric.trend && (
                  <div className={`mt-4 flex items-center text-xs font-bold uppercase tracking-widest ${metric.color === 'lime' ? 'text-secondary-container' : 'text-on-tertiary-container'}`}>
                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span> {metric.trend}
                  </div>
                )}
                {metric.progress && (
                  <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
                    <div className="bg-secondary-container h-full" style={{ width: `${metric.progress}%` }}></div>
                  </div>
                )}
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-8xl">{metric.icon}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Performance & Audit Section */}
        <div className="grid grid-cols-12 gap-6">
          {/* Analytics Chart */}
          <div className="col-span-12 lg:col-span-8 bg-[#16181D] border border-white/5 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-headline text-white text-lg uppercase tracking-tight">Performance Analytics</h2>
                <p className="text-slate-500 text-[10px] font-headline uppercase tracking-widest">Aggregate Revenue & Engagement</p>
              </div>
              <select className="bg-transparent border border-white/10 text-slate-400 text-[10px] font-headline p-2 outline-none uppercase tracking-widest">
                <option>LAST_30_DAYS</option>
                <option>LAST_QUARTER</option>
              </select>
            </div>
            <div className="h-64 flex items-end gap-2 relative">
              <div className="w-full h-[60%] bg-secondary-container/10 border-t border-secondary-container/30 flex items-end">
                {[40, 65, 55, 85, 70, 90, 75, 60, 80, 100].map((h, i) => (
                  <div key={i} className="w-[5%] mx-auto bg-secondary-container/40 hover:bg-secondary-container transition-all" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                {[1, 2, 3, 4].map(i => <div key={i} className="border-t border-white/50 w-full h-0"></div>)}
              </div>
            </div>
            <div className="mt-8 flex justify-around text-center">
              <div>
                <p className="text-slate-500 text-[9px] font-bold tracking-widest uppercase">NET_REVENUE</p>
                <p className="text-xl text-white font-headline">$142,000</p>
              </div>
              <div>
                <p className="text-slate-500 text-[9px] font-bold tracking-widest uppercase">CREDITS_ISSUED</p>
                <p className="text-xl text-white font-headline">12,400</p>
              </div>
              <div>
                <p className="text-slate-500 text-[9px] font-bold tracking-widest uppercase">AVG_ENGAGEMENT</p>
                <p className="text-xl text-white font-headline">8.2h/day</p>
              </div>
            </div>
          </div>

          {/* Audit Integrity */}
          <div className="col-span-12 lg:col-span-4 bg-[#16181D] border border-white/5 p-8">
            <h2 className="font-headline text-white text-lg mb-6 uppercase tracking-tight">Audit Integrity</h2>
            <div className="space-y-4">
              {[
                { title: 'Domain Authentication', sub: 'Verified via pixora.edu protocols.', status: 'check_circle', active: true },
                { title: 'Faculty Credentials', sub: '158/158 background nodes cleared.', status: 'check_circle', active: true },
                { title: 'Annual Compliance Audit', sub: 'Next window opens in 12 days.', status: 'pending', pending: true },
                { title: 'On-Chain Ledger Sync', sub: 'Locked until next revenue epoch.', status: 'radio_button_unchecked', disabled: true },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-4 p-4 rounded-sm border ${item.pending ? 'border-on-tertiary-container/30 bg-on-tertiary-container/5' : 'bg-white/5'} ${item.disabled ? 'grayscale opacity-50' : ''}`}>
                  <span className={`material-symbols-outlined ${item.active ? 'text-secondary-container' : item.pending ? 'text-on-tertiary-container' : 'text-slate-500'}`}>{item.status}</span>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tighter">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Faculty Roster */}
        <div className="bg-[#16181D] border border-white/5 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-white text-lg uppercase tracking-tight">Faculty roster</h2>
            <div className="flex gap-2">
              <button className="p-2 border border-white/10 text-slate-400 hover:text-white transition-all">
                <span className="material-symbols-outlined text-base">filter_list</span>
              </button>
              <button className="px-4 py-1.5 border border-white/20 text-white font-headline text-[10px] tracking-widest uppercase hover:bg-white/5">Manage All</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-headline">
              <thead className="text-slate-500 text-[10px] uppercase tracking-widest border-b border-white/5">
                <tr>
                  <th className="pb-4 font-medium">Instructor</th>
                  <th className="pb-4 font-medium">Specialization</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {faculty.map((member, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 flex items-center gap-3">
                      <img alt={member.name} className="w-8 h-8 rounded-full" src={member.img} />
                      <div>
                        <p className="text-white font-bold">{member.name}</p>
                        <p className="text-[9px] text-slate-500 uppercase">{member.role}</p>
                      </div>
                    </td>
                    <td className="py-4 text-slate-400">{member.spec}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold ${member.status === 'ACTIVE' ? 'bg-secondary-container/10 text-secondary-container' : 'bg-on-tertiary-container/10 text-on-tertiary-container'}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4">
                      {member.status === 'PENDING' ? (
                        <span className="text-on-tertiary-container cursor-pointer font-bold text-[10px] tracking-widest uppercase">Approve</span>
                      ) : (
                        <span className="material-symbols-outlined text-slate-500 cursor-pointer hover:text-white">more_vert</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CollegeAdminDashboard;
