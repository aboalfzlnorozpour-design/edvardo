import type { Database } from '@/integrations/supabase/types';
// Local helper (the generated types file must not be edited by hand).
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
