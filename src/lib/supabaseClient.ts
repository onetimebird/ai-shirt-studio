import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rdrkdxvucggzagbcunyn.supabase.co";
const supabaseKey = "eyJ…YOUR_PUBLIC_ANON_KEY…";
export const supabase = createClient(supabaseUrl, supabaseKey);


