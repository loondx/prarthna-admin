import { z } from 'zod';

export const UserRoleSchema = z.enum([
  'user',
  'admin',
  'content_editor',
  'reviewer',
  'audio_manager'
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  language: z.enum(['en', 'hi', 'sa']).optional(),
  dailyGoalMinutes: z.number().int().min(1).max(120).optional()
});
