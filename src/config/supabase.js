import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isConfigured = Boolean(url && key && !url.includes('your-project'));

// Browser client uses cookie storage automatically through createBrowserClient
export const supabase = isConfigured
  ? typeof window !== 'undefined'
    ? createBrowserClient(url, key)
    : createClient(url, key)
  : null;

// Helper to create a dedicated server-side client for RSC data fetching
export function getServerSupabase() {
  if (!isConfigured) return null;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
