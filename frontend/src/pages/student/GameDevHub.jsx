import React, { useState } from 'react';
import { 
  Gamepad2, Layers, Cpu, Box, 
  Image as ImageIcon, Music, Play, 
  Download, ExternalLink, Code2, 
  Zap, Monitor, Palette, Share2, Award, Target, Users
} from 'lucide-react';
import { useStudentTheme } from '../../context/StudentThemeContext';

const GameDevHub = () => {
  const { currentTheme } = useStudentTheme();
  const [activeCategory, setActiveCategory] = useState('all');

  const assets = [
    { id: 1, title: "Cyberpunk Alleyway Kit", type: "3D Environment", category: "models", size: "1.2 GB", image: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=2787&auto=format&fit=crop" },
    { id: 2, title: "Procedural Water Shader", type: "Unity ShaderGraph", category: "scripts", size: "12 MB", image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2940&auto=format&fit=crop" },
    { id: 3, title: "Atmospheric Synth Pad", type: "WAV / SFX", category: "audio", size: "45 MB", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2940&auto=format&fit=crop" },
    { id: 4, title: "Hero Character Rig", type: "FBX / Maya", category: "models", size: "280 MB", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2940&auto=format&fit=crop" }
  ];

  const filteredAssets = activeCategory === 'all' 
    ? assets 
    : assets.filter(a => a.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero Section */}
      <div className="relative rounded-[40px] overflow-hidden glass-panel border-white/5 p-12 group">
        <div className="absolute inset-0 circuit-bg opacity-[0.03]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--st-color-primary)] opacity-5 blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <div className="flex items-center gap-3">
              <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg bg-[var(--st-color-primary)]/10 border border-[var(--st-color-primary)]/20 shadow-[0_0_15px_var(--st-color-glow)]">
                Studio Terminal
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold text-white leading-[1.1]">
              The Creative <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_20px_var(--st-color-glow)]">Forge</span>
            </h1>
            <p className="text-on-surface-variant/60 text-lg max-w-xl font-medium leading-relaxed">
              Access hyper-realistic assets, optimize engine builds, and deploy your immersive worlds to the Pixora network.
            </p>
            <div className="flex flex-wrap gap-5 pt-4">
              <button className="btn-primary !px-10 !py-4 !rounded-2xl !text-sm group">
                <Gamepad2 size={20} className="group-hover:rotate-12 transition-transform" />
                <span>Launch Unreal Engine</span>
              </button>
              <button className="btn-outline !px-10 !py-4 !rounded-2xl !text-sm">
                <Box size={20} />
                <span>Asset Repository</span>
              </button>
            </div>
          </div>
          
          <div className="w-full lg:w-[400px] flex-shrink-0 grid grid-cols-2 gap-5">
            {[
              { label: 'Active Projects', value: '12', color: '[var(--st-color-primary)]' },
              { label: 'Asset Loads', value: '4.2k', color: 'emerald-400' },
              { label: 'Native Engine', value: 'UE5', color: 'blue-400' },
              { label: 'Industry Wins', value: '08', color: 'purple-400' }
            ].map((stat) => (
              <div key={stat.label} className="glass-card aspect-square rounded-[32px] p-8 flex flex-col justify-center items-center gap-3 border-white/5 hover:border-[var(--st-color-primary)]/30 transition-all group">
                <span className={`text-4xl font-headline font-bold text-${stat.color} group-hover:scale-110 transition-transform`}>{stat.value}</span>
                <span className="text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.2em] text-center">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Asset Explorer */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
            <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-wider">
              Hyper <span className="text-[var(--st-color-primary)]">Assets</span>
            </h2>
            <div className="flex gap-2 p-1.5 glass-panel rounded-2xl border-white/5">
              {['all', 'models', 'scripts', 'audio'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-headline font-bold uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                    ? 'bg-[var(--st-color-primary)] text-black shadow-[0_0_15px_var(--st-color-glow)]' 
                    : 'text-on-surface-variant/40 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredAssets.map(asset => (
              <div key={asset.id} className="glass-card rounded-[32px] border-white/5 overflow-hidden group hover:border-[var(--st-color-primary)]/30 transition-all duration-500 shadow-2xl">
                <div className="relative h-56 overflow-hidden">
                  <img src={asset.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-transparent to-transparent opacity-90"></div>
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div>
                      <p className="font-headline text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--st-color-primary)] mb-2">{asset.type}</p>
                      <h4 className="font-headline font-bold text-white text-lg tracking-wide">{asset.title}</h4>
                    </div>
                    <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-[var(--st-color-primary)] hover:text-black transition-all hover:scale-110 shadow-lg">
                      <Download size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-6 flex items-center justify-between text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span>Scale: {asset.size}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><Monitor size={14} className="text-white/20" /> Native</span>
                    <span className="flex items-center gap-1.5"><Cpu size={14} className="text-white/20" /> Lod 0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-5 rounded-[24px] glass-panel border-dashed border-white/10 text-on-surface-variant/40 font-headline font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white/[0.02] hover:border-[var(--st-color-primary)]/30 hover:text-white transition-all">
            Unlock Full Repository (25,000+ PREMIUM ASSETS)
          </button>
        </div>

        {/* Sidebar Tools */}
        <div className="space-y-10">
          {/* Quick Engine Links */}
          <div className="glass-panel rounded-3xl border-white/5 p-8 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full"></div>
            <h3 className="font-headline font-bold text-white text-sm uppercase tracking-widest">Compiler Matrix</h3>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition-all shadow-inner">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                    <Zap size={22} fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-headline font-bold text-white text-sm">Unreal Engine 5</p>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">Primary Link</p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-blue-500 opacity-20 group-hover:opacity-100 transition-all" />
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-400/10 to-transparent border border-slate-400/10 flex items-center justify-between group cursor-pointer hover:border-white/20 transition-all shadow-inner">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white shadow-lg">
                    <Box size={22} fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-headline font-bold text-white text-sm">Unity 6 LTS</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Asset Bridge</p>
                  </div>
                </div>
                <ExternalLink size={16} className="text-white opacity-10 group-hover:opacity-100 transition-all" />
              </div>
            </div>
          </div>

          {/* Dev Stats */}
          <div className="glass-panel rounded-3xl border-white/5 p-8 space-y-8">
            <h3 className="font-headline font-bold text-white text-sm uppercase tracking-widest">Core Performance</h3>
            <div className="space-y-8">
              {[
                { label: 'Render Fidelity', value: '92%', color: 'emerald-400' },
                { label: 'Script Execution', value: '74%', color: 'yellow-400' },
                { label: 'AI Grid Nav', value: '85%', color: 'blue-400' }
              ].map(stat => (
                <div key={stat.label} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest">{stat.label}</span>
                    <span className={`text-sm font-headline font-bold text-${stat.color}`}>{stat.value}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full bg-${stat.color} shadow-[0_0_10px_rgba(0,0,0,0.5)]`} style={{ width: stat.value }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Showcase */}
          <div className="relative rounded-[32px] p-8 overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-[var(--st-color-primary)]"></div>
            <div className="absolute -right-8 -bottom-8 text-black opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700">
              <Share2 size={200} />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-headline font-bold text-black mb-3">Sync Build</h3>
              <p className="text-xs font-bold text-black/70 mb-8 leading-relaxed tracking-wide">Finalize your iteration and deploy the latest build to the Global Showcase network.</p>
              <button className="w-full py-4 rounded-2xl bg-black text-white font-headline font-bold text-xs uppercase tracking-[0.2em] hover:bg-black/80 transition-all flex items-center justify-center gap-3 shadow-2xl">
                <Share2 size={18} />
                Deploy Showcase
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDevHub;
