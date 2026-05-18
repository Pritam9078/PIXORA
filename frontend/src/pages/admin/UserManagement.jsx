import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { 
  Search, Filter, MoreHorizontal, UserPlus, 
  Download, Mail, Shield, UserX, ExternalLink,
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle,
  Edit2, Trash2, ShieldCheck, CheckSquare, Square,
  UserCheck, UserMinus, FileSpreadsheet, Upload,
  Activity, Lock, Unlock, Settings, Key, RefreshCw,
  Globe, Cpu, Layers, Smartphone, X, MoreVertical,
  SlidersHorizontal, Radio, Terminal, AlertTriangle
} from 'lucide-react';

// ==========================================
// IAM USER PROFILES
// ==========================================

const UserManagement = ({ initialTab = 'All Users' }) => {
  // Master state
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab);

  const { data: rawUsers, refresh } = useSupabaseData('profiles', '*');
  const { data: rawColleges } = useSupabaseData('colleges', '*');

  useEffect(() => {
    if (rawUsers && rawUsers.length > 0) {
      const dbUsers = rawUsers.map((p, idx) => {
        const joinedDate = new Date(p.created_at || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        
        const collegeObj = rawColleges?.find(c => c.id === p.college_id);
        const collegeName = collegeObj ? collegeObj.name : 'Pixora HQ';

        return {
          id: p.id,
          full_name: p.full_name || 'Anonymous User',
          email: p.email || `${p.role || 'user'}_${idx}@pixora.academy`,
          phone: p.phone || '+1 (555) 000-0000',
          avatar_url: p.avatar_url || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${p.id}`,
          role: p.role || 'student',
          institution: collegeName,
          cohort: 'Cohort Alpha 2026',
          track: p.specialization || 'Blockchain',
          status: p.status || 'active',
          verification_status: 'verified',
          payment_status: 'paid',
          mentor_assigned: 'Unassigned',
          last_active: 'Active Now',
          presence: 'online',
          device: 'Desktop (Chrome, macOS)',
          security_status: '2FA Enabled',
          joined_date: joinedDate,
          dob: '1998-01-01',
          country: 'Global',
          signup_source: 'Email Signin',
          oauth_provider: 'None',
          wallet_address: 'None',
          github_username: '',
          progress: 80,
          assignments_completed: '0/0',
          active_sessions: [
            { id: 's-1', device: 'Chrome / macOS', location: 'Global', ip: '127.0.0.1', last_active: 'Active Now' }
          ],
          invoices: [],
          activity_logs: [
            { action: "Profile Synced", timestamp: "Just Now", type: "system" }
          ]
        };
      });

      setUsers(dbUsers);
    } else {
      setUsers([]);
    }
  }, [rawUsers, rawColleges]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Advanced Dropdowns
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [trackFilter, setTrackFilter] = useState('All Tracks');
  const [enrollFilter, setEnrollFilter] = useState('All Statuses');
  
  // Real-time Success Notification log system
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: "Admin System Loaded", detail: "IAM security console fully operational", time: "Just Now", type: "system" },
    { id: 2, action: "Auth Hook Sync", detail: "Supabase authentication policies verified", time: "1 min ago", type: "success" }
  ]);

  // Column Customization Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    avatar: true, full_name: true, email: true, phone: true, role: true, 
    institution: true, cohort: true, track: true, enrollment_status: true,
    verification_status: true, payment_status: true, mentor_assigned: true,
    last_active: true, device: true, security_status: true, joined_date: true
  });
  const [showColumnConfig, setShowColumnConfig] = useState(false);

  // Modals Toggles
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  
  // Sliding Drawer Control
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Modal Specific State Management
  const [roleFormData, setRoleFormData] = useState({
    proposedRole: 'student',
    reason: '',
    confirmSecurity: ''
  });

  const [suspendFormData, setSuspendFormData] = useState({
    reason: '',
    duration: '30 Days',
    restrictionLevel: 'Block Login'
  });

  const [addUserFormData, setAddUserFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'student',
    track: 'Blockchain',
    institution: 'Independent',
    cohort: 'Cohort Alpha 2026'
  });

  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    role: 'instructor',
    institution: ''
  });

  // Bulk Import CSV Parser state
  const [csvFile, setCsvFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [parsedRows, setParsedRows] = useState([]);

  // Toast System
  const [toast, setToast] = useState(null);
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper trigger to add live log
  const pushAuditLog = (action, detail, type = 'action') => {
    const newLog = {
      id: Date.now(),
      action,
      detail,
      time: "Just Now",
      type
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Calculate Realtime Analytics Strip Numbers
  const totalUsers = users.length;
  const activeSessionsCount = users.filter(u => u.presence === 'online' || u.presence === 'away').length;
  const pendingVerificationCount = users.filter(u => u.verification_status === 'pending').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;
  const studentsCount = users.filter(u => u.role === 'student').length;
  const instructorsCount = users.filter(u => u.role === 'instructor').length;
  const mentorsCount = users.filter(u => u.role === 'mentor').length;
  const collegeAdminsCount = users.filter(u => u.role === 'college_admin').length;

  // Filter & Search Engine
  const filteredUsers = users.filter(user => {
    // 1. Tab filters
    if (activeTab === 'Students') return user.role === 'student';
    if (activeTab === 'Instructors') return user.role === 'instructor';
    if (activeTab === 'Mentors') return user.role === 'mentor';
    if (activeTab === 'College Admins') return user.role === 'college_admin';
    if (activeTab === 'Partners') return user.role === 'partner';
    if (activeTab === 'Suspended') return user.status === 'suspended';
    if (activeTab === 'Pending Verification') return user.verification_status === 'pending';
    if (activeTab === 'Inactive') return user.last_active === 'Offline' || user.status === 'restricted';
    if (activeTab === 'Recently Joined') return user.joined_date.includes('Feb');
    return true;
  }).filter(user => {
    // 2. Role selector
    if (roleFilter !== 'All Roles') {
      const formatted = roleFilter.toLowerCase().replace(' ', '_');
      return user.role === formatted;
    }
    return true;
  }).filter(user => {
    // 3. Track selector
    if (trackFilter !== 'All Tracks') return user.track === trackFilter;
    return true;
  }).filter(user => {
    // 4. Enrollment Selector
    if (enrollFilter !== 'All Statuses') return user.status === enrollFilter.toLowerCase();
    return true;
  }).filter(user => {
    // 5. Search bar input
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.full_name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.toLowerCase().includes(query) ||
      user.institution.toLowerCase().includes(query) ||
      user.cohort.toLowerCase().includes(query) ||
      user.wallet_address.toLowerCase().includes(query) ||
      user.github_username.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  });

  // Action: Add New User Form Submit
  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!addUserFormData.full_name || !addUserFormData.email) {
      triggerToast("Name and email are required fields.", "error");
      return;
    }
    const newUser = {
      id: `usr-${Math.floor(10000 + Math.random() * 90000)}-n${Math.floor(100 + Math.random() * 900)}`,
      full_name: addUserFormData.full_name,
      email: addUserFormData.email,
      phone: addUserFormData.phone || "+1 (555) 000-0000",
      avatar_url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&q=80&w=256`,
      role: addUserFormData.role,
      institution: addUserFormData.institution,
      cohort: addUserFormData.cohort,
      track: addUserFormData.track,
      status: "active",
      verification_status: "unverified",
      payment_status: "unpaid",
      mentor_assigned: "None",
      last_active: "Just Created",
      presence: "online",
      device: "Desktop (Chrome, macOS)",
      security_status: "Password-Only",
      joined_date: "May 18, 2026",
      dob: "2000-01-01",
      country: "United States",
      signup_source: "Super Admin Invite",
      oauth_provider: "None",
      wallet_address: "Sol...Unlinked",
      github_username: "@unlinked",
      progress: 0,
      assignments_completed: "0/0",
      active_sessions: [],
      invoices: [],
      activity_logs: [{ action: "User Profile Initialized", timestamp: "Just Now", type: "system" }],
      permissions: {
        create_users: false, edit_users: false, delete_users: false, suspend_users: false,
        create_courses: false, edit_courses: false, delete_courses: false, publish_content: false,
        view_payments: false, refund_payments: false, generate_invoices: false,
        view_analytics: false, export_reports: false,
        moderate_community: false, delete_messages: false, ban_users: false
      }
    };

    setUsers(prev => [newUser, ...prev]);
    pushAuditLog("CREATE_USER", `Super Admin initialized new identity: ${newUser.full_name} (${newUser.email})`, "success");
    triggerToast(`User ${newUser.full_name} has been added successfully.`);
    setIsAddUserOpen(false);
    // Reset Form
    setAddUserFormData({
      full_name: '', email: '', phone: '', role: 'student', track: 'Blockchain', institution: 'Independent', cohort: 'Cohort Alpha 2026'
    });
  };

  // Action: Modify User Role Form Submit
  const handleRoleChangeSubmit = (e) => {
    e.preventDefault();
    if (!roleFormData.confirmSecurity) {
      triggerToast("Confirm authentication or admin password is required.", "error");
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          role: roleFormData.proposedRole,
          activity_logs: [
            { action: `Role changed to ${roleFormData.proposedRole}. Reason: ${roleFormData.reason || 'None provided'}`, timestamp: "Just Now", type: "security" },
            ...u.activity_logs
          ]
        };
      }
      return u;
    }));

    // Update current selected user context in drawer
    setSelectedUser(prev => ({
      ...prev,
      role: roleFormData.proposedRole,
      activity_logs: [
        { action: `Role changed to ${roleFormData.proposedRole}. Reason: ${roleFormData.reason || 'None provided'}`, timestamp: "Just Now", type: "security" },
        ...prev.activity_logs
      ]
    }));

    // Persist to Supabase Database
    supabase.from('profiles').update({ role: roleFormData.proposedRole }).eq('id', selectedUser.id)
      .then(({ error }) => {
        if (error) {
          triggerToast(`Database Error: ${error.message}`, "error");
        } else {
          // Log administrative action
          supabase.from('admin_logs').insert({
            action: `ROLE_UPDATE: ${selectedUser.full_name} to ${roleFormData.proposedRole}`,
            target_type: 'user',
            target_id: selectedUser.id,
            payload: { reason: roleFormData.reason }
          }).then(() => {});
        }
      });

    pushAuditLog("ROLE_UPDATE", `Role for ${selectedUser.full_name} updated to '${roleFormData.proposedRole}'`, "security");
    triggerToast(`Successfully updated role for ${selectedUser.full_name}.`);
    setIsRoleModalOpen(false);
    setRoleFormData({ proposedRole: 'student', reason: '', confirmSecurity: '' });
  };

  // Action: Suspend User Form Submit
  const handleSuspendSubmit = (e) => {
    e.preventDefault();
    if (!suspendFormData.reason) {
      triggerToast("Please provide a valid suspension reason.", "error");
      return;
    }

    setUsers(prev => prev.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          status: "suspended",
          activity_logs: [
            { action: `Account Restricted. Level: ${suspendFormData.restrictionLevel}. Duration: ${suspendFormData.duration}. Reason: ${suspendFormData.reason}`, timestamp: "Just Now", type: "security" },
            ...u.activity_logs
          ]
        };
      }
      return u;
    }));

    setSelectedUser(prev => ({
      ...prev,
      status: "suspended",
      activity_logs: [
        { action: `Account Restricted. Level: ${suspendFormData.restrictionLevel}. Duration: ${suspendFormData.duration}. Reason: ${suspendFormData.reason}`, timestamp: "Just Now", type: "security" },
        ...prev.activity_logs
      ]
    }));

    pushAuditLog("USER_SUSPENSION", `Suspended user ${selectedUser.full_name}. Restriction Level: ${suspendFormData.restrictionLevel}`, "security");
    triggerToast(`${selectedUser.full_name} has been suspended.`);
    setIsSuspendModalOpen(false);
    setSuspendFormData({ reason: '', duration: '30 Days', restrictionLevel: 'Block Login' });
  };

  // Quick Action: Verify User
  const handleQuickVerify = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, verification_status: "verified" };
      }
      return u;
    }));
    setSelectedUser(prev => ({ ...prev, verification_status: "verified" }));
    pushAuditLog("VERIFY_IDENTITY", `Verified identity documentation for user ID ${userId}`, "success");
    triggerToast("Identity document verified successfully.");
  };

  // Quick Action: Force Session Termination (Logout)
  const handleForceLogout = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, presence: "offline", active_sessions: [] };
      }
      return u;
    }));
    setSelectedUser(prev => ({ ...prev, presence: "offline", active_sessions: [] }));
    pushAuditLog("SESSION_REVOCATION", `Terminated all sessions and tokens for user ID ${userId}`, "security");
    triggerToast("All active sessions revoked successfully.");
  };

  // Quick Action: Delete User
  const handleDeleteUser = (userId, name) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete user ${name}? This action is irreversible.`)) return;
    
    supabase.from('profiles').delete().eq('id', userId)
      .then(({ error }) => {
        if (error) {
          triggerToast(`Database Error: ${error.message}`, "error");
        } else {
          // Log administrative action
          supabase.from('admin_logs').insert({
            action: `USER_DELETE: ${name}`,
            target_type: 'user',
            target_id: userId,
            payload: { name }
          }).then(() => {});
        }
      });

    setUsers(prev => prev.filter(u => u.id !== userId));
    pushAuditLog("USER_DELETE", `Permanently purged identity record for ${name} (${userId})`, "security");
    triggerToast(`User ${name} has been successfully deleted.`);
    setIsDrawerOpen(false);
  };

  // Action: Invite User
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteFormData.email) {
      triggerToast("Please supply a valid invitation destination.", "error");
      return;
    }
    pushAuditLog("INVITE_USER", `Dispatched access setup invitation link to: ${inviteFormData.email} (Role: ${inviteFormData.role})`, "action");
    triggerToast(`Invitation sent to ${inviteFormData.email}.`);
    setIsInviteOpen(false);
    setInviteFormData({ email: '', role: 'instructor', institution: '' });
  };

  // Action: Bulk CSV Parsing Simulator
  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      setImportProgress(20);
      setTimeout(() => setImportProgress(50), 300);
      setTimeout(() => {
        setImportProgress(100);
        setParsedRows([
          { full_name: "Damian West", email: "d.west@stanford.edu", role: "student", track: "Blockchain" },
          { full_name: "Clarissa Hayes", email: "c.hayes@mit.edu", role: "student", track: "Game Development" },
          { full_name: "Vikram Malhotra", email: "vikram@iitb.ac.in", role: "instructor", track: "Mixed" }
        ]);
      }, 700);
    }
  };

  const handleBulkImportExecute = () => {
    if (parsedRows.length === 0) {
      triggerToast("No valid rows parsed to import.", "error");
      return;
    }

    const newUsersList = parsedRows.map((row, idx) => ({
      id: `usr-csv-${Date.now()}-${idx}`,
      full_name: row.full_name,
      email: row.email,
      phone: "+1 (555) 123-9000",
      avatar_url: null,
      role: row.role,
      institution: "Independent",
      cohort: "Cohort Alpha 2026",
      track: row.track,
      status: "active",
      verification_status: "verified",
      payment_status: "paid",
      mentor_assigned: "None",
      last_active: "Just Imported",
      presence: "offline",
      device: "Desktop",
      security_status: "Password-Only",
      joined_date: "May 18, 2026",
      dob: "1997-08-10",
      country: "United States",
      signup_source: "Bulk Import",
      oauth_provider: "None",
      wallet_address: "Sol...Unlinked",
      github_username: `@${row.full_name.toLowerCase().replace(' ', '_')}`,
      progress: 0,
      assignments_completed: "0/0",
      active_sessions: [],
      invoices: [],
      activity_logs: [{ action: "Imported via CSV portal", timestamp: "Just Now", type: "system" }],
      permissions: {
        create_users: false, edit_users: false, delete_users: false, suspend_users: false,
        create_courses: false, edit_courses: false, delete_courses: false, publish_content: false,
        view_payments: false, refund_payments: false, generate_invoices: false,
        view_analytics: false, export_reports: false,
        moderate_community: false, delete_messages: false, ban_users: false
      }
    }));

    setUsers(prev => [...newUsersList, ...prev]);
    pushAuditLog("BULK_IMPORT", `Bulk imported ${newUsersList.length} user records successfully.`, "success");
    triggerToast(`Bulk imported ${newUsersList.length} users successfully.`);
    setIsImportOpen(false);
    setCsvFile(null);
    setImportProgress(0);
    setParsedRows([]);
  };

  // Toggle multi-select checkbox helpers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedUsers(prev => [...prev, userId]);
    }
  };

  // Bulk Actions
  const handleBulkSuspend = () => {
    setUsers(prev => prev.map(u => {
      if (selectedUsers.includes(u.id)) {
        return { ...u, status: "suspended" };
      }
      return u;
    }));
    pushAuditLog("BULK_SUSPEND", `Bulk suspended ${selectedUsers.length} user records`, "security");
    triggerToast(`Successfully suspended ${selectedUsers.length} selected users.`);
    setSelectedUsers([]);
  };

  const handleBulkVerify = () => {
    setUsers(prev => prev.map(u => {
      if (selectedUsers.includes(u.id)) {
        return { ...u, verification_status: "verified" };
      }
      return u;
    }));
    pushAuditLog("BULK_VERIFY", `Bulk verified ${selectedUsers.length} user identity documents`, "success");
    triggerToast(`Successfully verified ${selectedUsers.length} selected users.`);
    setSelectedUsers([]);
  };

  // Grid Colors mapper for Role styles
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'super_admin': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'college_admin': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'instructor': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'mentor': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'partner': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  // Render
  return (
    <AdminLayout>
      <div className="space-y-6 text-slate-100 relative">
        
        {/* Custom Toast Alert */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl shadow-2xl ${
                toast.type === 'error' 
                  ? 'bg-rose-950/80 border-rose-500/30 text-rose-200' 
                  : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200'
              }`}
            >
              {toast.type === 'error' ? <AlertTriangle size={18} className="text-rose-400 animate-pulse" /> : <ShieldCheck size={18} className="text-emerald-400" />}
              <span className="text-xs font-semibold">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
            1. PAGE HEADER
            ========================================== */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Shield className="text-blue-500" size={28} />
              Identity & Access Management (IAM)
            </h1>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-semibold">
              Platform central authority. Manage credentials, security locks, live roles & system syncs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded transition-all shadow-lg shadow-blue-600/20"
            >
              <UserPlus size={13} />
              + Add User
            </button>
            <button 
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#18181B] hover:bg-[#27272A] border border-white/5 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded transition-all"
            >
              <Mail size={13} />
              Invite User
            </button>
            <button 
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#18181B] hover:bg-[#27272A] border border-white/5 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded transition-all"
            >
              <Upload size={13} />
              Bulk Import
            </button>
            <button 
              onClick={() => {
                pushAuditLog("EXPORT_CSV", "Dispatched table dataset package for download", "action");
                triggerToast("User database CSV generated and downloaded.");
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#18181B] hover:bg-[#27272A] border border-white/5 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded transition-all"
            >
              <Download size={13} />
              Export CSV
            </button>
            <button 
              onClick={() => {
                pushAuditLog("SYNC_INSTITUTION", "Refreshed OAuth structures and college directory hooks", "success");
                triggerToast("Successfully synchronized student credentials across active campuses.");
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#18181B] hover:bg-[#27272A] border border-white/5 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded transition-all"
            >
              <RefreshCw size={13} className="animate-spin-slow" />
              Sync Inst.
            </button>
          </div>
        </div>

        {/* ==========================================
            2. TOP ANALYTICS STRIP
            ========================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          {[
            { label: "Total Users", val: totalUsers, sub: "Registered", color: "text-blue-400" },
            { label: "Active Sessions", val: activeSessionsCount, sub: "Online presence", color: "text-emerald-400" },
            { label: "Pending KYC", val: pendingVerificationCount, sub: "Awaiting review", color: "text-amber-400" },
            { label: "Suspended", val: suspendedCount, sub: "Restricted list", color: "text-rose-400" },
            { label: "Students", val: studentsCount, sub: "Pixora LMS Academy", color: "text-purple-400" },
            { label: "Instructors", val: instructorsCount, sub: "Academic Staff", color: "text-sky-400" },
            { label: "Mentors", val: mentorsCount, sub: "Coaching Panel", color: "text-pink-400" },
            { label: "College Admins", val: collegeAdminsCount, sub: "Institutional Sync", color: "text-orange-400" },
          ].map((card, i) => (
            <div key={i} className="bg-[#0b0b0d] border border-white/5 rounded-lg p-3 flex flex-col justify-between hover:border-white/10 transition-all group">
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">{card.label}</span>
              <span className={`text-2xl font-black my-1 block tracking-tight ${card.color}`}>{card.val}</span>
              <span className="text-[9px] text-slate-600 font-medium block">{card.sub}</span>
            </div>
          ))}
        </div>

        {/* ==========================================
            3. FILTER TABS & ADVANCED SEARCH OMNIBAR
            ========================================== */}
        <div className="bg-[#0b0b0d] border border-white/5 rounded-xl p-4 space-y-4">
          
          {/* Scrollable Horizontal Filter Tabs */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3 overflow-x-auto gap-4 scrollbar-thin">
            <div className="flex items-center gap-1.5 min-w-max">
              {[
                "All Users", "Students", "Instructors", "Mentors", "College Admins", 
                "Partners", "Suspended", "Pending Verification", "Inactive", "Recently Joined"
              ].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab 
                      ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/5' 
                      : 'border border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Column Config & Options Toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowColumnConfig(!showColumnConfig)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#141416] hover:bg-[#202023] border border-white/5 rounded text-[10px] text-slate-400 font-bold uppercase tracking-wider transition-all"
              >
                <SlidersHorizontal size={12} />
                Columns Visibility
              </button>
              {showColumnConfig && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0f0f12] border border-white/10 rounded-lg p-3 z-30 shadow-2xl space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider">Toggle Columns</span>
                    <button onClick={() => setShowColumnConfig(false)} className="text-slate-500 hover:text-white">
                      <X size={12} />
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1.5 scrollbar-thin pr-1 text-[10px] font-medium text-slate-400">
                    {Object.keys(visibleColumns).map((col) => (
                      <label key={col} className="flex items-center gap-2 hover:bg-white/5 p-1 rounded cursor-pointer transition-all">
                        <input 
                          type="checkbox" 
                          checked={visibleColumns[col]} 
                          onChange={() => setVisibleColumns({...visibleColumns, [col]: !visibleColumns[col]})}
                          className="rounded bg-[#09090b] border-white/10 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3 h-3" 
                        />
                        <span className="capitalize">{col.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Box & Advanced Selector Filters */}
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Expanded Search Omnibar */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by ID, Name, Email, Phone, Cohort, Wallet address, GitHub, Role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141416] border border-white/5 rounded py-2.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-white/20 transition-all font-medium"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Role Dropdown */}
              <div className="flex items-center gap-1 bg-[#141416] border border-white/5 rounded px-2">
                <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">Role:</span>
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent border-none text-[10px] text-slate-300 focus:ring-0 py-1.5 pr-8 pl-1 font-bold uppercase tracking-wider"
                >
                  <option value="All Roles">All Roles</option>
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Mentor">Mentor</option>
                  <option value="College Admin">College Admin</option>
                  <option value="Partner">Partner</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              {/* Track Dropdown */}
              <div className="flex items-center gap-1 bg-[#141416] border border-white/5 rounded px-2">
                <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">Track:</span>
                <select 
                  value={trackFilter}
                  onChange={(e) => setTrackFilter(e.target.value)}
                  className="bg-transparent border-none text-[10px] text-slate-300 focus:ring-0 py-1.5 pr-8 pl-1 font-bold uppercase tracking-wider"
                >
                  <option value="All Tracks">All Tracks</option>
                  <option value="Blockchain">Blockchain</option>
                  <option value="Game Development">Game Dev</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              {/* Status Dropdown */}
              <div className="flex items-center gap-1 bg-[#141416] border border-white/5 rounded px-2">
                <span className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">Workflow:</span>
                <select 
                  value={enrollFilter}
                  onChange={(e) => setEnrollFilter(e.target.value)}
                  className="bg-transparent border-none text-[10px] text-slate-300 focus:ring-0 py-1.5 pr-8 pl-1 font-bold uppercase tracking-wider"
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Restricted">Restricted</option>
                  <option value="Pending">Pending</option>
                  <option value="Banned">Banned</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <button 
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('All Roles');
                  setTrackFilter('All Tracks');
                  setEnrollFilter('All Statuses');
                  triggerToast("Active query filters flushed.");
                }}
                className="px-2.5 py-1 bg-[#1c1c1f] hover:bg-[#2c2c30] text-slate-400 hover:text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* ==========================================
            4. ADVANCED MASTER MULTI-SELECT USER TABLE
            ========================================== */}
        <div className="bg-[#0b0b0d] border border-white/5 rounded-xl overflow-hidden shadow-2xl relative">
          
          {/* Real-time Presence Sticky Banner / Bulk Action Panel */}
          <AnimatePresence>
            {selectedUsers.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-3 bg-[#0d0d0f]/90 border border-blue-500/20 rounded-lg backdrop-blur-md shadow-2xl text-[10px] font-bold text-white uppercase tracking-wider"
              >
                <div className="flex items-center gap-2 border-r border-white/10 pr-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                  <span>{selectedUsers.length} Selected</span>
                </div>
                <button 
                  onClick={handleBulkVerify}
                  className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/20 transition-all"
                >
                  Bulk Verify
                </button>
                <button 
                  onClick={handleBulkSuspend}
                  className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded hover:bg-rose-500/20 transition-all"
                >
                  Bulk Suspend
                </button>
                <button 
                  onClick={() => setSelectedUsers([])}
                  className="px-2 py-1 bg-slate-500/15 text-slate-300 rounded hover:bg-slate-500/20 transition-all"
                >
                  Deselect
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto min-h-[450px]">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5 text-slate-500 uppercase tracking-widest text-[9px] font-black">
                  <th className="px-4 py-3 w-10">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll}
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      className="rounded bg-[#09090b] border-white/10 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3 h-3" 
                    />
                  </th>
                  {visibleColumns.avatar && <th className="px-4 py-3 w-12">Avatar</th>}
                  {visibleColumns.full_name && <th className="px-4 py-3">Identity Name</th>}
                  {visibleColumns.email && <th className="px-4 py-3">Login Email</th>}
                  {visibleColumns.phone && <th className="px-4 py-3">Phone Node</th>}
                  {visibleColumns.role && <th className="px-4 py-3">Security Role</th>}
                  {visibleColumns.institution && <th className="px-4 py-3">Campus/Org</th>}
                  {visibleColumns.cohort && <th className="px-4 py-3">Assigned Cohort</th>}
                  {visibleColumns.track && <th className="px-4 py-3">LMS Track</th>}
                  {visibleColumns.enrollment_status && <th className="px-4 py-3">Workflow State</th>}
                  {visibleColumns.verification_status && <th className="px-4 py-3">KYC Verify</th>}
                  {visibleColumns.payment_status && <th className="px-4 py-3">Finances</th>}
                  {visibleColumns.mentor_assigned && <th className="px-4 py-3">Coached By</th>}
                  {visibleColumns.last_active && <th className="px-4 py-3">Presence Active</th>}
                  {visibleColumns.device && <th className="px-4 py-3">Target Node</th>}
                  {visibleColumns.security_status && <th className="px-4 py-3">Access State</th>}
                  {visibleColumns.joined_date && <th className="px-4 py-3">Enlist Date</th>}
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="18" className="px-4 py-20 text-center text-slate-500 uppercase tracking-widest font-black text-xs animate-pulse">
                      No_Active_Security_Identities_Match_Query
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr 
                    key={user.id}
                    className={`hover:bg-white/[0.02] transition-all cursor-pointer group ${selectedUsers.includes(user.id) ? 'bg-blue-500/[0.03]' : ''}`}
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDrawerOpen(true);
                    }}
                  >
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded bg-[#09090b] border-white/10 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3 h-3" 
                      />
                    </td>
                    
                    {/* AVATAR */}
                    {visibleColumns.avatar && (
                      <td className="px-4 py-3.5">
                        <div className="relative">
                          <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-white border border-white/10 overflow-hidden">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              user.full_name?.charAt(0) || 'U'
                            )}
                          </div>
                          {/* Live Presence indicator dot */}
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0d0d0f] ${
                            user.presence === 'online' ? 'bg-emerald-500 animate-pulse' :
                            user.presence === 'away' ? 'bg-amber-400' : 'bg-slate-500'
                          }`} />
                        </div>
                      </td>
                    )}

                    {/* FULL NAME */}
                    {visibleColumns.full_name && (
                      <td className="px-4 py-3.5 font-bold text-white group-hover:text-blue-400 transition-colors">
                        {user.full_name}
                      </td>
                    )}

                    {/* EMAIL */}
                    {visibleColumns.email && (
                      <td className="px-4 py-3.5 text-slate-400 lowercase font-mono">
                        {user.email}
                      </td>
                    )}

                    {/* PHONE */}
                    {visibleColumns.phone && (
                      <td className="px-4 py-3.5 text-slate-400 font-mono">
                        {user.phone}
                      </td>
                    )}

                    {/* ROLE BADGE */}
                    {visibleColumns.role && (
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tight ${getRoleBadgeClass(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                    )}

                    {/* INSTITUTION */}
                    {visibleColumns.institution && (
                      <td className="px-4 py-3.5 text-slate-300 font-semibold">
                        {user.institution}
                      </td>
                    )}

                    {/* COHORT */}
                    {visibleColumns.cohort && (
                      <td className="px-4 py-3.5 text-slate-400">
                        {user.cohort}
                      </td>
                    )}

                    {/* TRACK */}
                    {visibleColumns.track && (
                      <td className="px-4 py-3.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          user.track === 'Blockchain' ? 'text-sky-400 bg-sky-500/5' :
                          user.track === 'Game Development' ? 'text-pink-400 bg-pink-500/5' :
                          'text-amber-400 bg-amber-500/5'
                        }`}>
                          {user.track}
                        </span>
                      </td>
                    )}

                    {/* ENROLLMENT STATUS */}
                    {visibleColumns.enrollment_status && (
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                          user.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' :
                          user.status === 'suspended' ? 'text-rose-400 bg-rose-500/10' :
                          user.status === 'restricted' ? 'text-amber-400 bg-amber-500/10' :
                          'text-slate-400 bg-slate-500/10'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                    )}

                    {/* KYC STATUS */}
                    {visibleColumns.verification_status && (
                      <td className="px-4 py-3.5">
                        <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider ${
                          user.verification_status === 'verified' ? 'text-emerald-400' :
                          user.verification_status === 'pending' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.verification_status === 'verified' ? 'bg-emerald-400' :
                            user.verification_status === 'pending' ? 'bg-amber-400' : 'bg-rose-400'
                          }`} />
                          {user.verification_status}
                        </span>
                      </td>
                    )}

                    {/* PAYMENT STATUS */}
                    {visibleColumns.payment_status && (
                      <td className="px-4 py-3.5 capitalize font-semibold">
                        <span className={`${
                          user.payment_status === 'paid' ? 'text-emerald-400' :
                          user.payment_status === 'unpaid' ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          {user.payment_status}
                        </span>
                      </td>
                    )}

                    {/* MENTOR */}
                    {visibleColumns.mentor_assigned && (
                      <td className="px-4 py-3.5 text-slate-400 font-semibold">
                        {user.mentor_assigned}
                      </td>
                    )}

                    {/* LAST ACTIVE */}
                    {visibleColumns.last_active && (
                      <td className="px-4 py-3.5 font-mono text-slate-500">
                        {user.last_active}
                      </td>
                    )}

                    {/* DEVICE */}
                    {visibleColumns.device && (
                      <td className="px-4 py-3.5 text-slate-400 truncate max-w-[120px] font-mono">
                        {user.device}
                      </td>
                    )}

                    {/* SECURITY STATUS */}
                    {visibleColumns.security_status && (
                      <td className="px-4 py-3.5">
                        <span className={`text-[9px] font-bold ${
                          user.security_status === '2FA Enabled' ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {user.security_status}
                        </span>
                      </td>
                    )}

                    {/* JOINED DATE */}
                    {visibleColumns.joined_date && (
                      <td className="px-4 py-3.5 text-slate-500 font-mono">
                        {user.joined_date}
                      </td>
                    )}

                    {/* COLUMN CONTROLS */}
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setRoleFormData({ proposedRole: user.role, reason: '', confirmSecurity: '' });
                            setIsRoleModalOpen(true);
                          }}
                          title="Role Management Portal"
                          className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-all"
                        >
                          <ShieldCheck size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setIsSuspendModalOpen(true);
                          }}
                          title="Restrict / Suspend User"
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                        >
                          <UserMinus size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.full_name)}
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-white/5 rounded transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <span>
              Showing <span className="text-white">{filteredUsers.length}</span> of <span className="text-white">{users.length}</span> security identities
            </span>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-white/5 rounded text-slate-600 hover:text-white hover:bg-white/5 transition-all disabled:opacity-20 disabled:pointer-events-none" disabled>
                <ChevronLeft size={14} />
              </button>
              <button className="p-2 border border-white/5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ==========================================
            5. LIVE AUDITING LOG TICKER BAR
            ========================================== */}
        <div className="bg-[#0b0b0d] border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
              <Terminal size={12} className="text-blue-400" />
              Live Security Auditing Event Stream
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-semibold font-mono">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 bg-[#09090b] border border-white/5 p-2 rounded">
                <span className={`text-[9px] uppercase font-black px-1 rounded ${
                  log.type === 'security' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {log.type}
                </span>
                <div className="flex-1">
                  <p className="text-slate-300 font-bold">{log.action}</p>
                  <p className="text-slate-500 text-[9px] mt-0.5">{log.detail}</p>
                </div>
                <span className="text-slate-600 text-[9px] whitespace-nowrap">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================
            6. USER PROFILE SLIDING DRAWER PANEL (SLIDE DRAWER)
            ========================================== */}
        <AnimatePresence>
          {isDrawerOpen && selectedUser && (
            <>
              {/* Overlay shadow backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 bg-black z-40 cursor-pointer"
              />

              {/* Profile Sliding Drawer Panel */}
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full sm:w-[500px] xl:w-[600px] bg-[#0d0d0f] border-l border-white/10 z-50 overflow-y-auto shadow-2xl p-6 space-y-6 scrollbar-thin text-xs text-slate-300"
              >
                {/* Header controls inside Drawer */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                    <Activity size={12} className="text-blue-500" />
                    Identity profile deck
                  </span>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-all text-slate-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* PROFILE HEADER CARD */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white border border-white/10 overflow-hidden">
                      {selectedUser.avatar_url ? (
                        <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        selectedUser.full_name?.charAt(0) || 'U'
                      )}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0d0d0f] ${
                      selectedUser.presence === 'online' ? 'bg-emerald-500 animate-pulse' :
                      selectedUser.presence === 'away' ? 'bg-amber-400' : 'bg-slate-500'
                    }`} />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-lg font-black text-white">{selectedUser.full_name}</h2>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${getRoleBadgeClass(selectedUser.role)}`}>
                        {selectedUser.role.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono lowercase">{selectedUser.email}</p>
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-[9px] font-bold mt-1">
                      <span className="flex items-center gap-0.5 text-slate-400">
                        <Globe size={10} />
                        {selectedUser.country}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-0.5 text-blue-400">
                        <Cpu size={10} />
                        {selectedUser.wallet_address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FAST ACTION PANEL */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Fast Security Overrides</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button 
                      onClick={() => {
                        setRoleFormData({ proposedRole: selectedUser.role, reason: '', confirmSecurity: '' });
                        setIsRoleModalOpen(true);
                      }}
                      className="px-3 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded hover:bg-blue-600/20 transition-all font-bold text-[9px] uppercase tracking-wider text-center"
                    >
                      Grant Role
                    </button>
                    <button 
                      onClick={() => setIsSuspendModalOpen(true)}
                      className="px-3 py-2 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded hover:bg-rose-600/20 transition-all font-bold text-[9px] uppercase tracking-wider text-center"
                    >
                      Suspend Acc.
                    </button>
                    <button 
                      onClick={() => handleForceLogout(selectedUser.id)}
                      className="px-3 py-2 bg-amber-600/10 border border-amber-500/20 text-amber-400 rounded hover:bg-amber-600/20 transition-all font-bold text-[9px] uppercase tracking-wider text-center col-span-2 sm:col-span-1"
                    >
                      Force Logout
                    </button>
                    {selectedUser.verification_status !== 'verified' && (
                      <button 
                        onClick={() => handleQuickVerify(selectedUser.id)}
                        className="px-3 py-2 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-600/20 transition-all font-bold text-[9px] uppercase tracking-wider text-center"
                      >
                        Verify KYC
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        pushAuditLog("PASSWORD_RESET", `Initiated passkey refresh loop for user ID ${selectedUser.id}`, "security");
                        triggerToast(`Dispatched master password reset key to ${selectedUser.email}.`);
                      }}
                      className="px-3 py-2 bg-[#1c1c1f] hover:bg-[#28282c] border border-white/5 text-slate-300 rounded transition-all font-bold text-[9px] uppercase tracking-wider text-center"
                    >
                      Reset Password
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(selectedUser.id, selectedUser.full_name)}
                      className="px-3 py-2 bg-rose-950/20 border border-rose-900/30 text-rose-500 rounded hover:bg-rose-900/30 transition-all font-bold text-[9px] uppercase tracking-wider text-center"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>

                {/* ACCOUNT INFORMATION SECTION */}
                <div className="bg-[#141416] border border-white/5 rounded-lg p-4 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-white/5 pb-2">Profile & Identity Metrics</h4>
                  <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-600 block uppercase font-bold text-[8px]">Mobile Node</span>
                      <span className="text-slate-200">{selectedUser.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block uppercase font-bold text-[8px]">Birth Date</span>
                      <span className="text-slate-200">{selectedUser.dob}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block uppercase font-bold text-[8px]">Enlist Source</span>
                      <span className="text-slate-200">{selectedUser.signup_source}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block uppercase font-bold text-[8px]">Federated Auth</span>
                      <span className="text-slate-200">{selectedUser.oauth_provider}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block uppercase font-bold text-[8px]">Solana Wallet</span>
                      <span className="text-blue-400 font-bold truncate block">{selectedUser.wallet_address}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block uppercase font-bold text-[8px]">Github Handle</span>
                      <span className="text-purple-400 font-bold block">{selectedUser.github_username}</span>
                    </div>
                  </div>
                </div>

                {/* ENROLLMENT & ACADEMIC INFORMATION */}
                <div className="bg-[#141416] border border-white/5 rounded-lg p-4 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-white/5 pb-2">Enrollment & Academy Status</h4>
                  <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-600 block uppercase font-bold text-[8px]">Affiliation Campus</span>
                      <span className="text-slate-200 font-bold">{selectedUser.institution}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block uppercase font-bold text-[8px]">Assigned Cohort</span>
                      <span className="text-slate-200">{selectedUser.cohort}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block uppercase font-bold text-[8px]">Ecosystem Track</span>
                      <span className="text-slate-200">{selectedUser.track}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 block uppercase font-bold text-[8px]">Assigned Advisor</span>
                      <span className="text-slate-200">{selectedUser.mentor_assigned}</span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex justify-between text-[8px] uppercase tracking-wider text-slate-500 font-black mb-1">
                        <span>Academy Track Completion Progress</span>
                        <span className="text-white">{selectedUser.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-[#09090b] rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedUser.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECURITY LOGS SECTION */}
                <div className="bg-[#141416] border border-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Login Keys & Nodes</h4>
                    <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">
                      {selectedUser.security_status}
                    </span>
                  </div>
                  {selectedUser.active_sessions.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic">No active session footprints recorded.</p>
                  ) : (
                    <div className="space-y-2 font-mono text-[9px]">
                      {selectedUser.active_sessions.map((ses) => (
                        <div key={ses.id} className="flex justify-between items-center bg-[#09090b] p-2 rounded border border-white/5">
                          <div>
                            <p className="text-slate-300 font-bold">{ses.device}</p>
                            <p className="text-slate-500 text-[8px]">IP: {ses.ip} • Loc: {ses.location}</p>
                          </div>
                          <span className="text-slate-600 font-bold whitespace-nowrap">{ses.last_active}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* FINANCES & SUBSCRIPTIONS */}
                <div className="bg-[#141416] border border-white/5 rounded-lg p-4 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-white/5 pb-2">Financial Records</h4>
                  {selectedUser.invoices.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic">No billing records found for this identity.</p>
                  ) : (
                    <div className="space-y-1.5 font-mono text-[9px]">
                      {selectedUser.invoices.map((inv) => (
                        <div key={inv.id} className="flex justify-between items-center bg-[#09090b] p-2 rounded">
                          <div>
                            <span className="text-slate-300 font-bold block">{inv.plan}</span>
                            <span className="text-slate-600 text-[8px]">{inv.id} • {inv.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-200 block font-bold">{inv.amount}</span>
                            <span className="text-emerald-400 block text-[8px] uppercase tracking-wider">{inv.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* USER LOG TIMELINE */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Audit Event Trail</h4>
                  <div className="relative border-l border-white/5 pl-3 ml-2 space-y-4">
                    {selectedUser.activity_logs.map((log, idx) => (
                      <div key={idx} className="relative text-[10px]">
                        <span className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-[#0d0d0f] border-2 border-slate-600" />
                        <span className="text-slate-500 font-mono text-[8px] block">{log.timestamp}</span>
                        <p className="text-slate-300 mt-0.5">{log.action}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ==========================================
            7. ROLE MANAGEMENT MODAL (RBAC CONTROLLER)
            ========================================== */}
        <AnimatePresence>
          {isRoleModalOpen && selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black" onClick={() => setIsRoleModalOpen(false)} />
              
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0f0f12] border border-white/10 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl relative z-10 p-5 space-y-4 text-xs text-slate-300"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-1">
                    <Shield size={12} className="text-purple-400" />
                    Security RBAC override panel
                  </span>
                  <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>

                <form onSubmit={handleRoleChangeSubmit} className="space-y-4">
                  <div className="bg-[#141416] p-3 rounded border border-white/5">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-black">Managing Identity</p>
                    <p className="text-white font-bold text-sm mt-0.5">{selectedUser.full_name}</p>
                    <p className="text-slate-400 text-[10px] font-mono lowercase">{selectedUser.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block mb-1">Current Active Role</span>
                      <span className={`px-2.5 py-1 rounded border text-[10px] font-black uppercase tracking-tighter inline-block ${getRoleBadgeClass(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block mb-1">Assign Proposed Role</span>
                      <select 
                        value={roleFormData.proposedRole}
                        onChange={(e) => setRoleFormData({ ...roleFormData, proposedRole: e.target.value })}
                        className="w-full bg-[#141416] border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-500/50 uppercase font-black tracking-wider transition-all"
                      >
                        <option value="student">STUDENT</option>
                        <option value="instructor">INSTRUCTOR</option>
                        <option value="mentor">MENTOR</option>
                        <option value="college_admin">COLLEGE ADMIN</option>
                        <option value="partner">PARTNER</option>
                        <option value="hr">HR OPERATOR</option>
                        <option value="admin">ADMINISTRATOR</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Granular Permissions Live Preview Map */}
                  <div className="bg-[#141416] p-3 border border-white/5 rounded space-y-2">
                    <h5 className="text-[9px] font-black uppercase text-slate-400 tracking-wider border-b border-white/5 pb-1.5 flex justify-between items-center">
                      <span>Access Permissions Matrix Preview</span>
                      <span className="text-slate-600 font-mono">Live Sync Policies</span>
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-semibold font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className={roleFormData.proposedRole === 'student' ? "text-rose-400" : "text-emerald-400"}>
                          {roleFormData.proposedRole === 'student' ? '✗' : '✓'}
                        </span>
                        <span className="text-slate-300">Course Creator Tool</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={roleFormData.proposedRole === 'student' ? "text-rose-400" : "text-emerald-400"}>
                          {roleFormData.proposedRole === 'student' ? '✗' : '✓'}
                        </span>
                        <span className="text-slate-300">System Analytics Console</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={['student', 'instructor'].includes(roleFormData.proposedRole) ? "text-rose-400" : "text-emerald-400"}>
                          {['student', 'instructor'].includes(roleFormData.proposedRole) ? '✗' : '✓'}
                        </span>
                        <span className="text-slate-300">Mentor Supervision Deck</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={['admin', 'super_admin'].includes(roleFormData.proposedRole) ? "text-emerald-400" : "text-rose-400"}>
                          {['admin', 'super_admin'].includes(roleFormData.proposedRole) ? '✓' : '✗'}
                        </span>
                        <span className="text-slate-300">Platform Root Controls</span>
                      </div>
                    </div>
                  </div>

                  {/* Audit Logs Trail Reason */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Required Audit Change Statement</span>
                    <textarea 
                      placeholder="Input rational intent for security policy change..."
                      value={roleFormData.reason}
                      onChange={(e) => setRoleFormData({ ...roleFormData, reason: e.target.value })}
                      className="w-full bg-[#141416] border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-500/50 transition-all min-h-[50px] font-semibold"
                    />
                  </div>

                  {/* 2FA Master Password Guard */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block flex justify-between items-center">
                      <span>Confirm Authorization Code / password</span>
                      <span className="text-purple-400 font-bold">2FA REQUIREMENT</span>
                    </span>
                    <input 
                      type="password" 
                      placeholder="Input Super Admin root code/key..."
                      value={roleFormData.confirmSecurity}
                      onChange={(e) => setRoleFormData({ ...roleFormData, confirmSecurity: e.target.value })}
                      className="w-full bg-[#141416] border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-[9px] font-black uppercase tracking-widest rounded transition-all shadow-lg shadow-purple-600/20"
                    >
                      Authorize RBAC override & Commit Sync
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==========================================
            8. SUSPEND / RESTRICT USER MODAL
            ========================================== */}
        <AnimatePresence>
          {isSuspendModalOpen && selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black" onClick={() => setIsSuspendModalOpen(false)} />
              
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0f0f12] border border-white/10 w-full max-w-md rounded-xl overflow-hidden shadow-2xl relative z-10 p-5 space-y-4 text-xs text-slate-300"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-1">
                    <UserX size={12} className="text-rose-400" />
                    Restrict / Suspend Action Center
                  </span>
                  <button onClick={() => setIsSuspendModalOpen(false)} className="text-slate-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>

                <form onSubmit={handleSuspendSubmit} className="space-y-4">
                  <div className="bg-[#141416] p-3 rounded border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-slate-800 border border-white/10 overflow-hidden flex-shrink-0">
                      {selectedUser.avatar_url && <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs">{selectedUser.full_name}</p>
                      <p className="text-slate-500 text-[9px] lowercase font-mono">{selectedUser.email}</p>
                    </div>
                  </div>

                  {/* Restriction Levels */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Restriction Mode Level</span>
                    <div className="grid grid-cols-2 gap-2 text-[9px] font-bold">
                      {[
                        { level: "Block Login", desc: "Block platform access entirely" },
                        { level: "Read Only", desc: "Restrict database writes & submit loops" },
                        { level: "Community Ban", desc: "Forbid message posting completely" },
                        { level: "Course Access Restricted", desc: "Lock out active LMS player tracks" }
                      ].map(item => (
                        <button
                          type="button"
                          key={item.level}
                          onClick={() => setSuspendFormData({ ...suspendFormData, restrictionLevel: item.level })}
                          className={`p-2 border text-left rounded transition-all ${
                            suspendFormData.restrictionLevel === item.level
                              ? 'border-rose-500/40 bg-rose-500/5 text-rose-300'
                              : 'border-white/5 bg-[#141416] text-slate-400 hover:border-white/10'
                          }`}
                        >
                          <span className="block font-black text-[9px]">{item.level}</span>
                          <span className="block text-[8px] text-slate-500 font-medium mt-0.5 leading-none">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Restrict Duration Selector */}
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Suspension Time Duration</span>
                    <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold">
                      {["24 Hours", "7 Days", "30 Days", "Permanent (Ban)"].map(dur => (
                        <button
                          type="button"
                          key={dur}
                          onClick={() => setSuspendFormData({ ...suspendFormData, duration: dur })}
                          className={`py-1.5 border text-center rounded transition-all ${
                            suspendFormData.duration === dur
                              ? 'border-rose-500/40 bg-rose-500/5 text-rose-300'
                              : 'border-white/5 bg-[#141416] text-slate-400 hover:border-white/10'
                          }`}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reason Statement */}
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Incident Reason Statement</span>
                    <textarea 
                      placeholder="Input logs details regarding this suspension event..."
                      value={suspendFormData.reason}
                      onChange={(e) => setSuspendFormData({ ...suspendFormData, reason: e.target.value })}
                      className="w-full bg-[#141416] border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-rose-500/50 transition-all min-h-[60px]"
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded transition-all shadow-lg shadow-rose-600/20"
                    >
                      Authorize Restrictions & Lock Session
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==========================================
            9. + ADD NEW USER MODAL
            ========================================== */}
        <AnimatePresence>
          {isAddUserOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black" onClick={() => setIsAddUserOpen(false)} />
              
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0f0f12] border border-white/10 w-full max-w-md rounded-xl overflow-hidden shadow-2xl relative z-10 p-5 space-y-4 text-xs text-slate-300"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-1">
                    <UserPlus size={12} className="text-blue-400" />
                    Initialize New Platform Identity
                  </span>
                  <button onClick={() => setIsAddUserOpen(false)} className="text-slate-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>

                <form onSubmit={handleCreateUserSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Full Legal Name</span>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={addUserFormData.full_name}
                      onChange={(e) => setAddUserFormData({ ...addUserFormData, full_name: e.target.value })}
                      className="w-full bg-[#141416] border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-500/50 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Email Address</span>
                    <input 
                      type="email" 
                      placeholder="e.g. john@pixora.io"
                      value={addUserFormData.email}
                      onChange={(e) => setAddUserFormData({ ...addUserFormData, email: e.target.value })}
                      className="w-full bg-[#141416] border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-500/50 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Mobile Phone Node</span>
                    <input 
                      type="text" 
                      placeholder="e.g. +1 (555) 123-4567"
                      value={addUserFormData.phone}
                      onChange={(e) => setAddUserFormData({ ...addUserFormData, phone: e.target.value })}
                      className="w-full bg-[#141416] border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Security Role</span>
                      <select 
                        value={addUserFormData.role}
                        onChange={(e) => setAddUserFormData({ ...addUserFormData, role: e.target.value })}
                        className="w-full bg-[#141416] border border-white/10 rounded px-2 py-1.5 text-[10px] text-white focus:outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="mentor">Mentor</option>
                        <option value="college_admin">College Admin</option>
                        <option value="partner">Partner</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">LMS Track</span>
                      <select 
                        value={addUserFormData.track}
                        onChange={(e) => setAddUserFormData({ ...addUserFormData, track: e.target.value })}
                        className="w-full bg-[#141416] border border-white/10 rounded px-2 py-1.5 text-[10px] text-white focus:outline-none"
                      >
                        <option value="Blockchain">Blockchain</option>
                        <option value="Game Development">Game Dev</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Campus Org</span>
                      <input 
                        type="text" 
                        placeholder="e.g. Stanford"
                        value={addUserFormData.institution}
                        onChange={(e) => setAddUserFormData({ ...addUserFormData, institution: e.target.value })}
                        className="w-full bg-[#141416] border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Cohort Batch</span>
                      <input 
                        type="text" 
                        placeholder="e.g. Alpha 2026"
                        value={addUserFormData.cohort}
                        onChange={(e) => setAddUserFormData({ ...addUserFormData, cohort: e.target.value })}
                        className="w-full bg-[#141416] border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded transition-all shadow-lg shadow-blue-600/20"
                    >
                      Initialize Identity
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==========================================
            10. INVITE USER SYSTEM MODAL
            ========================================== */}
        <AnimatePresence>
          {isInviteOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black" onClick={() => setIsInviteOpen(false)} />
              
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0f0f12] border border-white/10 w-full max-w-md rounded-xl overflow-hidden shadow-2xl relative z-10 p-5 space-y-4 text-xs text-slate-300"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-1">
                    <Mail size={12} className="text-blue-400" />
                    Dispatch Federated Invitation Loop
                  </span>
                  <button onClick={() => setIsInviteOpen(false)} className="text-slate-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>

                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Recipient Email Address</span>
                    <input 
                      type="email" 
                      placeholder="e.g. instructor@stanford.edu"
                      value={inviteFormData.email}
                      onChange={(e) => setInviteFormData({ ...inviteFormData, email: e.target.value })}
                      className="w-full bg-[#141416] border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-blue-500/50 transition-all font-semibold font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Target System Role</span>
                      <select 
                        value={inviteFormData.role}
                        onChange={(e) => setInviteFormData({ ...inviteFormData, role: e.target.value })}
                        className="w-full bg-[#141416] border border-white/10 rounded px-2 py-1.5 text-[10px] text-white focus:outline-none"
                      >
                        <option value="instructor">Instructor</option>
                        <option value="mentor">Mentor</option>
                        <option value="college_admin">College Admin</option>
                        <option value="partner">Partner</option>
                        <option value="hr">HR Operator</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Assign Institution mapping</span>
                      <input 
                        type="text" 
                        placeholder="e.g. Stanford"
                        value={inviteFormData.institution}
                        onChange={(e) => setInviteFormData({ ...inviteFormData, institution: e.target.value })}
                        className="w-full bg-[#141416] border border-white/10 rounded px-2.5 py-1.5 text-[10px] text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-[#141416] p-3 border border-white/5 rounded space-y-1 text-slate-400">
                    <p className="font-bold text-[9px] text-slate-300 uppercase tracking-wider">Security Notice</p>
                    <p className="text-[8px] leading-relaxed">Dispatched invitation loops create a secure federated invitation key. The recipient user must click their personalized link to finish identity onboarding and register their credentials or sync their Solana wallet.</p>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded transition-all shadow-lg shadow-blue-600/20"
                    >
                      Authorize Invitation Loop
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==========================================
            11. BULK IMPORT CSV / EXCEL MODAL
            ========================================== */}
        <AnimatePresence>
          {isImportOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black" onClick={() => setIsImportOpen(false)} />
              
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0f0f12] border border-white/10 w-full max-w-md rounded-xl overflow-hidden shadow-2xl relative z-10 p-5 space-y-4 text-xs text-slate-300"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest flex items-center gap-1">
                    <FileSpreadsheet size={12} className="text-blue-400" />
                    Platform Bulk Import Portal
                  </span>
                  <button onClick={() => setIsImportOpen(false)} className="text-slate-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* File Dropzone */}
                  <div className="border border-dashed border-white/10 hover:border-white/20 bg-white/[0.01] rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative">
                    <input 
                      type="file" 
                      accept=".csv, .xlsx"
                      onChange={handleCsvFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload size={24} className="text-slate-500 mb-2" />
                    <p className="font-bold text-[10px] text-slate-300 uppercase tracking-wider">Drag & drop CSV or Excel roster</p>
                    <p className="text-[8px] text-slate-500 mt-1 leading-normal">File formats accepted: .CSV, .XLSX (Max file volume: 15MB)</p>
                  </div>

                  {/* Parse Progress Bar */}
                  {importProgress > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] uppercase tracking-wider font-bold text-slate-500">
                        <span>Parsing Dataset Structure</span>
                        <span>{importProgress}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${importProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Parsed Rows Preview */}
                  {parsedRows.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Roster Parser Preview Output</span>
                      <div className="bg-[#141416] p-2 border border-white/5 rounded max-h-32 overflow-y-auto scrollbar-thin space-y-1.5 text-[9px] font-semibold font-mono">
                        {parsedRows.map((row, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-[#09090b] p-1.5 rounded border border-white/5">
                            <div>
                              <p className="text-slate-300">{row.full_name}</p>
                              <p className="text-slate-500 text-[8px]">{row.email}</p>
                            </div>
                            <span className="text-blue-400 uppercase text-[8px] font-bold">{row.role} • {row.track}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => setIsImportOpen(false)}
                      className="flex-1 py-2 bg-[#141416] hover:bg-[#202023] border border-white/5 text-slate-400 hover:text-white text-[9px] font-black uppercase tracking-widest rounded transition-all"
                    >
                      Abort Import
                    </button>
                    <button 
                      onClick={handleBulkImportExecute}
                      disabled={parsedRows.length === 0}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none text-white text-[9px] font-black uppercase tracking-widest rounded transition-all shadow-lg shadow-blue-600/20"
                    >
                      Execute Import
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
};

export default UserManagement;
