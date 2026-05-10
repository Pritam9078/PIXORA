import { z } from 'zod';

// User Schema
export const UserSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['student', 'instructor', 'college_admin', 'partner', 'super_admin']),
  status: z.enum(['active', 'pending', 'suspended'])
});

// College Schema
export const CollegeSchema = z.object({
  name: z.string().min(2, 'Institution name must be at least 2 characters'),
  domain: z.string().url('Must be a valid URL/Domain').optional().or(z.literal('')),
  status: z.enum(['active', 'pending', 'suspended']),
  student_count: z.number().int().min(0).optional(),
  course_count: z.number().int().min(0).optional(),
  subscription_tier: z.enum(['free', 'pro', 'enterprise', 'global']).optional()
});

// Course Schema
export const CourseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  category: z.string().min(2, 'Category is required'),
  instructor_name: z.string().optional(),
  description: z.string().optional(),
  price: z.preprocess((val) => Number(val), z.number().min(0).optional()),
  status: z.enum(['draft', 'published', 'archived']),
  is_premium: z.boolean().optional(),
  enrolled: z.number().int().min(0).optional(),
  rating: z.number().min(0).max(5).optional()
});
