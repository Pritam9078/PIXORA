import React, { useState, useRef } from 'react';
import { 
  User, Shield, Bell, Monitor, 
  Settings as SettingsIcon, Save, Camera,
  Fingerprint, Cpu, Globe, Palette,
  Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { ProfileService } from '../../services/ProfileService';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { profile, user, refreshProfile } = useAuth();
  const { currentTheme, setTheme } = useStudentTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    learning_track: profile?.learning_track || 'game_dev'
  });

  const sections = [
    { id: 'profile', label: 'Identity Matrix', icon: <User size={18} /> },
    { id: 'security', label: 'Access Protocols', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Signal Settings', icon: <Bell size={18} /> },
    { id: 'appearance', label: 'Neural Theme', icon: <Palette size={18} /> }
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      await ProfileService.updateProfile(user.id, formData);
      await refreshProfile();
      toast.success('Identity synchronized successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Synchronization failed: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    try {
      setUploading(true);
      const loadingToast = toast.loading('Uploading avatar...');
      await ProfileService.uploadAvatar(user.id, file);
      await refreshProfile();
      toast.dismiss(loadingToast);
      toast.success('Avatar updated');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-white/5 text-[var(--st-color-primary)] font-headline font-bold text-[9px] uppercase tracking-[0.2em]">
          <Cpu size={14} />
          Terminal Configuration
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-white">System <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_10px_var(--st-color-glow)]">Settings</span></h1>
        <p className="text-on-surface-variant/60 font-medium">Calibrate your student identity and architectural preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Navigation Sidebar */}
        <aside className="lg:w-72 space-y-3">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-headline font-bold text-[10px] uppercase tracking-[0.15em] transition-all border ${
                activeSection === section.id 
                  ? 'bg-[var(--st-color-primary)]/10 text-[var(--st-color-primary)] border-[var(--st-color-primary)]/20 shadow-[0_0_20px_rgba(var(--st-color-primary-rgb),0.1)]' 
                  : 'text-on-surface-variant/30 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          <div className="glass-panel p-10 rounded-[48px] border-white/5 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 circuit-bg opacity-[0.03]"></div>
            
            <div className="relative z-10 space-y-10">
              {activeSection === 'profile' && (
                <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row items-center gap-10 p-8 glass-card border-white/5 rounded-3xl">
                     <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                       <div className="w-32 h-32 rounded-[40px] border-2 border-[var(--st-color-primary)]/30 p-1.5 shadow-[0_0_30px_var(--st-color-glow)] transition-transform group-hover:scale-105 duration-500 overflow-hidden bg-slate-900">
                         {uploading ? (
                           <div className="w-full h-full flex items-center justify-center">
                             <Loader2 className="animate-spin text-[var(--st-color-primary)]" />
                           </div>
                         ) : (
                           <img 
                             src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}`} 
                             className="w-full h-full object-cover rounded-[32px]" 
                             alt="Avatar" 
                           />
                         )}
                       </div>
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[40px] flex items-center justify-center">
                         <Camera size={24} className="text-white" />
                       </div>
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         className="hidden" 
                         accept="image/*"
                         onChange={handleFileChange}
                       />
                     </div>
                     <div className="space-y-2 text-center md:text-left">
                       <h3 className="text-2xl font-headline font-bold text-white tracking-tight">Identity Synchronization</h3>
                       <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">Mastery Level {Math.floor((profile?.xp_points || 0) / 1000) + 1} Student</p>
                       <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mx-auto md:mx-0">
                         <Fingerprint size={12} />
                         <span className="text-[9px] font-black uppercase tracking-widest">Biometric Verified</span>
                       </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-headline font-black text-on-surface-variant/30 uppercase tracking-[0.2em] ml-2">Display Alias</label>
                      <input 
                        type="text" 
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="w-full glass-card border-white/5 rounded-2xl p-4 text-sm font-medium text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-headline font-black text-on-surface-variant/30 uppercase tracking-[0.2em] ml-2">Comms Address</label>
                      <input 
                        type="email" 
                        value={profile?.email || user?.email}
                        className="w-full glass-card border-white/5 rounded-2xl p-4 text-sm font-medium text-white/40 focus:outline-none border-white/5"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-headline font-black text-on-surface-variant/30 uppercase tracking-[0.2em] ml-2">Identity Biography</label>
                    <textarea 
                      rows="4"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Transmission your story..."
                      className="w-full glass-card border-white/5 rounded-2xl p-4 text-sm font-medium text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              )}

              {activeSection === 'appearance' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <h3 className="text-2xl font-headline font-bold text-white tracking-tight">Neural Theme Calibration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['blockchain', 'game_dev'].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTheme(t);
                          setFormData({...formData, learning_track: t});
                          toast.success(`${t === 'blockchain' ? 'Web3' : 'Game Dev'} Theme Activated`);
                        }}
                        className={`p-8 rounded-[32px] border transition-all text-left group relative overflow-hidden ${
                          currentTheme.id === t 
                            ? 'bg-[var(--st-color-primary)]/10 border-[var(--st-color-primary)]/40' 
                            : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-inner border ${
                           currentTheme.id === t ? 'bg-[var(--st-color-primary)] text-black border-[var(--st-color-primary)]/20' : 'bg-white/5 text-white/40 border-white/5'
                        }`}>
                          {t === 'blockchain' ? <Globe size={24} /> : <Cpu size={24} />}
                        </div>
                        <h4 className="font-headline font-bold text-lg text-white uppercase tracking-wider mb-2">{t === 'blockchain' ? 'Blockchain / Web3' : 'Game Development'} Hub</h4>
                        <p className="text-[10px] font-medium text-on-surface-variant/40 leading-relaxed">
                          Calibrate all system visuals to {t === 'blockchain' ? 'Web3' : 'Game Dev'} design standards.
                        </p>
                        {currentTheme.id === t && (
                          <div className="absolute top-4 right-4">
                            <span className="text-[8px] font-black bg-[var(--st-color-primary)] text-black px-2 py-0.5 rounded shadow-[0_0_10px_var(--st-color-glow)]">ACTIVE</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(activeSection === 'security' || activeSection === 'notifications') && (
                 <div className="py-20 text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-white/10 mx-auto">
                      <SettingsIcon size={40} className="animate-spin-slow" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-headline font-bold text-white uppercase tracking-widest">Calibration Pending</h3>
                       <p className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">Higher security clearance required for this node</p>
                    </div>
                 </div>
              )}

              <div className="pt-10 border-t border-white/5 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary px-12 py-4 flex items-center gap-3 shadow-[0_0_20px_var(--st-color-glow)] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  <span>{saving ? 'Synchronizing...' : 'Synchronize Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
