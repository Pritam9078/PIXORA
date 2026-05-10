import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Target, Users, FileUser, 
  ChevronRight, Star, Map, ShieldCheck, 
  ExternalLink, Search, Filter, Sparkles,
  Award, TrendingUp, Building2, MapPin, MousePointer2,
  Lock, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { toast } from 'react-hot-toast';
import CareerService from '../../services/CareerService';

const CareerHub = () => {
  const { profile } = useAuth();
  const { currentTheme } = useStudentTheme();
  const [activeTab, setActiveTab] = useState('opportunities');
  const [loading, setLoading] = useState(true);
  const [skillTree, setSkillTree] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [readiness, setReadiness] = useState({ readinessScore: 0, verifiedRoles: 0, analysisDetails: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCV = async () => {
    try {
      setIsGenerating(true);
      toast.loading('Aggregating knowledge milestones...', { id: 'cv-gen' });
      
      await new Promise(r => setTimeout(r, 1500));
      toast.loading('Synchronizing verified credentials...', { id: 'cv-gen' });
      
      await new Promise(r => setTimeout(r, 1500));
      toast.loading('Architecting high-fidelity CV layout...', { id: 'cv-gen' });
      
      await new Promise(r => setTimeout(r, 1500));
      toast.success('Professional Identity Matrix generated!', { id: 'cv-gen' });
      
      // In a real app, this would trigger a PDF download or navigate to a preview page
      toast.success('Downloading verified PDF...', { duration: 4000 });
    } catch (error) {
      toast.error('Identity synthesis failed. Re-syncing node...', { id: 'cv-gen' });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const fetchCareerData = async () => {
      if (!profile?.id) return;
      try {
        setLoading(true);
        const [progression, analysis, opportunities] = await Promise.all([
          CareerService.getTechProgression(profile.id),
          CareerService.getReadinessAnalysis(profile.id),
          CareerService.getOpportunities()
        ]);
        setSkillTree(progression);
        setReadiness(analysis);
        setJobs(opportunities);
      } catch (error) {
        console.error('Error fetching career data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCareerData();
  }, [profile?.id]);

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[var(--st-color-primary)] animate-spin" />
        <p className="text-on-surface-variant/40 font-headline font-bold text-[10px] uppercase tracking-[0.2em]">Synchronizing Professional Trajectory...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Career Overview Hero */}
      <div className="glass-panel rounded-[40px] border-white/5 p-12 overflow-hidden relative group">
        <div className="absolute inset-0 circuit-bg opacity-[0.03]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--st-color-primary)] opacity-5 blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div>
              <span className="font-headline text-[10px] font-bold text-[var(--st-color-primary)] uppercase tracking-[0.25em] px-3 py-1.5 rounded-lg bg-[var(--st-color-primary)]/10 border border-[var(--st-color-primary)]/20 mb-4 inline-block shadow-[0_0_15px_var(--st-color-glow)]">
                Professional Matrix
              </span>
              <h1 className="text-4xl md:text-6xl font-headline font-bold text-white leading-[1.1]">Architect Your <span className="text-[var(--st-color-primary)] drop-shadow-[0_0_15px_var(--st-color-glow)]">Trajectory</span></h1>
            </div>
            <p className="text-on-surface-variant/60 text-lg max-w-xl font-medium leading-relaxed">
              Your learning milestones are the foundation of your industry impact. Track your technical mastery and synchronize with global lead opportunities.
            </p>
            <div className="flex flex-wrap gap-5 pt-4">
              <button 
                onClick={handleGenerateCV}
                disabled={isGenerating}
                className={`btn-primary !px-10 !py-4 !rounded-2xl !text-sm ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <FileUser size={20} />}
                <span>{isGenerating ? 'Generating...' : 'Generate Verified CV'}</span>
              </button>
              <button className="btn-outline !px-10 !py-4 !rounded-2xl !text-sm">
                <Target size={20} />
                <span>Mission Roadmap</span>
              </button>
            </div>
          </div>
          
          <div className="glass-card backdrop-blur-3xl border-white/10 p-10 rounded-[32px] w-full lg:w-96 text-center space-y-8 shadow-2xl relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl glass-panel border-white/10 flex items-center justify-center text-[var(--st-color-primary)]">
               <TrendingUp size={24} />
            </div>
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-[6px] border-[var(--st-color-primary)]/20 relative group/score">
              <div className="absolute inset-0 border-[6px] border-[var(--st-color-primary)] rounded-full border-t-transparent animate-spin duration-[3s]"></div>
              <span className="text-3xl font-headline font-bold text-white drop-shadow-[0_0_10px_var(--st-color-glow)] italic">{readiness.readinessScore}%</span>
              <div className="absolute -top-1 -right-1 w-10 h-10 rounded-xl bg-[var(--st-color-primary)] text-black flex items-center justify-center shadow-[0_0_20px_var(--st-color-glow)] group-hover/score:scale-110 transition-transform">
                <Sparkles size={20} fill="currentColor" />
              </div>
            </div>
            <div>
              <h3 className="font-headline font-bold text-white text-lg tracking-wide">Industry Readiness</h3>
              <p className="text-[11px] font-medium text-on-surface-variant/60 mt-2 uppercase tracking-[0.1em]">Verified for {readiness.verifiedRoles} protocol-aligned roles</p>
            </div>
            <button className="w-full btn-outline !text-[9px] !py-3.5 !rounded-xl !tracking-[0.2em]" title={readiness.analysisDetails}>ANALYSIS DETAILS</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Skill Tree & Mentorship */}
        <div className="space-y-12">
          {/* Skill Tree */}
          <section className="space-y-8">
            <h3 className="text-sm font-headline font-bold text-white flex items-center gap-3 px-2 uppercase tracking-[0.25em]">
              <Map size={18} className="text-[var(--st-color-primary)]" />
              Tech progression
            </h3>
            <div className="space-y-5">
              {skillTree.map((node) => (
                <div 
                  key={node.name} 
                  className={`p-6 rounded-[24px] border transition-all duration-500 relative group ${
                    node.status === 'locked' 
                    ? 'bg-black/40 border-white/5 grayscale opacity-30' 
                    : 'glass-card border-white/5 hover:border-[var(--st-color-primary)]/30'
                  }`}
                >
                  {node.status === 'in-progress' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-[var(--st-gradient-primary)] rounded-full shadow-[0_0_10px_var(--st-color-glow)]"></div>
                  )}
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h4 className="font-headline font-bold text-white text-sm tracking-wide mb-1">{node.name}</h4>
                      <p className={`text-[9px] font-headline font-bold uppercase tracking-widest ${node.status === 'completed' ? 'text-emerald-400' : 'text-on-surface-variant/40'}`}>
                        Protocol Level {node.level}
                      </p>
                    </div>
                    {node.status === 'completed' ? (
                      <ShieldCheck size={20} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" />
                    ) : node.status === 'locked' ? (
                      <Lock size={16} className="text-white/10" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[var(--st-color-primary)] animate-pulse shadow-[0_0_8px_var(--st-color-glow)]"></div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {node.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-on-surface-variant/60 group-hover:text-white transition-colors">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Mentorship */}
          <section className="glass-panel p-8 rounded-[32px] border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-[var(--st-color-primary)] opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-1000">
              <Users size={140} />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-headline font-bold text-[var(--st-color-primary)] uppercase tracking-widest mb-2 block">Direct Access</span>
              <h3 className="text-xl font-headline font-bold text-white mb-3">Industry Mentors</h3>
              <p className="text-xs text-on-surface-variant/60 mb-8 leading-relaxed">Synchronize with veterans from 50+ partner studios and protocol labs.</p>
              <div className="flex -space-x-4 mb-10 pl-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-14 h-14 rounded-2xl border-[4px] border-[#0d1c2d] overflow-hidden shadow-2xl relative group/avatar">
                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="" className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform" />
                  </div>
                ))}
                <div className="w-14 h-14 rounded-2xl border-[4px] border-[#0d1c2d] bg-white/5 backdrop-blur-xl flex items-center justify-center text-[10px] font-headline font-black text-white shadow-2xl">
                  +45
                </div>
              </div>
              <button className="w-full btn-outline !text-[9px] !py-4 !rounded-[20px] !tracking-[0.2em] group/btn">
                <span>INITIALIZE REQUEST</span>
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Opportunities Board */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl border-white/5">
              {['opportunities', 'applied', 'saved'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-headline font-bold uppercase tracking-[0.2em] transition-all ${
                    activeTab === t 
                    ? 'bg-[var(--st-color-primary)] text-black shadow-[0_0_15px_var(--st-color-glow)]' 
                    : 'text-on-surface-variant/40 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="text" 
                  placeholder="Scan protocols..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full glass-card border-white/5 rounded-2xl py-3 pl-12 pr-4 text-[11px] font-medium text-white focus:outline-none focus:border-[var(--st-color-primary)]/40 placeholder:text-white/10" 
                />
              </div>
              <button className="w-12 h-12 rounded-2xl glass-panel border-white/5 text-on-surface-variant/40 flex items-center justify-center hover:text-white hover:border-white/10 transition-all">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="glass-card p-10 rounded-[40px] border-white/5 hover:border-[var(--st-color-primary)]/30 transition-all group cursor-pointer shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--st-color-primary)]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex flex-col md:flex-row gap-10 items-start md:items-center relative z-10">
                  <div className="w-24 h-24 rounded-[28px] bg-white p-5 flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:scale-105 transition-all shadow-inner">
                    <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-4">
                      <h3 className="text-2xl font-headline font-bold text-white group-hover:text-[var(--st-color-primary)] transition-all tracking-tight">{job.title}</h3>
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[9px] font-headline font-bold uppercase tracking-[0.2em] border border-emerald-500/20">PREMIUM ROLE</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-y-3 gap-x-8 text-[11px] font-medium text-on-surface-variant/40">
                      <div className="flex items-center gap-2 group-hover:text-white transition-colors">
                        <Building2 size={16} className="text-[var(--st-color-primary)]" />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400">
                        <TrendingUp size={16} />
                        {job.salary}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5 pt-3">
                      {job.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="btn-outline !px-10 !py-4 !rounded-2xl !text-[10px] !tracking-[0.2em] w-full md:w-auto">
                    TRANSMISSION DETAILS
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Partner Labs', value: '12', icon: <Award className="text-blue-500" />, color: 'blue-500' },
              { label: 'Hires/Mo', value: '150+', icon: <TrendingUp className="text-emerald-500" />, color: 'emerald-500' },
              { label: 'Success Rate', value: '85%', icon: <Users className="text-purple-500" />, color: 'purple-500' }
            ].map(stat => (
              <div key={stat.label} className="glass-card p-10 rounded-[32px] border-white/5 flex flex-col items-center gap-6 text-center group hover:border-[var(--st-color-primary)]/20 transition-all">
                <div className={`w-16 h-16 rounded-2xl bg-${stat.color}/5 border border-${stat.color}/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                   {React.cloneElement(stat.icon, { size: 32 })}
                </div>
                <div>
                  <p className="text-3xl font-headline font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] mb-1">{stat.value}</p>
                  <p className="text-[9px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.25em]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerHub;
