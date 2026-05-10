import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { supabase } from '../../lib/supabase';
import ActionModal from '../../components/common/ActionModal';
import { UserSchema } from '../../utils/validationSchemas';
import { logAdminAction } from '../../utils/auditLogger';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, MoreHorizontal, UserPlus, 
  Download, Mail, Shield, UserX, ExternalLink,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  Edit2, Trash2
} from 'lucide-react';

const UserManagement = ({ initialTab = 'All Users' }) => {
  const { data: users, loading, refresh } = useSupabaseData('profiles');
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'student',
    status: 'active'
  });

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role || 'student',
        status: user.status || 'active'
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        role: 'student',
        status: 'active'
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setFormErrors({});
      const parsedData = UserSchema.parse(formData);
      if (modalMode === 'add') {
        const { error } = await supabase.from('profiles').insert([parsedData]);
        if (error) throw error;
        await logAdminAction('CREATE_USER', `Created user ${parsedData.email}`, null, parsedData);
      } else {
        const { error } = await supabase
          .from('profiles')
          .update(parsedData)
          .eq('id', selectedUser.id);
        if (error) throw error;
        await logAdminAction('UPDATE_USER', `Updated user ${parsedData.email}`, selectedUser, parsedData);
      }
      refresh();
      setIsModalOpen(false);
    } catch (error) {
      if (error.errors) { // Zod error
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
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const deletedUser = users.find(u => u.id === id);
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      await logAdminAction('DELETE_USER', `Deleted user ${deletedUser?.email || id}`, deletedUser, null);
      refresh();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    if (activeTab === 'Students') return user.role === 'student';
    if (activeTab === 'Instructors') return user.role === 'instructor';
    if (activeTab === 'College Admins') return user.role === 'college_admin';
    if (activeTab === 'Partners') return user.role === 'partner';
    if (activeTab === 'Suspended') return user.status === 'suspended';
    return true;
  }).filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = ['All Users', 'Students', 'Instructors', 'College Admins', 'Partners', 'Suspended'];

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'college_admin': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'instructor': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'partner': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle2 size={12} className="text-emerald-500" />;
      case 'pending': return <AlertCircle size={12} className="text-amber-500" />;
      case 'suspended': return <UserX size={12} className="text-rose-500" />;
      default: return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">User Directory</h1>
            <p className="text-slate-500 text-sm">Manage identities, roles, and access across the platform.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-md hover:bg-white/10 transition-all">
              <Download size={14} />
              EXPORT_CSV
            </button>
            <button 
              onClick={() => handleOpenModal('add')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              <UserPlus size={14} />
              ADD_NEW_USER
            </button>
          </div>
        </div>

        {/* Filters & Tabs */}
        <div className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-1 bg-[#09090B] p-1 rounded-lg border border-white/5">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                    activeTab === tab 
                      ? 'bg-white/10 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search identities..."
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="px-6 py-4">
                    <input type="checkbox" className="rounded bg-[#09090B] border-white/10 text-blue-600 focus:ring-0 focus:ring-offset-0" />
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User Identity</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Institution</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                      Synchronizing_Identity_Data...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                      No_Identities_Found
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/[0.02] transition-all group"
                  >
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded bg-[#09090B] border-white/10 text-blue-600 focus:ring-0 focus:ring-offset-0" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-white/10 overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user.full_name?.charAt(0) || 'U'
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{user.full_name || 'Anonymous User'}</p>
                          <p className="text-[10px] text-slate-500 font-mono lowercase">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded border text-[9px] font-black uppercase tracking-tighter ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-400">{user.college_id ? 'Affiliated' : 'Independent'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.status || 'active')}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.status || 'active'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal('edit', user)}
                          className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-md transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-md transition-all">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Showing <span className="text-white">1</span> to <span className="text-white">6</span> of <span className="text-white">124</span> results
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-white/5 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:pointer-events-none" disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="p-2 border border-white/5 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Modal */}
        <ActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'add' ? 'INITIALIZE_NEW_IDENTITY' : 'MODIFY_EXISTING_IDENTITY'}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Legal Name</label>
              <input 
                type="text" 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className={`w-full bg-[#09090B] border ${formErrors.full_name ? 'border-rose-500/50' : 'border-white/10'} rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all`}
                placeholder="John Doe"
              />
              {formErrors.full_name && <p className="text-[10px] text-rose-500 mt-1">{formErrors.full_name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full bg-[#09090B] border ${formErrors.email ? 'border-rose-500/50' : 'border-white/10'} rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all`}
                placeholder="john@pixora.io"
                disabled={modalMode === 'edit'}
              />
              {formErrors.email && <p className="text-[10px] text-rose-500 mt-1">{formErrors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Role</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="college_admin">College Admin</option>
                  <option value="partner">Partner</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="pt-4">
              <button 
                onClick={handleSubmit}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-md transition-all shadow-lg shadow-blue-600/20"
              >
                {modalMode === 'add' ? 'EXECUTE_CREATION' : 'COMMIT_CHANGES'}
              </button>
            </div>
          </div>
        </ActionModal>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
