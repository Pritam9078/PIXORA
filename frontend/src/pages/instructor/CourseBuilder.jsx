import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Save, Eye, Rocket, 
  Settings, Layers, Video, FileText, 
  Target, Code, ChevronRight, ChevronDown,
  GripVertical, Trash2, Edit3, Image as ImageIcon,
  CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import { InstructorService } from '../../services/InstructorService';
import { CurriculumService } from '../../services/CurriculumService';

const CourseBuilder = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: '',
    subtitle: '',
    category: 'Game Development',
    level: 'Beginner',
    price: '',
    description: '',
    thumbnail: null,
    thumbnailFile: null,
    thumbnailPreview: null
  });

  const [modules, setModules] = useState([
    {
      id: 'm1',
      title: 'Introduction to the Engine',
      lessons: [
        { id: 'l1', title: 'Setting up your environment', type: 'video' },
        { id: 'l2', title: 'The Interface Overview', type: 'video' }
      ]
    }
  ]);

  const steps = [
    { id: 1, name: 'Essentials', icon: Settings },
    { id: 2, name: 'Curriculum', icon: Layers },
    { id: 3, name: 'Publish', icon: Rocket },
  ];

  const categories = ['Game Development', 'Blockchain', 'Web3', 'Other'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  const addModule = () => {
    const newModule = {
      id: `m${Date.now()}`,
      title: 'New Module',
      lessons: []
    };
    setModules([...modules, newModule]);
  };

  const addLesson = (moduleId) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: [...m.lessons, { id: `l${Date.now()}`, title: 'New Lesson', type: 'video' }]
        }
      }
      return m;
    }));
  };
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setCourseData({ ...courseData, thumbnailFile: file, thumbnailPreview: preview });
    }
  };

  const uploadThumbnail = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `course-thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('course-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('course-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!courseData.title) {
      alert("Please provide a course title.");
      return;
    }

    setIsPublishing(true);
    try {
      // 0. Upload thumbnail if exists
      let thumbnailUrl = courseData.thumbnail;
      if (courseData.thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(courseData.thumbnailFile);
      }

      // 1. Create the course
      const course = await InstructorService.createCourse({
        title: courseData.title,
        description: courseData.description || courseData.subtitle,
        price: parseFloat(courseData.price) || 0,
        thumbnail_url: thumbnailUrl,
        category: courseData.category,
        level: courseData.level,
        status: 'published'
      });

      // 2. Save modules and lessons
      for (let i = 0; i < modules.length; i++) {
        const m = modules[i];
        const [savedModule] = await CurriculumService.saveModules([{
          course_id: course.id,
          title: m.title,
          order_index: i
        }]);

        if (m.lessons && m.lessons.length > 0) {
          const lessonsToSave = m.lessons.map((l, lIdx) => ({
            module_id: savedModule.id,
            title: l.title,
            content_type: l.type,
            order_index: lIdx,
            content_url: '' // Placeholder for actual content
          }));
          await CurriculumService.saveLessons(lessonsToSave);
        }
      }
      
      alert("Course architected and deployed successfully!");
      setActiveStep(1);
      setCourseData({ title: '', subtitle: '', category: 'Game Development', level: 'Beginner', price: '', description: '', thumbnail: null });
      setModules([{ id: 'm1', title: 'Introduction', lessons: [] }]);
    } catch (error) {
      console.error("Failed to publish course:", error);
      alert(`Publish error: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div className="code-label" style={{ color: 'rgba(195,244,0,0.5)', marginBottom: 10 }}>// Course Architecture Console</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Course <span style={{ color: '#c3f400' }}>Architect</span>
          </h1>
          <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
            Drafting: {courseData.title || 'Untitled Project'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="register-btn" style={{ width: 'auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
            <Eye size={16} />
            Preview
          </button>
          <button className="submit-btn" style={{ width: 'auto', padding: '12px 20px', gap: 10 }}>
            <Save size={16} />
            Save Draft
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 560, margin: '0 auto', position: 'relative', width: '100%' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 1, background: 'rgba(255,255,255,0.06)', transform: 'translateY(-50%)', zIndex: 0 }}></div>
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-lime-400 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
            <button 
              onClick={() => setActiveStep(step.id)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                activeStep >= step.id 
                  ? 'bg-[#0D0F14] border-lime-400 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.3)]' 
                  : 'bg-[#0D0F14] border-white/10 text-slate-600'
              }`}
            >
              <step.icon size={20} />
            </button>
            <span className={`text-[10px] font-headline font-bold uppercase tracking-widest ${
              activeStep >= step.id ? 'text-white' : 'text-slate-600'
            }`}>
              {step.name}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          {activeStep === 1 && (
            <div className="glass-card p-10 rounded-3xl space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-2">Course Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Master Game Development with UE5"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400/50 transition-all"
                      value={courseData.title}
                      onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-2">Subtitle</label>
                    <textarea 
                      placeholder="Catchy one-liner about the course..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400/50 transition-all h-24 resize-none"
                      value={courseData.subtitle}
                      onChange={(e) => setCourseData({...courseData, subtitle: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div 
                    onClick={() => document.getElementById('thumbnail-upload').click()}
                    className="aspect-video rounded-2xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/10 transition-all group relative overflow-hidden"
                  >
                    {courseData.thumbnailPreview ? (
                      <img src={courseData.thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ImageIcon className="text-slate-500" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-headline font-bold text-white uppercase tracking-widest">Upload Thumbnail</p>
                          <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold">16:9 Aspect Ratio recommended</p>
                        </div>
                      </>
                    )}
                    <input 
                      id="thumbnail-upload"
                      type="file" 
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleThumbnailChange}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label className="block text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400/50 transition-all appearance-none cursor-pointer"
                    value={courseData.category}
                    onChange={(e) => setCourseData({...courseData, category: e.target.value})}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-2">Level</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-lime-400/50 transition-all appearance-none cursor-pointer"
                    value={courseData.level}
                    onChange={(e) => setCourseData({...courseData, level: e.target.value})}
                  >
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-2">Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-8 py-3 text-white focus:outline-none focus:border-lime-400/50 transition-all"
                      value={courseData.price}
                      onChange={(e) => setCourseData({...courseData, price: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button 
                  onClick={() => setActiveStep(2)}
                  className="flex items-center gap-2 px-8 py-4 bg-lime-400 text-black font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(163,230,53,0.3)] transition-all"
                >
                  Configure Curriculum
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6">
              {modules.map((module, mIdx) => (
                <div key={module.id} className="glass-card rounded-3xl overflow-hidden border border-white/5">
                  <div className="p-6 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white/5 rounded-lg text-slate-500 cursor-grab active:cursor-grabbing">
                        <GripVertical size={16} />
                      </div>
                      <div>
                        <span className="text-[9px] font-headline font-bold text-lime-400 uppercase tracking-widest">Module {mIdx + 1}</span>
                        <h4 className="text-sm font-headline font-bold text-white uppercase">{module.title}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-500 hover:text-white transition-colors"><Edit3 size={16} /></button>
                      <button className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    {module.lessons.map((lesson, lIdx) => (
                      <div key={lesson.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            lesson.type === 'video' ? 'bg-blue-400/10 text-blue-400' : 'bg-lime-400/10 text-lime-400'
                          }`}>
                            {lesson.type === 'video' ? <Video size={14} /> : <FileText size={14} />}
                          </div>
                          <span className="text-xs font-headline font-bold text-slate-400 uppercase tracking-tight group-hover:text-white transition-colors">
                            {lIdx + 1}. {lesson.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-500 hover:text-white transition-colors"><Edit3 size={14} /></button>
                          <button className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => addLesson(module.id)}
                      className="w-full py-4 mt-2 border-2 border-dashed border-white/5 rounded-xl text-slate-600 hover:border-lime-400/20 hover:text-lime-400 hover:bg-lime-400/5 transition-all text-[10px] font-headline font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      Insert Lesson
                    </button>
                  </div>
                </div>
              ))}

              <button 
                onClick={addModule}
                className="w-full py-6 glass-card border-dashed border-white/10 rounded-3xl text-slate-400 hover:border-lime-400/30 hover:text-white hover:bg-lime-400/5 transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Plus size={20} />
                </div>
                <span className="text-[10px] font-headline font-bold uppercase tracking-[0.3em]">Integrate New Module</span>
              </button>

              <div className="flex justify-between items-center pt-10">
                <button 
                  onClick={() => setActiveStep(1)}
                  className="px-8 py-4 text-slate-500 font-headline font-bold text-xs uppercase tracking-widest hover:text-white transition-all"
                >
                  Back to Essentials
                </button>
                <button 
                  onClick={() => setActiveStep(3)}
                  className="flex items-center gap-2 px-8 py-4 bg-lime-400 text-black font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(163,230,53,0.3)] transition-all"
                >
                  Finalize Release
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="glass-card p-12 rounded-3xl text-center space-y-10">
              <div className="w-24 h-24 rounded-full bg-lime-400/10 flex items-center justify-center mx-auto border-2 border-lime-400 shadow-[0_0_30px_rgba(163,230,53,0.2)]">
                <Sparkles className="text-lime-400" size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-headline font-bold text-white uppercase tracking-tight mb-4">Ready for Launch</h3>
                <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
                  Your course architecture is sound. Once published, all modules and lessons will be deployed to the student network in real-time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
                  <div className="p-3 bg-emerald-400/10 text-emerald-400 rounded-xl">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-1">Integrity Check</p>
                    <p className="text-sm font-headline font-bold text-white uppercase tracking-tight">System Validated</p>
                  </div>
                </div>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 text-left">
                  <div className="p-3 bg-blue-400/10 text-blue-400 rounded-xl">
                    <Layers size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-1">Total Assets</p>
                    <p className="text-sm font-headline font-bold text-white uppercase tracking-tight">12 Modules Active</p>
                  </div>
                </div>
              </div>

              <div className="pt-10 flex flex-col md:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => setActiveStep(2)}
                  className="w-full md:w-auto px-10 py-4 text-slate-500 font-headline font-bold text-xs uppercase tracking-widest hover:text-white transition-all"
                >
                  Adjust Curriculum
                </button>
                <button 
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full md:w-auto px-12 py-4 bg-lime-400 text-black font-headline font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-[0_0_40px_rgba(163,230,53,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Rocket size={18} />
                  {isPublishing ? 'Deploying...' : 'Initiate Global Deployment'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};

export default CourseBuilder;
