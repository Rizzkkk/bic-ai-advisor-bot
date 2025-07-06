
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AvatarMetrics {
  totalInteractions: number;
  averageResponseTime: number;
  contentSources: number;
  averageRating: number;
  recentInteractions: any[];
  contentSourcesData: any[];
}

export const useAvatarAnalytics = () => {
  const [metrics, setMetrics] = useState<AvatarMetrics>({
    totalInteractions: 0,
    averageResponseTime: 0,
    contentSources: 0,
    averageRating: 0,
    recentInteractions: [],
    contentSourcesData: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      
      // Fetch total interactions
      const { data: interactions, error: interactionsError } = await supabase
        .from('avatar_interactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (interactionsError) throw interactionsError;

      // Fetch content sources
      const { data: sources, error: sourcesError } = await supabase
        .from('content_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (sourcesError) throw sourcesError;

      // Calculate metrics
      const totalInteractions = interactions?.length || 0;
      const averageResponseTime = interactions?.length > 0 
        ? interactions.reduce((sum, int) => sum + (int.response_time_ms || 0), 0) / interactions.length
        : 0;
      
      const averageRating = interactions?.length > 0
        ? interactions
            .filter(int => int.response_rating)
            .reduce((sum, int) => sum + (int.response_rating || 0), 0) / 
          interactions.filter(int => int.response_rating).length
        : 0;

      const recentInteractions = interactions?.slice(0, 10) || [];
      const contentSources = sources?.length || 0;
      const contentSourcesData = sources || [];

      setMetrics({
        totalInteractions,
        averageResponseTime,
        contentSources,
        averageRating,
        recentInteractions,
        contentSourcesData
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching avatar analytics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Set up real-time updates
    const channel = supabase
      .channel('avatar_analytics')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'avatar_interactions'
      }, () => {
        fetchMetrics();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'content_sources'
      }, () => {
        fetchMetrics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { metrics, isLoading, error, refetch: fetchMetrics };
};
