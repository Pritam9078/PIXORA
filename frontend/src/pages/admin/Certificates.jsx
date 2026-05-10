import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { supabase } from '../../lib/supabase';
import ActionModal from '../../components/common/ActionModal';
import { motion } from 'framer-motion';
import { 
  Award, Plus, Search, Filter, 
  ExternalLink, ShieldCheck, Download, Trash2, Edit2
} from 'lucide-react';

const Certificates = () => {
  const { data: certificates, loading, refresh } = useSupabaseData('certificates');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCert, setSelectedCert] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    on_chain: true,
    issued_count: 0
  });

  const handleOpenModal = (mode, cert = null) => {
    setModalMode(mode);
    setSelectedCert(cert);
    if (cert) {
      setFormData({
        title: cert.title || '',
        description: cert.description || '',
        on_chain: cert.on_chain ?? true,
        issued_count: cert.issued_count || 0
      });
    } else {
      setFormData({
        title: '',
        description: '',
        on_chain: true,
        issued_count: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (modalMode === 'add') {
        const { error } = await supabase.from('certificates').insert([formData]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('certificates')
          .update(formData)
          .eq('id', selectedCert.id);
        if (error) throw error;
      }
      refresh();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Operation failed:', error);
      alert('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      const { error } = await supabase.from('certificates').delete().eq('id', id);
      if (error) throw error;
      refresh();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Credential Center</h1>
            <p className="text-slate-500 text-sm">Issue and verify digital certificates and on-chain credentials.</p>
          </div>
          <button 
            onClick={() => handleOpenModal('add')}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
          >
            <Award size={16} />
            DESIGN_TEMPLATE
          </button>
        </div>

        <div className="grid gap-6">
          {loading ? (
            <div className="p-12 text-center text-slate-600 uppercase tracking-widest animate-pulse">Syncing_Credentials...</div>
          ) : certificates.length === 0 ? (
            <div className="p-12 text-center text-slate-600 uppercase tracking-widest border border-white/5 rounded-xl">No_Templates_Found</div>
          ) : (
            certificates.map((cert) => (
              <div key={cert.id} className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden p-8 flex items-center justify-between group hover:border-white/10 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-32 bg-white/5 border border-white/10 rounded flex items-center justify-center text-slate-700 group-hover:text-blue-500 transition-all">
                    <Award size={48} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{cert.title}</h3>
                    <p className="text-xs text-slate-500 mb-4">{cert.description}</p>
                    <div className="flex gap-4">
                      {cert.on_chain && (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">VERIFIED ON-CHAIN</span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400">{cert.issued_count?.toLocaleString()} ISSUED</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal('edit', cert)}
                    className="p-2 bg-[#09090B] border border-white/5 rounded text-slate-400 hover:text-white transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cert.id)}
                    className="p-2 bg-[#09090B] border border-white/5 rounded text-slate-400 hover:text-rose-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button className="p-2 bg-[#09090B] border border-white/5 rounded text-slate-400 hover:text-white transition-all">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <ActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'add' ? 'DESIGN_NEW_CREDENTIAL' : 'MODIFY_CREDENTIAL_TEMPLATE'}
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Certificate Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                placeholder="Blockchain Masterclass"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[#09090B] border border-white/10 rounded-md py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                rows="3"
                placeholder="Briefly describe the credential value..."
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">On-Chain Verification</span>
              </div>
              <div 
                onClick={() => setFormData({...formData, on_chain: !formData.on_chain})}
                className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-all ${formData.on_chain ? 'bg-blue-600' : 'bg-slate-800'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-all ${formData.on_chain ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
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

export default Certificates;
