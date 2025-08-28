// import { createClient } from "@supabase/supabase-js";
// const supabaseUrl = "https://nnalhwramlsvzquuebmw.supabase.co";
// const supabaseKey = String(process.env.SUPABASE_KEY);
// const supabase = createClient(supabaseUrl, supabaseKey);

// export default supabase;

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
