import { getServerSupabase, isConfigured } from '../config/supabase';

export async function getProducts() {
  if (!isConfigured) return [];

  const supabase = getServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles!products_owner_id_fkey(family_name, city, whatsapp)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products on server:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Server getProducts exception:', err);
    return [];
  }
}
