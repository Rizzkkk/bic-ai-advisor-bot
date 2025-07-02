
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, FileText, Settings, TrendingUp } from 'lucide-react';
import ContentUploader from '@/components/avatar/ContentUploader';
import ContentManager from '@/components/avatar/ContentManager';
import Navigation from '@/components/Navigation';

const AdminDashboard: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const handleUploadComplete = (sourceId: string) => {
    console.log('Content uploaded:', sourceId);
    // Refresh content manager or show success message
  };

  const handleSourceSelect = (sourceId: string) => {
    setSelectedSource(sourceId);
    // Could open a detailed view or processing panel
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Navigation />
      <div className="max-w-7xl mx-auto pt-16">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Avatar Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage Bibhrajit's content and monitor AI Avatar performance</p>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="testing">Quality Testing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <ContentUploader onUploadComplete={handleUploadComplete} />
              </div>
              <div>
                <ContentManager onSourceSelect={handleSourceSelect} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Content Sources</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-muted-foreground">+2 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Quality</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.6/5</div>
                  <p className="text-xs text-muted-foreground">+0.2 from last month</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Interactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">User asked about AI investment strategy</p>
                      <p className="text-sm text-gray-600">Retrieved 3 relevant sources, 4.5/5 rating</p>
                    </div>
                    <div className="text-sm text-gray-500">2 hours ago</div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">Query about African market opportunities</p>
                      <p className="text-sm text-gray-600">Retrieved 2 relevant sources, 5/5 rating</p>
                    </div>
                    <div className="text-sm text-gray-500">4 hours ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Testing Suite</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Test the AI Avatar's responses against known scenarios</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded">
                    <h4 className="font-medium mb-2">Founder Questions</h4>
                    <p className="text-sm text-gray-600 mb-3">Test responses to typical founder inquiries</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Run Tests
                    </button>
                  </div>
                  <div className="p-4 border rounded">
                    <h4 className="font-medium mb-2">Investor Questions</h4>
                    <p className="text-sm text-gray-600 mb-3">Test responses to investor-focused queries</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Run Tests
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Avatar Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Response Temperature</label>
                    <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="w-full" />
                    <p className="text-sm text-gray-600">Controls creativity vs consistency (0.7 recommended)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">RAG Similarity Threshold</label>
                    <input type="range" min="0.5" max="0.9" step="0.05" defaultValue="0.7" className="w-full" />
                    <p className="text-sm text-gray-600">Minimum similarity for content retrieval</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Context Chunks</label>
                    <select className="w-full p-2 border rounded">
                      <option value="3">3 chunks</option>
                      <option value="5" selected>5 chunks</option>
                      <option value="10">10 chunks</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
