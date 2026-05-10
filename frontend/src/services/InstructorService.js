import { supabase } from '../lib/supabase';

// ─── Helpers ───────────────────────────────────────────────
const DEFAULT_TIMEOUT = 10000; // 10 seconds

async function withTimeout(promise, ms = DEFAULT_TIMEOUT) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Database request timed out')), ms)
  );
  return Promise.race([promise, timeout]);
}

async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No active session');
  return session;
}

async function getInstructorCourseIds(instructorId) {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', instructorId)
    );
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('getInstructorCourseIds failed:', err.message);
    return [];
  }
}

// ─── InstructorService ─────────────────────────────────────
export const InstructorService = {

  // ── Dashboard Metrics ─────────────────────────────────────
  async getDashboardMetrics() {
    try {
      const session = await getSession();
      const courses = await getInstructorCourseIds(session.user.id);
      const courseIds = courses.map(c => c.id);

      let studentsCount = 0;
      let completedCount = 0;
      let pendingSubmissions = 0;
      let avgProgress = 0;

      if (courseIds.length > 0) {
        // Count enrolled students and get progress
        const { data: enrollments, count: enrolled } = await withTimeout(
          supabase
            .from('enrollments')
            .select('progress', { count: 'exact' })
            .in('course_id', courseIds)
        );
        
        studentsCount = enrolled || 0;
        
        if (enrollments && enrollments.length > 0) {
          avgProgress = Math.round(enrollments.reduce((acc, curr) => acc + (curr.progress || 0), 0) / enrollments.length);
          completedCount = enrollments.filter(e => e.progress >= 100).length;
        }

        // Count pending submissions
        const { data: assignmentIds } = await withTimeout(
          supabase
            .from('assignments')
            .select('id')
            .in('course_id', courseIds)
        );

        if (assignmentIds && assignmentIds.length > 0) {
          const { count: pending } = await withTimeout(
            supabase
              .from('submissions')
              .select('id', { count: 'exact', head: true })
              .in('assignment_id', assignmentIds.map(a => a.id))
              .is('grade', null)
          );
          pendingSubmissions = pending || 0;
        }
      }

      return {
        totalStudents: studentsCount,
        activeCourses: courseIds.length,
        completedStudents: completedCount,
        pendingGrading: pendingSubmissions,
        avgProgress,
        totalRevenue: 0,
        averageRating: 0,
      };
    } catch (error) {
      console.error('getDashboardMetrics error:', error.message);
      return { totalStudents: 0, activeCourses: 0, completedStudents: 0, pendingGrading: 0, avgProgress: 0, totalRevenue: 0, averageRating: 0 };
    }
  },

  // ── Performance Trend (Enrollments over time) ──────────────
  async getPerformanceTrend() {
    try {
      const session = await getSession();
      const courses = await getInstructorCourseIds(session.user.id);
      if (courses.length === 0) return [];

      const courseIds = courses.map(c => c.id);
      
      // Get enrollments from the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('created_at')
        .in('course_id', courseIds)
        .gte('created_at', sevenDaysAgo.toISOString());

      // Group by day
      const dailyData = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        dailyData[label] = 0;
      }

      enrollments?.forEach(e => {
        const label = new Date(e.created_at).toLocaleDateString('en-US', { weekday: 'short' });
        if (dailyData[label] !== undefined) {
          dailyData[label]++;
        }
      });

      return Object.entries(dailyData)
        .map(([name, value]) => ({ name, value }))
        .reverse();
    } catch (error) {
      console.error('getPerformanceTrend error:', error.message);
      return [];
    }
  },

  // ── Recent Activity (Mixed: Enrollments + Quizzes) ─────────
  async getRecentActivity(limit = 10) {
    try {
      const session = await getSession();
      const courses = await getInstructorCourseIds(session.user.id);
      const courseIds = courses.map(c => c.id);
      if (courseIds.length === 0) return [];

      const courseMap = Object.fromEntries(courses.map(c => [c.id, c.title]));

      // Fetch recent enrollments
      const { data: enrollments } = await withTimeout(
        supabase
          .from('enrollments')
          .select('id, student_id, course_id, created_at, progress')
          .in('course_id', courseIds)
          .order('created_at', { ascending: false })
          .limit(limit)
      );

      // Fetch recent quiz attempts
      const { data: quizzes } = await withTimeout(
        supabase
          .from('quizzes')
          .select('id, title')
          .in('course_id', courseIds)
      );
      
      const quizIds = quizzes?.map(q => q.id) || [];
      const { data: quizAttempts } = quizIds.length > 0 
        ? await withTimeout(
            supabase
              .from('quiz_attempts')
              .select('id, student_id, quiz_id, completed_at, score')
              .in('quiz_id', quizIds)
              .order('completed_at', { ascending: false })
              .limit(limit)
          )
        : { data: [] };

      // Combine and Sort
      const activities = [
        ...(enrollments || []).map(e => ({
          id: e.id,
          type: e.progress >= 100 ? 'completion' : 'enrollment',
          student_id: e.student_id,
          course: courseMap[e.course_id],
          timestamp: e.created_at,
          detail: e.progress >= 100 ? 'Finished academic track' : 'Joined the module'
        })),
        ...(quizAttempts || []).map(q => ({
          id: q.id,
          type: 'submission',
          student_id: q.student_id,
          course: quizzes.find(qz => qz.id === q.quiz_id)?.title,
          timestamp: q.completed_at,
          detail: `Scored ${q.score}% on assessment`
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);

      if (activities.length === 0) return [];

      const studentIds = [...new Set(activities.map(a => a.student_id))];
      const { data: profiles } = await withTimeout(
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', studentIds)
      );

      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

      return activities.map(a => ({
        ...a,
        user: profileMap[a.student_id]?.full_name || 'Student',
        avatar: profileMap[a.student_id]?.avatar_url,
        time: timeAgo(a.timestamp),
      }));
    } catch (error) {
      console.error('getRecentActivity error:', error.message);
      return [];
    }
  },

  // ── Students ──────────────────────────────────────────────
  async getStudents() {
    try {
      const session = await getSession();
      const courses = await getInstructorCourseIds(session.user.id);
      if (courses.length === 0) return [];

      const courseIds = courses.map(c => c.id);
      const courseMap = Object.fromEntries(courses.map(c => [c.id, c.title]));

      // Step 1: Get all enrollments
      const { data: enrollments, error: enrollError } = await withTimeout(
        supabase
          .from('enrollments')
          .select('id, student_id, course_id, progress, created_at')
          .in('course_id', courseIds)
          .order('created_at', { ascending: false })
      );

      if (enrollError) {
        console.warn('enrollments error:', enrollError.message);
        return [];
      }
      if (!enrollments || enrollments.length === 0) return [];

      // Step 2: Fetch profiles for those students
      const studentIds = [...new Set(enrollments.map(e => e.student_id))];
      const { data: profiles, error: profilesError } = await withTimeout(
        supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', studentIds)
      );

      if (profilesError) {
        console.warn('profiles error:', profilesError.message);
      }

      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

      // Step 3: Merge
      return enrollments.map(e => {
        const profile = profileMap[e.student_id] || {};
        const pct = e.progress ?? 0;
        return {
          id: e.student_id,
          enrollmentId: e.id,
          name: profile.full_name || 'Unknown Student',
          email: profile.email || 'N/A',
          avatar: profile.avatar_url,
          course: courseMap[e.course_id] || 'Unknown Course',
          courseId: e.course_id,
          progress: pct,
          status: pct >= 100 ? 'completed' : pct > 10 ? 'active' : 'struggling',
          grade: 'N/A',
          joinedAt: e.created_at,
        };
      });
    } catch (error) {
      console.error('getStudents error:', error.message);
      return [];
    }
  },

  // ── My Courses ────────────────────────────────────────────
  async createCourse(courseData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authenticated user not found");

      // Fetch instructor's college_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('college_id')
        .eq('id', user.id)
        .single();

      const { data, error } = await withTimeout(
        supabase
          .from('courses')
          .insert([{
            ...courseData,
            instructor_id: user.id,
            college_id: profile?.college_id || null,
            created_at: new Date().toISOString()
          }])
          .select()
          .single()
      );

      if (error) throw error;
      return data;
    } catch (error) {
      const errorMsg = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      console.error('Error in createCourse:', errorMsg);
      throw new Error(`Failed to create course: ${errorMsg}`);
    }
  },

  async getMyCourses() {
    try {
      const session = await getSession();
      const { data, error } = await withTimeout(
        supabase
          .from('courses')
          .select('*')
          .eq('instructor_id', session.user.id)
          .order('created_at', { ascending: false })
      );

      if (error) { console.warn('getMyCourses error:', error.message); return []; }
      return data || [];
    } catch (error) {
      console.error('getMyCourses error:', error.message);
      return [];
    }
  },

  async seedInstructorData() {
    const session = await getSession();
    const userId = session.user.id;
    console.log("InstructorService: Seeding data for:", userId);

    // 1. Create a sample course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        instructor_id: userId,
        title: 'Mastering the Meta-Game: Advanced Theory',
        description: 'A deep dive into cross-platform game mechanics and blockchain integration.',
        price: 49.99,
        category: 'Game Development',
        level: 'Intermediate',
        status: 'published',
        thumbnail_url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800'
      })
      .select()
      .single();

    if (courseError) throw courseError;

    // 2. Link existing profiles if any for testing
    const { data: profiles } = await supabase.from('profiles').select('id').limit(10);
    
    if (profiles && profiles.length > 0) {
      // Create a mix of enrollments with different progress
      const enrollments = profiles.map((p, i) => ({
        student_id: p.id,
        course_id: course.id,
        enrolled_at: new Date(Date.now() - (i * 86400000)).toISOString(),
        progress: i % 2 === 0 ? 100 : Math.floor(Math.random() * 80)
      }));

      await supabase.from('enrollments').insert(enrollments);
      
      // Add a mock quiz attempt for one student to show "submission" activity
      const { data: quiz } = await supabase.from('quizzes').insert({
        course_id: course.id,
        title: `${course.title} Final Quiz`,
        time_limit: 20,
        is_published: true
      }).select().single();

      if (quiz) {
        await supabase.from('quiz_attempts').insert({
          student_id: profiles[0].id,
          quiz_id: quiz.id,
          score: 85,
          completed_at: new Date().toISOString()
        });
      }
    }

    return { success: true, courseId: course.id };
  },

  // ── Update Course ─────────────────────────────────────────
  async updateCourse(courseId, updates) {
    const { data, error } = await withTimeout(
      supabase
        .from('courses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', courseId)
        .select()
        .single()
    );
    if (error) throw error;
    return data;
  },

  // ── Analytics Metrics ─────────────────────────────────────
  async getAnalyticsMetrics() {
    try {
      const session = await getSession();
      const courses = await getInstructorCourseIds(session.user.id);
      if (courses.length === 0) return { watchTime: '0h', retention: '0%', passRate: '0%', engagement: '0/10' };

      const courseIds = courses.map(c => c.id);
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('progress')
        .in('course_id', courseIds);

      const total = enrollments?.length || 0;
      const avgProgress = total > 0
        ? Math.round(enrollments.reduce((a, e) => a + (e.progress ?? 0), 0) / total)
        : 0;

      return {
        watchTime: `${(total * 4.5).toFixed(0)}h`,
        retention: `${avgProgress}%`,
        passRate: `${Math.round(avgProgress * 0.8)}%`,
        engagement: `${Math.min(10, (total * 0.12 + 4)).toFixed(1)}/10`,
        totalEnrollments: total,
        avgProgress,
      };
    } catch (error) {
      console.error('getAnalyticsMetrics error:', error.message);
      return { watchTime: '0h', retention: '0%', passRate: '0%', engagement: '0/10' };
    }
  },

  async getRetentionData() {
    try {
      const session = await getSession();
      const courses = await getInstructorCourseIds(session.user.id);
      if (courses.length === 0) return [];

      const courseIds = courses.map(c => c.id);
      const { data: enrollments } = await withTimeout(
        supabase
          .from('enrollments')
          .select('progress')
          .in('course_id', courseIds)
      );

      const buckets = [
        { name: '0-20%', value: 0 },
        { name: '21-40%', value: 0 },
        { name: '41-60%', value: 0 },
        { name: '61-80%', value: 0 },
        { name: '81-100%', value: 0 },
      ];

      enrollments?.forEach(e => {
        const p = e.progress || 0;
        if (p <= 20) buckets[0].value++;
        else if (p <= 40) buckets[1].value++;
        else if (p <= 60) buckets[2].value++;
        else if (p <= 80) buckets[3].value++;
        else buckets[4].value++;
      });

      return buckets;
    } catch (error) {
      console.error('getRetentionData error:', error.message);
      return [];
    }
  },

  async getEarningsMetrics() {
    try {
      const session = await getSession();
      const courses = await getInstructorCourseIds(session.user.id);
      if (courses.length === 0) return { available: '$0', total: '$0', pending: '$0', transactions: [] };

      const courseIds = courses.map(c => c.id);
      const { data: enrollments } = await withTimeout(
        supabase
          .from('enrollments')
          .select(`
            created_at,
            courses (title, price)
          `)
          .in('course_id', courseIds)
          .order('created_at', { ascending: false })
      );

      const totalRevenue = enrollments?.reduce((acc, e) => acc + (e.courses?.price || 0), 0) || 0;
      
      const transactions = (enrollments || []).slice(0, 10).map((e, i) => ({
        id: `tx-${i}`,
        type: 'Course Sale',
        amount: `$${e.courses?.price || 0}`,
        status: 'Completed',
        date: new Date(e.created_at).toLocaleDateString(),
        method: e.courses?.title || 'Unknown Course'
      }));

      return {
        available: `$${(totalRevenue * 0.8).toFixed(2)}`,
        total: `$${totalRevenue.toFixed(2)}`,
        pending: `$${(totalRevenue * 0.1).toFixed(2)}`,
        transactions
      };
    } catch (error) {
      console.error('getEarningsMetrics error:', error.message);
      return { available: '$0', total: '$0', pending: '$0', transactions: [] };
    }
  },

  // ── Real-time subscription for enrollments ────────────────
  subscribeToEnrollments(instructorId, callback) {
    return supabase
      .channel(`enrollments:instructor:${instructorId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enrollments' }, callback)
      .subscribe();
  },

  // ── Real-time subscription for submissions ────────────────
  subscribeToSubmissions(instructorId, callback) {
    return supabase
      .channel(`submissions:instructor:${instructorId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, callback)
      .subscribe();
  },

  // ── Quiz Analytics ──────────────────────────────────────
  async getQuizStats() {
    try {
      const session = await getSession();
      const courses = await getInstructorCourseIds(session.user.id);
      if (courses.length === 0) return { avgScore: 0, completions: 0, passRate: 0, recentSuccess: [] };

      const courseIds = courses.map(c => c.id);
      
      const { data: quizzes } = await withTimeout(
        supabase
          .from('quizzes')
          .select('id, title')
          .in('course_id', courseIds)
      );

      if (!quizzes || quizzes.length === 0) return { avgScore: 0, completions: 0, passRate: 0, recentSuccess: [] };

      const quizIds = quizzes.map(q => q.id);
      const { data: attempts } = await withTimeout(
        supabase
          .from('quiz_attempts')
          .select('*')
          .in('quiz_id', quizIds)
          .order('completed_at', { ascending: false })
      );

      if (!attempts || attempts.length === 0) return { avgScore: 0, completions: 0, passRate: 0, recentSuccess: [] };

      const studentIds = [...new Set(attempts.map(a => a.student_id))];
      const { data: studentProfiles } = await withTimeout(
        supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', studentIds)
      );

      const profileMap = Object.fromEntries((studentProfiles || []).map(p => [p.id, p]));
      const quizMap = Object.fromEntries(quizzes.map(q => [q.id, q]));

      const completions = attempts.length;
      const avgScore = Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / completions);
      const passRate = Math.round((attempts.filter(a => a.score >= 70).length / completions) * 100);

      return {
        avgScore,
        completions,
        passRate,
        recentSuccess: attempts.slice(0, 5).map(a => ({
          name: profileMap[a.student_id]?.full_name || 'Student',
          quiz: quizMap[a.quiz_id]?.title || 'Unknown Quiz',
          score: a.score,
          time: timeAgo(a.completed_at)
        }))
      };
    } catch (error) {
      console.error('getQuizStats error:', error.message);
      return { avgScore: 0, completions: 0, passRate: 0, recentSuccess: [] };
    }
  },
};

// ─── Utility ───────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
