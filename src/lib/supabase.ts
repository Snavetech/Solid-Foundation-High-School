import { createClient } from '@supabase/supabase-js';

// Environment variable retrieval
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-school-fees.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key-solid-foundation';

// Initialize Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('demo');
