// utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zliywqoxpdeaeyhpkybr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsaXl3cW94cGRlYWV5aHBreWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMDgzOTQsImV4cCI6MjA2NjU4NDM5NH0.LH19x_-4db8KIl4XkbVrJy3bpdgd0Fe_sFmCAIU48dE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;