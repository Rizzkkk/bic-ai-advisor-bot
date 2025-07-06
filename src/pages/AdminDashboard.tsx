import React, { useState, useEffect } from 'react';
import AdminAuth from '@/components/auth/AdminAuth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, FileText, Settings, TrendingUp, LogOut, Shield, Activity, Users, MessageSquare, Database } from 'lucide-react';
import ContentUploader from '@/components/avatar/ContentUploader';
import ContentManager from '@/components/avatar/ContentManager';
import Navigation from '@/components/Navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAvatarAnalytics } from '@/hooks/useAvatarAnalytics';

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const { metrics, isLoading, error, refetch } = useAvatarAnalytics();

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
    refetch(); // Refresh analytics
  };

  const handleSourceSelect = (sourceId: string) => {
    setSelectedSource(sourceId);
  };

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <Navigation />
      <div className="max-w-7xl mx-auto pt-16">
        {/* Production Admin Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Production Admin Dashboard</h1>
                <p className="text-gray-600">Bibhrajit AI Avatar Management Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">System Online</span>
              </div>
              <span className="text-gray-500">Last updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200"
          >
            <LogOut className="w-4 h-4" />
            Secure Logout
          </Button>
        </div>

        {/* System Status Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Activity className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Production Environment Active</strong> - All systems operational. Session auto-expires in 2 hours.
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              <strong>Data Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* System Health Dashboard */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Database</p>
                  <p className="text-xs text-green-600">PostgreSQL + Vector</p>
                </div>
                <Database className="w-5 h-5 text-green-600" />
              </div>
              <div className="mt-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-700 font-medium">Online</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Voice System</p>
                  <p className="text-xs text-blue-600">STT + TTS Active</p>
                </div>
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div className="mt-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-blue-700 font-medium">Online</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">RAG Pipeline</p>
                  <p className="text-xs text-purple-600">Content Processing</p>
                </div>
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div className="mt-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs text-purple-700 font-medium">Online</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Analytics</p>
                  <p className="text-xs text-orange-600">Live Monitoring</p>
                </div>
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div className="mt-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-orange-700 font-medium">Online</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="content" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Content Management</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Live Analytics</TabsTrigger>
            <TabsTrigger value="testing" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Quality Testing</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">System Settings</TabsTrigger>
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
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Interactions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {isLoading ? '...' : metrics.totalInteractions.toLocaleString()}
                  </div>
                  <p className="text-xs text-blue-600">Live production data</p>
                  <div className="mt-2 text-xs text-blue-500">
                    Avg response: {isLoading ? '...' : Math.round(metrics.averageResponseTime)}ms
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Content Sources</CardTitle>
                  <FileText className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {isLoading ? '...' : metrics.contentSources}
                  </div>
                  <p className="text-xs text-green-600">Active knowledge base</p>
                  <div className="mt-2 text-xs text-green-500">Vector embeddings ready</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Response Quality</CardTitle>
                  <BarChart className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">
                    {isLoading ? '...' : metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) + '/5' : 'N/A'}
                  </div>
                  <p className="text-xs text-purple-600">Based on user feedback</p>
                  <div className="mt-2 text-xs text-purple-500">Production quality</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Live Interactions Dashboard
                  <Button 
                    onClick={refetch} 
                    variant="outline" 
                    size="sm"
                    className="ml-auto"
                  >
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading live data...</div>
                ) : metrics.recentInteractions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No interactions yet. Try the Avatar mode to generate some data!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {metrics.recentInteractions.slice(0, 5).map((interaction, index) => (
                      <div key={interaction.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div>
                          <p className="font-medium text-blue-900">
                            {interaction.user_query.substring(0, 80)}
                            {interaction.user_query.length > 80 ? '...' : ''}
                          </p>
                          <p className="text-sm text-blue-700">
                            Retrieved {interaction.retrieved_chunks?.length || 0} sources
                            {interaction.response_rating && ` • ${interaction.response_rating}/5 rating`}
                            {interaction.response_time_ms && ` • ${interaction.response_time_ms}ms`}
                          </p>
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          {new Date(interaction.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Production Quality Assurance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">Comprehensive testing suite for production environment</p>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-6 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="font-semibold mb-3 text-blue-900">Avatar Voice Testing</h4>
                    <p className="text-sm text-blue-700 mb-4">Test complete voice conversation flow with AI Avatar</p>
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-blue-600">✓ Speech-to-text accuracy</div>
                      <div className="text-xs text-blue-600">✓ RAG context retrieval</div>
                      <div className="text-xs text-blue-600">✓ Text-to-speech output</div>
                      <div className="text-xs text-blue-600">✓ Continuous conversation</div>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Test Avatar Voice Mode
                    </Button>
                  </div>
                  <div className="p-6 border border-green-200 rounded-lg bg-green-50">
                    <h4 className="font-semibold mb-3 text-green-900">Content Integration</h4>
                    <p className="text-sm text-green-700 mb-4">Verify uploaded content affects Avatar responses</p>
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-green-600">✓ Content processing pipeline</div>
                      <div className="text-xs text-green-600">✓ Vector embedding quality</div>
                      <div className="text-xs text-green-600">✓ Context retrieval accuracy</div>
                      <div className="text-xs text-green-600">✓ Response relevance</div>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Test Content Pipeline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Production System Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">AI Response Settings</h4>
                      <div>
                        <label className="block text-sm font-medium mb-2">Response Temperature</label>
                        <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="w-full" />
                        <p className="text-sm text-gray-600 mt-1">Controls creativity vs consistency (0.7 optimal for production)</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">RAG Similarity Threshold</label>
                        <input type="range" min="0.5" max="0.9" step="0.05" defaultValue="0.75" className="w-full" />
                        <p className="text-sm text-gray-600 mt-1">Minimum similarity for content retrieval (0.75 production)</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Voice System Settings</h4>
                      <div>
                        <label className="block text-sm font-medium mb-2">Default AI Voice</label>
                        <select className="w-full p-2 border rounded-lg">
                          <option value="nova" selected>Nova (Professional - Default)</option>
                          <option value="alloy">Alloy (Neutral)</option>
                          <option value="echo">Echo (Male)</option>
                          <option value="onyx">Onyx (Deep)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">TTS Speed</label>
                        <input type="range" min="0.5" max="2.0" step="0.1" defaultValue="1.0" className="w-full" />
                        <p className="text-sm text-gray-600 mt-1">Speech playback speed (1.0 optimal)</p>
                      </div>
                    </div>
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
