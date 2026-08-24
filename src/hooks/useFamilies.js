import { useQuery } from '@tanstack/react-query';
import { supabase, isConfigured } from '../config/supabase';

export const useFamilyCount = () => {
  return useQuery({
    queryKey: ['familyCount'],
    queryFn: async () => {
      if (!isConfigured) return 0;
      
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('is_admin', false)
        .neq('role', 'customer');

      if (error) {
        throw new Error(error.message);
      }
      
      return count || 0;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour since count doesn't change extremely often
  });
};
