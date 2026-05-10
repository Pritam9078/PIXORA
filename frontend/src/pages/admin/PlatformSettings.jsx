import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Settings, Globe, Bell, Mail, 
  Cpu, Activity, Zap, Layers,
  Save, RotateCcw, AlertTriangle, Monitor,
  CheckCircle2, Loader2
} from 'lucide-react';

const PlatformSettings = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [settings, setSettings] = useState({
    platformName: 'Pixora Cloud',
    supportEmail: 'ops@pixora.io',
    statusMessage: 'All systems operational. Network latency: 12ms.'
  });

  const [features, setFeatures] = useState([
    { id: 'ai', title: 'AI Automated Grading', desc: 'Use GPT-4 for assignment evaluation', enabled: true },
    { id: 'block', title: 'Blockchain Verification', desc: 'On-chain certificate minting', enabled: true },
    { id: 'live', title: 'Live Streaming Engine', desc: 'Native HLS integration', enabled: false },
    { id: 'mobile', title: 'Mobile App Sync', desc: 'Real-time push notifications', enabled: true },
  ]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const toggleFeature = (id) => {
    setFeatures(features.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Platform Configuration</h1>
            <p className="text-slate-500 text-sm">System-wide parameters, API keys, and operational modes.</p>
          </div>
          <div className="flex items-center gap-3">
            {showSuccess && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-md animate-in fade-in slide-in-from-right-4">
                <CheckCircle2 size={14} />
                CONFIGURATION_SYNCED
              </div>
            )}
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold rounded-md hover:text-white transition-all">
              <RotateCcw size={14} />
              RESET_ALL
            </button>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-wait"
            >
              {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isSyncing ? 'SYNCING_PROTOCOL...' : 'SYNC_CHANGES'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Settings Area */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* General Config */}
            <div className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Globe size={16} className="text-blue-500" />
                  System_Core_Settings
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Platform Name</label>
                    <input 
                      type="text" 
                      value={settings.platformName}
                      onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                      className="w-full bg-[#09090B] border border-white/5 rounded-md p-3 text-xs text-white outline-none focus:border-blue-600/50 transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Support Email</label>
                    <input 
                      type="text" 
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                      className="w-full bg-[#09090B] border border-white/5 rounded-md p-3 text-xs text-white outline-none focus:border-blue-600/50 transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Status Message</label>
                  <textarea 
                    rows="3" 
                    value={settings.statusMessage}
                    onChange={(e) => setSettings({...settings, statusMessage: e.target.value})}
                    className="w-full bg-[#09090B] border border-white/5 rounded-md p-3 text-xs text-white outline-none focus:border-blue-600/50 transition-all resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" />
                  Advanced_Features
                </h3>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                {features.map((feat) => (
                  <div key={feat.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between group hover:border-white/10 transition-all">
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1">{feat.title}</h4>
                      <p className="text-[9px] text-slate-500">{feat.desc}</p>
                    </div>
                    <div 
                      onClick={() => toggleFeature(feat.id)}
                      className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-all ${feat.enabled ? 'bg-blue-600' : 'bg-slate-800'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-all ${feat.enabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest">Maintenance Mode</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">Activating this will restrict platform access to admins only. All active student sessions will be terminated immediately.</p>
              <button className="w-full py-3 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-rose-600/20 hover:bg-rose-500 transition-all">
                ACTIVATE_LOCKDOWN
              </button>
            </div>

            <div className="bg-[#111113] border border-white/5 rounded-xl p-6">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Infrastructure Performance</h3>
              <div className="space-y-6">
                {[
                  { label: 'CPU Usage', val: '12%', color: 'bg-emerald-500', width: 'w-[12%]' },
                  { label: 'Memory', val: '4.2GB / 16GB', color: 'bg-blue-500', width: 'w-[26%]' },
                  { label: 'DB Connections', val: '142', color: 'bg-amber-500', width: 'w-[64%]' },
                ].map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">{stat.label}</span>
                      <span className="text-white">{stat.val}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: stat.width.replace('w-[', '').replace('%]', '') + '%' }}
                        className={`h-full ${stat.color} opacity-80`}
                      ></motion.div>
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

export default PlatformSettings;

