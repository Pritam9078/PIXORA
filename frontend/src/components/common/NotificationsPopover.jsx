import React, { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertCircle, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const NotificationsPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (user) {
      const subscription = supabase
        .channel('notifications_realtime')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 10));
          setUnreadCount(prev => prev + 1);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <Check size={16} className="text-lime-400" />;
      case 'error': return <AlertCircle size={16} className="text-rose-400" />;
      case 'info':
      default: return <Info size={16} className="text-indigo-400" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-lime-400 rounded-full border-2 border-slate-900 animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800/60 bg-slate-900/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-lime-400/10 text-lime-400 text-xs px-2 py-0.5 rounded-full border border-lime-400/20">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-3">
                      <Bell size={20} className="text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">You're all caught up!</p>
                    <p className="text-xs text-slate-500 mt-1">No new notifications.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-4 transition-colors hover:bg-slate-900/40 relative group ${!notif.is_read ? 'bg-slate-900/20' : ''}`}
                      >
                        {!notif.is_read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime-400 rounded-r"></div>
                        )}
                        <div className="flex gap-3">
                          <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            notif.type === 'success' ? 'bg-lime-400/10 border border-lime-400/20' :
                            notif.type === 'error' ? 'bg-rose-400/10 border border-rose-400/20' :
                            'bg-indigo-400/10 border border-indigo-400/20'
                          }`}>
                            {getIcon(notif.type)}
                          </div>
                          <div className="flex-1 pr-6">
                            <h4 className="text-sm font-semibold text-white mb-1">{notif.title}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed mb-2">{notif.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(notif.created_at).toLocaleDateString()}
                              </span>
                              {notif.link_url && (
                                <a 
                                  href={notif.link_url} 
                                  className="text-xs text-lime-400 hover:text-lime-300 flex items-center gap-1 transition-colors"
                                >
                                  View details <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        {!notif.is_read && (
                          <button 
                            onClick={() => markAsRead(notif.id)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all bg-slate-800 rounded-full p-1"
                            title="Mark as read"
                          >
                            <Check size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPopover;
