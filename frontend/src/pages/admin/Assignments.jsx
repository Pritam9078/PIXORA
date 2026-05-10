import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { supabase } from '../../lib/supabase';
import ActionModal from '../../components/common/ActionModal';
import { 
  FileText, Plus, Search, Filter, 
  Clock, CheckCircle2, AlertCircle, 
  Download, MoreHorizontal, Eye,
  Edit2, Trash2, Calendar, Book
} from 'lucide-react';

const Assignments = () => {
  const { data: assignments, loading, refresh } = useSupabaseData('assignments');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    course_id: '',
    due_date: '',
    status: 'active',
    max_points: 100
  });

  const handleOpenModal = (mode, assignment = null) => {
    setModalMode(mode);
    setSelectedAssignment(assignment);
    if (assignment) {
      setFormData({
        title: assignment.title || '',
        course_id: assignment.course_id || '',
        due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().split('T')[0] : '',
        status: assignment.status || 'active',
        max_points: assignment.max_points || 100
      });
    } else {
      setFormData({
        title: '',
        course_id: '',
        due_date: '',
        status: 'active',
        max_points: 100
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (modalMode === 'add') {
        const { error } = await supabase.from('assignments').insert([formData]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('assignments')
          .update(formData)
          .eq('id', selectedAssignment.id);
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
    if (!window.confirm('Delete this assignment?')) return;
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;
      refresh();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredAssignments = assignments.filter(a => 
    a.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Assignment Management</h1>
            <p className="text-slate-500 text-sm">Monitor submissions and evaluation progress across all courses.</p>
          </div>
          <button 
            onClick={() => handleOpenModal('add')}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={16} />
            CREATE_ASSIGNMENT
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#111113] p-4 border border-white/5 rounded-xl gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#09090B] border border-white/5 rounded-md py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none transition-all"
              />
            </div>
            <button className="p-2 bg-[#09090B] border border-white/5 rounded-md text-slate-400 hover:text-white transition-all">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="grid gap-4">
          {loading ? (
             <div className="col-span-full py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
               Synchronizing_Assignment_Modules...
             </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
              No_Assignments_Deployed
            </div>
          ) : filteredAssignments.map((a) => (
            <motion.div 
              key={a.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#111113] border border-white/5 p-6 rounded-xl hover:border-white/10 transition-all group"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white tracking-tight">{a.title}</h3>
                    <p className="text-xs text-slate-500">{a.course_name || 'General Curriculum'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-xs font-bold text-white">{a.submissions}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Submissions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-amber-500">{a.pending}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-slate-300">{a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Due Date</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    a.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    a.status === 'completed' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                    'bg-slate-500/10 text-slate-500 border-slate-500/20'
                  }`}>
                    {a.status}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal('edit', a)}
                    className="p-2 text-slate-500 hover:text-emerald-500 transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(a.id)}
                    className="p-2 text-slate-500 hover:text-rose-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className="p-2 text-slate-500 hover:text-white transition-all"><Eye size={16} /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Modal */}
        <ActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'add' ? 'INITIALIZE_ASSIGNMENT' : 'UPDATE_ASSIGNMENT_PARAMETERS'}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assignment Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                placeholder="Final Project: Physics Engine"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Course ID</label>
                <input 
                  type="text" 
                  value={formData.course_id}
                  onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                  className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  placeholder="UUID"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Max Points</label>
                <input 
                  type="number" 
                  value={formData.max_points}
                  onChange={(e) => setFormData({...formData, max_points: parseInt(e.target.value)})}
                  className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</label>
                <div className="relative">
                  <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="date" 
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phase Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleSubmit}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-md transition-all shadow-lg shadow-blue-600/20"
              >
                {modalMode === 'add' ? 'EXECUTE_DEPLOYMENT' : 'COMMIT_UPDATE'}
              </button>
            </div>
          </div>
        </ActionModal>
      </div>
    </AdminLayout>
  );
};

export default Assignments;
