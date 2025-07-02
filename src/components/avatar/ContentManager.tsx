
import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Eye, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface ContentSource {
  id: string;
  name: string;
  type: string;
  status: string;
  upload_date: string;
  source_url?: string;
  metadata: any;
}

interface ContentManagerProps {
  onSourceSelect?: (sourceId: string) => void;
}

const ContentManager: React.FC<ContentManagerProps> = ({ onSourceSelect }) => {
  const [sources, setSources] = useState<ContentSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string[]>([]);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const { data, error } = await supabase
        .from('content_sources' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSources(data || []);
    } catch (error) {
      console.error('Error loading sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const processContent = async (sourceId: string) => {
    setProcessing(prev => [...prev, sourceId]);
    
    try {
      const response = await supabase.functions.invoke('process-content', {
        body: { sourceId }
      });

      if (response.error) throw response.error;

      // Refresh the sources list
      await loadSources();
    } catch (error) {
      console.error('Error processing content:', error);
    } finally {
      setProcessing(prev => prev.filter(id => id !== sourceId));
    }
  };

  const generateEmbeddings = async (sourceId: string) => {
    setProcessing(prev => [...prev, sourceId]);
    
    try {
      // First get the chunks for this source
      const { data: chunks, error: chunksError } = await supabase
        .from('content_chunks' as any)
        .select('*')
        .eq('source_id', sourceId)
        .is('embedding', null);

      if (chunksError) throw chunksError;

      if (chunks && chunks.length > 0) {
        const response = await supabase.functions.invoke('generate-embeddings', {
          body: { chunks }
        });

        if (response.error) throw response.error;
      }

      await loadSources();
    } catch (error) {
      console.error('Error generating embeddings:', error);
    } finally {
      setProcessing(prev => prev.filter(id => id !== sourceId));
    }
  };

  const deleteSource = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this content source?')) return;

    try {
      const { error } = await supabase
        .from('content_sources' as any)
        .delete()
        .eq('id', sourceId);

      if (error) throw error;
      await loadSources();
    } catch (error) {
      console.error('Error deleting source:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    return <FileText className="w-4 h-4" />;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading content sources...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Content Sources</h2>
        <Button onClick={loadSources} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {sources.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No content sources added yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sources.map((source) => (
            <Card key={source.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(source.type)}
                    <div>
                      <CardTitle className="text-lg">{source.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {new Date(source.upload_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(source.status)}>
                      {source.status}
                    </Badge>
                    <Badge variant="outline">{source.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSourceSelect?.(source.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    
                    {source.status === 'uploaded' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => processContent(source.id)}
                        disabled={processing.includes(source.id)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {processing.includes(source.id) ? 'Processing...' : 'Process'}
                      </Button>
                    )}
                    
                    {source.status === 'processed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateEmbeddings(source.id)}
                        disabled={processing.includes(source.id)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {processing.includes(source.id) ? 'Embedding...' : 'Generate Embeddings'}
                      </Button>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSource(source.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {source.source_url && (
                  <p className="text-sm text-gray-600 mt-2">
                    Source: <a href={source.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {source.source_url}
                    </a>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentManager;
