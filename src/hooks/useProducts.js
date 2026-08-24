import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '../config/supabase';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!isConfigured) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles!products_owner_id_fkey(family_name, city, whatsapp)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    },
    // Cache data for 5 minutes
    staleTime: 1000 * 60 * 5, 
  });
};
