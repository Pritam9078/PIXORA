import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/common/Logo";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const TECH_STACK = [
  "Solidity", "Unreal Engine 5", "Unity", "Rust",
  "Go-lang", "Smart Contracts", "Zero Knowledge", "C++"
];

const DAYS = [
  { label: "MON", hours: "4h", active: false },
  { label: "TUE", hours: "6h", active: true },
  { label: "WED", hours: "6h", active: true },
  { label: "THU", hours: "2h", active: false },
  { label: "FRI", hours: "4h", active: true },
  { label: "SAT", hours: "--", active: false, disabled: true },
  { label: "SUN", hours: "--", active: false, disabled: true },
];

const TEACHING_OPTIONS = [
  { label: "Live Virtual Classes", desc: "Available for synchronous streaming sessions." },
  { label: "1:1 Mentorship", desc: "Provide direct career guidance to students." },
  { label: "Curriculum Design", desc: "Expertise in building technical syllabi." },
  { label: "Project Evaluation", desc: "Assessing and grading student technical submissions." },
];

export default function InstructorApplicationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedTech, setSelectedTech] = useState(["Solidity"]);
  const [activeDays, setActiveDays] = useState(
    DAYS.reduce((acc, d) => ({ ...acc, [d.label]: d.active }), {})
  );
  const [teachingChecks, setTeachingChecks] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // File states
  const [profilePic, setProfilePic] = useState(null);
  const [resume, setResume] = useState(null);
  const [portfolio, setPortfolio] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Add password for new users
    phone: "",
    country: "",
    yearsActive: "",
    organization: "",
    rank: "",
    motivation: "",
    github: "",
    linkedin: "",
    website: "",
    portfolioVideo: ""
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.user_metadata?.full_name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const toggleTech = (tech) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const toggleDay = (label) => {
    setActiveDays((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError("You must agree to the Pixora Faculty Agreement and Privacy Protocol.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    const uploadFile = async (file, path) => {
      if (!file) return null;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;
      
      const { error } = await supabase.storage.from('pixora-applications').upload(filePath, file);
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from('pixora-applications').getPublicUrl(filePath);
      return publicUrl;
    };

    try {
      let currentUserId = user?.id;

      // If user is not logged in, create an account first
      if (!user) {
        if (!formData.password || formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        const { data: signUpData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              role: 'student' // They sign up as student first, then apply for instructor
            }
          }
        });

        if (authError) throw authError;
        if (!signUpData?.user) {
          throw new Error('Sign up failed. Please check your email and try again.');
        }
        currentUserId = signUpData.user.id;
      }

      setUploadProgress(20);
      
      // Upload files
      let profileUrl = null;
      let resumeUrl = null;
      let portfolioUrl = null;
      
      if (profilePic) profileUrl = await uploadFile(profilePic, `${currentUserId}/profile`);
      if (resume) resumeUrl = await uploadFile(resume, `${currentUserId}/resume`);
      if (portfolio) portfolioUrl = await uploadFile(portfolio, `${currentUserId}/portfolio`);
      
      setUploadProgress(80);

      const { error: appError } = await supabase
        .from('applications')
        .insert({
          student_id: currentUserId,
          role_requested: 'instructor',
          status: 'Submitted',
          details: {
            phone: formData.phone,
            country: formData.country,
            focus_area: focus,
            years_active: formData.yearsActive,
            organization: formData.organization,
            rank: formData.rank,
            specializations: selectedTech,
            motivation: formData.motivation,
            github: formData.github,
            linkedin: formData.linkedin,
            website: formData.website,
            portfolio_video: formData.portfolioVideo,
            teaching_options: Object.keys(teachingChecks).filter(k => teachingChecks[k]),
            availability: activeDays,
            profile_image_url: profileUrl,
            resume_url: resumeUrl,
            portfolio_pdf_url: portfolioUrl
          }
        });

      if (appError) throw appError;

      setUploadProgress(100);
      setSubmitted(true);
      setTimeout(() => navigate('/application/success', { state: { role: 'instructor' } }), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051424] text-[#d5e4fa] font-body relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary-container/10 via-[#051424]/0 to-transparent pointer-events-none"></div>
      
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-8 md:px-12 shrink-0 relative z-10 border-b border-white/5">
        <Link to="/" className="flex items-center">
          <Logo height={32} />
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-slate-500">
            <span className="text-[10px] font-headline uppercase tracking-widest">Protocol:</span>
            <span className="text-secondary-container text-[10px] font-headline uppercase tracking-widest">Faculty_V4.2</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto relative z-10">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-headline text-[10px] uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Return to Previous
        </button>
        
        {/* Title */}
        <div className="mb-12 text-center">
          <h1 className="font-headline text-4xl text-white uppercase tracking-tighter leading-tight mb-2">
            INSTRUCTOR <span className="text-secondary-container">AUTHORIZATION</span>
          </h1>
          <p className="text-slate-400 font-body text-sm max-w-lg mx-auto">
            Join the elite rank of Pixora educators. Submit your credentials for terminal access to shape the future of Web3 and Game Tech.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container/20 border border-error-container/30 text-error text-[10px] font-headline uppercase tracking-widest flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        {submitted && (
          <div className="mb-8 p-4 bg-secondary-container/10 border border-secondary-container/30 text-secondary-container text-[10px] font-headline uppercase tracking-widest flex items-center gap-3">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Data stream transmitted. A Pixora Admin will process your clearance within 72 hours.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: BASIC INFO */}
          <Section icon="fingerprint" title="Personnel Data">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <Label>Profile Upload</Label>
                <div className="relative w-full aspect-square max-w-[160px] mx-auto mt-2 group">
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all bg-white/5 border border-white/10 group-hover:border-secondary-container group-hover:bg-white/10 overflow-hidden relative">
                    <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={(e) => setProfilePic(e.target.files[0])} />
                    {profilePic ? (
                      <div className="flex flex-col items-center text-center p-2">
                        <span className="material-symbols-outlined text-3xl mb-2 text-secondary-container">check_circle</span>
                        <span className="font-headline text-[10px] text-white uppercase tracking-widest truncate w-full px-2">{profilePic.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-3xl mb-2 text-slate-500 group-hover:text-secondary-container transition-colors">add_a_photo</span>
                        <span className="font-headline text-[10px] text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">UPLOAD JPG/PNG</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className="md:col-span-2 space-y-4">
                <div>
                  <Label>Full Name / Alias</Label>
                  <Input placeholder="E.G. ALEX STERLING" type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Neural Link (Email)</Label>
                    <Input placeholder="ALEX@PIXORA.ACADEMY" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Comms Channel (Phone)</Label>
                    <Input placeholder="+1 (555) 000-0000" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                {!user && (
                  <div>
                    <Label>Secure Protocol (Password)</Label>
                    <Input placeholder="••••••••••••" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                  </div>
                )}
                <div>
                  <Label>Operational Sector (Country)</Label>
                  <div className="relative">
                    <select 
                      className="w-full bg-white/5 border border-white/10 focus:border-secondary-container focus:bg-white/10 text-white px-4 py-3 focus:ring-0 transition-all font-body text-sm appearance-none cursor-pointer uppercase tracking-wider"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      required
                    >
                      <option value="" disabled className="bg-[#051424]">SELECT REGION</option>
                      <option value="US" className="bg-[#051424]">UNITED STATES</option>
                      <option value="UK" className="bg-[#051424]">UNITED KINGDOM</option>
                      <option value="DE" className="bg-[#051424]">GERMANY</option>
                      <option value="SG" className="bg-[#051424]">SINGAPORE</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* SECTION 2: PROFESSIONAL DETAILS */}
          <Section icon="work" title="Operational History">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <Label>Primary Designation (Focus Area)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {["Blockchain Lab", "Game Development"].map((opt) => (
                    <label key={opt} className={`flex items-center gap-3 p-4 cursor-pointer transition-all border ${focus === opt ? 'border-secondary-container bg-secondary-container/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                      <input
                        type="radio"
                        name="focus"
                        value={opt}
                        onChange={() => setFocus(opt)}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 border flex items-center justify-center ${focus === opt ? 'border-secondary-container' : 'border-slate-500'}`}>
                        {focus === opt && <div className="w-2 h-2 bg-secondary-container" />}
                      </div>
                      <span className={`font-headline text-xs uppercase tracking-widest ${focus === opt ? 'text-secondary-container' : 'text-slate-400'}`}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>Years Active</Label>
                <Input placeholder="E.G. 8" type="number" value={formData.yearsActive} onChange={(e) => setFormData({...formData, yearsActive: e.target.value})} required />
              </div>
              <div>
                <Label>Current Organization</Label>
                <Input placeholder="ORG NAME" type="text" value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} required />
              </div>
              <div className="sm:col-span-2">
                <Label>Current Rank / Role</Label>
                <Input placeholder="E.G. SENIOR SMART CONTRACT ENGINEER" type="text" value={formData.rank} onChange={(e) => setFormData({...formData, rank: e.target.value})} required />
              </div>
            </div>
          </Section>

          {/* SECTION 3: SKILLS */}
          <Section icon="terminal" title="Tech Stack & Expertise">
            <div className="space-y-4">
              <Label>Core Frameworks (Select all that apply)</Label>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.map((tech) => {
                  const active = selectedTech.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTech(tech)}
                      className={`px-4 py-2 font-headline text-[10px] uppercase tracking-widest transition-all border ${active ? 'border-secondary-container bg-secondary-container/10 text-secondary-container' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/30 hover:text-white'}`}
                    >
                      {tech}
                    </button>
                  );
                })}
                <button type="button" className="flex items-center gap-1 px-4 py-2 font-headline text-[10px] uppercase tracking-widest border border-dashed border-white/20 text-slate-500 hover:text-white hover:border-white/50 transition-colors">
                  <span className="material-symbols-outlined text-[12px]">add</span> CUSTOM
                </button>
              </div>
            </div>
            <div className="mt-6">
              <Label>What makes you a top 1% instructor?</Label>
              <textarea
                className="w-full bg-white/5 border border-white/10 focus:border-secondary-container focus:bg-white/10 text-white p-4 focus:ring-0 transition-all font-body text-sm resize-none mt-2 placeholder:text-white/20"
                placeholder="DESCRIBE YOUR VISION AND METHODOLOGY..."
                rows={4}
                value={formData.motivation}
                onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                required
              />
            </div>
          </Section>

          {/* SECTION 4: PORTFOLIO */}
          <Section icon="link" title="Digital Footprint">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "data_object", ph: "GITHUB PROFILE URL", field: "github" },
                { icon: "public", ph: "LINKEDIN PROFILE URL", field: "linkedin" },
                { icon: "language", ph: "PERSONAL TERMINAL (WEBSITE)", field: "website" },
                { icon: "video_library", ph: "YOUTUBE / PORTFOLIO VIDEO", field: "portfolioVideo" },
              ].map(({ icon, ph, field }) => (
                <div key={ph} className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-slate-500">{icon}</span>
                  <input
                    type="url"
                    placeholder={ph}
                    value={formData[field]}
                    onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 focus:border-secondary-container focus:bg-white/10 text-white pl-12 pr-4 py-3 focus:ring-0 transition-all font-body text-xs placeholder:text-white/20 uppercase tracking-wider"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-white/5 border border-dashed border-white/20 hover:border-secondary-container hover:bg-white/10 group">
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files[0])} />
                <span className={`material-symbols-outlined text-2xl ${resume ? 'text-secondary-container' : 'text-slate-500 group-hover:text-secondary-container'}`}>upload_file</span>
                <div className="text-center px-2 overflow-hidden w-full">
                  <p className="font-headline text-xs text-white uppercase tracking-widest truncate">{resume ? resume.name : 'Upload Resume/CV'}</p>
                  <p className="font-headline text-[9px] text-slate-500 uppercase tracking-widest mt-1">PDF, DOCX (MAX 10MB)</p>
                </div>
              </label>
              
              <label className="p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-white/5 border border-dashed border-white/20 hover:border-secondary-container hover:bg-white/10 group">
                <input type="file" className="hidden" accept=".pdf" onChange={(e) => setPortfolio(e.target.files[0])} />
                <span className={`material-symbols-outlined text-2xl ${portfolio ? 'text-secondary-container' : 'text-slate-500 group-hover:text-secondary-container'}`}>description</span>
                <div className="text-center px-2 overflow-hidden w-full">
                  <p className="font-headline text-xs text-white uppercase tracking-widest truncate">{portfolio ? portfolio.name : 'Portfolio PDF'}</p>
                  <p className="font-headline text-[9px] text-slate-500 uppercase tracking-widest mt-1">CASE STUDIES, PROJECTS</p>
                </div>
              </label>
            </div>
          </Section>

          {/* SECTION 5: TEACHING */}
          <Section icon="cast_for_education" title="Deployment Parameters">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {TEACHING_OPTIONS.map(({ label, desc }) => (
                <label key={label} className={`flex items-start gap-4 p-4 cursor-pointer transition-all border ${teachingChecks[label] ? 'border-secondary-container bg-secondary-container/5' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={!!teachingChecks[label]}
                    onChange={() => setTeachingChecks((prev) => ({ ...prev, [label]: !prev[label] }))}
                  />
                  <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 ${teachingChecks[label] ? 'border-secondary-container bg-secondary-container text-black' : 'border-slate-500'}`}>
                    {teachingChecks[label] && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                  </div>
                  <div>
                    <p className={`font-headline text-xs uppercase tracking-widest mb-1 ${teachingChecks[label] ? 'text-secondary-container' : 'text-white'}`}>{label}</p>
                    <p className="font-body text-[11px] text-slate-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="pt-6 border-t border-white/5">
              <Label>Uplink Availability (Standard Week)</Label>
              <div className="grid grid-cols-7 gap-2 mt-4">
                {DAYS.map(({ label, hours, disabled }) => {
                  const isActive = activeDays[label];
                  return (
                    <button
                      key={label}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && toggleDay(label)}
                      className={`flex flex-col items-center justify-center p-3 transition-all border ${isActive ? 'border-secondary-container bg-secondary-container/10' : disabled ? 'border-white/5 bg-transparent opacity-30 cursor-not-allowed' : 'border-white/10 bg-white/5 hover:border-white/30 cursor-pointer'}`}
                    >
                      <span className={`font-headline text-[10px] uppercase tracking-widest ${isActive ? 'text-secondary-container' : 'text-slate-500'}`}>{label}</span>
                      <span className={`font-mono text-xs mt-1 ${isActive ? 'text-white' : 'text-slate-600'}`}>{hours}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          {/* SECTION 6: VERIFICATION */}
          <Section icon="verified_user" title="Security Vetting">
            <div className="p-4 mb-6 flex items-start gap-3 bg-secondary-container/10 border border-secondary-container/20">
              <span className="material-symbols-outlined text-secondary-container text-lg">admin_panel_settings</span>
              <p className="font-body text-xs text-slate-300">
                End-to-end encryption active. Your identification documents are only used for protocol vetting and are never exposed publicly.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: "badge", label: "Government Issued ID", cta: "UPLOAD CREDENTIALS" },
                { icon: "face", label: "Biometric Scan", cta: "INITIALIZE CAMERA" },
              ].map(({ icon, label, cta }) => (
                <div key={label} className="space-y-2">
                  <Label>{label}</Label>
                  <div className="h-32 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#051424] border border-dashed border-white/20 hover:border-secondary-container group">
                    <span className="material-symbols-outlined text-2xl mb-2 text-slate-500 group-hover:text-secondary-container">{icon}</span>
                    <span className="font-headline text-[9px] text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">{cta}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* SECTION 7: AGREEMENT */}
          <div className="pt-4 space-y-8">
            <label className="flex items-start gap-4 cursor-pointer group">
              <input
                type="checkbox"
                className="hidden"
                checked={agreed}
                onChange={() => setAgreed((v) => !v)}
              />
              <div className={`mt-0.5 w-5 h-5 border flex items-center justify-center shrink-0 transition-colors ${agreed ? 'border-secondary-container bg-secondary-container text-black' : 'border-slate-500 group-hover:border-white'}`}>
                {agreed && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
              </div>
              <p className="font-body text-xs text-slate-400 leading-relaxed">
                I certify that all telemetry provided is accurate and that I am cleared to instruct the protocols listed. I agree to the{" "}
                <a href="#" className="text-secondary-container hover:underline decoration-secondary-container/50">Pixora Faculty Agreement</a>
                {" "}and{" "}
                <a href="#" className="text-secondary-container hover:underline decoration-secondary-container/50">Privacy Protocol</a>.
              </p>
            </label>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
              <button
                type="button"
                className="w-full sm:w-auto px-6 py-3 font-headline text-[10px] uppercase tracking-widest text-slate-400 hover:text-white transition-colors border border-white/10 hover:border-white/30 bg-transparent flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">archive</span>
                Save Draft
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto group relative overflow-hidden bg-secondary-container text-black px-10 py-3 font-headline text-[12px] font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(195,244,0,0.4)] active:scale-[0.98] flex items-center justify-center disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'TRANSMITTING...' : 'Submit Credentials'}
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out"></div>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

// ── Reusable Sub-Components ──────────────────────────────────────

function Section({ icon, title, children }) {
  return (
    <section className="p-6 sm:p-8 bg-white/5 backdrop-blur-md border border-white/10 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-secondary-container opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <h2 className="font-headline text-lg uppercase tracking-tight text-white mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-secondary-container">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Label({ children }) {
  return (
    <label className="block font-headline text-[10px] text-slate-500 uppercase tracking-widest mb-2">
      {children}
    </label>
  );
}

function Input({ placeholder, type = "text", value, onChange, required }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full bg-white/5 border border-white/10 focus:border-secondary-container focus:bg-white/10 text-white px-4 py-3 focus:ring-0 transition-all font-body text-sm placeholder:text-white/20"
    />
  );
}
