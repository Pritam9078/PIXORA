import React, { useState } from 'react';
import { 
  Wallet, Database, Activity, Cpu, 
  ExternalLink, Code, ShieldCheck, 
  ArrowUpRight, RefreshCw, BarChart3,
  Coins, Box, Globe, Lock, Award, Target,
  Users
} from 'lucide-react';
import { useStudentTheme } from '../../context/StudentThemeContext';

const BlockchainHub = () => {
  const { currentTheme } = useStudentTheme();
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState('Ethereum');

  const networks = [
    { name: 'Ethereum', status: 'Mainnet', gas: '12 gwei', icon: '💎' },
    { name: 'Polygon', status: 'Amoy Testnet', gas: '35 gwei', icon: '🟣' },
    { name: 'Stellar', status: 'Testnet', gas: '100 stroops', icon: '✨' },
    { name: 'Solana', status: 'Devnet', gas: '0.000005 SOL', icon: '☀️' }
  ];

  const recentTransactions = [
    { id: '0x4f...a23', type: 'Certificate Mint', status: 'Confirmed', date: '2h ago' },
    { id: '0x8e...1c9', type: 'DAO Vote', status: 'Confirmed', date: '1d ago' },
    { id: '0x2a...f44', type: 'Token Transfer', status: 'Pending', date: '5m ago' }
  ];

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => setIsConnecting(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Hero / Wallet Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass-panel rounded-3xl border-white/5 p-8 relative overflow-hidden group">
          <div className="absolute inset-0 circuit-bg opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--st-color-primary)] opacity-5 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--st-color-primary)] shadow-inner">
                <Wallet size={28} />
              </div>
              <div>
                <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Web3 Interface</span>
                <h1 className="text-3xl font-headline font-bold text-white mt-1">Terminal <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_15px_var(--st-color-glow)]">Dashboard</span></h1>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6 flex flex-col justify-between group hover:border-[var(--st-color-primary)]/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/40">Total Assets</span>
                  <Coins className="text-[var(--st-color-primary)]" size={16} />
                </div>
                <div>
                  <h3 className="text-3xl font-headline font-bold text-white mb-1">2.450 <span className="text-sm text-on-surface-variant/40">ETH</span></h3>
                  <p className="text-[10px] font-headline font-bold text-green-400">+$124.20 (24h)</p>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-6 flex flex-col justify-between group hover:border-[var(--st-color-primary)]/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface-variant/40">Active Node</span>
                  <RefreshCw className="text-[var(--st-color-primary)]" size={16} />
                </div>
                <div>
                  <h3 className="text-2xl font-headline font-bold text-white mb-1">{activeNetwork}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    <p className="text-[10px] font-headline font-bold text-on-surface-variant/60 uppercase tracking-widest">Protocol Synced</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={handleConnect}
                className="btn-primary !px-8 !rounded-xl min-w-[200px]"
              >
                {isConnecting ? <RefreshCw className="animate-spin" size={18} /> : <Wallet size={18} />}
                <span>{isConnecting ? 'Linking Identity...' : 'Connect Wallet'}</span>
              </button>
              <button className="btn-outline !px-8 !rounded-xl">
                <Globe size={18} />
                <span>Switch Grid</span>
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl border-white/5 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <h3 className="font-headline font-bold text-white text-sm flex items-center gap-2 uppercase tracking-widest">
              <Activity size={16} className="text-red-500" />
              Gas Station
            </h3>
            <span className="text-[9px] font-headline font-bold text-on-surface-variant/40 tracking-widest">REAL-TIME</span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {networks.map((net) => (
              <div 
                key={net.name}
                onClick={() => setActiveNetwork(net.name)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                  activeNetwork === net.name 
                    ? 'bg-[var(--st-color-primary)]/5 border-[var(--st-color-primary)]/50 shadow-[0_0_15px_var(--st-color-glow)]' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base group-hover:scale-110 transition-transform">{net.icon}</span>
                    <span className="font-headline font-bold text-sm text-white">{net.name}</span>
                  </div>
                  <span className={`font-headline font-bold text-xs ${activeNetwork === net.name ? 'text-[var(--st-color-primary)]' : 'text-white'}`}>{net.gas}</span>
                </div>
                <div className="flex items-center justify-between text-[9px] font-headline font-bold uppercase tracking-wider text-on-surface-variant/40">
                  <span>{net.status}</span>
                  <span className={net.name === 'Solana' ? 'text-green-400' : ''}>{net.name === 'Solana' ? 'Fastest' : 'Stable'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tools & Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Block Explorer', icon: <Box size={20} />, color: 'blue-400', desc: 'Trace transactions and protocol states.' },
          { title: 'Contract Debug', icon: <Code size={20} />, color: 'emerald-400', desc: 'Simulate smart contract executions.' },
          { title: 'Governance', icon: <ShieldCheck size={20} />, color: 'purple-400', desc: 'Participate in network consensus.' },
          { title: 'Asset Bridge', icon: <ArrowUpRight size={20} />, color: 'orange-400', desc: 'Transfer assets across protocol grids.' }
        ].map((tool) => (
          <div key={tool.title} className="glass-card p-6 rounded-3xl group cursor-pointer border-white/5 hover:border-[var(--st-color-primary)]/30">
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-5 text-${tool.color} group-hover:scale-110 transition-all shadow-inner`}>
              {tool.icon}
            </div>
            <h3 className="font-headline font-bold text-white text-sm mb-2 flex items-center justify-between">
              {tool.title}
              <ExternalLink size={14} className="text-on-surface-variant/20 group-hover:text-white transition-all" />
            </h3>
            <p className="text-[10px] font-medium text-on-surface-variant/60 leading-relaxed">{tool.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Smart Contract Sandbox Teaser */}
          <section className="glass-panel rounded-3xl border-white/5 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--st-gradient-primary)]"></div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.2em]">Secure Environment</span>
                <h3 className="text-xl font-headline font-bold text-white mt-1 flex items-center gap-2">
                  <Cpu size={20} className="text-[var(--st-color-primary)]" />
                  Contract Sandbox
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-headline font-bold text-emerald-400 uppercase tracking-widest px-2 py-1 rounded bg-emerald-400/10 border border-emerald-400/20">Read-Only</span>
                <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-on-surface-variant">
                  <Lock size={16} />
                </button>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 font-mono text-[11px] overflow-x-auto relative">
              <div className="absolute top-4 right-4 text-white/5 select-none">SOLC 0.8.20</div>
              <div className="flex gap-4 mb-4 border-b border-white/5 pb-4">
                <span className="text-emerald-500">contract</span>
                <span className="text-blue-400">PixoraAccess</span>
                <span className="text-emerald-500">is</span>
                <span className="text-blue-400">ERC721, Ownable</span>
                <span className="text-white/60">{`{`}</span>
              </div>
              <div className="pl-6 space-y-2 text-white/80">
                <p><span className="text-purple-400">uint256</span> <span className="text-blue-300">public constant</span> MAX_SUPPLY = <span className="text-orange-400">1000</span>;</p>
                <p><span className="text-purple-400">mapping</span>(address ={`>`} <span className="text-purple-400">bool</span>) <span className="text-blue-300">public</span> hasAccess;</p>
                <br />
                <p><span className="text-emerald-500">function</span> <span className="text-yellow-400">mintAccessCard</span>(address _to) <span className="text-purple-400">external</span> onlyOwner {`{`}</p>
                <p className="pl-6 text-on-surface-variant/40 italic">// Implementation for minting logic here...</p>
                <p className="pl-6">_safeMint(_to, nextTokenId);</p>
                <p className="text-white/60">{`}`}</p>
              </div>
              <div className="mt-6 border-t border-white/5 pt-4 text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest">
                Status: Compilation Successful • Coverage 100%
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="btn-primary !bg-emerald-500 !text-black !px-8 !py-2.5 !text-xs !rounded-xl shadow-emerald-500/20">Deploy Instance</button>
              <button className="btn-outline !px-8 !py-2.5 !text-xs !rounded-xl">Reset Environment</button>
            </div>
          </section>

          {/* Activity Feed */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <BarChart3 size={18} className="text-[var(--st-color-primary)]" />
              <h3 className="font-headline font-bold text-white text-base">Ledger Activity</h3>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:border-[var(--st-color-primary)]/30 transition-all border-white/5">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-[var(--st-color-primary)]/20 transition-colors">
                      <RefreshCw size={20} className="text-on-surface-variant/40 group-hover:text-[var(--st-color-primary)] transition-colors" />
                    </div>
                    <div>
                      <p className="font-headline font-bold text-white text-sm tracking-wide">{tx.type}</p>
                      <p className="text-[10px] font-mono text-on-surface-variant/40 mt-0.5">{tx.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-headline font-bold uppercase tracking-[0.15em] text-green-400 bg-green-400/5 border border-green-400/10 px-2 py-1 rounded-lg">Verified</span>
                    <p className="text-[10px] font-medium text-on-surface-variant/40 mt-1.5">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-10">
          <div className="glass-panel p-8 rounded-3xl border-white/5 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--st-color-primary)]/5 blur-3xl rounded-full"></div>
            <h3 className="font-headline font-bold text-white text-sm uppercase tracking-widest">Protocol Metrics</h3>
            <div className="space-y-6">
              {[
                { label: 'NFT Certificates', value: '12', icon: <Award size={14} /> },
                { label: 'Skill Attestations', value: '08', icon: <Target size={14} /> },
                { label: 'DAO Participation', value: '03', icon: <Users size={14} /> }
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="text-on-surface-variant/40 group-hover:text-[var(--st-color-primary)] transition-colors">{item.icon}</span>
                    <span className="text-xs font-medium text-on-surface-variant/60">{item.label}</span>
                  </div>
                  <span className="font-headline font-bold text-lg text-white group-hover:text-[var(--st-color-primary)] transition-colors">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="pt-8 border-t border-white/5">
              <button className="w-full btn-outline !text-[10px] !py-3 !rounded-xl !tracking-[0.15em]">
                EXPORT PROTOCOL CV
              </button>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-[var(--st-color-primary)] opacity-5 group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
              <ShieldCheck size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="font-headline font-bold text-white text-base mb-2">System Audit</h3>
              <p className="text-xs text-on-surface-variant/60 mb-8 leading-relaxed">Your smart contract architectures are currently under continuous AI-driven security analysis.</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end text-[10px] font-headline font-bold uppercase tracking-widest">
                  <span className="text-emerald-400">Security Score</span>
                  <span className="text-white">78%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[78%] shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                </div>
              </div>
              
              <p className="text-[9px] font-headline font-bold text-emerald-400 uppercase tracking-[0.1em] mt-4 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                Secure • No High Vulnerabilities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainHub;
