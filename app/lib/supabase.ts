import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ryqjkslsgfcycxybdeoj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5cWprc2xzZ2ZjeWN4eWJkZW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTk5NzMsImV4cCI6MjA3MzA5NTk3M30.G3TTKLpIdBbpcvaO7_SWDuAsvehLI5mT0U85eM5uw50';

export const supabase = createClient(
  'https://ryqjkslsgfcycxybdeoj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5cWprc2xzZ2ZjeWN4eWJkZW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTk5NzMsImV4cCI6MjA3MzA5NTk3M30.G3TTKLpIdBbpcvaO7_SWDuAsvehLI5mT0U85eM5uw50',
  {
    global: {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    }
  }
);

// Database types
export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'client' | 'cleaner' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; 
  category: string;
  created_at: string;
};

export type Booking = {
  id: string;
  client_id: string;
  cleaner_id: string | null;
  service_id: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  scheduled_time: string;
  address: string;
  special_instructions: string | null;
  total_price: number;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  booking_id: string;
  client_id: string;
  cleaner_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};