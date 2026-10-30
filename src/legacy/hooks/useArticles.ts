import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { publicArticle } from '@/lib/articles.mjs';

export function useArticles() {
  return useQuery({ queryKey: ['published-articles'], queryFn: async () => {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('status','published').order('published_at',{ascending:false}).abortSignal(AbortSignal.timeout(15000));
    if (error) throw error;
    return (data || []).map(publicArticle);
  }});
}

export function useAdminArticles() {
  return useQuery({ queryKey: ['admin-articles'], queryFn: async () => {
    const { data, error } = await supabase.from('blog_posts').select('*').order('updated_at',{ascending:false}).abortSignal(AbortSignal.timeout(15000));
    if (error) throw error;
    return data || [];
  }});
}
