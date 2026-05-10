import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { supabase } from '../../lib/supabase';
import ActionModal from '../../components/common/ActionModal';
import { 
  CheckSquare, Plus, Search, Filter, 
  HelpCircle, Users, BarChart2, MoreHorizontal,
  Edit2, Trash2, Clock, Book
} from 'lucide-react';

const Quizzes = () => {
  const { data: quizzes, loading, refresh } = useSupabaseData('quizzes');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    course_id: '',
    description: '',
    time_limit_minutes: 30,
    passing_score: 70
  });

  const handleOpenModal = (mode, quiz = null) => {
    setModalMode(mode);
    setSelectedQuiz(quiz);
    if (quiz) {
      setFormData({
        title: quiz.title || '',
        course_id: quiz.course_id || '',
        description: quiz.description || '',
        time_limit_minutes: quiz.time_limit_minutes || 30,
        passing_score: quiz.passing_score || 70
      });
    } else {
      setFormData({
        title: '',
        course_id: '',
        description: '',
        time_limit_minutes: 30,
        passing_score: 70
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (modalMode === 'add') {
        const { error } = await supabase.from('quizzes').insert([formData]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('quizzes')
          .update(formData)
          .eq('id', selectedQuiz.id);
        if (error) throw error;
      }
      refresh();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Operation failed:', error);
      alert('Operation failed: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assessment?')) return;
    try {
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (error) throw error;
      refresh();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Assessment Engine</h1>
            <p className="text-slate-500 text-sm">Design and manage quizzes, exams, and certifications.</p>
          </div>
          <button 
            onClick={() => handleOpenModal('add')}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus size={16} />
            CONSTRUCT_QUIZ
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
               Synchronizing_Assessment_Matrix...
             </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
              No_Assessments_Constructed
            </div>
          ) : filteredQuizzes.map((quiz) => (
            <motion.div 
              key={quiz.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#111113] border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <CheckSquare size={20} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenModal('edit', quiz); }}
                    className="p-1.5 text-slate-600 hover:text-emerald-500 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(quiz.id); }}
                    className="p-1.5 text-slate-600 hover:text-rose-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-white mb-1">{quiz.title}</h3>
              <p className="text-xs text-slate-500 mb-6 line-clamp-2">{quiz.description || 'No description provided.'}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-400">{quiz.time_limit_minutes || 0} MINUTES</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart2 size={14} className="text-slate-500" />
                  <span className="text-[10px] font-bold text-slate-400">PASS: {quiz.passing_score}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Modal */}
        <ActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'add' ? 'CONSTRUCT_NEW_ASSESSMENT' : 'MODIFY_ASSESSMENT_STRUCTURE'}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assessment Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="Module 1: Core Mechanics"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Course ID</label>
              <input 
                type="text" 
                value={formData.course_id}
                onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                placeholder="UUID"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time Limit (Min)</label>
                <div className="relative">
                  <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="number" 
                    value={formData.time_limit_minutes}
                    onChange={(e) => setFormData({...formData, time_limit_minutes: parseInt(e.target.value)})}
                    className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Passing Score (%)</label>
                <input 
                  type="number" 
                  value={formData.passing_score}
                  onChange={(e) => setFormData({...formData, passing_score: parseInt(e.target.value)})}
                  className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assessment Scope</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                placeholder="Specify the topics covered..."
              />
            </div>

            <div className="pt-4">
              <button 
                onClick={handleSubmit}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-md transition-all shadow-lg shadow-emerald-600/20"
              >
                {modalMode === 'add' ? 'EXECUTE_CONSTRUCTION' : 'COMMIT_ARCHETYPE'}
              </button>
            </div>
          </div>
        </ActionModal>
      </div>
    </AdminLayout>
  );
};

export default Quizzes;
