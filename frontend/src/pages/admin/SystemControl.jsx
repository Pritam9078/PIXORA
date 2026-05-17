import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Terminal, ShieldAlert, Cpu, Database, Save, RotateCcw,
  Zap, Settings, AlertTriangle, CheckCircle2, Play, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import toast from 'react-hot-toast';

const SystemControl = () => {
  const { data: adminLogs, loading: logsLoading } = useSupabaseData('admin_logs');
  const [terminalCommand, setTerminalCommand] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'input', text: 'pixora --version' },
    { type: 'output', text: 'Pixora Operating OS Cloud v3.1.2-alpha' },
    { type: 'input', text: 'status --network' },
    { type: 'output', text: 'All RPC nodes active. Latency to Polygon RPC: 18ms.' }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [featureFlags, setFeatureFlags] = useState([
    { key: 'MINTING_PIPELINE', label: 'NFT SBT Minting Engine', active: true, desc: 'Enables automatic minting of certificates on Polygon' },
    { key: 'AI_GRADER', label: 'AI Automated Grading Agent', active: true, desc: 'Invokes AI assistant during quiz completions' },
    { key: 'LIVE_CLASS_NATIVE', label: 'Native HLS Live Rooms', active: false, desc: 'Engages custom WebRTC video architecture' },
    { key: 'REALT_PAYMENTS', label: 'Stripe Webhook Telemetry', active: true, desc: 'Auto-syncs user profiles on payment completions' }
  ]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!terminalCommand) return;

    const cmd = terminalCommand.trim().toLowerCase();
    const newHistory = [...terminalHistory, { type: 'input', text: terminalCommand }];

    let response = `Unknown instruction or syntax error: '${cmd}'. Reference help files.`;
    if (cmd === 'help') {
      response = 'Available modules:\n - help\n - sys --info\n - db --migrate\n - clear';
    } else if (cmd === 'sys --info') {
      response = 'CPU: 96% Idle • Memory: 4.2GB / 8.0GB Used • Net: 25.4Mbps • Active RPC: 3';
    } else if (cmd === 'db --migrate') {
      response = 'Database schema alignment verified. 0 pending migrations found.';
    } else if (cmd === 'clear') {
      setTerminalHistory([]);
      setTerminalCommand('');
      return;
    }

    setTerminalHistory([...newHistory, { type: 'output', text: response }]);
    setTerminalCommand('');
  };

  const handleFlagToggle = (key) => {
    setFeatureFlags(prev => prev.map(f => {
      if (f.key === key) {
        toast.success(`Feature Flag '${f.key}' updated to ${!f.active ? 'ACTIVE' : 'INACTIVE'}`);
        return { ...f, active: !f.active };
      }
      return f;
    }));
  };

  const handleLockdownToggle = () => {
    setIsLocking(true);
    setTimeout(() => {
      setIsLocking(false);
      setMaintenanceMode(!maintenanceMode);
      toast.success(
        maintenanceMode 
          ? 'Platform returned to standard operational routing.' 
          : 'Emergency lockdown engaged. Standard users locked out.',
        { icon: '⚠️' }
      );
    }, 1800);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight uppercase flex items-center gap-2">
              <Terminal className="text-[#c3f400]" size={24} />
              System Infrastructure Operations
            </h1>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-0.5">Control feature gates, run system terminal routines, and lock routing</p>
          </div>
        </div>

        {/* Main Grid Deck */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Main system control cards */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Developer interactive shell */}
            <div className="bg-[#111113]/80 border border-white/5 rounded-2xl overflow-hidden font-mono text-xs flex flex-col h-[340px]">
              <div className="p-4 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Database size={14} className="text-[#c3f400]" />
                  PIXORA_SYS_SHELL
                </span>
                <span className="text-[9px] text-slate-600">Secure Admin Session</span>
              </div>

              {/* Terminal feed */}
              <div className="flex-1 p-5 overflow-y-auto space-y-2.5 bg-[#09090B]/60 text-slate-300">
                {terminalHistory.map((item, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {item.type === 'input' ? (
                      <div className="flex gap-2">
                        <span className="text-[#c3f400] font-black">admin@pixora:~$</span>
                        <span className="text-white font-bold">{item.text}</span>
                      </div>
                    ) : (
                      <div className="text-slate-400 pl-4 whitespace-pre-wrap">{item.text}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Form Input */}
              <form onSubmit={handleCommandSubmit} className="border-t border-white/5 bg-[#09090B]/90 p-3 flex gap-2">
                <span className="text-[#c3f400] font-black pl-2 self-center">~$</span>
                <input
                  type="text"
                  placeholder="Type 'help' to review instruction dictionary..."
                  value={terminalCommand}
                  onChange={(e) => setTerminalCommand(e.target.value)}
                  className="flex-1 bg-transparent outline-none border-none text-white font-mono text-xs"
                />
              </form>
            </div>

            {/* Feature Flag Registry */}
            <div className="bg-[#111113]/60 border border-white/5 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Zap size={16} className="text-[#c3f400]" />
                  Global Feature Flags
                </h3>
                <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider mt-1">Live toggle engines to isolate platform systems</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featureFlags.map((flag) => (
                  <div key={flag.key} className="p-4 bg-white/2 border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-between transition-all group">
                    <div className="space-y-1 pr-4">
                      <h4 className="text-xs font-bold text-white group-hover:text-[#c3f400] transition-all">{flag.label}</h4>
                      <p className="text-[10px] text-slate-500 leading-normal">{flag.desc}</p>
                    </div>
                    <div 
                      onClick={() => handleFlagToggle(flag.key)}
                      className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-all flex-shrink-0 ${
                        flag.active ? 'bg-purple-600' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-all ${
                        flag.active ? 'translate-x-5' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar controls */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* Maintenance Lock box */}
            <div className="bg-[#111113]/60 border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-500">
                <ShieldAlert size={20} />
                <h3 className="text-sm font-headline font-bold uppercase tracking-wider">Emergency Routing Control</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Invoking maintenance protocol shuts down routing gates for non-administrators instantly. Use with extreme caution.
              </p>
              <button
                onClick={handleLockdownToggle}
                disabled={isLocking}
                className={`w-full py-3 text-xs font-mono font-bold tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${
                  maintenanceMode
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-rose-600 text-white hover:bg-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                }`}
              >
                {isLocking ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    INITIALIZING_SHUTDOWN...
                  </>
                ) : maintenanceMode ? (
                  'TERMINATE_MAINTENANCE'
                ) : (
                  'ACTIVATE_MAINTENANCE_LOCK'
                )}
              </button>
            </div>

            {/* Cron Jobs telemetries */}
            <div className="bg-[#111113]/60 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider">System Audit Logs</h3>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {logsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c3f400]"></div>
                  </div>
                ) : adminLogs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 font-mono text-[10px]">NO_LOGS_FOUND</div>
                ) : (
                  adminLogs.slice(0, 10).map((log, i) => (
                    <div key={log.id || i} className="p-3 bg-white/2 border border-white/5 rounded-xl space-y-2 hover:border-white/10 transition-all">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-white font-mono truncate max-w-[180px]">{log.action}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-blue-500/10 text-blue-400`}>
                          {log.target_type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                        <span>ID: {log.target_id ? (log.target_id.substring(0, 8) + '...') : 'N/A'}</span>
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default SystemControl;
