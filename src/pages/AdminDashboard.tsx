
import React, { useState, useEffect } from 'react';
import AdminAuth from '@/components/auth/AdminAuth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, FileText, Settings, TrendingUp, LogOut, Shield } from 'lucide-react';
import ContentUploader from '@/components/avatar/ContentUploader';
import ContentManager from '@/components/avatar/ContentManager';
import Navigation from '@/components/Navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session');
    const sessionExpiry = localStorage.getItem('admin_session_expiry');
    
    if (adminSession && sessionExpiry) {
      const now = new Date().getTime();
      const expiry = parseInt(sessionExpiry);
      
      if (now < expiry) {
        setIsAuthenticated(true);
      } else {
        handleLogout();
      }
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    localStorage.removeItem('admin_session_expiry');
    setIsAuthenticated(false);
  };

  const handleUploadComplete = (sourceId: string) => {
    console.log('Content uploaded:', sourceId);
    // Refresh content manager or show success message
  };

  const handleSourceSelect = (sourceId: string) => {
    setSelectedSource(sourceId);
    // Could open a detailed view or processing panel
  };

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Navigation />
      <div className="max-w-7xl mx-auto pt-16">
        {/* Admin Header with Security Warning */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">AI Avatar Admin Dashboard</h1>
            </div>
            <p className="text-gray-600">Manage Bibhrajit's content and monitor AI Avatar performance</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Security Alert */}
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <Shield className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Secure Admin Session Active</strong> - Session will expire automatically after 2 hours of inactivity.
          </AlertDescription>
        </Alert>

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
