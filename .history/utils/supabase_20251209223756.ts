import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extras = Constants.expoConfig?.extra ?? {};
const supabaseUrl = extras.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = extras.PUBLIC_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);