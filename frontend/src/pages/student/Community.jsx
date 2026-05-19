import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageSquare, Heart, Share2, 
  Search, Filter, Plus, Zap, 
  MessageCircle, Sparkles, Loader2,
  Clock, Globe, ShieldCheck, Award, Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTheme } from '../../context/StudentThemeContext';
import { SocialService } from '../../services/SocialService';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const MOCK_CHANNEL_CHATS = {
  'smart-contracts': [
    { id: 1, sender: 'SolidityWizard_42', avatar: 'https://i.pravatar.cc/150?u=SolidityWizard', role: 'student', text: "Just deployed a dynamic NFT contract on Goerli. Gas optimization was tough but got it down to 45k gas!", time: '2m ago' },
    { id: 2, sender: 'DeFi_Deity', avatar: 'https://i.pravatar.cc/150?u=DeFi_Deity', role: 'student', text: "Nice! Are you using the new ERC-721A standard for batch minting?", time: '1m ago' },
    { id: 3, sender: 'SmartContract_Ninja', avatar: 'https://i.pravatar.cc/150?u=SmartContract_Ninja', role: 'mentor', text: "Be careful with reentrancy guards on the claim function. Always follow checks-effects-interactions.", time: '30s ago' }
  ],
  'defi-protocols': [
    { id: 1, sender: 'DeFi_Deity', avatar: 'https://i.pravatar.cc/150?u=DeFi_Deity', role: 'student', text: "Analyzing the liquidity pool metrics for our new AMM module. Yield is stable at 12% APR.", time: '5m ago' },
    { id: 2, sender: 'Yield_Farmer', avatar: 'https://i.pravatar.cc/150?u=Yield_Farmer', role: 'student', text: "Are we using flash loans for arbitrage testing on the testnet?", time: '3m ago' },
    { id: 3, sender: 'instructor_julian', avatar: 'https://i.pravatar.cc/150?u=instructor_julian', role: 'instructor', text: "Yes, we'll write a flash loan receiver contract in next Monday's session. Get your math hats on!", time: '1m ago' }
  ],
  'solana-builds': [
    { id: 1, sender: 'Rustacean_Web3', avatar: 'https://i.pravatar.cc/150?u=Rustacean_Web3', role: 'student', text: "Anchor framework makes writing Solana programs feel so clean. Serialization is handled beautifully.", time: '6m ago' },
    { id: 2, sender: 'Sol_Surfer', avatar: 'https://i.pravatar.cc/150?u=Sol_Surfer', role: 'student', text: "Agreed, much better than writing raw BPF programs. The account validation is a lifesaver.", time: '4m ago' }
  ],
  'ethereum-dev': [
    { id: 1, sender: 'Ether_Architect', avatar: 'https://i.pravatar.cc/150?u=Ether_Architect', role: 'student', text: "Stuck on a signature verification issue with ecrecover. Anyone solved this?", time: '10m ago' },
    { id: 2, sender: 'SolidityWizard_42', avatar: 'https://i.pravatar.cc/150?u=SolidityWizard', role: 'student', text: "Check if your v, r, s values are formatted correctly. Had the same bug yesterday!", time: '8m ago' }
  ],
  'nft-minting': [
    { id: 1, sender: 'PixelArt_Student', avatar: 'https://i.pravatar.cc/150?u=PixelArt_Student', role: 'student', text: "Metadata is officially pinned on IPFS! Check out these dynamic traits.", time: '4m ago' }
  ],
  // Game Dev
  'unity-engine': [
    { id: 1, sender: 'UnityNinja', avatar: 'https://i.pravatar.cc/150?u=UnityNinja', role: 'student', text: "Just optimized our custom scriptable render pipeline. Frame rate jumped from 45 to 90 FPS on mobile!", time: '3m ago' },
    { id: 2, sender: 'C_Sharp_Guru', avatar: 'https://i.pravatar.cc/150?u=C_Sharp_Guru', role: 'student', text: "Scriptable objects are life-savers for inventory databases. Keeps memory clean.", time: '2m ago' },
    { id: 3, sender: 'ShaderCraft', avatar: 'https://i.pravatar.cc/150?u=ShaderCraft', role: 'mentor', text: "Also, check your draw calls. Batching static meshes does wonders.", time: '1m ago' }
  ],
  'unreal-engine': [
    { id: 1, sender: 'UnrealMaster', avatar: 'https://i.pravatar.cc/150?u=UnrealMaster', role: 'student', text: "Lumen global illumination in UE5 is pure wizardry. The reflections are insane.", time: '5m ago' },
    { id: 2, sender: 'Blueprint_King', avatar: 'https://i.pravatar.cc/150?u=Blueprint_King', role: 'student', text: "True, but watch out for nanite overdraw on high-density foliage. Can drop frames fast.", time: '3m ago' }
  ],
  'physics-simulation': [
    { id: 1, sender: 'RigidBody_Dev', avatar: 'https://i.pravatar.cc/150?u=RigidBody_Dev', role: 'student', text: "Simulating a soft-body vehicle suspension today. The deformation matrix is wild!", time: '12m ago' },
    { id: 2, sender: 'MathGeek', avatar: 'https://i.pravatar.cc/150?u=MathGeek', role: 'student', text: "Are you using Verlet integration or traditional Euler? Verlet is way more stable.", time: '10m ago' }
  ],
  'game-art-design': [
    { id: 1, sender: 'VoxelArtist', avatar: 'https://i.pravatar.cc/150?u=VoxelArtist', role: 'student', text: "Finished modeling the voxel spaceship for the Game Jam! Texturing it in MagicaVoxel now.", time: '7m ago' },
    { id: 2, sender: 'PixelQueen', avatar: 'https://i.pravatar.cc/150?u=PixelQueen', role: 'student', text: "Wow, the colors pop so well with the emissive glow!", time: '5m ago' }
  ],
  'level-design': [
    { id: 1, sender: 'LevelArchitect', avatar: 'https://i.pravatar.cc/150?u=LevelArchitect', role: 'student', text: "Designing a vertical neon city level. The player flow needs to guide their eyes upward.", time: '8m ago' }
  ]
};

const Community = () => {
  const { profile } = useAuth();
  const { currentTheme } = useStudentTheme();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isTransmitting, setIsTransmitting] = useState(false);

  // Track channels & chat states
  const userTrack = (profile?.learning_track || profile?.track || 'blockchain').toLowerCase();
  
  const trackChannels = userTrack === 'blockchain' 
    ? [
        { id: 'feed', name: '📢 collective-feed', description: 'Real-time synchronization of academic milestones' },
        { id: 'smart-contracts', name: '💬 smart-contracts', description: 'Solidity, Rust, and Security debug corridor' },
        { id: 'defi-protocols', name: '💬 defi-protocols', description: 'AMM, Staking, and Flash Loan protocol mechanics' },
        { id: 'solana-builds', name: '💬 solana-builds', description: 'Anchor framework, programs, and Solana execution' },
        { id: 'ethereum-dev', name: '💬 ethereum-dev', description: 'EVM optimizations, gas saving, and node RPCs' },
        { id: 'nft-minting', name: '💬 nft-minting', description: 'Dynamic metadata, IPFS, and generative assets' }
      ]
    : [
        { id: 'feed', name: '📢 collective-feed', description: 'Real-time synchronization of academic milestones' },
        { id: 'unity-engine', name: '💬 unity-engine', description: 'C# scripting, SRP pipelines, and mobile builds' },
        { id: 'unreal-engine', name: '💬 unreal-engine', description: 'Lumen illumination, Nanite, and Blueprints' },
        { id: 'physics-simulation', name: '💬 physics-simulation', description: 'Soft-body dynamics, Verlet, and constraints' },
        { id: 'game-art-design', name: '💬 game-art-design', description: 'Voxel assets, Blender modeling, and shaders' },
        { id: 'level-design', name: '💬 level-design', description: 'Vertical flow, neon lighting, and player guiding' }
      ];

  const [selectedChannel, setSelectedChannel] = useState(trackChannels[0]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const chatEndRef = useRef(null);

  // Sync selected channel to track switch
  useEffect(() => {
    setSelectedChannel(trackChannels[0]);
  }, [userTrack]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  // Simulated peer messages in selected channel
  useEffect(() => {
    if (!selectedChannel || selectedChannel.id === 'feed') return;

    // Load initial messages
    setChatMessages(MOCK_CHANNEL_CHATS[selectedChannel.id] || []);

    // Set up simulated typing and chat replies
    const chatTimers = [];
    const members = userTrack === 'blockchain' 
      ? ['SolidityWizard_42', 'DeFi_Deity', 'SmartContract_Ninja', 'Rustacean_Web3', 'instructor_julian']
      : ['UnityNinja', 'C_Sharp_Guru', 'ShaderCraft', 'UnrealMaster', 'Blueprint_King'];

    const triggerSimulation = () => {
      const delay = Math.random() * 6000 + 6000; // 6 to 12 seconds
      const timer = setTimeout(() => {
        const member = members[Math.floor(Math.random() * members.length)];
        setTypingUser(member);
        setIsTyping(true);

        const replyTimer = setTimeout(() => {
          setIsTyping(false);
          setTypingUser('');

          const msgs = {
            'smart-contracts': [
              "Has anyone tried the new Vyper compiler optimizations?",
              "Make sure your modifiers don't consume too much gas.",
              "I'm testing reentrancy vulnerabilities using static analyzers.",
              "Just deployed a multi-sig wallet on the Sepolia testnet! 🚀"
            ],
            'defi-protocols': [
              "We need to balance the slippage parameters in the routing contract.",
              "Arbitrage bots are active today, pools are balancing nicely.",
              "Impermanent loss is the biggest hurdle for dynamic AMMs."
            ],
            'solana-builds': [
              "Solana playground is good for quick testing, but local anchor test suites are essential.",
              "PDA mapping is so much cleaner now."
            ],
            'ethereum-dev': [
              "Geth nodes are syncing stable. EIP-4844 is going to be game-changing.",
              "Reduced gas costs by packing storage variables in a single 256-bit slot!"
            ],
            'nft-minting': [
              "Check out this dynamic SVG generator contract. Fully on-chain NFT art!",
              "Is anyone else using decentralized storage for image rendering?"
            ],
            'unity-engine': [
              "Anyone else playing with Unity's new ECS system?",
              "Profile your garbage collection if you have frame drops on mobile.",
              "Adding procedural generation to our endless runner game today!"
            ],
            'unreal-engine': [
              "Using PCG (Procedural Content Generation) in UE5.2 makes level design so fast.",
              "Struggling with animation retargeting. Metahumans are complex."
            ],
            'physics-simulation': [
              "My ragdoll physics is acting super glitchy, parts are flying off!",
              "Try increasing the solver iterations in the project settings."
            ],
            'game-art-design': [
              "Working on dynamic grass shaders today. Wind displacement looks super smooth.",
              "Substance Painter is standard, but you can get amazing low-poly textures in Blender."
            ],
            'level-design': [
              "Pacing is key. Make sure to place checkpoints right after intense encounters.",
              "Lighting defines the mood. Try a high-contrast warm light for safe zones."
            ]
          };

          const textList = msgs[selectedChannel.id] || ["That sounds incredibly cool!", "Let's work on this together!"];
          const text = textList[Math.floor(Math.random() * textList.length)];

          setChatMessages(prev => [
            ...prev,
            {
              id: Date.now(),
              sender: member,
              avatar: `https://i.pravatar.cc/150?u=${member}`,
              role: member === 'instructor_julian' ? 'instructor' : (member === 'ShaderCraft' || member === 'SmartContract_Ninja' ? 'mentor' : 'student'),
              text,
              time: 'Just now'
            }
          ]);

          // queue next message simulation
          triggerSimulation();

        }, 2000);

        chatTimers.push(replyTimer);
      }, delay);

      chatTimers.push(timer);
    };

    triggerSimulation();

    return () => {
      chatTimers.forEach(t => clearTimeout(t));
    };
  }, [selectedChannel, userTrack]);

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: profile?.full_name || 'Student',
      avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}`,
      role: 'student',
      text: newMessage.trim(),
      time: 'Just now'
    };

    setChatMessages(prev => [...prev, userMsg]);
    setNewMessage('');

    // Trigger a simulated reply 1.5 seconds later
    setTimeout(() => {
      setIsTyping(true);
      setTypingUser(userTrack === 'blockchain' ? 'instructor_julian' : 'ShaderCraft');

      setTimeout(() => {
        setIsTyping(false);
        setTypingUser('');

        const responses = [
          "Outstanding point, Student! Keep pushing the boundaries of your track.",
          "Fascinating solution. Let's run a telemetry check on this protocol.",
          "Indeed! This is exactly how senior developers tackle production bugs.",
          "Keep logging those sync metrics. The Collective is growing stronger."
        ];
        const text = responses[Math.floor(Math.random() * responses.length)];

        setChatMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: userTrack === 'blockchain' ? 'instructor_julian' : 'ShaderCraft',
            avatar: `https://i.pravatar.cc/150?u=${userTrack === 'blockchain' ? 'instructor_julian' : 'ShaderCraft'}`,
            role: userTrack === 'blockchain' ? 'instructor' : 'mentor',
            text,
            time: 'Just now'
          }
        ]);
      }, 1500);
    }, 1000);
  };

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const data = await SocialService.getActivityFeed();
        setFeed(data);
      } catch (error) {
        console.error('Error fetching activity feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();

    // Subscribe to real-time updates
    const subscription = SocialService.subscribeToActivityFeed((newActivity) => {
      setFeed(prev => [newActivity, ...prev].slice(0, 50));
    });

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  const formatTime = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now - then) / 1000);
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getActionDetails = (activity) => {
    switch (activity.action) {
      case 'COURSE_ENROLLED':
        return { text: 'enrolled in a new course', icon: <Globe className="text-blue-400" />, color: 'blue' };
      case 'XP_AWARDED':
        return { text: `earned ${activity.metadata?.amount || 0} XP for ${activity.metadata?.reason || 'activity'}`, icon: <Zap className="text-yellow-400" />, color: 'yellow' };
      case 'SUBMISSION_CREATED':
        return { text: 'completed a mission objective', icon: <ShieldCheck className="text-emerald-400" />, color: 'emerald' };
      case 'ACHIEVEMENT_EARNED':
        return { text: `unlocked achievement: ${activity.metadata?.achievement_name}`, icon: <Sparkles className="text-purple-400" />, color: 'purple' };
      default:
        return { text: 'performed a protocol action', icon: <MessageSquare className="text-slate-400" />, color: 'slate' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[var(--st-color-primary)] animate-spin" />
        <p className="text-on-surface-variant/40 font-headline font-bold text-[10px] uppercase tracking-[0.2em]">Synchronizing Communal Matrix...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Community Header */}
      <div className="flex flex-col md:flex-row items-end justify-between gap-8 pb-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-panel border-[var(--st-color-primary)]/20 text-[var(--st-color-primary)] font-headline font-bold text-[9px] uppercase tracking-[0.2em]">
            <Globe size={14} className="animate-spin-slow" />
            Neural Network Online
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tight">The <span className="text-[var(--st-color-primary)]">Collective</span></h1>
          <p className="text-on-surface-variant/60 max-w-lg font-medium leading-relaxed">
            Real-time synchronization of student achievements, collaborations, and protocol milestones across the Pixora ecosystem.
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={handleNewTransmission}
            disabled={isTransmitting}
            className="flex-1 md:flex-none btn-primary !rounded-2xl !py-4 !px-8 !text-xs disabled:opacity-50"
          >
            {isTransmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            <span>{isTransmitting ? 'Transmitting...' : 'New Transmission'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left main area (either Milestones feed or Neural Chat Corridor) */}
        <div className="lg:col-span-2 space-y-8">
          {selectedChannel.id === 'feed' ? (
            <>
              {/* Feed Filters */}
              <div className="flex items-center gap-2 p-1.5 glass-panel rounded-2xl border-white/5 w-fit">
                {['All', 'Achievements', 'Milestones', 'Community'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-6 py-2.5 rounded-xl text-[9px] font-headline font-bold uppercase tracking-[0.15em] transition-all ${
                      activeFilter === f 
                        ? 'bg-[var(--st-color-primary)] text-black shadow-[0_0_15px_var(--st-color-glow)]' 
                        : 'text-on-surface-variant/40 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Activity List */}
              <div className="space-y-6">
                {feed.map((activity) => {
                  const details = getActionDetails(activity);
                  return (
                    <div key={activity.id} className="glass-panel p-8 rounded-[32px] border-white/5 hover:border-white/10 transition-all group relative overflow-hidden shadow-xl">
                      <div className={`absolute top-0 left-0 w-1 h-full bg-${details.color}-400/20 group-hover:bg-${details.color}-400 transition-colors`}></div>
                      <div className="flex gap-6 items-start relative z-10">
                        <div className="relative group/avatar">
                          <div className={`absolute inset-0 bg-${details.color}-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full`}></div>
                          <img 
                            src={activity.actor?.avatar_url || `https://ui-avatars.com/api/?name=${activity.actor?.full_name}`} 
                            className="w-14 h-14 rounded-2xl border border-white/10 relative z-10" 
                            alt="" 
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg glass-panel border-white/10 flex items-center justify-center z-20 shadow-xl scale-90 group-hover:scale-100 transition-transform">
                            {details.icon}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-headline font-bold text-white text-base tracking-wide">
                              {activity.actor?.full_name}
                            </h3>
                            <div className="flex items-center gap-2 text-[10px] font-headline font-bold text-on-surface-variant/30 uppercase tracking-widest">
                              <Clock size={12} />
                              {formatTime(activity.created_at)}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-on-surface-variant/60 leading-relaxed">
                            {details.text}
                          </p>
                          <div className="flex items-center gap-6 pt-4">
                            <button className="flex items-center gap-2 text-[10px] font-headline font-bold text-on-surface-variant/40 hover:text-white transition-colors group/btn">
                              <Heart size={14} className="group-hover/btn:scale-110 transition-transform" />
                              <span>RESPECT</span>
                            </button>
                            <button className="flex items-center gap-2 text-[10px] font-headline font-bold text-on-surface-variant/40 hover:text-white transition-colors group/btn">
                              <MessageCircle size={14} className="group-hover/btn:scale-110 transition-transform" />
                              <span>SYNCHRONIZE</span>
                            </button>
                            <button className="flex items-center gap-2 text-[10px] font-headline font-bold text-on-surface-variant/40 hover:text-white transition-colors group/btn">
                              <Share2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                              <span>RETRANSMIT</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Neural Chat Corridor */
            <div className="glass-panel rounded-[32px] border-white/5 shadow-2xl flex flex-col h-[620px] overflow-hidden relative group/chat animate-in fade-in duration-500">
              {/* Glowing decorative background effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--st-color-primary)]/5 rounded-full blur-[80px] pointer-events-none transition-all duration-1000"></div>
              
              {/* Chat Header */}
              <div className="p-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between z-10 relative">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-bold text-lg text-[var(--st-color-primary)] tracking-wide uppercase font-mono">
                      {selectedChannel.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 text-[8px] font-headline font-bold uppercase tracking-widest">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                      COHORT ACTIVE
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-on-surface-variant/50 max-w-md font-sans">
                    {selectedChannel.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-headline font-bold text-white uppercase tracking-wider font-mono">Telemetry Active</div>
                    <div className="text-[8px] font-medium text-on-surface-variant/30 uppercase tracking-widest mt-0.5">Node ID: PX-{selectedChannel.id.substring(0, 4).toUpperCase()}</div>
                  </div>
                </div>
              </div>

              {/* Chat Message Corridor */}
              <div className="flex-1 p-6 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent z-10 relative">
                {chatMessages.map((msg) => {
                  const isUser = msg.sender === profile?.full_name;
                  const isInstructor = msg.role === 'instructor';
                  const isMentor = msg.role === 'mentor';
                  
                  return (
                    <div key={msg.id} className={`flex gap-4 items-start ${isUser ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                      <img 
                        src={msg.avatar} 
                        className="w-9 h-9 rounded-xl border border-white/10 shadow-lg object-cover bg-neutral-900" 
                        alt="" 
                      />
                      <div className={`space-y-1.5 max-w-[75%] ${isUser ? 'items-end flex flex-col' : ''}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-headline font-bold text-white tracking-wide">
                            {msg.sender}
                          </span>
                          {isInstructor && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[7px] font-headline font-bold uppercase tracking-widest font-mono shadow-[0_0_8px_rgba(168,85,247,0.2)]">
                              INSTRUCTOR
                            </span>
                          )}
                          {isMentor && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[7px] font-headline font-bold uppercase tracking-widest font-mono shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                              MENTOR
                            </span>
                          )}
                          <span className="text-[8px] font-bold text-on-surface-variant/30 uppercase tracking-widest">
                            {msg.time}
                          </span>
                        </div>
                        <div className={`p-4 rounded-[20px] text-[12px] font-sans leading-relaxed border shadow-md font-medium ${
                          isUser 
                            ? 'bg-[var(--st-color-primary)]/10 border-[var(--st-color-primary)]/20 text-white rounded-tr-none' 
                            : isInstructor 
                              ? 'bg-purple-950/20 border-purple-900/30 text-purple-100 rounded-tl-none' 
                              : 'bg-white/[0.03] border-white/5 text-on-surface-variant/80 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Simulated typing status */}
                {isTyping && (
                  <div className="flex gap-4 items-center animate-in fade-in duration-300">
                    <img 
                      src={`https://i.pravatar.cc/150?u=${typingUser}`} 
                      className="w-9 h-9 rounded-xl border border-white/10 shadow-lg object-cover bg-neutral-900" 
                      alt="" 
                    />
                    <div className="space-y-1">
                      <div className="text-[10px] font-headline font-bold text-on-surface-variant/40 tracking-wide">
                        {typingUser} is transmitting...
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl rounded-tl-none flex gap-1 items-center px-4">
                        <div className="w-1.5 h-1.5 bg-[var(--st-color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-[var(--st-color-primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-[var(--st-color-primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Pinned Footer */}
              <form onSubmit={handleSendChatMessage} className="p-4 bg-white/[0.01] border-t border-white/5 flex gap-3 items-center z-10 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Broadcast to ${selectedChannel.name}...`}
                  className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-[12px] text-white placeholder-on-surface-variant/30 focus:outline-none focus:border-[var(--st-color-primary)] focus:bg-white/[0.05] transition-all font-mono"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-primary !rounded-xl !p-0 !w-12 !h-12 flex items-center justify-center shadow-[0_0_15px_var(--st-color-glow)] disabled:opacity-30 disabled:shadow-none transition-all active:scale-95"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-10">
          {/* Active Channels Selector */}
          <section className="glass-panel p-8 rounded-[32px] border-white/5 space-y-6">
            <h3 className="text-[10px] font-headline font-bold text-white uppercase tracking-[0.25em] flex items-center gap-2">
              <MessageSquare size={16} className="text-[var(--st-color-primary)]" />
              Active Channels
            </h3>
            <div className="space-y-2.5">
              {trackChannels.map(channel => {
                const isActive = selectedChannel.id === channel.id;
                return (
                  <button 
                    key={channel.id} 
                    onClick={() => setSelectedChannel(channel)}
                    className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group border ${
                      isActive 
                        ? 'bg-[var(--st-color-primary)]/10 border-[var(--st-color-primary)]/20 text-white font-bold' 
                        : 'bg-transparent border-transparent hover:bg-white/5 text-on-surface-variant/40 hover:text-white'
                    }`}
                  >
                    <span className="text-[11px] font-headline tracking-wide uppercase font-mono">{channel.name.replace('💬 ', '').replace('📢 ', '# ')}</span>
                    {isActive ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--st-color-primary)] shadow-[0_0_8px_var(--st-color-glow)]"></div>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Trending Achievements */}
          <section className="glass-panel p-8 rounded-[32px] border-white/5 space-y-8">
            <h3 className="text-[10px] font-headline font-bold text-white uppercase tracking-[0.25em] flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" />
              Recent Ascensions
            </h3>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl glass-card border-white/5 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-headline font-bold text-white">
                      {userTrack === 'blockchain' ? 'Genesis Architect' : 'Voxel Master'}
                    </p>
                    <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-0.5">3 students today</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full btn-outline !text-[9px] !py-4 !rounded-[20px] !tracking-[0.2em]">VIEW ALL BADGES</button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Community;
