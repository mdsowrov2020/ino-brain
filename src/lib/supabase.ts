import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://nnalhwramlsvzquuebmw.supabase.co";
const supabaseKey = String(process.env.SUPABASE_KEY);
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
