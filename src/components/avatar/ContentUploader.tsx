
import React, { useState, useCallback } from 'react';
import { Upload, FileText, Link, Mic, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface ContentUploaderProps {
  onUploadComplete?: (sourceId: string) => void;
}

const ContentUploader: React.FC<ContentUploaderProps> = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'text' | 'url'>('file');
  const [formData, setFormData] = useState({
    name: '',
    type: 'document',
    sourceUrl: '',
    content: ''
  });

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      
      const { data, error } = await supabase
        .from('content_sources' as any)
        .insert([{
          name: formData.name || file.name,
          type: formData.type,
          raw_content: text,
          metadata: {
            original_filename: file.name,
            file_size: file.size,
            file_type: file.type
          }
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onUploadComplete?.(data.id);
      }
      setFormData({ name: '', type: 'document', sourceUrl: '', content: '' });
      
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  }, [formData, onUploadComplete]);

  const handleTextSubmit = async () => {
    if (!formData.content.trim() || !formData.name.trim()) return;

    setUploading(true);
    try {
      const { data, error } = await supabase
        .from('content_sources' as any)
        .insert([{
          name: formData.name,
          type: formData.type,
          source_url: formData.sourceUrl || null,
          raw_content: formData.content,
          metadata: {
            input_method: uploadMode,
            created_via: 'manual_input'
          }
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        onUploadComplete?.(data.id);
      }
      setFormData({ name: '', type: 'document', sourceUrl: '', content: '' });
      
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setUploading(false);
    }
  };

  const getUploadIcon = () => {
    switch (formData.type) {
      case 'audio': return <Mic className="w-4 h-4" />;
      case 'social_post': return <MessageSquare className="w-4 h-4" />;
      case 'article': return <Link className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Add Content Source
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Mode Selection */}
        <div className="flex gap-2">
          <Button
            variant={uploadMode === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('file')}
          >
            <Upload className="w-4 h-4 mr-2" />
            File Upload
          </Button>
          <Button
            variant={uploadMode === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('text')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Text Input
          </Button>
          <Button
            variant={uploadMode === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMode('url')}
          >
            <Link className="w-4 h-4 mr-2" />
            URL Import
          </Button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Content Name</label>
            <Input
              placeholder="Enter content name..."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="audio">Audio Transcript</SelectItem>
                <SelectItem value="social_post">Social Post</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="strategic_doc">Strategic Document</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {uploadMode === 'url' && (
          <div>
            <label className="block text-sm font-medium mb-2">Source URL</label>
            <Input
              placeholder="https://..."
              value={formData.sourceUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
            />
          </div>
        )}

        {uploadMode === 'file' && (
          <div>
            <label className="block text-sm font-medium mb-2">Select File</label>
            <Input
              type="file"
              accept=".txt,.md,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </div>
        )}

        {(uploadMode === 'text' || uploadMode === 'url') && (
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <Textarea
              placeholder="Paste your content here..."
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
            />
          </div>
        )}

        {uploadMode !== 'file' && (
          <Button
            onClick={handleTextSubmit}
            disabled={uploading || !formData.content.trim() || !formData.name.trim()}
            className="w-full"
          >
            {getUploadIcon()}
            {uploading ? 'Processing...' : 'Add Content'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentUploader;
