import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeroSection } from '@/components/HeroSection';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Upload, 
  Brain, 
  Satellite,
  Users,
  TreePine,
  Map
} from 'lucide-react';

interface DashboardProps {
  onViewChange: (view: string) => void;
  currentView: string;
}

export const Dashboard = ({ onViewChange, currentView }: DashboardProps) => {
  const stats = {
    totalClaims: 2847,
    approved: 1523,
    pending: 892,
    underReview: 307,
    rejected: 125,
    aiProcessed: 2234,
    ocrDocuments: 1876,
    forestArea: 45672 // hectares
  };

  const recentActivity = [
    { id: 1, type: 'OCR Processing', description: 'Document digitized for claim FRA-002847', time: '2 min ago', status: 'completed' },
    { id: 2, type: 'AI Validation', description: 'Overlap detected in claims FRA-002845 & FRA-002846', time: '5 min ago', status: 'alert' },
    { id: 3, type: 'Claim Approval', description: 'Claim FRA-002844 approved by District Collector', time: '15 min ago', status: 'approved' },
    { id: 4, type: 'Satellite Analysis', description: 'Land parcel verification completed for 12 claims', time: '1 hour ago', status: 'completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <HeroSection onViewChange={onViewChange} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-gis-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClaims.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-gis-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Claims</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.approved.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.approved / stats.totalClaims) * 100).toFixed(1)}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-gis-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Processed</CardTitle>
            <Brain className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.aiProcessed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.aiProcessed / stats.totalClaims) * 100).toFixed(1)}% automated
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-gis-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Forest Area</CardTitle>
            <TreePine className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.forestArea.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              hectares under FRA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="claims">Claims Status</TabsTrigger>
          <TabsTrigger value="ai">AI Analytics</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Claims Distribution */}
            <Card className="shadow-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Claims Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success"></div>
                      Approved
                    </span>
                    <span>{stats.approved}</span>
                  </div>
                  <Progress value={(stats.approved / stats.totalClaims) * 100} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-warning"></div>
                      Pending
                    </span>
                    <span>{stats.pending}</span>
                  </div>
                  <Progress value={(stats.pending / stats.totalClaims) * 100} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Under Review
                    </span>
                    <span>{stats.underReview}</span>
                  </div>
                  <Progress value={(stats.underReview / stats.totalClaims) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-panel">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'approved' ? 'bg-success' :
                        activity.status === 'alert' ? 'bg-destructive' :
                        'bg-primary'
                      }`}></div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.type}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="claims">
          <Card className="shadow-panel">
            <CardHeader>
              <CardTitle>Claims Status Overview</CardTitle>
              <CardDescription>Detailed breakdown of all forest rights claims</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processing Pipeline</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>OCR Processing</span>
                      <Badge variant="secondary">{stats.ocrDocuments}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>AI Validation</span>
                      <Badge variant="outline">{stats.aiProcessed}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Manual Review</span>
                      <Badge variant="outline">{stats.totalClaims - stats.aiProcessed}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Geographic Distribution</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Madhya Pradesh</span>
                      <Badge>1,247</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Chhattisgarh</span>
                      <Badge>892</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Odisha</span>
                      <Badge>708</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Claim Types</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Individual</span>
                      <Badge variant="secondary">1,689</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Community</span>
                      <Badge variant="secondary">1,158</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Processing Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>OCR Accuracy</span>
                      <span>94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overlap Detection</span>
                      <span>98.7%</span>
                    </div>
                    <Progress value={98.7} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Validation Confidence</span>
                      <span>87.3%</span>
                    </div>
                    <Progress value={87.3} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="h-5 w-5" />
                  Satellite Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">156</div>
                    <div className="text-xs text-muted-foreground">Land parcels verified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">23</div>
                    <div className="text-xs text-muted-foreground">Potential conflicts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">89%</div>
                    <div className="text-xs text-muted-foreground">Match accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">4.2GB</div>
                    <div className="text-xs text-muted-foreground">Imagery processed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card className="shadow-panel">
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>System performance and alert monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">2.3s</div>
                  <div className="text-sm text-muted-foreground">Avg processing time</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
                  <div className="text-2xl font-bold">7</div>
                  <div className="text-sm text-muted-foreground">Active alerts</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                  <div className="text-2xl font-bold">99.2%</div>
                  <div className="text-sm text-muted-foreground">System uptime</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">156</div>
                  <div className="text-sm text-muted-foreground">Documents today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};