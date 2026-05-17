import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Award, Shield, Cpu, RefreshCw, Layers, ExternalLink, 
  Search, Zap, Globe, Plus, CheckCircle2, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import toast from 'react-hot-toast';

const NFTCertificates = () => {
  const { data: nftLedger, loading: ledgerLoading } = useSupabaseData('nft_certificates', '*, certificates(title), profiles(full_name)');
  
  const [activeNetwork, setActiveNetwork] = useState('POLYGON_AMOY');
  const [searchQuery, setSearchQuery] = useState('');
  const [mintingToken, setMintingToken] = useState(null);

  const smartContracts = [
    { name: 'Pixora Core Certificates (SBT)', address: '0x32A46b40Ff0C8eE72605E44588eA153f5F60B8E1', type: 'ERC-5114 Soulbound', totalMinted: 142, lastGasGwei: 28 },
    { name: 'GameDev Track Achievements', address: '0x15Fa8353C49B26f0Cc60a63118E84b39A066bBE2', type: 'ERC-1155 Multi-Token', totalMinted: 94, lastGasGwei: 31 },
    { name: 'Blockchain Mentorship SBT', address: '0x88fA99d5A5B6955a1dCe0907e59b2Fe3BEE03A28', type: 'ERC-5114 Soulbound', totalMinted: 28, lastGasGwei: 27 },
  ];

  const handleMintTest = (recipient) => {
    setMintingToken(recipient);
    toast.loading('Broadcasting NFT mint transaction payload to Polygon network...');
    setTimeout(() => {
      toast.dismiss();
      toast.success(`SBT minted successfully for ${recipient}! Tx Hash: 0x51c3...d229`);
      setMintingToken(null);
    }, 2500);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight uppercase flex items-center gap-2">
              <Award className="text-[#c3f400] animate-pulse" size={24} />
              Web3 SBT Certificate Command
            </h1>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-0.5">Soulbound Token issuance, smart contract monitors & gas logs</p>
          </div>
          <div className="flex gap-2">
            {['POLYGON_AMOY', 'ETHEREUM_SEPOLIA', 'BASE_MAINNET'].map((net) => (
              <button
                key={net}
                onClick={() => setActiveNetwork(net)}
                className={`px-4 py-2 text-[9px] font-mono font-bold tracking-wider rounded-lg transition-all ${
                  activeNetwork === net 
                    ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {net}
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Minted SBTs', value: '264', trend: '+12.4%', color: 'emerald', icon: Shield },
            { label: 'Gas Cost (Average)', value: '0.0024 MATIC', trend: '-8.2%', color: 'purple', icon: Cpu },
            { label: 'Verified Smart Contracts', value: '3 Active', trend: 'Healthy', color: 'blue', icon: Layers },
            { label: 'Mint Success Rate', value: '98.8%', trend: '+0.4%', color: 'rose', icon: Zap }
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-[#111113]/60 border border-white/5 p-5 rounded-2xl flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="text-slate-500 text-[9px] font-mono uppercase tracking-wider">{card.label}</p>
                  <div className="flex items-center gap-2">
                    <h4 className="text-2xl font-bold text-white tracking-tight">{card.value}</h4>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">{card.trend}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-${card.color}-500/10 text-${card.color}-500 group-hover:scale-110 transition-all duration-300`}>
                  <Icon size={18} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Smart Contracts and Registry Deck */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Contracts List */}
          <div className="col-span-12 lg:col-span-6 bg-[#111113]/60 border border-white/5 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-[#c3f400]" />
                SBT Smart Contract Register
              </h3>
              <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider mt-1">Operational addresses deployed inside Pixora ecosystem</p>
            </div>

            <div className="space-y-4">
              {smartContracts.map((contract, i) => (
                <div key={i} className="p-4 bg-white/2 border border-white/5 hover:border-white/10 rounded-xl transition-all space-y-3 group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">{contract.name}</h4>
                      <p className="text-[9px] text-[#c3f400] font-mono uppercase tracking-wider mt-0.5">{contract.type}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">{contract.totalMinted} Minted</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#09090B] p-2.5 rounded-lg border border-white/5">
                    <span className="text-[10px] text-slate-400 font-mono select-all truncate max-w-sm">{contract.address}</span>
                    <a
                      href={`https://amoy.polygonscan.com/address/${contract.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-white transition-all ml-2"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Minting ledger tracking */}
          <div className="col-span-12 lg:col-span-6 bg-[#111113]/60 border border-white/5 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Globe size={16} className="text-blue-500" />
                Live Minting Log Ledger
              </h3>
              <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider mt-1">Real-time verification logs matching transaction records</p>
            </div>

            <div className="space-y-3">
              {ledgerLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              ) : nftLedger.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-mono text-[10px]">NO_LEDGER_ENTRIES_FOUND</div>
              ) : (
                nftLedger.map((item, i) => (
                  <div key={item.id || i} className="p-3 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between hover:border-white/10 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.profiles?.full_name || 'Unknown User'}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{new Date(item.minted_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{item.certificates?.title || 'Unknown Certificate'}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <span className={`px-2 py-0.5 text-[8px] font-bold font-mono rounded uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/10`}>
                        CONFIRMED
                      </span>
                      <p className="text-[9px] text-slate-500 font-mono">{item.tx_hash ? item.tx_hash.substring(0, 10) + '...' + item.tx_hash.substring(item.tx_hash.length - 4) : 'N/A'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/5 pt-4">
              <button
                onClick={() => handleMintTest('M. Suchismita')}
                disabled={mintingToken !== null}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#c3f400] text-black text-xs font-mono font-bold tracking-widest rounded-xl hover:bg-[#b0dc00] transition-all disabled:opacity-50"
              >
                {mintingToken ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    MINTING_TRANSACTION_QUEUE...
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    SIMULATE_MINT_PIPELINE
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
};

export default NFTCertificates;
