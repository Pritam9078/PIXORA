import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

const ActionModal = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  actions, 
  isLoading = false 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#111113] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
                  {description && (
                    <p className="text-xs text-slate-500 mt-1">{description}</p>
                  )}
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {children}
            </div>

            {/* Footer */}
            {actions && (
              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-all uppercase tracking-widest"
                >
                  Cancel
                </button>
                {actions.map((action, i) => (
                  <button
                    key={i}
                    onClick={action.onClick}
                    disabled={isLoading || action.disabled}
                    className={`flex items-center gap-2 px-6 py-2 text-xs font-bold rounded-lg transition-all shadow-lg uppercase tracking-widest ${
                      action.variant === 'danger' 
                        ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/20' 
                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ActionModal;
