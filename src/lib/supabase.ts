import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://nnalhwramlsvzquuebmw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uYWxod3JhbWxzdnpxdXVlYm13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE2ODQsImV4cCI6MjA2NjE0NzY4NH0.XFrSIg6Pt0RC0tIG8hpa-fe_atuYuXwEuZVCIC_IvcY";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
