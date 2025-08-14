
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wkmvvlvznxazvwcccptx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbXZ2bHZ6bnhhenZ3Y2NjcHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNTY2MjUsImV4cCI6MjA2OTczMjYyNX0.XMNjEo_xoou2emfzAt6dVXcBtWj2_NZOth8ZUo96pa8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Define your database types
export interface Premise {
  id: number;
  name: string;
  address: string;
  contact_person: string;
  contact_phone: string;
  contact_email?: string;
  service_type: string;
  cleaning_frequency: string;
  special_instructions?: string;
  status: 'pending' | 'completed' | 'issues';
  cleaner: string;
  last_visit?: string;
  next_scheduled: string;
  created_at: string;
}

export interface InspectionReport {
  id: number;
  premise_id: number;
  inspector_name: string;
  date: string;
  time_in: string;
  time_out: string;
  sites_visited: number;
  client_feedback: string;
  overall_rating: string;
  ratings: Record<string, string>;
  comments: Record<string, string>;
  created_at: string;
}