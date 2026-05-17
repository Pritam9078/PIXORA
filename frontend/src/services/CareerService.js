import { supabase } from '../lib/supabase';

export const CareerService = {
  /**
   * Get student's industry readiness analysis
   * @param {string} studentId 
   */
  getReadinessAnalysis: async (studentId) => {
    try {
      // Fetch user's course progress and completed modules
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          progress,
          course:courses (
            title,
            category
          )
        `)
        .eq('student_id', studentId);

      if (enrollmentError) throw enrollmentError;

      // Logic to calculate readiness based on progress
      const totalProgress = enrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0);
      const avgProgress = enrollments.length > 0 ? totalProgress / enrollments.length : 0;
      
      return {
        readinessScore: Math.round(avgProgress),
        verifiedRoles: Math.floor(avgProgress / 30), // Simple logic: 1 role per 30% avg progress
        analysisDetails: `Your current mastery in ${enrollments.map(e => e.course.category).join(', ')} indicates strong protocol alignment.`
      };
    } catch (error) {
      console.error('Error fetching readiness analysis:', error.message);
      return { readinessScore: 0, verifiedRoles: 0, analysisDetails: 'Initialization required.' };
    }
  },

  /**
   * Get tech progression (Skill Tree)
   * @param {string} studentId 
   */
  getTechProgression: async (studentId) => {
    try {
      const { data: enrollments, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          progress,
          course:courses (
            title,
            level
          )
        `)
        .eq('student_id', studentId);

      if (enrollmentError) throw enrollmentError;

      // Map courses to skill tree nodes
      return [
        { 
          name: "Core Fundamentals", 
          level: Math.min(5, Math.floor((enrollments.filter(e => e.course.level === 'Beginner').length / 2) * 5)),
          status: enrollments.some(e => e.course.level === 'Beginner' && e.progress > 80) ? "completed" : "in-progress",
          skills: ["Logic", "Data Struct", "Math"] 
        },
        { 
          name: "Advanced Development", 
          level: Math.min(5, Math.floor((enrollments.filter(e => e.course.level === 'Intermediate').length / 2) * 5)),
          status: enrollments.some(e => e.course.level === 'Intermediate' && e.progress > 0) ? "in-progress" : "locked",
          skills: ["Shaders", "Multiplayer", "AI"] 
        },
        { 
          name: "Architecture & Optimization", 
          level: Math.min(5, Math.floor((enrollments.filter(e => e.course.level === 'Advanced').length / 2) * 5)),
          status: enrollments.some(e => e.course.level === 'Advanced' && e.progress > 0) ? "in-progress" : "locked",
          skills: ["ECS", "DOTS", "Low-Level"] 
        }
      ];
    } catch (error) {
      console.error('Error fetching tech progression:', error.message);
      return [];
    }
  },

  /**
   * Get available job opportunities (Mocked for now as per design)
   */
  getOpportunities: async () => {
    // In a real app, this would fetch from a 'jobs' or 'opportunities' table
    return [
      { id: 1, title: "Junior Solidity Engineer", company: "Aave Protocol", location: "Remote / London", type: "Full-time", salary: "$120k - $160k", tags: ["Web3", "Security"], logo: "https://cryptologos.cc/logos/aave-aave-logo.png" },
      { id: 2, title: "UE5 Gameplay Programmer", company: "Respawn Entertainment", location: "Los Angeles", type: "Hybrid", salary: "$110k - $140k", tags: ["C++", "UE5"], logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Respawn_Entertainment_logo.svg/1200px-Respawn_Entertainment_logo.svg.png" },
      { id: 3, title: "Smart Contract Auditor", company: "Trail of Bits", location: "Remote", type: "Contract", salary: "$180k+", tags: ["Rust", "ZKP"], logo: "https://avatars.githubusercontent.com/u/231267?s=200&v=4" },
      { id: 4, title: "AI Research Engineer", company: "OpenAI", location: "San Francisco", type: "Full-time", salary: "$250k+", tags: ["Python", "PyTorch"], logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" }
    ];
  }
};

export default CareerService;
