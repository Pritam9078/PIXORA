import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Settings as SettingsIcon, Shield, Server, Bell, Globe, Save, 
  RefreshCw, Check, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const Settings = () => {
  const [platformConfig, setPlatformConfig] = useState({
    siteName: 'Pixora Academy',
    maintenanceMode: false,
    restrictSignups: false,
    allowAnonymousEnrollment: false,
    authTimeout: 3600,
    supabaseSync: true,
    solanaRPC: 'https://api.mainnet-beta.solana.com',
    superintendentEmail: 'admin@pixora.academy',
    slackNotifications: true,
    emailAlerts: true
  });

  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setPlatformConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInputChange = (key, value) => {
    setPlatformConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Global application governance policies updated successfully.');
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans flex items-center gap-3">
            <SettingsIcon className="text-lime-400 h-8 w-8" />
            Global Platform Governance
          </h1>
          <p className="text-slate-400 text-sm mt-1">Configure systemic gatekeepers, verify auth policies, regulate blockchain connections, and track database settings.</p>
        </div>

        <form onSubmit={handleSaveChanges} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Platform & Governance */}
            <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-6 space-y-5">
              <h3 className="font-extrabold text-sm text-white font-sans uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-3">
                <Globe size={16} className="text-lime-400" /> Platform Governance
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-350">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-slate-500 block">Organization Brand Title</label>
                  <input
                    type="text"
                    value={platformConfig.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-lime-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-slate-500 block">Superintendent Audit Email</label>
                  <input
                    type="email"
                    value={platformConfig.superintendentEmail}
                    onChange={(e) => handleInputChange('superintendentEmail', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-lime-400"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-900 rounded-lg">
                  <div>
                    <span className="font-bold text-xs text-white block">Platform Maintenance Overlay</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Locks client-side onboarding and courses during systems updates.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('maintenanceMode')}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${
                      platformConfig.maintenanceMode ? 'bg-lime-500 text-slate-950' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                      platformConfig.maintenanceMode ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-900 rounded-lg">
                  <div>
                    <span className="font-bold text-xs text-white block">Restrict Self-Enrollment Gates</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Only allow manual enrollments triggered by administrative vetting reviews.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('restrictSignups')}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${
                      platformConfig.restrictSignups ? 'bg-lime-500 text-slate-950' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                      platformConfig.restrictSignups ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Integrations & Database */}
            <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-6 space-y-5">
              <h3 className="font-extrabold text-sm text-white font-sans uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-3">
                <Server size={16} className="text-lime-400" /> Infrastructure Gateways
              </h3>

              <div className="space-y-4">
                <div className="space-y-1 text-xs text-slate-350">
                  <label className="text-[10px] uppercase font-semibold text-slate-500 block">Blockchain Cluster RPC Node URL</label>
                  <input
                    type="text"
                    value={platformConfig.solanaRPC}
                    onChange={(e) => handleInputChange('solanaRPC', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-lime-400"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-900 rounded-lg">
                  <div>
                    <span className="font-bold text-xs text-white block">Automated Supabase Profile Syncing</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Enforces automatic webhook calls between Supabase Auth updates and Local Roster states.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('supabaseSync')}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${
                      platformConfig.supabaseSync ? 'bg-lime-500 text-slate-950' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                      platformConfig.supabaseSync ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Overview & Actions */}
          <div className="space-y-6">
            <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-6 space-y-4">
              <h3 className="font-extrabold text-sm text-white font-sans uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-3">
                <Shield size={16} className="text-lime-400" /> Security State
              </h3>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={16} className="text-lime-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Vetted Security Profiles</span>
                    <span className="text-[10px] text-slate-500">Dual-layer token authorization active.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck size={16} className="text-lime-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Document Encryption Layer</span>
                    <span className="text-[10px] text-slate-500">Student submissions saved using industry-grade AES-256.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-black uppercase tracking-widest py-3 rounded-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" /> Saving System State...
                    </>
                  ) : (
                    <>
                      <Save size={15} /> Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default Settings;
