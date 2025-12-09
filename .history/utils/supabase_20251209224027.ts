import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.PUBLIC_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);