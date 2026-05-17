import React, { useState, useMemo } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Key, Lock, Fingerprint, Eye, 
  ShieldAlert, ShieldCheck, RefreshCcw, 
  Trash2, Plus, ChevronRight, UserCheck,
  Clock, Monitor, Terminal
} from 'lucide-react';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const initialPermissions = [
  { module: 'User Management', read: true, write: true, delete: false, approve: true },
  { module: 'LMS Content', read: true, write: true, delete: true, approve: true },
  { module: 'Financials', read: true, write: false, delete: false, approve: false },
  { module: 'System Settings', read: true, write: true, delete: false, approve: true },
  { module: 'Security Audit', read: true, write: false, delete: false, approve: false },
];

const SecurityAuth = () => {
  const [activeTab, setActiveTab] = useState('Roles');
  const [permissions, setPermissions] = useState(initialPermissions);
  const { data: users } = useSupabaseData('profiles');
  const { data: rawAdminLogs } = useSupabaseData('admin_logs');

  // Calculate role counts dynamically
  const roleStats = useMemo(() => {
    if (!users) return {};
    return users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
  }, [users]);

  const togglePermission = (index, action) => {
    const newPermissions = [...permissions];
    newPermissions[index][action] = !newPermissions[index][action];
    setPermissions(newPermissions);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Security & Authorization</h1>
            <p className="text-slate-500 text-sm">Configure system-wide RBAC policies and security protocols.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
            <Shield size={14} />
            RESTRICT_ACCESS_LOCK
          </button>
        </div>

        {/* Control Tabs */}
        <div className="flex gap-1 bg-[#111113] p-1 rounded-lg border border-white/5 w-fit overflow-x-auto max-w-full">
          {['Roles', 'Permissions', 'Auth Logs', 'Active Sessions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'Roles' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-12 gap-8"
            >
              {/* Roles List */}
              <div className="col-span-12 lg:col-span-4 space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Defined Roles</h2>
                  <button className="p-1 text-slate-400 hover:text-white transition-all"><Plus size={14} /></button>
                </div>
                {[
                  { id: 'super_admin', name: 'Super Admin', level: 'Level 1', icon: <ShieldCheck size={16} /> },
                  { id: 'college_admin', name: 'College Admin', level: 'Level 2', icon: <Shield size={16} /> },
                  { id: 'instructor', name: 'Instructor', level: 'Level 3', icon: <Fingerprint size={16} /> },
                  { id: 'partner', name: 'Partner', level: 'Level 3', icon: <UserCheck size={16} /> },
                  { id: 'student', name: 'Student', level: 'Level 4', icon: <Lock size={16} /> },
                ].map((role, i) => (
                  <div key={i} className={`p-4 rounded-xl border transition-all cursor-pointer group ${i === 0 ? 'bg-blue-600/10 border-blue-600/30' : 'bg-[#111113] border-white/5 hover:border-white/10'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${i === 0 ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500 group-hover:text-white transition-all'}`}>
                          {role.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight">{role.name}</h3>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{role.level} Access</p>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <p className="text-[9px] text-blue-400 font-bold tracking-widest">{roleStats[role.id] || 0} USERS</p>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Permission Matrix Preview */}
              <div className="col-span-12 lg:col-span-8 bg-[#111113] border border-white/5 rounded-xl p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Role Configuration</h2>
                    <p className="text-xs text-slate-500">Configure global settings for selected identity protocol.</p>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold text-slate-500 tracking-widest">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      SECURE
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      ENCRYPTED
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-lg bg-white/[0.02] border border-white/5">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Auth Protocol</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white">Multi-Factor Auth</span>
                        <div className="w-10 h-5 bg-blue-600 rounded-full p-1"><div className="w-3 h-3 bg-white rounded-full translate-x-5"></div></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white">Single Sign On</span>
                        <div className="w-10 h-5 bg-slate-800 rounded-full p-1"><div className="w-3 h-3 bg-white rounded-full"></div></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-lg bg-white/[0.02] border border-white/5">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Session Control</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white">Auto Timeout</span>
                        <span className="text-[10px] font-bold text-blue-400">30 MIN</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white">Device Limit</span>
                        <span className="text-[10px] font-bold text-blue-400">3 NODES</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Permissions' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#111113] border border-white/5 rounded-xl p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Permission Matrix: Super Admin</h2>
                  <p className="text-xs text-slate-500">Configure module-level access for the selected role.</p>
                </div>
                <button className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg shadow-emerald-600/20">Save Matrix</button>
              </div>

              <div className="space-y-6">
                {permissions.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-lg group">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-1">{p.module}</h4>
                      <p className="text-[10px] text-slate-500">Full system access for {p.module.toLowerCase()} modules.</p>
                    </div>
                    <div className="flex gap-8">
                      {['READ', 'WRITE', 'DELETE', 'APPROVE'].map((action) => (
                        <div key={action} className="flex flex-col items-center gap-2">
                          <p className="text-[8px] font-black text-slate-600 tracking-tighter">{action}</p>
                          <div 
                            onClick={() => togglePermission(i, action.toLowerCase())}
                            className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-all ${p[action.toLowerCase()] ? 'bg-blue-600' : 'bg-slate-800'}`}
                          >
                            <div className={`w-3 h-3 bg-white rounded-full transition-all ${p[action.toLowerCase()] ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'Auth Logs' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#09090B] border border-white/5 rounded-xl overflow-hidden font-mono text-[11px]"
            >
              <div className="bg-[#111113] p-4 border-b border-white/5 flex justify-between items-center">
                <div className="flex gap-4 text-slate-500 font-bold uppercase tracking-widest">
                  <span className="text-white">AUTH_EVENT_STREAM</span>
                  <span>FILTER: CRITICAL_ONLY</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={12} />
                  <span>SYNC_ACTIVE</span>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {rawAdminLogs && rawAdminLogs.length > 0 ? rawAdminLogs.map((log) => (
                  <div key={log.id} className="flex gap-6 p-2 rounded hover:bg-white/5 transition-all cursor-pointer group">
                    <span className="text-slate-600 w-24 truncate">{new Date(log.created_at).toLocaleTimeString()}</span>
                    <span className="text-blue-500 font-bold w-32 truncate">[{log.admin_email?.split('@')[0] || log.admin_id?.substring(0,8) || 'system'}]</span>
                    <span className="text-white font-black w-32 truncate">{log.action}</span>
                    <span className="text-slate-400 flex-1 truncate">{log.details || 'N/A'}</span>
                    <span className={`font-black w-20 text-right text-emerald-500`}>OK</span>
                  </div>
                )) : (
                  <div className="text-slate-500 text-center py-4">No Auth Logs Found</div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'Active Sessions' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {users && users.slice(0,6).map((session, i) => (
                <div key={i} className="p-6 bg-[#111113] border border-white/5 rounded-xl relative group hover:border-blue-600/30 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-white/5 rounded-lg text-slate-400 group-hover:text-blue-500 transition-all">
                      <Monitor size={20} />
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Session</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{session.full_name || session.email}</h3>
                  <p className="text-xs text-slate-500 mb-4">{session.role.toUpperCase()}</p>
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-600 uppercase font-bold tracking-widest">Location</span>
                      <span className="text-slate-400">Global</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-600 uppercase font-bold tracking-widest">Network_IP</span>
                      <span className="text-slate-400">127.0.0.1</span>
                    </div>
                  </div>
                  <button className="mt-6 w-full py-2 bg-rose-600/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded hover:bg-rose-600/20 transition-all">
                    Terminate_Session
                  </button>
                </div>
              ))}
              <div className="p-6 border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-slate-600 hover:text-slate-400 cursor-pointer transition-all">
                <Terminal size={32} className="mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Connect New Node</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Danger Zone */}
        {activeTab === 'Roles' && (
          <div className="mt-8 p-8 border border-rose-500/10 bg-rose-500/[0.02] rounded-xl">
            <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldAlert size={16} />
              Danger Zone: Policy Reset
            </h3>
            <div className="flex flex-col md:flex-row gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 py-4 border border-rose-500/30 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded hover:bg-rose-500/10 transition-all">
                <RefreshCcw size={14} />
                Emergency_Protocol_Reset
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20">
                <Lock size={14} />
                Global_Auth_Lockdown
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SecurityAuth;

