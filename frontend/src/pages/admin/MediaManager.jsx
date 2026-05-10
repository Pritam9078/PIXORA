import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { supabase } from '../../lib/supabase';
import ActionModal from '../../components/common/ActionModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, Video, FileText, File, 
  Upload, Search, Filter, FolderPlus, 
  MoreVertical, Grid, List, Download, Trash2,
  ChevronRight, Folder, HardDrive, Edit2, AlertTriangle
} from 'lucide-react';

const MediaManager = () => {
  const { data: files, loading, refresh } = useSupabaseData('media_metadata');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const filteredFiles = files.filter(file => 
    file.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalSize: files.reduce((acc, f) => acc + (f.size_bytes || 0), 0),
    images: files.filter(f => f.file_type === 'image').length,
    videos: files.filter(f => f.file_type === 'video').length,
    docs: files.filter(f => f.file_type === 'document').length,
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Are you sure you want to delete ${file.name}?`)) return;
    
    try {
      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([file.storage_path]);
      
      if (storageError) throw storageError;

      // 2. Delete from metadata
      const { error: dbError } = await supabase
        .from('media_metadata')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;
      
      refresh();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete asset');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Insert Metadata
      const { error: dbError } = await supabase
        .from('media_metadata')
        .insert({
          name: file.name,
          storage_path: filePath,
          file_type: file.type.split('/')[0],
          size_bytes: file.size,
          mime_type: file.type,
          folder: 'root'
        });

      if (dbError) throw dbError;
      
      refresh();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Media Assets</h1>
            <p className="text-slate-500 text-sm">Centralized repository for all platform content and resources.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white text-xs font-semibold rounded-md hover:bg-white/10 transition-all">
              <FolderPlus size={14} />
              NEW_FOLDER
            </button>
            <label className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 cursor-pointer">
              <Upload size={14} />
              {uploading ? 'UPLOADING...' : 'UPLOAD_ASSETS'}
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Storage Stats */}
        <div className="bg-[#111113] border border-white/5 rounded-xl p-6 flex flex-col md:flex-row items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
              <HardDrive size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Storage Utilized</p>
              <div className="flex items-end gap-2">
                <h3 className="text-xl font-bold text-white">{formatSize(stats.totalSize)}</h3>
                <span className="text-[10px] text-slate-600 mb-1">/ 100 GB</span>
              </div>
            </div>
          </div>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden max-w-md">
            <div className="h-full bg-blue-600" style={{ width: `${(stats.totalSize / (100 * 1024 * 1024 * 1024)) * 100}%` }}></div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xs font-bold text-white">{stats.images}</p>
              <p className="text-[8px] text-slate-500 uppercase font-black">Images</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-white">{stats.videos}</p>
              <p className="text-[8px] text-slate-500 uppercase font-black">Videos</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-white">{stats.docs}</p>
              <p className="text-[8px] text-slate-500 uppercase font-black">Docs</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#111113] p-4 border border-white/5 rounded-xl gap-4">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
            <button className="text-white">All Files</button>
            <ChevronRight size={14} />
            <button className="hover:text-white transition-all">Courses</button>
            <ChevronRight size={14} />
            <button className="hover:text-white transition-all">Game_Dev_Advanced</button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#09090B] border border-white/5 rounded-md py-1.5 pl-9 pr-4 text-[10px] text-slate-200 focus:outline-none"
              />
            </div>
            <div className="flex bg-[#09090B] p-1 rounded-lg border border-white/5">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Grid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {/* Folders */}
          {['Thumbnails', 'Lessons', 'Resources', 'Marketing'].map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-[#111113] border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-white/20 transition-all group"
            >
              <Folder size={32} className="text-blue-400 fill-blue-400/10 group-hover:fill-blue-400/20 transition-all" />
              <p className="text-[10px] font-bold text-white uppercase tracking-tighter truncate w-full text-center">{f}</p>
            </motion.div>
          ))}

          {/* Files */}
          {loading ? (
             <div className="col-span-full py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
               SYNCHRONIZING_ASSETS...
             </div>
          ) : filteredFiles.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
              NO_ASSETS_FOUND
            </div>
          ) : filteredFiles.map((file) => (
            <motion.div 
              key={file.id}
              whileHover={{ scale: 1.02 }}
              className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all group relative"
            >
              <div className="aspect-square bg-white/[0.02] flex items-center justify-center relative overflow-hidden">
                {file.thumbnail_url ? (
                  <img src={file.thumbnail_url} alt={file.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                ) : (
                  <div className="text-slate-600">
                    {file.file_type === 'video' && <Video size={32} />}
                    {file.file_type === 'image' && <ImageIcon size={32} />}
                    {file.file_type === 'document' && <FileText size={32} />}
                    {(!['video', 'image', 'document'].includes(file.file_type)) && <File size={32} />}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><Download size={16} /></button>
                  <button 
                    onClick={() => handleDelete(file)}
                    className="p-2 bg-white/10 hover:bg-rose-500/20 hover:text-rose-500 rounded-full text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[10px] font-bold text-white truncate mb-1">{file.name}</p>
                <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                  <span>{formatSize(file.size_bytes)}</span>
                  <span>{new Date(file.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Modal for Renaming/Editing metadata if needed later */}
        <ActionModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalMode === 'edit' ? 'EDIT_ASSET_METADATA' : 'NEW_FOLDER'}
        >
           <div className="space-y-4">
              <p className="text-xs text-slate-400">Implementation of folder creation and renaming logic...</p>
           </div>
        </ActionModal>
      </div>
    </AdminLayout>
  );
};

export default MediaManager;
