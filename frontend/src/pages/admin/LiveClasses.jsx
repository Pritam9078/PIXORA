import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabase';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { 
  Monitor, Calendar, Video, Clock, Plus, Users, 
  Trash2, Play, ExternalLink, Loader2, Sparkles, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const LiveClasses = () => {
  const { data: liveSessions, loading: sessionsLoading, refresh: refreshSessions } = useSupabaseData('live_sessions', '*');
  const { data: profiles, loading: profilesLoading } = useSupabaseData('profiles', 'id, full_name, role');
  const { data: courses, loading: coursesLoading } = useSupabaseData('courses', 'id, title');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor_id: '',
    course_id: '',
    scheduled_at: '',
    duration_mins: 60,
    meeting_link: '',
    status: 'scheduled'
  });

  const instructors = profiles.filter(p => p.role === 'instructor');

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.instructor_id || !formData.scheduled_at || !formData.meeting_link) {
      toast.error('Required fields are missing.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('live_sessions').insert(formData);
    setIsSubmitting(false);

    if (error) {
      toast.error(`Database Error: ${error.message}`);
    } else {
      toast.success('Live class session scheduled successfully.');
      setIsModalOpen(false);
      refreshSessions();
      setFormData({
        title: '',
        description: '',
        instructor_id: '',
        course_id: '',
        scheduled_at: '',
        duration_mins: 60,
        meeting_link: '',
        status: 'scheduled'
      });
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled live session?')) return;
    const { error } = await supabase.from('live_sessions').delete().eq('id', id);
    if (error) {
      toast.error(`Failed to cancel live session: ${error.message}`);
    } else {
      toast.success('Live session cancelled successfully.');
      refreshSessions();
    }
  };

  const getInstructorName = (id) => {
    const inst = instructors.find(i => i.id === id);
    return inst ? inst.full_name : 'Assigned Instructor';
  };

  const getCourseTitle = (id) => {
    const course = courses.find(c => c.id === id);
    return course ? course.title : 'General Stream';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Live Stream Command Desk</h1>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-0.5">Schedule classes, direct native streams, and monitor metrics</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#c3f400] text-black text-xs font-mono font-bold tracking-widest hover:bg-[#b0dc00] transition-all rounded-xl shadow-[0_0_15px_rgba(195,244,0,0.2)]"
          >
            <Plus size={14} />
            SCHEDULE_LIVE_CLASS
          </button>
        </div>

        {/* Dynamic Telemetry Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Scheduled', value: liveSessions.length, color: 'blue', icon: Calendar },
            { label: 'Active Live Now', value: liveSessions.filter(s => s.status === 'live').length, color: 'rose', icon: Video, pulse: true },
            { label: 'Completed Streams', value: liveSessions.filter(s => s.status === 'completed').length, color: 'emerald', icon: Monitor },
            { label: 'Assigned Instructors', value: instructors.length, color: 'purple', icon: Users }
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="bg-[#111113]/60 border border-white/5 p-5 rounded-2xl flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="text-slate-500 text-[9px] font-mono uppercase tracking-wider">{card.label}</p>
                  <div className="flex items-center gap-2">
                    <h4 className="text-2xl font-bold text-white tracking-tight">{card.value}</h4>
                    {card.pulse && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-${card.color}-500/10 text-${card.color}-500 group-hover:scale-110 transition-all duration-300`}>
                  <Icon size={18} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Master Session Scheduler Table */}
        <div className="bg-[#111113]/60 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-white/[0.01]">
            <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} className="text-[#c3f400]" />
              Scheduled Session Database
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  <th className="p-6">Session Title</th>
                  <th className="p-6">Associated Course</th>
                  <th className="p-6">Assigned Mentor</th>
                  <th className="p-6">Time (UTC)</th>
                  <th className="p-6">Duration</th>
                  <th className="p-6">Stream Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {sessionsLoading || profilesLoading || coursesLoading ? (
                  <tr>
                    <td colSpan="7" className="p-12 text-center">
                      <Loader2 size={24} className="animate-spin text-[#c3f400] mx-auto" />
                    </td>
                  </tr>
                ) : liveSessions.length > 0 ? (
                  liveSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-white/[0.01] transition-all group">
                      <td className="p-6">
                        <div className="font-bold text-white">{session.title}</div>
                        <div className="text-[10px] text-slate-500 max-w-xs truncate">{session.description || 'No description provided.'}</div>
                      </td>
                      <td className="p-6 text-slate-300 font-mono text-[11px]">{getCourseTitle(session.course_id)}</td>
                      <td className="p-6 font-semibold text-slate-300">{getInstructorName(session.instructor_id)}</td>
                      <td className="p-6 text-slate-400 font-mono text-[11px]">{new Date(session.scheduled_at).toLocaleString()}</td>
                      <td className="p-6 text-slate-400 font-mono text-[11px]">{session.duration_mins} mins</td>
                      <td className="p-6">
                        <span className={`px-2.5 py-1 text-[9px] font-bold rounded-full font-mono uppercase tracking-wider ${
                          session.status === 'live'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10 animate-pulse'
                            : session.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                            : 'bg-slate-500/10 text-slate-400 border border-white/5'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <a
                            href={session.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all"
                            title="Launch Video Room"
                          >
                            <ExternalLink size={13} />
                          </a>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition-all"
                            title="Cancel Class"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-12 text-center text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                      No live sessions scheduled inside the system
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal dialog box */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111113] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-6">
              <div>
                <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider">Schedule System Broadcast</h3>
                <p className="text-slate-500 text-[10px] uppercase font-mono tracking-wider mt-1">Configure meeting targets and video access keys</p>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Session Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solidity Assembly and EVM Deep Dive"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#09090B] border border-white/5 focus:border-white/15 outline-none rounded-xl p-3 text-xs text-white transition-all font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Instructor</label>
                    <select
                      required
                      value={formData.instructor_id}
                      onChange={(e) => setFormData({...formData, instructor_id: e.target.value})}
                      className="w-full bg-[#09090B] border border-white/5 focus:border-white/15 outline-none rounded-xl p-3 text-xs text-white transition-all font-mono"
                    >
                      <option value="">SELECT_INSTRUCTOR</option>
                      {instructors.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Course Hook</label>
                    <select
                      value={formData.course_id}
                      onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                      className="w-full bg-[#09090B] border border-white/5 focus:border-white/15 outline-none rounded-xl p-3 text-xs text-white transition-all font-mono"
                    >
                      <option value="">NONE (GENERAL)</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.scheduled_at}
                      onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})}
                      className="w-full bg-[#09090B] border border-white/5 focus:border-white/15 outline-none rounded-xl p-3 text-xs text-white transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Duration (Mins)</label>
                    <input
                      type="number"
                      required
                      value={formData.duration_mins}
                      onChange={(e) => setFormData({...formData, duration_mins: parseInt(e.target.value)})}
                      className="w-full bg-[#09090B] border border-white/5 focus:border-white/15 outline-none rounded-xl p-3 text-xs text-white transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Meeting Link</label>
                  <input
                    type="url"
                    required
                    placeholder="https://zoom.us/j/... or google meet link"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
                    className="w-full bg-[#09090B] border border-white/5 focus:border-white/15 outline-none rounded-xl p-3 text-xs text-white transition-all font-mono"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-white/5 text-slate-400 text-xs font-mono font-bold tracking-widest hover:text-white transition-all rounded-xl border border-white/5"
                  >
                    CLOSE_PORTAL
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#c3f400] text-black text-xs font-mono font-bold tracking-widest hover:bg-[#b0dc00] transition-all rounded-xl disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : 'INITIALIZE_SCHEDULE'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default LiveClasses;
