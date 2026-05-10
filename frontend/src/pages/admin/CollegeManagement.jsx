import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { supabase } from '../../lib/supabase';
import ActionModal from '../../components/common/ActionModal';
import { CollegeSchema } from '../../utils/validationSchemas';
import { logAdminAction } from '../../utils/auditLogger';
import { 
  School, Plus, Search, Filter, MoreVertical, 
  CheckCircle2, XCircle, Clock, ExternalLink,
  Users, BookOpen, CreditCard, Edit2, Trash2
} from 'lucide-react';

const CollegeManagement = () => {
  const { data: colleges, loading, refresh } = useSupabaseData('colleges');
  const [view, setView] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    status: 'pending',
    subscription_tier: 'free'
  });

  const handleOpenModal = (mode, college = null) => {
    setModalMode(mode);
    setSelectedCollege(college);
    if (college) {
      setFormData({
        name: college.name || '',
        domain: college.domain || '',
        status: college.status || 'pending',
        subscription_tier: college.subscription_tier || 'free'
      });
    } else {
      setFormData({
        name: '',
        domain: '',
        status: 'pending',
        subscription_tier: 'free'
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setFormErrors({});
      const parsedData = CollegeSchema.parse(formData);
      if (modalMode === 'add') {
        const { error } = await supabase.from('colleges').insert([parsedData]);
        if (error) throw error;
        await logAdminAction('CREATE_COLLEGE', `Onboarded institution ${parsedData.name}`, null, parsedData);
      } else {
        const { error } = await supabase
          .from('colleges')
          .update(parsedData)
          .eq('id', selectedCollege.id);
        if (error) throw error;
        await logAdminAction('UPDATE_COLLEGE', `Updated institution ${parsedData.name}`, selectedCollege, parsedData);
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
    if (!window.confirm('Are you sure you want to delete this institution?')) return;
    try {
      const deletedCollege = colleges.find(c => c.id === id);
      const { error } = await supabase.from('colleges').delete().eq('id', id);
      if (error) throw error;
      await logAdminAction('DELETE_COLLEGE', `Deleted institution ${deletedCollege?.name || id}`, deletedCollege, null);
      refresh();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredColleges = colleges.filter(c => {
    if (view === 'Active') return c.status === 'active';
    if (view === 'Pending') return c.status === 'pending';
    if (view === 'Suspended') return c.status === 'suspended';
    return true;
  }).filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.domain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'suspended': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Institution Management</h1>
            <p className="text-slate-500 text-sm">Control and monitor all registered colleges and organizations.</p>
          </div>
          <button 
            onClick={() => handleOpenModal('add')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-md hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Plus size={14} />
            ONBOARD_COLLEGE
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111113] border border-white/5 p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                <School size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Institutions</p>
                <h3 className="text-xl font-bold text-white">{colleges.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-[#111113] border border-white/5 p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Approvals</p>
                <h3 className="text-xl font-bold text-white">12</h3>
              </div>
            </div>
          </div>
          <div className="bg-[#111113] border border-white/5 p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Subscriptions</p>
                <h3 className="text-xl font-bold text-white">38</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center bg-[#111113] p-4 border border-white/5 rounded-xl">
          <div className="flex gap-2">
            {['All', 'Active', 'Pending', 'Suspended'].map((v) => (
              <button 
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${view === v ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search institutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#09090B] border border-white/5 rounded-md py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
            <button className="p-2 bg-[#09090B] border border-white/5 rounded-md text-slate-400 hover:text-white transition-all">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Institutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
              Synchronizing_Institutional_Registry...
            </div>
          ) : filteredColleges.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
              No_Institutions_Registered
            </div>
          ) : filteredColleges.map((college) => (
            <motion.div 
              key={college.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-slate-400">
                      <School size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white tracking-tight">{college.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">{college.domain || 'no-domain.com'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded border text-[9px] font-black uppercase tracking-tighter ${getStatusStyle(college.status || 'active')}`}>
                    {college.status || 'active'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                    <Users size={14} className="mx-auto mb-1 text-slate-500" />
                    <p className="text-[10px] font-bold text-white">{college.student_count || 0}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black">Students</p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                    <BookOpen size={14} className="mx-auto mb-1 text-slate-500" />
                    <p className="text-[10px] font-bold text-white">{college.course_count || 0}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black">Courses</p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                    <CreditCard size={14} className="mx-auto mb-1 text-slate-500" />
                    <p className="text-[10px] font-bold text-white uppercase">{college.plan || 'trial'}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-black">Plan</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-white/10 transition-all">
                    View Details
                  </button>
                  <button 
                    onClick={() => handleOpenModal('edit', college)}
                    className="px-3 py-2 bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-500 rounded hover:bg-white/10 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(college.id)}
                    className="px-3 py-2 bg-white/5 border border-white/10 text-slate-400 hover:text-rose-500 rounded hover:bg-white/10 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {college.status === 'pending' && (
                <div className="bg-amber-500/10 border-t border-amber-500/20 px-6 py-3 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Awaiting Verification</span>
                  <div className="flex gap-2">
                    <button className="p-1 hover:text-emerald-500 transition-all"><CheckCircle2 size={16} /></button>
                    <button className="p-1 hover:text-rose-500 transition-all"><XCircle size={16} /></button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Action Modal */}
        <ActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'add' ? 'ONBOARD_NEW_INSTITUTION' : 'MODIFY_INSTITUTION_PROFILE'}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Institution Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full bg-[#09090B] border ${formErrors.name ? 'border-rose-500/50' : 'border-white/10'} rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all`}
                placeholder="Neo-Tokyo Institute"
              />
              {formErrors.name && <p className="text-[10px] text-rose-500 mt-1">{formErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Official Domain</label>
              <input 
                type="text" 
                value={formData.domain}
                onChange={(e) => setFormData({...formData, domain: e.target.value})}
                className={`w-full bg-[#09090B] border ${formErrors.domain ? 'border-rose-500/50' : 'border-white/10'} rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all`}
                placeholder="https://neotokyo.edu"
              />
              {formErrors.domain && <p className="text-[10px] text-rose-500 mt-1">{formErrors.domain}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subscription Tier</label>
                <select 
                  value={formData.subscription_tier}
                  onChange={(e) => setFormData({...formData, subscription_tier: e.target.value})}
                  className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                >
                  <option value="free">Free</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="pt-4">
              <button 
                onClick={handleSubmit}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-md transition-all shadow-lg shadow-emerald-600/20"
              >
                {modalMode === 'add' ? 'EXECUTE_ONBOARDING' : 'UPDATE_REGISTRY'}
              </button>
            </div>
          </div>
        </ActionModal>
      </div>
    </AdminLayout>
  );
};

export default CollegeManagement;
