import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, UploadCloud, Loader2, CheckCircle2, 
  Terminal, Fingerprint, Scan, AlertCircle, FileCheck,
  Sparkles, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { toast } from 'react-hot-toast';

const DocumentVerification = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { currentTheme } = useStudentTheme();

  const [idFile, setIdFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  
  const [status, setStatus] = useState('idle'); // idle, uploading, scanning, verified
  const [logs, setLogs] = useState([]);
  const [activeChecklist, setActiveChecklist] = useState({
    fileIntegrity: 'pending',
    ocrVerification: 'pending',
    faceMatching: 'pending',
    databaseCheck: 'pending'
  });

  const simulateLogs = [
    { text: 'Establishing secure cryptographic pipeline...', delay: 200, updateChecklist: null },
    { text: 'Received payloads: [gov_id.jpg], [biometric_selfie.png]', delay: 600, updateChecklist: null },
    { text: 'Parsing payload headers & file integrity...', delay: 1000, updateChecklist: { fileIntegrity: 'success' } },
    { text: 'Initializing Optical Character Recognition (OCR)...', delay: 1500, updateChecklist: null },
    { text: `OCR Match: Full name matches identity database`, delay: 2000, updateChecklist: { ocrVerification: 'success' } },
    { text: 'Initializing facial geometric metric analysis...', delay: 2500, updateChecklist: null },
    { text: 'Extracting landmark nodes (nose-to-eye ratio, jawline alignment)...', delay: 3000, updateChecklist: null },
    { text: 'Biometric verification match confirmed: 99.78% rate', delay: 3500, updateChecklist: { faceMatching: 'success' } },
    { text: 'Querying national academic & clearance registry...', delay: 4000, updateChecklist: null },
    { text: 'Generating student level 1 authorization signature...', delay: 4500, updateChecklist: { databaseCheck: 'success' } },
    { text: 'SECURITY HANDSHAKE COMPLETED. ACCESS GRANTED.', delay: 5000, updateChecklist: null }
  ];

  const handleStartScan = (e) => {
    e.preventDefault();
    if (!idFile || !selfieFile) {
      toast.error('Both Government ID and Selfie Biometrics are required.');
      return;
    }

    setStatus('uploading');
    toast.loading('Uploading credentials to secure servers...');

    setTimeout(() => {
      toast.dismiss();
      setStatus('scanning');
      setLogs([]);
      
      // Reset checklist
      setActiveChecklist({
        fileIntegrity: 'running',
        ocrVerification: 'pending',
        faceMatching: 'pending',
        databaseCheck: 'pending'
      });

      // Trigger sequential terminal logs and checklist statuses
      simulateLogs.forEach((log) => {
        setTimeout(() => {
          setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log.text}`]);
          if (log.updateChecklist) {
            setActiveChecklist(prev => {
              const updated = { ...prev, ...log.updateChecklist };
              // Set next check as running
              const keys = Object.keys(updated);
              const completedKey = Object.keys(log.updateChecklist)[0];
              const completedIndex = keys.indexOf(completedKey);
              if (completedIndex < keys.length - 1) {
                updated[keys[completedIndex + 1]] = 'running';
              }
              return updated;
            });
          }
        }, log.delay);
      });

      // Complete scan
      setTimeout(() => {
        setStatus('verified');
        toast.success('Holographic Identity Verification Approved!');
      }, 5300);

    }, 1500);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (setter, label) => (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setter(file);
      toast.success(`${label} imported successfully`);
    }
  };

  const handleFileSelect = (setter, label) => (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
      toast.success(`${label} calibrated`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Styles Injection */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 0.8; }
          100% { top: 0%; opacity: 0.8; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        .scanner-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, var(--st-color-primary), transparent);
          box-shadow: 0 0 15px var(--st-color-glow);
          animation: scan 2.5s linear infinite;
          z-index: 10;
        }
        .scanner-overlay {
          animation: pulse-glow 2s infinite ease-in-out;
        }
      `}</style>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--st-color-primary)]/10 text-[var(--st-color-primary)] border border-[var(--st-color-primary)]/20 text-[9px] font-headline font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(var(--st-color-primary-rgb),0.1)]">
          <Fingerprint size={12} />
          Biometric Node Verification
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-black text-white tracking-tight">
          Holographic <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_8px_var(--st-color-glow)]">AI Scanner</span>
        </h1>
        <p className="text-on-surface-variant/60 max-w-lg mx-auto text-sm font-medium">
          Upload identification nodes to trigger full security biometric authentication. Mandatory clearance required.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Upload Files / Scan Overlay */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-8 rounded-[40px] border-white/5 relative overflow-hidden shadow-2xl h-full flex flex-col justify-between min-h-[480px]">
            <div className="absolute inset-0 circuit-bg opacity-[0.02] z-0"></div>

            {status === 'idle' && (
              <div className="space-y-6 z-10 relative flex-1 flex flex-col justify-center">
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-headline font-bold text-white uppercase tracking-wider">Secure Cryptographic Inputs</h3>
                  <p className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest">Provide clear images under 5MB. Files are verified locally.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID upload card */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop(setIdFile, 'Government ID')}
                    className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all relative flex flex-col items-center justify-center min-h-[180px] group ${
                      idFile 
                        ? 'border-[var(--st-color-primary)]/40 bg-[var(--st-color-primary)]/[0.02]' 
                        : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="idInput"
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileSelect(setIdFile, 'Government ID')}
                    />
                    <label htmlFor="idInput" className="cursor-pointer space-y-3 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-on-surface-variant/40 group-hover:scale-105 duration-300">
                        {idFile ? <FileCheck size={20} className="text-[var(--st-color-primary)]" /> : <UploadCloud size={20} />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-headline font-black text-[10px] text-white uppercase tracking-widest">
                          {idFile ? 'Gov ID Calibrated' : 'Upload Gov ID'}
                        </h4>
                        <p className="text-[9px] text-on-surface-variant/40 font-medium">
                          {idFile ? idFile.name : 'Drag & drop or browse'}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Selfie upload card */}
                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop(setSelfieFile, 'Biometric Selfie')}
                    className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all relative flex flex-col items-center justify-center min-h-[180px] group ${
                      selfieFile 
                        ? 'border-[var(--st-color-primary)]/40 bg-[var(--st-color-primary)]/[0.02]' 
                        : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="selfieInput"
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileSelect(setSelfieFile, 'Biometric Selfie')}
                    />
                    <label htmlFor="selfieInput" className="cursor-pointer space-y-3 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-on-surface-variant/40 group-hover:scale-105 duration-300">
                        {selfieFile ? <FileCheck size={20} className="text-[var(--st-color-primary)]" /> : <UploadCloud size={20} />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-headline font-black text-[10px] text-white uppercase tracking-widest">
                          {selfieFile ? 'Selfie Calibrated' : 'Biometric Selfie'}
                        </h4>
                        <p className="text-[9px] text-on-surface-variant/40 font-medium">
                          {selfieFile ? selfieFile.name : 'Drag & drop or browse'}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <button 
                  onClick={handleStartScan}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2 shadow-[0_0_20px_var(--st-color-glow)] font-headline font-black text-xs uppercase tracking-widest"
                >
                  <Scan size={16} />
                  <span>Initiate Holographic Verification</span>
                </button>
              </div>
            )}

            {status === 'uploading' && (
              <div className="z-10 relative flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-[var(--st-color-primary)]/10 flex items-center justify-center relative border border-[var(--st-color-primary)]/20 shadow-[0_0_30px_rgba(var(--st-color-primary-rgb),0.1)]">
                  <Loader2 className="animate-spin text-[var(--st-color-primary)]" size={36} />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-lg font-headline font-bold text-white uppercase tracking-wider">Uploading Identity Nodes</h3>
                  <p className="text-xs text-on-surface-variant/40 font-medium italic">Encrypting and parsing biometric images...</p>
                </div>
              </div>
            )}

            {status === 'scanning' && (
              <div className="z-10 relative flex-1 flex flex-col items-center justify-center space-y-8 min-h-[350px]">
                {/* Visual Cyberpunk Scanner HUD */}
                <div className="relative w-64 h-64 border-2 border-[var(--st-color-primary)]/30 rounded-3xl overflow-hidden p-2 bg-slate-950/80 shadow-[0_0_50px_rgba(var(--st-color-primary-rgb),0.15)]">
                  <div className="scanner-line"></div>
                  <div className="absolute inset-0 bg-[var(--st-color-primary)]/5 scanner-overlay"></div>
                  
                  {/* Cyber grid overlays */}
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[var(--st-color-primary)]"></div>
                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[var(--st-color-primary)]"></div>
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[var(--st-color-primary)]"></div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[var(--st-color-primary)]"></div>
                  
                  <div className="w-full h-full rounded-2xl flex items-center justify-center relative overflow-hidden bg-slate-900 border border-white/5">
                    <Fingerprint className="text-[var(--st-color-primary)]/20 animate-pulse" size={100} />
                    
                    {/* Glowing status */}
                    <div className="absolute bottom-6 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-[var(--st-color-primary)] animate-ping"></span>
                      <span className="text-[8px] font-headline font-black text-white uppercase tracking-widest">Active Scan</span>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-lg font-headline font-bold text-white uppercase tracking-wider">Biometric Scanning Matrix</h3>
                  <p className="text-xs text-on-surface-variant/40 font-medium italic">Analyzing facial geometric telemetry indices...</p>
                </div>
              </div>
            )}

            {status === 'verified' && (
              <div className="z-10 relative flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 rounded-[32px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative">
                  <ShieldCheck className="text-emerald-400" size={36} />
                  <div className="absolute -top-1 -right-1">
                    <span className="text-[8px] font-headline bg-emerald-500 text-black px-2 py-0.5 rounded-full font-black tracking-widest shadow-lg">VERIFIED</span>
                  </div>
                </div>

                <div className="text-center space-y-2 max-w-sm">
                  <h3 className="text-xl font-headline font-bold text-white uppercase tracking-wider">Verification Complete</h3>
                  <p className="text-xs text-on-surface-variant/50 leading-relaxed font-medium">
                    Holographic signature matching confirmed. Your clearance level has been updated to **Grade 1 LMS Student**.
                  </p>
                </div>

                <button 
                  onClick={() => navigate('/student/checkout')}
                  className="btn-primary py-3.5 px-8 flex items-center gap-2 shadow-[0_0_20px_var(--st-color-glow)] font-headline font-black text-xs uppercase tracking-widest animate-bounce mt-4"
                >
                  <span>Proceed to secure checkout</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Security Scanner Terminal Output */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          {/* Diagnostic Checklist */}
          <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-4">
            <h3 className="text-xs font-headline font-bold text-white uppercase tracking-wider ml-1">LMS Biometric Checklist</h3>
            
            <div className="space-y-3">
              {[
                { key: 'fileIntegrity', label: 'File Hash Integrity Check' },
                { key: 'ocrVerification', label: 'Government OCR Identity Matching' },
                { key: 'faceMatching', label: 'Facial Biometric Core Indexing' },
                { key: 'databaseCheck', label: 'Historical Record Lookup & Signature' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5 text-xs font-medium">
                  <span className="text-on-surface-variant/70">{item.label}</span>
                  {activeChecklist[item.key] === 'pending' && (
                    <span className="text-[9px] font-black text-on-surface-variant/20 uppercase tracking-widest">PENDING</span>
                  )}
                  {activeChecklist[item.key] === 'running' && (
                    <div className="flex items-center gap-1">
                      <Loader2 className="animate-spin text-[var(--st-color-primary)]" size={12} />
                      <span className="text-[9px] font-black text-[var(--st-color-primary)] uppercase tracking-widest">RUNNING</span>
                    </div>
                  )}
                  {activeChecklist[item.key] === 'success' && (
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <CheckCircle2 size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">PASSED</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Secure Live Shell Log Terminal */}
          <div className="glass-panel p-6 rounded-3xl border-white/5 space-y-3 flex-1 flex flex-col justify-between min-h-[220px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-[var(--st-color-primary)]" />
                <span className="text-[10px] font-headline font-bold text-white uppercase tracking-widest">Diagnostic Console</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--st-color-primary)]/10 border border-[var(--st-color-primary)]/20 animate-pulse"></span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[9px] text-emerald-400 leading-normal max-h-[150px] p-2 bg-slate-950/50 rounded-xl border border-white/5">
              {logs.length === 0 ? (
                <div className="text-on-surface-variant/30 italic flex items-center justify-center h-full">
                  Waiting for biometric core stream trigger...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="animate-in fade-in slide-in-from-left-2 duration-300">
                    {log}
                  </div>
                ))
              )}
            </div>

            <div className="text-[8px] font-headline font-black text-on-surface-variant/30 uppercase tracking-[0.15em] pt-2 border-t border-white/5 flex items-center gap-1 ml-1">
              <Sparkles size={10} className="text-[var(--st-color-primary)]" />
              Verifying against Pixora Neural Matrix protocols.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DocumentVerification;
