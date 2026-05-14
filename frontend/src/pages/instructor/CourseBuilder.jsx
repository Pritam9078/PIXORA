import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Save, Eye, Rocket, 
  Settings, Layers, Video, FileText, 
  Target, Code, ChevronRight, ChevronDown,
  GripVertical, Trash2, Edit3, Image as ImageIcon,
  CheckCircle2, AlertCircle, Sparkles, Loader2
} from 'lucide-react';
import { InstructorService } from '../../services/InstructorService';
import { CurriculumService } from '../../services/CurriculumService';
import { supabase } from '../../lib/supabase';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
    thumbnailPreview: null,
    objectives: [''],
    prerequisites: [''],
    targetAudience: ['']
  });

  const [modules, setModules] = useState([
    {
      id: 'm1',
      title: 'Introduction to the Engine',
      lessons: [
        { 
          id: 'l1', 
          title: 'learn blockchain', 
          type: 'article', 
          content_url: '', 
          description: 'A deep dive into the decentralized core of the engine and how blockchain protocols facilitate secure data transmission.', 
          duration: '7:03 Estimated' 
        },
        { 
          id: 'l2', 
          title: 'The Interface Overview', 
          type: 'video', 
          content_url: '', 
          description: 'Master the visual architecture of the engine and optimize your workflow with keyboard macros.', 
          duration: '12:45' 
        },
        { 
          id: 'l3', 
          title: 'New Lesson', 
          type: 'video', 
          content_url: '', 
          description: '', 
          duration: '' 
        }
      ]
    }
  ]);

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editingId = searchParams.get('edit');
  const [isPublishing, setIsPublishing] = useState(false);

  // Load data: either from draft or from database if editing
  useEffect(() => {
    const loadData = async () => {
      if (editingId) {
        try {
          const course = await InstructorService.getCourseById(editingId);
          const curriculum = await CurriculumService.getCurriculum(editingId);
          
          setCourseData({
            title: course.title || '',
            subtitle: course.description || '',
            category: course.category || 'Game Development',
            level: course.level || 'Beginner',
            price: course.price?.toString() || '',
            description: course.description || '',
            thumbnail: course.thumbnail_url,
            objectives: course.objectives || [''],
            prerequisites: course.prerequisites || [''],
            targetAudience: course.target_audience || ['']
          });

          if (curriculum && curriculum.length > 0) {
            setModules(curriculum.map(m => ({
              id: m.id,
              title: m.title,
              lessons: (m.lessons || [])
                .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                .map(l => ({
                  ...l,
                  type: l.content_type || 'video' // Map DB field to state field
                }))
            })));
          }
        } catch (err) {
          console.error("Failed to load course for editing:", err);
        }
      } else {
        const saved = localStorage.getItem('pixora_course_draft');
        if (saved) {
          try {
            const { data, modules: savedModules } = JSON.parse(saved);
            setCourseData(prev => ({ 
              ...prev, 
              ...data,
              objectives: (Array.isArray(data.objectives) && data.objectives.length > 0) ? data.objectives : prev.objectives,
              prerequisites: (Array.isArray(data.prerequisites) && data.prerequisites.length > 0) ? data.prerequisites : prev.prerequisites,
              targetAudience: (Array.isArray(data.targetAudience) && data.targetAudience.length > 0) ? data.targetAudience : prev.targetAudience
            }));
            setModules(savedModules || []);
          } catch (e) { console.error("Failed to load draft"); }
        }
      }
    };
    loadData();
  }, [editingId]);

  useEffect(() => {
    localStorage.setItem('pixora_course_draft', JSON.stringify({ data: courseData, modules }));
  }, [courseData, modules]);

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
          lessons: [...m.lessons, { 
            id: `l${Date.now()}`, 
            title: 'New Lesson', 
            type: 'video',
            content_url: '',
            description: '',
            duration: ''
          }]
        }
      }
      return m;
    }));
  };

  const openLessonDrawer = (moduleIndex, lessonIndex) => {
    setSelectedLesson({ moduleIndex, lessonIndex, ...modules[moduleIndex].lessons[lessonIndex] });
    setIsDrawerOpen(true);
  };

  const updateLessonDetails = (updatedFields) => {
    const { moduleIndex, lessonIndex } = selectedLesson;
    const newModules = [...modules];
    newModules[moduleIndex].lessons[lessonIndex] = {
      ...newModules[moduleIndex].lessons[lessonIndex],
      ...updatedFields
    };
    setModules(newModules);
    setSelectedLesson(prev => ({ ...prev, ...updatedFields }));
  };
  const removeModule = (moduleId) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const removeLesson = (moduleId, lessonId) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.filter(l => l.id !== lessonId)
        };
      }
      return m;
    }));
  };

  const duplicateModule = (moduleId) => {
    const moduleToCopy = modules.find(m => m.id === moduleId);
    if (moduleToCopy) {
      const newModule = {
        ...moduleToCopy,
        id: `m${Date.now()}`,
        title: `${moduleToCopy.title} (Copy)`,
        lessons: moduleToCopy.lessons.map(l => ({ ...l, id: `l${Math.random()}` }))
      };
      setModules([...modules, newModule]);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleModuleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleLessonDragEnd = (moduleId, event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setModules(modules.map(m => {
        if (m.id === moduleId) {
          const oldIndex = m.lessons.findIndex((l) => l.id === active.id);
          const newIndex = m.lessons.findIndex((l) => l.id === over.id);
          return {
            ...m,
            lessons: arrayMove(m.lessons, oldIndex, newIndex)
          };
        }
        return m;
      }));
    }
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

  const handlePublish = async (status = 'published') => {
    // 0. Sanity Check
    if (!courseData.title) {
      alert("Project Title is required to register in the protocol.");
      setActiveStep(1);
      return;
    }

    // Only strict validation for publishing
    if (status === 'published') {
      const emptyModules = modules.filter(m => m.lessons.length === 0);
      if (emptyModules.length > 0) {
        alert(`CRITICAL: Module "${emptyModules[0].title}" has no lessons. Every architected unit must contain at least one lesson.`);
        return;
      }
    }

    setIsPublishing(true);
    try {
      // 0. Upload thumbnail if exists
      let thumbnailUrl = courseData.thumbnail;
      if (courseData.thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(courseData.thumbnailFile);
      }

      // 1. Create or Update the course
      let course;
      const payload = {
        title: courseData.title,
        description: courseData.description || courseData.subtitle,
        price: parseFloat(courseData.price) || 0,
        thumbnail_url: thumbnailUrl,
        category: courseData.category,
        level: courseData.level,
        objectives: courseData.objectives.filter(o => o.trim()),
        prerequisites: courseData.prerequisites.filter(p => p.trim()),
        target_audience: courseData.targetAudience.filter(t => t.trim()),
        status: status
      };

      if (editingId) {
        course = await InstructorService.updateCourse(editingId, payload);
      } else {
        course = await InstructorService.createCourse(payload);
      }

      // 2. Save modules and lessons
      const updatedModules = [];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      for (let i = 0; i < modules.length; i++) {
        const m = modules[i];
        const modulePayload = {
          course_id: course.id,
          title: m.title,
          order_index: i
        };
        
        // Only include ID if it's a valid UUID (not a temporary ID like 'm1')
        if (m.id && uuidRegex.test(m.id)) {
          modulePayload.id = m.id;
        }

        const [savedModule] = await CurriculumService.saveModules([modulePayload]);
        
        const updatedLessons = [];
        if (m.lessons && m.lessons.length > 0) {
          const lessonsToSave = m.lessons.map((l, lIdx) => {
            const lessonPayload = {
              module_id: savedModule.id,
              course_id: course.id, // Add course_id for easier querying
              title: l.title,
              content_type: l.type,
              order_index: lIdx,
              content_url: l.content_url || '',
              description: l.description || '',
              duration: l.duration || ''
            };
            
            if (l.id && uuidRegex.test(l.id)) {
              lessonPayload.id = l.id;
            }
            return lessonPayload;
          });
          
          console.log('CourseBuilder: Saving lessons:', lessonsToSave);
          const savedLessons = await CurriculumService.saveLessons(lessonsToSave);
          updatedLessons.push(...savedLessons);
        }
        
        updatedModules.push({
          ...savedModule,
          lessons: updatedLessons
        });
      }
      
      // Update state with saved data (containing real UUIDs)
      setModules(updatedModules);
      
      alert(status === 'published' ? "Course architected and deployed successfully!" : "Draft protocol successfully archived.");
      if (!editingId) {
        navigate(`/instructor/builder?edit=${course.id}`);
      }
    } catch (error) {
      console.error(`Failed to ${status} course:`, error);
      alert(`Operation error: ${error.message}`);
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
          <button 
            className="submit-btn" 
            style={{ width: 'auto', padding: '12px 20px', gap: 10 }}
            onClick={() => handlePublish('draft')}
            disabled={isPublishing}
          >
            {isPublishing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
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

              <div className="space-y-8 mt-10 p-8 rounded-3xl bg-lime-400/5 border border-lime-400/10">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-lime-400" size={20} />
                  <h3 className="text-sm font-headline font-bold text-white uppercase tracking-widest">Advanced Marketing Intelligence</h3>
                </div>

                <div className="space-y-8">
                  <DynamicInputs 
                    label="What will students learn?"
                    values={courseData.objectives}
                    onChange={(vals) => setCourseData({...courseData, objectives: vals})}
                    placeholder="e.g. Master the Godot scene system"
                  />
                  <DynamicInputs 
                    label="Prerequisites"
                    values={courseData.prerequisites}
                    onChange={(vals) => setCourseData({...courseData, prerequisites: vals})}
                    placeholder="e.g. Basic understanding of GDSCRIPT"
                  />
                  <DynamicInputs 
                    label="Target Audience"
                    values={courseData.targetAudience}
                    onChange={(vals) => setCourseData({...courseData, targetAudience: vals})}
                    placeholder="e.g. Aspiring Indie Game Developers"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-10">
                <button 
                  onClick={() => setActiveStep(2)}
                  className="flex items-center gap-2 px-10 py-5 bg-lime-400 text-black font-headline font-bold text-xs uppercase tracking-widest rounded-2xl hover:shadow-[0_0_40px_rgba(163,230,53,0.3)] transition-all"
                >
                  Architect Curriculum
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleModuleDragEnd}
              >
                <SortableContext 
                  items={modules.map(m => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {modules.map((module, mIdx) => (
                    <SortableModule 
                      key={module.id}
                      module={module}
                      mIdx={mIdx}
                      removeModule={removeModule}
                      duplicateModule={duplicateModule}
                      addLesson={addLesson}
                      removeLesson={removeLesson}
                      openLessonDrawer={openLessonDrawer}
                      handleLessonDragEnd={(e) => handleLessonDragEnd(module.id, e)}
                      updateModuleTitle={(newTitle) => {
                        const newModules = [...modules];
                        newModules[mIdx].title = newTitle;
                        setModules(newModules);
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <button 
                onClick={addModule}
                className="w-full py-6 border border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-3 text-xs font-headline font-bold text-slate-500 hover:text-lime-400 hover:border-lime-400/30 hover:bg-lime-400/5 transition-all uppercase tracking-[0.2em]"
              >
                <Plus size={18} /> Initialize New Module
              </button>

              <div className="flex justify-between pt-10">
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
                  Review & Deploy
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
                  onClick={() => handlePublish('published')}
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

      {/* Lesson Detail Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedLesson && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0D0F14] border-l border-white/5 shadow-2xl z-[101] p-10 overflow-y-auto"
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-headline font-bold text-lime-400 uppercase tracking-widest">Architecting Lesson</span>
                    <h3 className="text-xl font-headline font-bold text-white uppercase mt-1">{selectedLesson.title}</h3>
                  </div>
                  <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-500 hover:text-white">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-2">Lesson Title</label>
                    <input 
                      type="text" 
                      value={selectedLesson.title}
                      onChange={(e) => updateLessonDetails({ title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-lime-400/50 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-2">Type</label>
                      <select 
                        value={selectedLesson.type}
                        onChange={(e) => updateLessonDetails({ type: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none"
                      >
                        <option value="video">Video</option>
                        <option value="article">Article</option>
                        <option value="quiz">Quiz</option>
                        <option value="lab">Lab</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-2">Duration</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 15m"
                        value={selectedLesson.duration}
                        onChange={(e) => updateLessonDetails({ duration: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-2">Content URL (Video/Link)</label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      value={selectedLesson.content_url}
                      onChange={(e) => updateLessonDetails({ content_url: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest mb-2">Lesson Description</label>
                    <textarea 
                      placeholder="Detailed breakdown of what this lesson covers..."
                      value={selectedLesson.description}
                      onChange={(e) => updateLessonDetails({ description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white h-48 resize-none focus:border-lime-400/50 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-10">
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-full py-4 bg-lime-400 text-black font-headline font-bold text-xs uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(163,230,53,0.3)]"
                  >
                    Confirm Architecture
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
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

const SortableModule = ({ 
  module, 
  mIdx, 
  removeModule, 
  duplicateModule,
  addLesson, 
  removeLesson, 
  openLessonDrawer, 
  handleLessonDragEnd,
  updateModuleTitle 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="glass-card rounded-3xl overflow-hidden border border-white/5 mb-6"
    >
      <div className="p-6 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-4">
          <div 
            {...attributes} 
            {...listeners} 
            className="p-2 bg-white/5 rounded-lg text-slate-500 cursor-grab active:cursor-grabbing hover:text-lime-400 transition-colors"
          >
            <GripVertical size={16} />
          </div>
          <div>
            <span className="text-[9px] font-headline font-bold text-lime-400 uppercase tracking-widest">Module {mIdx + 1}</span>
            <input 
              type="text" 
              value={module.title}
              onChange={(e) => updateModuleTitle(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-headline font-bold text-white uppercase p-0 block"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => duplicateModule(module.id)}
            title="Duplicate Module"
            className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
          >
            <Plus size={16} />
          </button>
          <button 
            onClick={() => removeModule(module.id)}
            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-3">
        <DndContext 
          collisionDetection={closestCenter}
          onDragEnd={handleLessonDragEnd}
        >
          <SortableContext 
            items={module.lessons.map(l => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {module.lessons.map((lesson, lIdx) => (
              <SortableLesson 
                key={lesson.id}
                lesson={lesson}
                lIdx={lIdx}
                onRemove={() => removeLesson(module.id, lesson.id)}
                onOpen={() => openLessonDrawer(mIdx, lIdx)}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        <button 
          onClick={() => addLesson(module.id)}
          className="w-full py-4 mt-2 border-2 border-dashed border-white/5 rounded-xl text-slate-600 hover:border-lime-400/20 hover:text-lime-400 hover:bg-lime-400/5 transition-all text-[10px] font-headline font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2"
        >
          <Plus size={14} />
          Insert Lesson
        </button>
      </div>
    </div>
  );
};

const SortableLesson = ({ lesson, lIdx, onRemove, onOpen }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      onClick={onOpen}
      className={`flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-lime-400/30 hover:bg-lime-400/5 transition-all group cursor-pointer ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div 
          {...attributes} 
          {...listeners}
          onClick={(e) => e.stopPropagation()} 
          className="p-1.5 text-slate-600 hover:text-lime-400 transition-colors cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </div>
        <div className={`p-2 rounded-lg ${
          lesson.type === 'video' ? 'bg-blue-400/10 text-blue-400' : 'bg-lime-400/10 text-lime-400'
        }`}>
          {lesson.type === 'video' ? <Video size={14} /> : <FileText size={14} />}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-headline font-bold text-slate-400 uppercase tracking-tight group-hover:text-white transition-colors">
            {lIdx + 1}. {lesson.title}
          </span>
          {lesson.duration && (
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">
              {lesson.duration} Estimated
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Edit3 size={14} className="text-slate-500 hover:text-white" />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const DynamicInputs = ({ label, values, onChange, placeholder }) => {
  const addField = () => onChange([...values, '']);
  const updateField = (index, val) => {
    const newVals = [...values];
    newVals[index] = val;
    onChange(newVals);
  };
  const removeField = (index) => {
    if (values.length > 1) {
      onChange(values.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-headline font-bold text-slate-500 uppercase tracking-widest">{label}</label>
        <button onClick={addField} className="text-[10px] font-headline font-bold text-lime-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
          <Plus size={12} /> Add Point
        </button>
      </div>
      <div className="space-y-3">
        {(values || ['']).map((val, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-lime-400/30" />
              <input 
                type="text" 
                value={val}
                placeholder={placeholder}
                onChange={(e) => updateField(i, e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-300 focus:border-lime-400/30 transition-all focus:outline-none"
              />
            </div>
            {values.length > 1 && (
              <button onClick={() => removeField(i)} className="p-3 text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseBuilder;
