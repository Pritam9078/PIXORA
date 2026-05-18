import React, { useState } from 'react';
import { 
  Terminal, Cpu, Code2, FileText, Copy, Check, 
  ArrowRight, ShieldCheck, Download, ExternalLink, Sparkles 
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const PublicResourcesPage = () => {
  const [copied, setCopied] = useState(false);
  const shellCommand = 'curl -sSL https://pixora-backend-1wdd.onrender.com/scripts/pixora_admission.sh | bash';

  const handleCopy = () => {
    navigator.clipboard.writeText(shellCommand);
    setCopied(true);
    toast.success('Terminal initialization command copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const boilerplates = [
    {
      title: 'Unreal Engine 5 C++ Core Boilerplate',
      description: 'Production-ready framework containing custom physics-based character movement, network replication controllers, and custom viewport shader loops.',
      size: '142.4 MB',
      category: 'Game Dev',
      features: ['Physics Movement', 'Network Replication', 'Async Streaming Pools', 'Render Pipeline Customization']
    },
    {
      title: 'Foundry & Solidity Rollup Integration Kit',
      description: 'Preconfigured Foundry smart contracts environment with optimized gas consumption matrices, automated unit testing, and zero-knowledge circuit integrations.',
      size: '28.1 MB',
      category: 'Blockchain',
      features: ['Foundry Environment', 'OpenZeppelin V5 Primitives', 'ZK-Snarks Proof Generation', 'Gas Profiling Tools']
    },
    {
      title: 'Pixora CLI & Local Environment Sandbox',
      description: 'Local runtime environment simulator that mimics the global college admin course deployment networks, supporting hot-reload lessons audits.',
      size: '18.7 MB',
      category: 'DevOps',
      features: ['Local Database Simulator', 'Hot-Reload Course Engine', 'Supabase Storage Audits', 'Mock Auth Hooks']
    }
  ];

  const whitepapers = [
    {
      title: 'Decoupled Rollups in Massively Multiplayer AAA Worlds',
      author: 'Pixora Core Research Lab',
      date: 'Feb 2026',
      readTime: '18 min read',
      excerpt: 'Analyzing real-time state sync bottlenecks and designing high-performance optimistic rollups tailored specifically for persistent, multiplayer game matrices.'
    },
    {
      title: 'Dynamic GPU Ray-Tracing Pipeline Optimization',
      author: 'Marcus Vance & Academy Staff',
      date: 'Jan 2026',
      readTime: '24 min read',
      excerpt: 'Investigating async compute shader optimizations to squeeze high-fidelity level layout lighting parameters down to 8.3ms frame times.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0D0E12] text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-8 max-w-7xl mx-auto w-full space-y-16">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(195,244,0,0.01),rgba(0,0,0,0),rgba(195,244,0,0.01))] bg-[size:100%_8px,20px_100%] pointer-events-none -z-10"></div>

        {/* Hero Section */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-[#c3f400]/20 bg-[#c3f400]/5 text-[#c3f400] font-headline font-bold text-[9px] uppercase tracking-[0.2em] w-fit animate-pulse">
            <Cpu size={12} />
            Command Center Resources
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
            Developer <span className="text-[#c3f400] drop-shadow-[0_0_15px_rgba(195,244,0,0.25)]">Toolkits</span>
          </h1>
          <p className="text-slate-400 font-medium text-sm md:text-base leading-relaxed">
            Acquire production-grade boilerplates, local sandbox scripts, and peer-reviewed whitepapers published directly by the Pixora Core Research Group.
          </p>
        </div>

        {/* Terminal Installer Block */}
        <div className="glass-panel p-8 rounded-[32px] border border-white/5 bg-white/[0.01] relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[#c3f400]/[0.01] pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1 space-y-4">
              <div className="inline-flex items-center gap-2 text-[10px] font-headline font-bold text-[#c3f400] uppercase tracking-widest bg-[#c3f400]/10 border border-[#c3f400]/15 py-1 px-3 rounded-lg w-fit">
                <Terminal size={12} />
                Shell Installer
              </div>
              <h3 className="text-2xl font-headline font-bold leading-tight">
                One-Click Sandbox Installation
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Execute this direct shell command in your command environment to bootstrap the Pixora Developer CLI suite, configuration templates, and testing rigs locally.
              </p>
            </div>

            <div className="lg:col-span-2">
              <div className="glass-panel rounded-2xl border border-white/10 bg-black/50 p-5 flex items-center justify-between font-mono text-xs overflow-x-auto gap-4 relative group">
                <span className="text-slate-300 select-all whitespace-nowrap scrollbar-thin">
                  {shellCommand}
                </span>
                
                <button 
                  onClick={handleCopy}
                  className="bg-[#c3f400] text-black hover:shadow-[0_0_15px_rgba(195,244,0,0.35)] p-3.5 rounded-xl flex items-center justify-center transition-all shrink-0"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3 text-[10px] font-mono text-slate-500 justify-end">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Digitally signed SHA-256 secure transport protocol</span>
              </div>
            </div>
          </div>
        </div>

        {/* Boilerplates Grid */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-xl font-headline font-bold uppercase tracking-wider flex items-center gap-2.5">
              <Code2 className="text-[#c3f400]" size={20} />
              Elite Boilerplates & Rig Templates
            </h3>
            <p className="text-xs text-slate-500">
              Clean starting nodes built inside industry standard development environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boilerplates.map((bp) => (
              <div 
                key={bp.title}
                className="glass-panel rounded-[28px] border border-white/5 bg-white/[0.01] p-6 hover:border-[#c3f400]/20 flex flex-col justify-between transition-all duration-300 relative group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-headline font-bold uppercase tracking-widest px-3 py-1 rounded bg-white/5 text-slate-400 border border-white/5">
                      {bp.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{bp.size}</span>
                  </div>

                  <h4 className="text-base font-headline font-bold text-white leading-snug tracking-wide group-hover:text-[#c3f400] transition-colors">
                    {bp.title}
                  </h4>
                  
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {bp.description}
                  </p>

                  <ul className="space-y-2 pt-2 border-t border-white/5">
                    {bp.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        <span className="w-1 h-1 rounded-full bg-[#c3f400]"></span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => toast.loading('Initializing download package secure transmission...')}
                    className="w-full bg-white/5 border border-white/10 hover:border-[#c3f400]/30 hover:bg-[#c3f400]/10 text-white hover:text-[#c3f400] py-3 rounded-xl text-xs font-headline font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    <Download size={14} />
                    <span>Download Package</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Research / Whitepapers */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-xl font-headline font-bold uppercase tracking-wider flex items-center gap-2.5">
              <FileText className="text-purple-400" size={20} />
              Pixora Academic Whitepapers
            </h3>
            <p className="text-xs text-slate-500">
              Advanced engineering investigations, spatial studies, and decentralization proofs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {whitepapers.map((wp) => (
              <div 
                key={wp.title}
                className="glass-panel p-8 rounded-[32px] border border-white/5 bg-white/[0.01] hover:border-purple-500/20 flex flex-col justify-between transition-all duration-300 relative group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-headline font-bold tracking-widest text-slate-500 uppercase">
                    <span>{wp.author}</span>
                    <span>{wp.date}</span>
                  </div>

                  <h4 className="text-lg font-headline font-bold text-white group-hover:text-purple-400 transition-colors">
                    {wp.title}
                  </h4>
                  
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {wp.excerpt}
                  </p>
                </div>

                <div className="pt-6 flex items-center justify-between border-t border-white/5 mt-6">
                  <span className="text-[10px] font-mono text-purple-400/80 font-bold uppercase tracking-wider">{wp.readTime}</span>
                  
                  <button 
                    onClick={() => toast.loading('Syncing read pipeline...')}
                    className="text-white hover:text-purple-400 text-xs font-headline font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                  >
                    <span>Read Whitepaper</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default PublicResourcesPage;
