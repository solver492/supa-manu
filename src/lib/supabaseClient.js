import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfaheztemlnespvqwzlt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYWhlenRlbWxuZXNwdnF3emx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwOTAyMTcsImV4cCI6MjA2MzY2NjIxN30.TJ3ZIN1FG3f43exdQ3itmdlsRY0Lhhcli3JwuKSWrgU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);