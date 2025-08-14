// lib/supabase/users.ts
import { supabase } from './supabase';

export type UserProfile = {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  email_confirmed_at?: string | null;
};

export const fetchUsers = async (filters?: {
  role?: string;
  search?: string;
}): Promise<UserProfile[]> => {
  try {
    let query = supabase.from('profiles').select('*');

    // Apply role filter if provided
    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Apply search filter client-side if needed
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      return (data || []).filter(user => 
        user.email?.toLowerCase().includes(searchTerm) ||
        user.full_name?.toLowerCase().includes(searchTerm) ||
        user.company?.toLowerCase().includes(searchTerm)
      );
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};