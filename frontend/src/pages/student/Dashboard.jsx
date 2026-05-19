import React, { useEffect, useState, useRef } from 'react';

import { 
  Play, Clock, Award, TrendingUp, 
  ChevronRight, Calendar, MessageSquare, 
  Zap, Trophy, Target, BookOpen,
  Flame, Gamepad2, Wallet, Loader2,
  PlusCircle, Star, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { CourseService } from '../../services/CourseService';
import { SubmissionService } from '../../services/SubmissionService';
import { QuizService } from '../../services/QuizService';
import { RealtimeService } from '../../services/RealtimeService';
import { supabase } from '../../lib/supabase';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-white/5 text-[var(--st-color-primary)] shadow-inner">
        <Icon size={22} className="group-hover:scale-110 transition-transform" />
      </div>
      {trend && (
        <span className="text-[10px] font-headline font-bold px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/10">
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-on-surface-variant/60 font-headline text-[10px] uppercase tracking-[0.2em] mb-1">{title}</h3>
    <p className="text-2xl font-headline font-bold text-white">{value}</p>
    
    {/* Animated Background Pulse */}
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--st-color-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--st-color-primary)]/10 transition-colors"></div>
  </div>
);

const CourseCard = ({ title, instructor, progress, image, category, onResume }) => (
  <div className="glass-card rounded-2xl overflow-hidden group">
    <div className="relative h-44 overflow-hidden">
      <img src={image || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop'} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-transparent to-transparent"></div>
      <div className="absolute top-4 left-4">
        <span className="text-[9px] font-headline font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md text-white px-2 py-1 rounded border border-white/10">
          {category}
        </span>
      </div>
    </div>
    <div className="p-5 space-y-4">
      <div>
        <h3 className="font-headline font-bold text-white text-base leading-snug line-clamp-2 group-hover:text-[var(--st-color-primary)] transition-colors">{title}</h3>
        <p className="text-xs text-on-surface-variant/60 mt-1 font-medium">{instructor}</p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] font-headline font-bold uppercase tracking-wider">
          <span className="text-on-surface-variant/40">Progress</span>
          <span className="text-[var(--st-color-primary)]">{progress}%</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--st-gradient-primary)] rounded-full transition-all duration-1000 shadow-[0_0_10px_var(--st-color-glow)]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <button onClick={onResume} className="w-full btn-outline py-2.5 !text-xs !rounded-xl group/btn">
        <Play size={14} className="group-hover/btn:fill-current" />
        <span>Resume Mission</span>
      </button>
    </div>
  </div>
);

// ==========================================
// BLOCKCHAIN & WEB3 SPECIALIZED COMPONENTS
// ==========================================

const WalletSandbox = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balances, setBalances] = useState({ eth: 0, sol: 0, usdc: 0 });
  const [status, setStatus] = useState('idle'); // idle, calling, mining, confirmed
  const [logs, setLogs] = useState([]);
  const [contractCode] = useState(
`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PixoraCertificate {
    mapping(address => bool) public isCertified;
    
    function claimCertificate() public {
        isCertified[msg.sender] = true;
    }
}`
  );

  const connectWallet = () => {
    setConnected(true);
    setAddress('0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''));
    setBalances({
      eth: parseFloat((Math.random() * 10 + 1).toFixed(3)),
      sol: parseFloat((Math.random() * 50 + 10).toFixed(2)),
      usdc: parseFloat((Math.random() * 5000 + 1000).toFixed(2))
    });
  };

  const simulateCall = async () => {
    if (!connected) return;
    setStatus('calling');
    setLogs([]);
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    
    const messages = [
      '[01:14:02] 🌐 Initializing sandbox JSON-RPC connection...',
      '[01:14:03] 📦 Encoding transaction payload (claimCertificate)...',
      '[01:14:04] 🔑 Signing with private key of ' + address.slice(0, 8) + '...',
      '[01:14:05] 🚀 Broadcasting transaction to Pixora Testnet...',
      '[01:14:06] ⛓️ Transaction received: Hash 0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      '[01:14:08] ⏳ Mining transaction in block #204,912...',
      '[01:14:09] 🎉 Smart Contract executed successfully!',
      '[01:14:10] 🏆 Pixora Certificate claimed for ' + address.slice(0, 8) + '!'
    ];

    for (let msg of messages) {
      setLogs(prev => [...prev, msg]);
      await sleep(500);
    }
    setStatus('confirmed');
    setBalances(prev => ({ ...prev, eth: parseFloat((prev.eth - 0.005).toFixed(3)) })); // gas fee deduction
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6 relative overflow-hidden text-left">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--st-color-primary)]/5 to-transparent pointer-events-none"></div>
      
      <div className="flex justify-between items-center">
        <div>
          <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Developer Sandbox</span>
          <h3 className="text-xl font-headline font-bold text-white mt-1">Web3 Protocol Environment</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[var(--st-color-primary)] animate-pulse shadow-[0_0_8px_var(--st-color-glow)]' : 'bg-rose-500'}`}></span>
          <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/80">
            {connected ? 'Testnet Linked' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet & Balance Grid */}
        <div className="glass-card p-5 rounded-2xl border-white/10 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-on-surface-variant/50">Developer Identity</span>
              {connected && (
                <span className="text-[10px] font-mono text-[var(--st-color-primary)] bg-[var(--st-color-primary)]/10 px-2 py-0.5 rounded border border-[var(--st-color-primary)]/20">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              )}
            </div>
            
            {connected ? (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-[9px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/40 block mb-1">ETH</span>
                  <span className="text-sm font-headline font-bold text-white">{balances.eth}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-[9px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/40 block mb-1">SOL</span>
                  <span className="text-sm font-headline font-bold text-white">{balances.sol}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                  <span className="text-[9px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/40 block mb-1">USDC</span>
                  <span className="text-sm font-headline font-bold text-white">{balances.usdc}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                <p className="text-[10px] font-headline uppercase tracking-widest text-on-surface-variant/40">No Wallet Registered</p>
              </div>
            )}
          </div>

          {!connected ? (
            <button onClick={connectWallet} className="w-full btn-primary py-3 !rounded-xl !text-xs">
              <Wallet size={16} />
              <span>Connect Sandbox Wallet</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={simulateCall} 
                disabled={status === 'calling'}
                className="flex-1 btn-primary py-3 !rounded-xl !text-xs disabled:opacity-50"
              >
                {status === 'calling' ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                <span>{status === 'calling' ? 'Executing Tx...' : 'Claim Certificate'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Smart Contract Playground */}
        <div className="glass-card p-5 rounded-2xl border-white/10 flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-on-surface-variant/50">Solidity Playground</span>
            <span className="text-[8px] font-headline font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">v0.8.20</span>
          </div>

          <pre className="flex-1 font-mono text-[10px] p-3 rounded-xl bg-black/40 border border-white/5 text-left text-on-surface-variant overflow-y-auto leading-relaxed h-32 whitespace-pre">
            <code>{contractCode}</code>
          </pre>
        </div>
      </div>

      {/* Terminal logs */}
      {logs.length > 0 && (
        <div className="p-4 rounded-2xl bg-black/50 border border-white/5 font-mono text-[10px] space-y-1 h-32 overflow-y-auto text-left shadow-inner animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
            <span className="text-[8px] uppercase tracking-widest text-[var(--st-color-primary)] font-bold">Testnet Deployment Stream</span>
            <span className="text-[8px] text-on-surface-variant/40">Status: {status.toUpperCase()}</span>
          </div>
          {logs.map((log, index) => (
            <div key={index} className={`leading-loose ${log.includes('🎉') || log.includes('🏆') ? 'text-[var(--st-color-primary)] font-bold' : 'text-white/70'}`}>
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const NFTCredentials = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  const badges = [
    { name: 'DeFi Architect', category: 'SMART CONTRACTS', date: 'Earned 2 days ago', desc: 'Validated yield optimization protocols & multi-sig vault security.', tx: '0x3bf9...c10e', glow: 'rgba(0, 255, 148, 0.4)' },
    { name: 'ERC-20 Token Master', category: 'TOKENOMICS', date: 'Earned 1 week ago', desc: 'Deployed customized liquidity models and distribution sequences.', tx: '0xa9d2...03fb', glow: 'rgba(0, 163, 255, 0.4)' },
    { name: 'Smart Contract Auditor', category: 'SECURITY', date: 'Earned 2 weeks ago', desc: 'Identified re-entrancy vectors and verified integer overflow protection.', tx: '0xf92a...612d', glow: 'rgba(255, 215, 0, 0.4)' },
  ];

  return (
    <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6 relative overflow-hidden text-left">
      <div>
        <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Verified Credentials</span>
        <h3 className="text-xl font-headline font-bold text-white mt-1">NFT Credential Showcase</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {badges.map((badge, idx) => (
          <div 
            key={idx}
            className="glass-card p-5 rounded-2xl border-white/10 hover-glow transition-all duration-500 flex flex-col justify-between h-56 relative overflow-hidden group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              boxShadow: hoveredIndex === idx ? `0 0 25px ${badge.glow}` : 'none'
            }}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-headline font-black text-[var(--st-color-primary)] uppercase tracking-[0.2em]">{badge.category}</span>
                <span className="text-[8px] font-headline text-on-surface-variant/40">{badge.date}</span>
              </div>
              <h4 className="font-headline font-bold text-white text-base group-hover:text-[var(--st-color-primary)] transition-colors leading-snug">{badge.name}</h4>
              <p className="text-[10px] text-on-surface-variant/60 leading-relaxed font-body">{badge.desc}</p>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between font-mono text-[9px] text-on-surface-variant/40">
              <span>TX HASH</span>
              <span className="text-[var(--st-color-primary)]/80 hover:underline">{badge.tx}</span>
            </div>
            
            <div className="absolute -bottom-10 -right-10 w-24 h-24 rounded-full bg-[var(--st-color-primary)]/5 blur-2xl group-hover:bg-[var(--st-color-primary)]/10 transition-all duration-500"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GithubDappDecks = () => {
  const repos = [
    { name: 'pixora-lending-protocol', status: 'Healthy', commits: 48, latency: '14ms', env: 'Production', url: 'https://pixora-defi.vercel.app' },
    { name: 'cross-chain-identity-bridge', status: 'Staging', commits: 32, latency: '22ms', env: 'Staging', url: 'https://pixora-id-staging.vercel.app' },
  ];

  return (
    <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6 relative overflow-hidden text-left">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Deployment Pipeline</span>
          <h3 className="text-xl font-headline font-bold text-white mt-1">dApp Portfolio & Git Sync</h3>
        </div>
        <span className="text-[8px] font-headline font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-1 rounded text-on-surface-variant/80 font-black">ACTIVE</span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {repos.map((repo, idx) => (
          <div key={idx} className="glass-card p-5 rounded-2xl border-white/10 space-y-4 relative overflow-hidden group">
            <div className="flex justify-between items-center">
              <h4 className="font-headline font-bold text-white text-base group-hover:text-[var(--st-color-primary)] transition-colors leading-snug">{repo.name}</h4>
              <span className={`px-2 py-0.5 rounded text-[8px] font-headline font-bold uppercase tracking-wider ${
                repo.status === 'Healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {repo.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 text-[10px] font-headline uppercase tracking-wider text-on-surface-variant/60">
              <div>
                <span className="text-[8px] text-on-surface-variant/35 block mb-1">Commits</span>
                <span className="text-white font-bold">{repo.commits}</span>
              </div>
              <div>
                <span className="text-[8px] text-on-surface-variant/35 block mb-1">RPC</span>
                <span className="text-white font-bold">{repo.latency}</span>
              </div>
              <div>
                <span className="text-[8px] text-on-surface-variant/35 block mb-1">Cluster</span>
                <span className="text-white font-bold">{repo.env}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono text-on-surface-variant/40">URL: <a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">{repo.url}</a></span>
              <button className="text-[10px] font-headline font-bold uppercase tracking-widest text-[var(--st-color-primary)] hover:underline">Console</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// GAME DEV SPECIALIZED COMPONENTS
// ==========================================

const WebGLBuildUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buildReady, setBuildReady] = useState(false);
  const [playMode, setPlayMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const [details, setDetails] = useState(null);

  const startUpload = () => {
    setIsUploading(true);
    setProgress(0);
    setBuildReady(false);
    setLogs([]);
    setDetails(null);

    const logsArray = [
      '[COMPILING] Packaging WebGL assembly files...',
      '[OPTIMIZATION] Re-mapping asset reference maps...',
      '[COMPRESSION] Compressing package with Brotli...',
      '[UPLOADING] Uploading to Pixora CDN endpoints...',
      '[CHECKLIST] Optimizing texture coordinates...',
      '[COMPLETED] Build successfully deployed!'
    ];

    let currentLog = 0;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setBuildReady(true);
          setDetails({
            size: '42.8 MB',
            optimization: '94% Score',
            fps: '60 FPS Target'
          });
          return 100;
        }
        if (p % 18 === 0 && currentLog < logsArray.length) {
          setLogs(prev => [...prev, logsArray[currentLog]]);
          currentLog++;
        }
        return p + 2;
      });
    }, 60);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6 relative overflow-hidden text-left">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--st-color-primary)]/5 to-transparent pointer-events-none"></div>
      
      <div className="flex justify-between items-center">
        <div>
          <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Build Pipeline</span>
          <h3 className="text-xl font-headline font-bold text-white mt-1">Unity & Unreal Deployment Deck</h3>
        </div>
        <span className="text-[8px] font-headline font-bold uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-1 rounded text-on-surface-variant/80">WebGL Target</span>
      </div>

      {!playMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Uploader interaction card */}
          <div className="glass-card p-5 rounded-2xl border-white/10 flex flex-col justify-between h-64 relative overflow-hidden group">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-on-surface-variant/50">Local Engine Build</span>
                {buildReady && (
                  <span className="text-[8px] font-headline font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">BUILD READY</span>
                )}
              </div>

              {!isUploading && !buildReady && (
                <div className="py-6 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                  <Gamepad2 size={36} className="mx-auto text-on-surface-variant/20 mb-3" />
                  <p className="text-[10px] font-headline uppercase tracking-widest text-on-surface-variant/40">Drag and drop engine build here</p>
                </div>
              )}

              {isUploading && (
                <div className="space-y-4 py-4 text-left">
                  <div className="flex justify-between text-[10px] font-headline uppercase tracking-widest text-on-surface-variant/60 font-bold">
                    <span>Compressing Engine Assets</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--st-gradient-primary)] rounded-full shadow-[0_0_12px_var(--st-color-glow)] transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {buildReady && details && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                    <span className="text-[8px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/45 block mb-1">Bundle</span>
                    <span className="text-xs font-headline font-bold text-white">{details.size}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                    <span className="text-[8px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/45 block mb-1">Assets Opt</span>
                    <span className="text-xs font-headline font-bold text-white">{details.optimization}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                    <span className="text-[8px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/45 block mb-1">FPS Target</span>
                    <span className="text-xs font-headline font-bold text-white">{details.fps}</span>
                  </div>
                </div>
              )}
            </div>

            {!isUploading && !buildReady && (
              <button onClick={startUpload} className="w-full btn-primary py-3 !rounded-xl !text-xs">
                <Play size={16} fill="currentColor" />
                <span>Upload New WebGL Build</span>
              </button>
            )}

            {isUploading && (
              <button disabled className="w-full btn-outline py-3 !rounded-xl !text-xs disabled:opacity-50">
                <Loader2 className="animate-spin" size={16} />
                <span>Processing Pipeline...</span>
              </button>
            )}

            {buildReady && (
              <div className="flex gap-3">
                <button onClick={startUpload} className="flex-1 btn-outline py-3 !rounded-xl !text-xs">
                  <span>Re-deploy</span>
                </button>
                <button onClick={() => setPlayMode(true)} className="flex-1 btn-primary py-3 !rounded-xl !text-xs">
                  <Play size={16} fill="currentColor" />
                  <span>Test Emulator</span>
                </button>
              </div>
            )}
          </div>

          {/* Compilation Logs box */}
          <div className="glass-card p-5 rounded-2xl border-white/10 flex flex-col justify-between h-64">
            <span className="text-[10px] font-headline font-bold uppercase tracking-wider text-on-surface-variant/50">Deployment Pipeline Terminal</span>
            <div className="flex-1 font-mono text-[9px] p-3 rounded-xl bg-black/40 border border-white/5 text-on-surface-variant overflow-y-auto leading-relaxed h-full mt-3 space-y-1">
              {logs.length > 0 ? (
                logs.map((log, idx) => (
                  <div key={idx} className={log.includes('[COMPLETED]') ? 'text-[var(--st-color-primary)] font-bold' : 'text-white/60'}>
                    {log}
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-on-surface-variant/30">
                  Pipeline terminal idle. Launch a build deployment.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-black/80 border border-white/10 flex flex-col items-center justify-center space-y-4">
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none"></div>
          
          {/* Simulated 3D retro neon gameplay canvas loop */}
          <div className="text-center space-y-3 z-10">
            <Gamepad2 size={54} className="mx-auto text-[var(--st-color-primary)] animate-bounce" />
            <h4 className="text-lg font-headline font-bold text-white">WebGL Playable Emulator Active</h4>
            <p className="text-[10px] text-on-surface-variant/60 font-headline uppercase tracking-widest">FPS: 60 (Locked) | Memory: 254MB | Cache: Verified</p>
            <div className="flex justify-center gap-3 pt-4">
              <button onClick={() => setPlayMode(false)} className="btn-outline !px-5 !py-2.5 !text-[10px]">
                <span>Exit Emulator</span>
              </button>
              <button onClick={() => alert('Demo action: Game controls active!')} className="btn-primary !px-5 !py-2.5 !text-[10px]">
                <span>Focus Controls</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GameplayShowcase = () => {
  const games = [
    { title: 'Neon Void Survival', genre: 'Sci-Fi Action', downloads: '1.2k', rating: '4.8', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2940&auto=format&fit=crop' },
    { title: 'Solitary Cyber Grid', genre: 'Puzzle Hack', downloads: '840', rating: '4.9', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=2940&auto=format&fit=crop' },
  ];

  return (
    <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6 relative overflow-hidden text-left">
      <div>
        <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Creative Deck</span>
        <h3 className="text-xl font-headline font-bold text-white mt-1">Gameplay Showcase & Portfolio</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game, idx) => (
          <div key={idx} className="glass-card rounded-2xl overflow-hidden group cursor-pointer border-white/10 hover-glow transition-all duration-500">
            <div className="relative h-36 overflow-hidden">
              <img src={game.image} alt={game.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <span className="absolute top-3 left-3 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-headline font-bold uppercase tracking-wider text-white border border-white/10">
                {game.genre}
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-headline font-bold text-white text-base leading-snug">{game.title}</h4>
                <div className="flex items-center gap-1 text-[10px] text-yellow-500/80 font-bold">
                  <Star size={11} fill="currentColor" />
                  <span>{game.rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] font-headline uppercase tracking-widest text-on-surface-variant/40 pt-1">
                <span>Plays: {game.downloads}</span>
                <span className="text-[var(--st-color-primary)] font-bold group-hover:underline">View Deck</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GameJamArena = () => {
  const [timeLeft, setTimeLeft] = useState(74830); // in seconds, custom mock countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const d = Math.floor(secs / (3600 * 24));
    const h = Math.floor((secs % (3600 * 24)) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6 relative overflow-hidden text-left">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--st-color-primary)]/5 blur-3xl rounded-full"></div>
      
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Active Jam Competition</span>
          <h3 className="text-xl font-headline font-bold text-white mt-1">Multiplayer Jam Arena</h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[8px] font-headline font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">ACTIVE</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-center">
          <span className="text-[8px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/40 block mb-1 text-center">Time Left</span>
          <span className="text-xs font-headline font-bold text-white text-center leading-none">{formatTime(timeLeft)}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-center">
          <span className="text-[8px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/40 block mb-1 text-center">Active Prompt</span>
          <span className="text-xs font-headline font-bold text-[var(--st-color-primary)] text-center leading-none">NEON VOID RETRO</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-center">
          <span className="text-[8px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/40 block mb-1 text-center">Team Status</span>
          <span className="text-xs font-headline font-bold text-white text-center leading-none">2/4 Members</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => alert('Demo action: Recruit panel opened!')} className="flex-1 btn-outline py-2.5 !rounded-xl !text-xs">
          <span>Find Teammates</span>
        </button>
        <button onClick={() => alert('Demo action: Submission deck opened!')} className="flex-1 btn-primary py-2.5 !rounded-xl !text-xs">
          <span>Submit Project</span>
        </button>
      </div>
    </div>
  );
};

const AssetAudioPortal = () => {
  const assets = [
    { name: 'Cyberpunk Hover Vehicle', type: '3D Model', format: 'gltf', size: '14MB' },
    { name: 'Synthwave Background Loop', type: 'Audio Pack', format: 'wav', size: '22MB' },
    { name: 'High-Tech Console UI HUD', type: 'Textures Pack', format: 'png/svg', size: '8MB' },
  ];

  return (
    <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-6 relative overflow-hidden text-left">
      <div>
        <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Developer Toolkit</span>
        <h3 className="text-xl font-headline font-bold text-white mt-1">3D Assets & Audio Library</h3>
      </div>

      <div className="space-y-4">
        {assets.map((asset, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
            <div className="space-y-1">
              <h4 className="font-headline font-bold text-white text-sm group-hover:text-[var(--st-color-primary)] transition-colors leading-snug">{asset.name}</h4>
              <span className="text-[9px] font-headline uppercase tracking-widest text-on-surface-variant/40">
                {asset.type} | {asset.format.toUpperCase()} ({asset.size})
              </span>
            </div>
            <button onClick={() => alert(`Demo action: Downloading ${asset.name}...`)} className="btn-outline !px-4 !py-2 !text-[9px] !rounded-lg uppercase tracking-wider">
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { currentTheme } = useStudentTheme();
  
  console.log('--- PIXORA DASHBOARD V3 ---');

  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [learningStats, setLearningStats] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFetching = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id || !profile || isFetching.current) return;
      
      const safetyTimeout = setTimeout(() => {
        if (mounted.current && isLoading) {
          console.warn('Dashboard: Safety timeout reached, forcing render');
          setIsLoading(false);
        }
      }, 3000);

      try {
        isFetching.current = true;
        setIsLoading(true);
        
        console.log('Dashboard: Initializing data fetch for:', user.id);
        
        // Fetch core data with a race against a timeout to prevent hanging
        const fetchData = async () => {
          try {
            const userTrack = profile?.track || (profile?.learning_track ? profile.learning_track.toUpperCase() : null);
            const [coursesData, availableData, assignmentsData, quizzesData, statsData, lastLesson] = await Promise.all([
              CourseService.getEnrolledCourses(user.id).catch(e => { console.warn(e); return []; }),
              profile?.college_id 
                ? CourseService.getAvailableCourses(profile.college_id, userTrack).catch(e => { console.warn(e); return []; }) 
                : CourseService.getAvailableCourses(null, userTrack).catch(e => { console.warn(e); return []; }),
              SubmissionService.getAssignments(user.id).catch(e => { console.warn(e); return []; }),
              QuizService.getQuizzes(user.id).catch(e => { console.warn(e); return []; }),
              CourseService.getStudentLearningStats(user.id).catch(e => { console.warn(e); return null; }),
              CourseService.getContinueLearning(user.id).catch(e => { console.warn(e); return null; })
            ]);
            return { coursesData, availableData, assignmentsData, quizzesData, statsData, lastLesson };
          } catch (e) {
            console.error('Dashboard: Data fetch failed', e);
            return null;
          }
        };

        const result = await fetchData();

        if (mounted.current && result) {
          const { coursesData, availableData, assignmentsData, quizzesData, statsData, lastLesson } = result;
          setEnrolledCourses(coursesData || []);
          setLearningStats(statsData);
          setResumeData(lastLesson);
          
          const enrolledIds = new Set((coursesData || []).map(c => c.course_id));
          const filteredAvailable = (availableData || []).filter(c => !enrolledIds.has(c.id));
          setAvailableCourses(filteredAvailable.slice(0, 3));
          
          setAssignments(assignmentsData || []);
          setQuizzes(quizzesData || []);

          try {
            const userTrack = profile?.track || (profile?.learning_track ? profile.learning_track.toUpperCase() : null);
            let liveQuery = supabase
              .from('live_classes')
              .select('*')
              .in('status', ['scheduled', 'live']);

            if (userTrack) {
              liveQuery = liveQuery.or(`track.eq.${userTrack},track.is.null`);
            }

            const { data: live } = await liveQuery
              .order('scheduled_at', { ascending: true })
              .limit(3);
            setLiveClasses(live || []);
          } catch (err) {
            console.warn('Dashboard: Live classes fetch failed', err);
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        clearTimeout(safetyTimeout);
        if (mounted.current) {
          setIsLoading(false);
          isFetching.current = false;
        }
      }
    };

    loadDashboardData();
  }, [user?.id, profile]);

  // --- Real-time Subscriptions ---
  useEffect(() => {
    if (!user?.id || enrolledCourses.length === 0) return;

    console.log('Dashboard: Initializing real-time synchronization...');
    
    // 1. Subscribe to progress updates
    const progressSub = RealtimeService.subscribeToProgress(user.id, (payload) => {
      console.log('Dashboard: Progress update received', payload);
      // Refresh only the affected course if possible, or reload all
      setEnrolledCourses(prev => prev.map(c => 
        c.id === payload.new.id ? { ...c, ...payload.new } : c
      ));
    });

    // 2. Subscribe to all course-related changes
    const courseIds = enrolledCourses.map(c => c.course_id);
    const multiSub = RealtimeService.subscribeToAllCourses(courseIds, (payload) => {
      console.log('Dashboard: Course update received', payload);
      // For curriculum/assessment changes, we usually want to refresh relevant states
      // but for now we'll just log and let the user know data is fresh.
    });

    return () => {
      RealtimeService.unsubscribe(progressSub);
      multiSub.unsubscribe();
    };
  }, [user?.id, enrolledCourses.length]);





  const isGameDev = currentTheme.id === 'game_dev';
  const isBlockchain = currentTheme.id === 'blockchain';

  const level = Math.floor((profile?.xp_points || 0) / 1000) + 1;
  const nextLevelXP = level * 1000;
  const currentLevelXP = profile?.xp_points || 0;
  const levelProgress = ((currentLevelXP % 1000) / 1000) * 100;

  const stats = [
    { title: 'Enrolled Tracks', value: (learningStats?.totalEnrolled || 0).toString().padStart(2, '0'), icon: BookOpen, color: 'var(--st-color-primary)' },
    { title: 'Knowledge XP', value: (learningStats?.xp || 0).toLocaleString(), icon: Zap, color: 'var(--st-color-primary)' },
    { title: 'Learning Streak', value: `${learningStats?.streak || 0} Days`, icon: Flame, color: 'var(--st-color-primary)' },
    { title: 'Pending Tasks', value: assignments.filter(a => !a.mySubmission).length.toString().padStart(2, '0'), icon: Target, color: 'var(--st-color-primary)' },
  ];



  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Premium Welcome Header */}
      <section className="relative glass-panel rounded-3xl overflow-hidden border-white/5">
        <div className="absolute inset-0 bg-[var(--st-gradient-surface)] opacity-40"></div>
        <div className="absolute inset-0 circuit-bg opacity-20"></div>
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--st-color-primary)] animate-pulse shadow-[0_0_8px_var(--st-color-glow)]"></span>
              <span className="font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">Systems Operational</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-white mb-4 leading-tight">
              Welcome back, <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_15px_var(--st-color-glow)]">{profile?.full_name?.split(' ')[0] || 'Explorer'}</span>
            </h1>
            <p className="text-on-surface-variant/80 text-base md:text-lg mb-8 leading-relaxed font-body">
              {isGameDev 
                ? "Your engine builds are synchronized and the creative pipeline is active. Ready to forge another world?"
                : isBlockchain 
                  ? "The blocks are confirming and your protocol nodes are stable. Let's engineer the decentralized future."
                  : "Your academic sequence is performing optimally. Continue your progress to maintain system dominance."}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button 
                onClick={() => resumeData ? navigate(`/student/course/${resumeData.course_id}?lesson=${resumeData.lesson_id}`) : navigate('/student/courses')}
                className="btn-primary !px-8"
              >
                <Play size={18} fill="currentColor" />
                <span>{resumeData ? 'Jump Back In' : 'Start Mission'}</span>
              </button>
              <button 
                onClick={() => navigate('/student/community')}
                className="btn-outline !px-8"
              >
                <Calendar size={18} />
                <span>Sync Community</span>
              </button>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
            <div className="w-64 h-64 relative group">
              <div className="absolute inset-0 bg-[var(--st-color-primary)]/10 rounded-full blur-[80px] animate-pulse"></div>
              <div className="relative z-10 w-full h-full glass-card rounded-full flex items-center justify-center border-white/10">
                {isGameDev ? (
                  <Gamepad2 size={100} className="text-[var(--st-color-primary)] drop-shadow-[0_0_20px_var(--st-color-glow)]" />
                ) : (
                  <Wallet size={100} className="text-[var(--st-color-primary)] drop-shadow-[0_0_20px_var(--st-color-glow)]" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} trend={12} />
        ))}
      </div>

      {/* Specialized Track Portal Section */}
      {isBlockchain && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="border-b border-white/5 pb-4 text-left">
            <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Track Portal</span>
            <h2 className="text-2xl font-headline font-bold text-white mt-1">Blockchain & Web3 Ecosystem</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <WalletSandbox />
              <NFTCredentials />
            </div>
            <div>
              <GithubDappDecks />
            </div>
          </div>
        </section>
      )}

      {isGameDev && (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="border-b border-white/5 pb-4 text-left">
            <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Track Portal</span>
            <h2 className="text-2xl font-headline font-bold text-white mt-1">Immersive Game Dev Ecosystem</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <WebGLBuildUploader />
              <GameplayShowcase />
            </div>
            <div className="space-y-8">
              <GameJamArena />
              <AssetAudioPortal />
            </div>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-10">
        {/* Main Content: Courses */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-end border-b border-white/5 pb-4">
            <div>
              <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Active Tracks</span>
              <h2 className="text-2xl font-headline font-bold text-white mt-1">Continue Learning</h2>
            </div>
            <button 
              onClick={() => navigate('/student/courses')}
              className="text-[10px] font-headline font-bold text-on-surface-variant/60 hover:text-[var(--st-color-primary)] flex items-center gap-1 transition-all uppercase tracking-widest"
            >
              Explore All <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.slice(0, 2).map((enrollment) => (
                <CourseCard 
                  key={enrollment.id}
                  title={enrollment.course?.title}
                  instructor={enrollment.course?.instructor?.full_name || 'Expert Instructor'}
                  progress={enrollment.progress}
                  category={enrollment.course?.category}
                  image={enrollment.course?.thumbnail_url}
                  onResume={() => enrollment.course_id && navigate(`/student/course/${enrollment.course_id}`)}
                />
              ))
            ) : availableCourses.length > 0 ? (
              availableCourses.slice(0, 2).map((course) => (
                <div key={course.id} className="relative group glass-card overflow-hidden hover-glow transition-all duration-500 border-white/5">
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-1 rounded-md bg-[var(--st-color-primary)]/10 border border-[var(--st-color-primary)]/20 text-[8px] font-headline font-bold text-[var(--st-color-primary)] uppercase tracking-wider">Recommended Mission</span>
                  </div>
                  <div className="aspect-video relative overflow-hidden">
                    <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60'} alt={course.title} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-110 group-hover:scale-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
                  </div>
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-headline font-bold text-white group-hover:text-[var(--st-color-primary)] transition-colors">{course.title}</h3>
                    <div className="flex items-center justify-between text-[10px] text-on-surface-variant/60 font-headline uppercase tracking-widest">
                      <span>{course.category || 'Tech'}</span>
                      <button onClick={() => navigate('/student/courses')} className="text-[var(--st-color-primary)] hover:underline">Enroll Now</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 glass-card p-10 text-center space-y-4 border-dashed border-white/5 bg-white/[0.01]">
                <BookOpen size={40} className="mx-auto text-on-surface-variant/10" />
                <p className="text-on-surface-variant/40 font-headline text-[10px] uppercase tracking-[0.2em]">No active sequences detected.</p>
                <button onClick={() => navigate('/student/courses')} className="btn-primary !px-6 mx-auto !py-2.5 !text-[10px]">Initialize Sequence</button>
              </div>
            )}
          </div>

          {/* New: Featured/Discovery Section in Dashboard */}
          <div className="space-y-8 pt-4">
            <div className="flex justify-between items-end border-b border-white/5 pb-4">
              <div>
                <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Available Missions</span>
                <h2 className="text-2xl font-headline font-bold text-white mt-1">Recommended for You</h2>
              </div>
              <button 
                onClick={() => navigate('/student/courses')}
                className="text-[10px] font-headline font-bold text-on-surface-variant/60 hover:text-[var(--st-color-primary)] flex items-center gap-1 transition-all uppercase tracking-widest"
              >
                Discovery Hub <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {availableCourses.length > 0 ? (
                availableCourses.slice(0, 2).map((course) => (
                  <div 
                    key={course.id}
                    onClick={() => navigate('/student/courses')}
                    className="glass-card rounded-2xl overflow-hidden group cursor-pointer border-white/5 hover:border-[var(--st-color-primary)]/30 transition-all shadow-xl"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2940&auto=format&fit=crop'} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-transparent to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-[var(--st-color-primary)]/20 backdrop-blur-md border border-[var(--st-color-primary)]/30 p-1.5 rounded-lg text-[var(--st-color-primary)]">
                          <PlusCircle size={16} />
                        </div>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[8px] font-headline font-black uppercase tracking-[0.2em] text-[var(--st-color-primary)] mb-1 block">{course.category}</span>
                        <h3 className="font-headline font-bold text-white text-base line-clamp-1 group-hover:text-[var(--st-color-primary)] transition-colors">{course.title}</h3>
                      </div>
                      <p className="text-[10px] text-on-surface-variant/60 line-clamp-2 leading-relaxed">
                        {course.description || "Initialize this module to explore advanced architectural concepts."}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[9px] font-headline font-black uppercase tracking-widest text-[var(--st-color-primary)]">Enroll Now</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-yellow-500/80 font-bold">
                          <Star size={12} fill="currentColor" />
                          <span>4.9</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-10 glass-card text-center border-dashed border-white/5 bg-white/[0.01]">
                   <Sparkles size={32} className="mx-auto text-on-surface-variant/10 mb-4" />
                   <p className="text-on-surface-variant/40 font-headline text-[9px] uppercase tracking-[0.2em]">Scanning for new missions...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-10">
          {/* Upcoming Live Session */}
          <div className="glass-panel rounded-2xl p-6 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container/5 blur-2xl rounded-full"></div>
            <h3 className="font-headline font-bold text-white text-sm mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Calendar size={16} className="text-[var(--st-color-primary)]" />
              Live Directives
            </h3>
            <div className="space-y-4">
              {liveClasses.length > 0 ? (
                liveClasses.map((session) => (
                  <div 
                    key={session.id} 
                    onClick={() => navigate(`/student/live?session_id=${session.id}`)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${
                      session.status === 'live'
                        ? 'bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.05)]'
                        : 'bg-white/[0.02] border-white/5 hover:border-[var(--st-color-primary)]/30'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[9px] font-headline font-bold uppercase tracking-widest ${
                        session.status === 'live' ? 'text-rose-400' : 'text-[var(--st-color-primary)]'
                      }`}>
                        {new Date(session.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} @ {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {session.status === 'live' && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-[8px] font-black text-rose-400 tracking-wider uppercase animate-pulse">
                          <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                          LIVE_NOW
                        </span>
                      )}
                    </div>
                    <h4 className="font-headline font-bold text-white text-sm mb-3 line-clamp-1 group-hover:text-[var(--st-color-primary)] transition-colors">
                      {session.title}
                    </h4>
                    <button className={`text-[10px] font-headline font-bold uppercase tracking-wider transition-colors ${
                      session.status === 'live' ? 'text-rose-400 group-hover:text-rose-300' : 'text-white/40 group-hover:text-white'
                    }`}>
                      {session.status === 'live' ? 'JOIN_BROADCAST_NOW' : 'ENTER_PORTAL'}
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-on-surface-variant/40 font-headline uppercase tracking-widest text-center py-4">No scheduled transmissions.</p>
              )}
            </div>
          </div>

          {/* Achievement Progress */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
            <Trophy className="absolute -top-6 -right-6 text-[var(--st-color-primary)] opacity-5 rotate-12" size={120} />
            <h3 className="font-headline font-bold text-white text-sm mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Target size={16} className="text-[var(--st-color-primary)]" />
              Goal Alignment
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end text-[10px] font-headline font-bold uppercase tracking-widest">
                <div className="space-y-1">
                  <span className="text-on-surface-variant/40 block">Mastery Level</span>
                  <span className="text-white text-lg">LEVEL {level.toString().padStart(2, '0')}</span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-on-surface-variant/40 block">Next Milestone</span>
                  <span className="text-[var(--st-color-primary)] text-lg">{currentLevelXP % 1000} / 1000 XP</span>
                </div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--st-gradient-primary)] rounded-full shadow-[0_0_15px_var(--st-color-glow)] transition-all duration-1000"
                  style={{ width: `${levelProgress}%` }}
                ></div>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
                <p className="text-[10px] text-on-surface-variant/60 italic font-medium leading-relaxed">
                  "Only <span className="text-white font-bold">{1000 - (currentLevelXP % 1000)} XP</span> remains to unlock the 
                  <span className="text-[var(--st-color-primary)] font-bold"> Level {(level + 1).toString().padStart(2, '0')}</span> status."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
