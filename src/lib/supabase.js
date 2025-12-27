import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log("[Supabase ENV]", {
  REACT_APP_SUPABASE_URL: url,
  hasUrl: !!url,
  hasAnon: !!anon,
});

export const supabase = createClient(url || "", anon || "");
