import { getServerSupabase, isConfigured } from '../config/supabase';

export async function getFamilyCount() {
  if (!isConfigured) return 0;

  const supabase = getServerSupabase();
  if (!supabase) return 0;

  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')
      .eq('is_admin', false)
      .neq('role', 'customer');

    if (error) {
      console.error('Error fetching familyCount on server:', error.message);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Server getFamilyCount exception:', err);
    return 0;
  }
}
