import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';

const PartnerDashboard = () => {
  const navigation = [
    { label: 'Command Center', icon: 'dashboard', href: '#', active: true },
    { label: 'Onboarding Status', icon: 'verified_user', href: '#' },
    { label: 'Academic Tracks', icon: 'account_tree', href: '#' },
    { label: 'Engine Analytics', icon: 'query_stats', href: '#' },
    { label: 'Network Nodes', icon: 'hub', href: '#' },
    { label: 'Documentation', icon: 'menu_book', href: '#' },
  ];

  const conversions = [
    { label: 'QUALIFIED', value: 82, color: 'lime' },
    { label: 'NEGOTIATION', value: 45, color: 'purple' },
    { label: 'ONBOARDED', value: 12, color: 'white' },
  ];

  const network = [
    { name: 'Nebula Institute of Tech', sector: 'Blockchain Eng.', status: 'Active', yield: '12,400 ZNT', icon: 'school' },
    { name: 'Orbital Design Labs', sector: 'Game Development', status: 'Pending', yield: '4,200 ZNT', icon: 'architecture' },
    { name: 'Titan Cyber Academy', sector: 'Security Audit', status: 'Lead', yield: '0 ZNT', icon: 'memory' },
  ];

  return (
    <DashboardLayout role="Operator | Level 4" navigation={navigation}>
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="font-headline text-3xl text-white uppercase tracking-tight">Partner Portal</h1>
            <p className="text-slate-400 font-body mt-2 text-sm">Tracking network growth and referral performance across the orbital grid.</p>
          </div>
          <div className="glass-panel px-6 py-4 rounded-lg flex items-center gap-4 border-secondary-container/20 shadow-[0_0_15px_rgba(195,244,0,0.1)]">
            <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            <div>
              <p className="font-headline text-[10px] text-secondary-container uppercase tracking-widest">PARTNERSHIP LEVEL</p>
              <p className="font-headline text-lg text-white">Gold Node</p>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Revenue Analytics */}
          <div className="md:col-span-8 glass-panel rounded-lg p-8 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline text-white text-lg uppercase tracking-tight">Commission Revenue</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded bg-secondary-container/10 text-secondary-container font-headline text-[9px] uppercase tracking-widest border border-secondary-container/20">WEEKLY</span>
                <span className="px-3 py-1 rounded bg-white/5 text-slate-400 font-headline text-[9px] uppercase tracking-widest hover:bg-white/10 cursor-pointer transition-all">MONTHLY</span>
              </div>
            </div>
            <div className="flex-grow flex items-end gap-3 px-2 relative">
              <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-20">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-white/10"></div>)}
              </div>
              {[30, 45, 60, 85, 70, 50, 90].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className={`flex-1 rounded-t-sm transition-all cursor-pointer relative group ${i < 5 ? 'bg-secondary-container/20 hover:bg-secondary-container/40' : 'bg-on-tertiary-container/30 hover:bg-on-tertiary-container/50'}`}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border border-white/10 px-2 py-1 rounded text-[8px] font-headline text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {h * 120} ZNT
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between pt-6 text-slate-500 font-headline text-[9px] uppercase tracking-[0.2em]">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => <span key={d}>{d}</span>)}
            </div>
          </div>

          {/* Conversion Stats */}
          <div className="md:col-span-4 space-y-6">
            <div className="glass-panel rounded-lg p-6">
              <h4 className="font-headline text-white text-sm mb-6 uppercase tracking-wider">Lead Conversion</h4>
              <div className="space-y-6">
                {conversions.map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] font-headline uppercase tracking-widest mb-2">
                      <span className="text-slate-500">{stat.label}</span>
                      <span className="text-white font-bold">{stat.value}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        className={`h-full ${stat.color === 'lime' ? 'bg-secondary-container' : stat.color === 'purple' ? 'bg-on-tertiary-container' : 'bg-white'}`}
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-lg p-8 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="font-headline text-on-tertiary-container text-[10px] mb-2 uppercase tracking-[0.2em]">Network Reach</p>
                <h2 className="text-5xl font-headline text-white tracking-tighter">124</h2>
                <p className="text-slate-500 text-[10px] font-headline uppercase tracking-widest mt-2">Referred Institutions</p>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-[140px] text-white">public</span>
              </div>
            </div>
          </div>

          {/* Referred Network Table */}
          <div className="md:col-span-12 glass-panel rounded-lg overflow-hidden border-white/5">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-headline text-white text-sm uppercase tracking-wider">Referred Network</h3>
              <button className="text-[10px] font-headline text-secondary-container flex items-center gap-2 hover:underline uppercase tracking-widest">
                EXPORT DATA <span className="material-symbols-outlined text-sm">download</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 font-headline text-[9px] uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.01]">
                    <th className="px-8 py-4">Institution</th>
                    <th className="px-8 py-4">Sector</th>
                    <th className="px-8 py-4">Lead Status</th>
                    <th className="px-8 py-4">Referral Yield</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-white/5">
                  {network.map((item, i) => (
                    <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-white/10">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">{item.icon}</span>
                          </div>
                          <span className="text-white font-medium uppercase tracking-tight">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-slate-500 font-headline uppercase tracking-tight">{item.sector}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[9px] border font-bold uppercase tracking-widest ${
                          item.status === 'Active' ? 'bg-secondary-container/10 text-secondary-container border-secondary-container/20' :
                          item.status === 'Pending' ? 'bg-on-tertiary-container/10 text-on-tertiary-container border-on-tertiary-container/20' :
                          'bg-white/5 text-slate-400 border-white/10'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-headline text-white tracking-widest">{item.yield}</td>
                      <td className="px-8 py-5 text-right">
                        <button className="text-slate-600 hover:text-white transition-colors">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expansion Card */}
          <div className="md:col-span-12 glass-panel rounded-lg p-1 relative min-h-[350px] flex items-center overflow-hidden">
            <img className="absolute inset-0 w-full h-full object-cover opacity-20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgycz0bjfiVGuRrNHk0ebeRqC5t6MEZ_mcjAB3INGRY0_LEkcjLUHEebVt5khGIf9rdyrF-d0YEGvyaSLwB65Nj2XEuvWc8ruVFOux_QeoWBVTg1Rp9FClhC9VVp_WDkI_lkcR_-7KsEg83LfzfVPDZo_owKdAizcIE5v3xf_fbWgVv_XNE7xtV_Nfvujjo5B0ZNJBNsdRVcjIRrmUyNUzYyiLTzlycaJ8JGqA3zrNVMPr527mNZ9RaFuVdC1Ewa0QY_M98REoUKHI" alt="Globe network" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D0E12] via-[#0D0E12]/90 to-transparent"></div>
            <div className="relative z-10 p-12 max-w-2xl">
              <h2 className="font-headline text-4xl text-white uppercase tracking-tighter mb-4">Scale Your Nodes</h2>
              <p className="text-slate-400 font-body text-lg mb-8 leading-relaxed">Reach 'Platinum Node' status by referring 5 more accredited institutions. Unlock exclusive orbital governance rights and tier-2 commission multipliers.</p>
              <button className="bg-secondary-container text-black px-10 py-5 font-headline text-xs font-bold uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(195,244,0,0.4)] transition-all rounded-sm">
                EXPAND NETWORK
              </button>
            </div>
          </div>
        </div>

        {/* Footer Logs */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-600 font-headline text-[9px] uppercase tracking-[0.2em]">
          <div className="flex gap-10">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container shadow-[0_0_5px_rgba(195,244,0,0.5)]"></span>
              CORE ENGINE STATUS: STABLE
            </div>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container shadow-[0_0_5px_rgba(87,116,223,0.5)]"></span>
              NETWORK SYNC: 99.8%
            </div>
          </div>
          <p>© 2024 PIXORA ACADEMY - PARTNER TERMINAL V2.4.0</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PartnerDashboard;
