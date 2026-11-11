import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();

const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  url &&
  anonKey &&
  url.startsWith("https://") &&
  !url.includes("YOUR_PROJECT") &&
  !anonKey.includes("YOUR_")
);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const adminEmail = (
  import.meta.env.VITE_ADMIN_EMAIL || ""
)
  .trim()
  .toLowerCase();