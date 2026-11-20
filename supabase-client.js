import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const SUPABASE_URL = "https://fyyebxjysrhcxgmgperf.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_mD_KmxXF8wtT-7w08ECpUQ_xzhxsy3P";
export const SITE_URL = "https://fidelarcia09.github.io/internacional-web/";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
