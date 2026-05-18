import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Grid, List as ListIcon, Play, BookOpen, Clock, Star, 
  Sparkles, Loader2, PlusCircle, LogIn, ExternalLink, Lock 
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { CourseService } from '../services/CourseService';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const PublicCatalogPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCourseForModal, setSelectedCourseForModal] = useState(null);

  // Elite default fallbacks in case dynamic fetch returns empty/offline database
  const fallbackCourses = [
    {
      id: 'mock-ue5',
      title: 'AAA Pipeline Mastery: Unreal Engine 5 & C++',
      category: 'Game Development',
      level: 'Advanced',
      price: 0,
      description: 'Architect professional real-time environments, custom shader matrices, and scalable game loop architectures using Unreal Engine 5.',
      thumbnail_url: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?q=80&w=2000&auto=format&fit=crop',
      instructor: { full_name: 'Marcus Vance' },
      duration: '48h Video Material',
      lectures_count: 32
    },
    {
      id: 'mock-solidity',
      title: 'Smart Contract Architecture: Solidity & Foundry',
      category: 'Blockchain',
      level: 'Expert',
      price: 299,
      description: 'Design enterprise-ready, security-first Solidity smart contracts. Build, test, and audit using advanced gas optimization guidelines.',
      thumbnail_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000&auto=format&fit=crop',
      instructor: { full_name: 'Elena Rostova' },
      duration: '36h Materials',
      lectures_count: 24
    },
    {
      id: 'mock-zkp',
      title: 'Decoupled Rollups & Zero-Knowledge Cryptography',
      category: 'Blockchain',
      level: 'Elite',
      price: 0,
      description: 'Explore the mechanics of ZK-snarks, rollups, and high-performance decentralized systems configured for global scalability.',
      thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop',
      instructor: { full_name: 'Dr. Evelyn Sterling' },
      duration: '40h Total Lectures',
      lectures_count: 28
    },
    {
      id: 'mock-greybox',
      title: 'High-Fidelity Level Design & Spatial Composition',
      category: 'Game Development',
      level: 'Intermediate',
      price: 199,
      description: 'Master spatial balance, pacing, and visual storytelling by utilizing expert greyboxing primitives in production pipelines.',
      thumbnail_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2000&auto=format&fit=crop',
      instructor: { full_name: 'Takahiro Sato' },
      duration: '30h Project-based Course',
      lectures_count: 18
    }
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await CourseService.getAvailableCourses(null);
        if (data && data.length > 0) {
          setCourses(data);
        } else {
          setCourses(fallbackCourses);
        }
      } catch (error) {
        console.warn('Supabase fetch issue, utilizing fallback catalog matrix:', error);
        setCourses(fallbackCourses);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const categories = ['All', 'Game Development', 'Blockchain', 'AI & Core Labs'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === 'All') return matchesSearch;
    return matchesSearch && course.category.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#0D0E12] text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Dynamic Scanline Grid Decorative */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(195,244,0,0.01),rgba(0,0,0,0),rgba(195,244,0,0.01))] bg-[size:100%_8px,20px_100%] pointer-events-none -z-10"></div>

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-[#c3f400]/20 bg-[#c3f400]/5 text-[#c3f400] font-headline font-bold text-[9px] uppercase tracking-[0.2em] w-fit">
              <Sparkles size={12} className="animate-pulse" />
              Pixora Engineering Matrix
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tight">
              Course <span className="text-[#c3f400] drop-shadow-[0_0_15px_rgba(195,244,0,0.2)]">Archive</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-lg text-sm md:text-base">
              Secure entrance into game loop architectures, blockchain security audits, and decentralized deployment models.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/signup/student')} 
              className="bg-[#c3f400] text-black hover:shadow-[0_0_20px_rgba(195,244,0,0.4)] px-6 py-3 rounded-xl text-xs font-headline font-bold uppercase tracking-widest flex items-center space-x-2 transition-all"
            >
              <span>Apply for Admission</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6 p-1.5 rounded-[24px]">
          {/* Category Selector */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 glass-panel rounded-2xl border border-white/5 bg-white/[0.01] w-fit">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-headline font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                  activeCategory === c 
                    ? 'bg-[#c3f400] text-black shadow-[0_0_15px_rgba(195,244,0,0.35)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#c3f400] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter by title, keywords, or parameters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-panel border border-white/5 bg-white/[0.01] rounded-2xl py-3.5 pl-14 pr-6 text-sm font-medium text-white focus:outline-none focus:border-[#c3f400]/40 transition-all placeholder:text-white/10"
            />
          </div>
        </div>

        {/* Course Grid Loading or Display */}
        {loading ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 text-[#c3f400] animate-spin" />
            <p className="text-slate-500 font-headline font-bold text-[9px] uppercase tracking-[0.2em]">Syncing course index registry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <div 
                  key={course.id}
                  className="glass-panel rounded-[28px] border border-white/5 bg-white/[0.01] overflow-hidden flex flex-col group hover:border-[#c3f400]/25 transition-all duration-300 shadow-2xl relative"
                >
                  {/* Aspect Thumbnail Container */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={course.thumbnail_url || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1000&auto=format&fit=crop'} 
                      alt={course.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0E12] via-[#0D0E12]/20 to-transparent"></div>
                    
                    {/* Category Label */}
                    <div className="absolute top-4 left-4">
                      <span className="text-[9px] font-headline font-bold uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-lg backdrop-blur-xl border border-white/10 bg-[#0D0E12]/80 text-[#c3f400]/95">
                        {course.category}
                      </span>
                    </div>

                    {/* Level Label */}
                    <div className="absolute top-4 right-4">
                      <span className="text-[9px] font-headline font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-md backdrop-blur-xl border border-white/10 bg-white/5 text-white/50">
                        {course.level || 'Expert'}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col space-y-5 justify-between relative">
                    <div className="space-y-3">
                      <h3 className="font-headline font-bold text-lg text-white leading-snug tracking-wide group-hover:text-[#c3f400] transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      
                      <div className={`flex items-center justify-between text-xs text-slate-400 font-medium transition-all duration-300 ${!user ? 'filter blur-[1.5px] select-none opacity-40' : ''}`}>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          By {course.instructor?.full_name || 'Academy Staff'}
                        </span>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star size={12} fill="currentColor" />
                          <span className="text-[10px] font-bold">4.9</span>
                        </div>
                      </div>

                      <div className="relative">
                        <p className={`text-xs text-slate-400 leading-relaxed line-clamp-3 transition-all duration-300 ${!user ? 'filter blur-[4.5px] select-none opacity-25' : ''}`}>
                          {course.description}
                        </p>
                        
                        {/* Immersive Cyber lock overlay */}
                        {!user && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#c3f400]/30 bg-[#0D0E12]/95 shadow-[0_0_15px_rgba(195,244,0,0.15)] text-[9px] font-headline font-bold text-[#c3f400] uppercase tracking-[0.15em] animate-pulse">
                              <Lock size={10} className="shrink-0" />
                              <span>Cadet Auth Required</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex items-center justify-between mt-auto">
                      <div className={`flex flex-col transition-all duration-300 ${!user ? 'filter blur-[2px] select-none opacity-45' : ''}`}>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Mission Track</span>
                        <span className="text-xs font-bold text-[#c3f400] mt-0.5">
                          {course.price === 0 ? 'FREE ADMISSION' : `$${course.price}.00 USD`}
                        </span>
                      </div>

                      <button 
                        onClick={() => {
                          if (!user) {
                            setSelectedCourseForModal(course);
                          } else {
                            navigate('/student/courses');
                          }
                        }}
                        className="bg-[#c3f400]/10 border border-[#c3f400]/25 text-[#c3f400] hover:bg-[#c3f400] hover:text-black py-2.5 px-4 rounded-xl text-[10px] font-headline font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all"
                      >
                        {user ? (
                          <>
                            <Play size={11} fill="currentColor" />
                            <span>Enter Sector</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle size={13} />
                            <span>Initialize</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center glass-panel rounded-[28px] border border-white/5 space-y-4 max-w-md mx-auto w-full">
                <Search size={32} className="text-slate-500 mx-auto opacity-50" />
                <h3 className="text-sm font-headline font-bold text-white uppercase tracking-wider">No catalog records match query</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Refine your search parameters to find courses in the currently designated sectors.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Onboarding Trigger Modal */}
      <AnimatePresence>
        {selectedCourseForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0D0E12]/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel p-8 rounded-[32px] border border-white/10 bg-[#0D0E12] max-w-md w-full relative space-y-6 shadow-2xl"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs text-[#c3f400] font-headline font-bold uppercase tracking-widest bg-[#c3f400]/10 py-1 px-3.5 rounded-full border border-[#c3f400]/20">
                  <LogIn size={12} />
                  Terminal Authorization
                </div>
                <h3 className="text-2xl font-headline font-bold text-white leading-tight">
                  Authorization Required
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  To initialize the mission <span className="text-[#c3f400] font-bold">"{selectedCourseForModal.title}"</span>, you must authenticate with the Pixora Core Network.
                </p>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Selected Sector</span>
                <p className="text-xs font-bold text-white uppercase tracking-wide">{selectedCourseForModal.category}</p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedCourseForModal(null);
                    navigate('/login');
                  }}
                  className="bg-[#c3f400] text-black py-4 rounded-xl text-xs font-headline font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(195,244,0,0.35)] transition-all"
                >
                  <LogIn size={14} />
                  <span>Access Terminal Log In</span>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedCourseForModal(null);
                    navigate('/signup/student');
                  }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 py-4 rounded-xl text-xs font-headline font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink size={14} />
                  <span>Apply for Cadet Account</span>
                </button>

                <button
                  onClick={() => setSelectedCourseForModal(null)}
                  className="text-slate-500 hover:text-white text-[10px] font-headline font-bold uppercase tracking-widest pt-2 transition-colors"
                >
                  Cancel Protocol
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default PublicCatalogPage;
