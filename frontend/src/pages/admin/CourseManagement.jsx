import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { supabase } from '../../lib/supabase';
import ActionModal from '../../components/common/ActionModal';
import { CourseSchema } from '../../utils/validationSchemas';
import { logAdminAction } from '../../utils/auditLogger';
import { 
  BookOpen, Plus, Search, Filter, MoreHorizontal,
  Video, FileText, Users, Star, Globe,
  LayoutGrid, List, CheckCircle2, Clock,
  Edit2, Trash2, Tag, DollarSign
} from 'lucide-react';

const CourseManagement = () => {
  const { data: courses, loading, refresh } = useSupabaseData('courses');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Courses');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    category: 'Game Development',
    instructor_name: '',
    description: '',
    price: 0,
    status: 'published',
    is_premium: true
  });

  const handleOpenModal = (mode, course = null) => {
    setModalMode(mode);
    setSelectedCourse(course);
    if (course) {
      setFormData({
        title: course.title || '',
        category: course.category || 'Game Development',
        instructor_name: course.instructor_name || '',
        description: course.description || '',
        price: course.price || 0,
        status: course.status || 'published',
        is_premium: course.is_premium ?? true
      });
    } else {
      setFormData({
        title: '',
        category: 'Game Development',
        instructor_name: '',
        description: '',
        price: 0,
        status: 'published',
        is_premium: true
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setFormErrors({});
      const parsedData = CourseSchema.parse(formData);
      if (modalMode === 'add') {
        const { error } = await supabase.from('courses').insert([parsedData]);
        if (error) throw error;
        await logAdminAction('CREATE_COURSE', `Created course ${parsedData.title}`, null, parsedData);
      } else {
        const { error } = await supabase
          .from('courses')
          .update(parsedData)
          .eq('id', selectedCourse.id);
        if (error) throw error;
        await logAdminAction('UPDATE_COURSE', `Updated course ${parsedData.title}`, selectedCourse, parsedData);
      }
      refresh();
      setIsModalOpen(false);
    } catch (error) {
      if (error.errors) {
        const errors = {};
        error.errors.forEach(err => {
          errors[err.path[0]] = err.message;
        });
        setFormErrors(errors);
      } else {
        console.error('Operation failed:', error);
        alert('Operation failed: ' + error.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirm course deletion?')) return;
    try {
      const deletedCourse = courses.find(c => c.id === id);
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      await logAdminAction('DELETE_COURSE', `Deleted course ${deletedCourse?.title || id}`, deletedCourse, null);
      refresh();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All Courses' || course.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Course Repository</h1>
            <p className="text-slate-500 text-sm">Manage curriculum, enrollment, and content across all categories.</p>
          </div>
          <button 
            onClick={() => handleOpenModal('add')}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={16} />
            CREATE_NEW_COURSE
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {['All Courses', 'Game Development', 'Web3 & Blockchain', 'Artificial Intelligence', 'Cybersecurity', 'Cloud Systems'].map((cat, i) => (
            <button 
              key={i}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-white text-[#09090B] border-white' : 'text-slate-500 border-white/10 hover:border-white/20 hover:text-slate-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#111113] p-4 border border-white/5 rounded-xl gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#09090B] border border-white/5 rounded-md py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
            <button className="p-2 bg-[#09090B] border border-white/5 rounded-md text-slate-400 hover:text-white transition-all">
              <Filter size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#09090B] p-1 rounded-lg border border-white/5">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <List size={16} />
              </button>
            </div>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <select className="bg-[#09090B] border border-white/5 text-slate-400 text-[10px] font-bold p-2 outline-none rounded-md uppercase tracking-widest">
              <option>SORT_BY: RECENT</option>
              <option>SORT_BY: POPULAR</option>
              <option>SORT_BY: RATING</option>
            </select>
          </div>
        </div>

        {/* Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
              Synchronizing_Curriculum_Library...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
              No_Courses_Available
            </div>
          ) : filteredCourses.map((course) => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all group cursor-pointer"
            >
              <div className="aspect-video bg-slate-800 relative">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${course.status === 'published' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {course.status || 'published'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest">
                    {course.is_premium ? 'premium' : 'free'}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{course.category}</p>
                </div>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{course.title}</h3>
                  <p className="text-xs text-slate-500">{course.instructor_name || 'Expert Instructor'}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-slate-500" />
                    <span>{course.enrollment_count || 0} ENROLLED</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-white">{course.rating || '5.0'}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-sm font-black text-white">{course.price ? `$${course.price}` : 'Free'}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal('edit', course)}
                      className="p-1.5 text-slate-500 hover:text-emerald-500 transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(course.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button className="p-1.5 text-slate-500 hover:text-white transition-all"><Globe size={14} /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Add New Placeholder */}
          <button 
            onClick={() => handleOpenModal('add')}
            className="border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center p-8 text-slate-600 hover:border-white/10 hover:text-slate-400 transition-all gap-2 group"
          >
            <div className="p-3 rounded-full bg-white/[0.02] group-hover:bg-white/[0.05] transition-all">
              <Plus size={32} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Add_New_Module</span>
          </button>
        </div>

        {/* Action Modal */}
        <ActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'add' ? 'CREATE_NEW_COURSE' : 'EDIT_COURSE_BLUEPRINT'}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Course Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={`w-full bg-[#09090B] border ${formErrors.title ? 'border-rose-500/50' : 'border-white/10'} rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all`}
                placeholder="Advanced Blockchain Architectures"
              />
              {formErrors.title && <p className="text-[10px] text-rose-500 mt-1">{formErrors.title}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="Game Development">Game Development</option>
                  <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                  <option value="Artificial Intelligence">AI</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instructor</label>
                <input 
                  type="text" 
                  value={formData.instructor_name}
                  onChange={(e) => setFormData({...formData, instructor_name: e.target.value})}
                  className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price ($)</label>
                <div className="relative">
                  <DollarSign size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Access Tier</label>
                <select 
                  value={formData.is_premium ? 'true' : 'false'}
                  onChange={(e) => setFormData({...formData, is_premium: e.target.value === 'true'})}
                  className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="true">Premium</option>
                  <option value="false">Free</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                placeholder="Enter course overview..."
              />
            </div>

            <div className="pt-4">
              <button 
                onClick={handleSubmit}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-md transition-all shadow-lg shadow-blue-600/20"
              >
                {modalMode === 'add' ? 'EXECUTE_DEPLOYMENT' : 'COMMIT_CHANGES'}
              </button>
            </div>
          </div>
        </ActionModal>
      </div>
    </AdminLayout>
  );
};

export default CourseManagement;
