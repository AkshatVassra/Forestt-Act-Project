import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield,
  Clock
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Users', value: '247', icon: Users, trend: '+12% this month' },
    { label: 'Claims Filed', value: '1,234', icon: FileText, trend: '+8% from last week' },
    { label: 'Pending Review', value: '45', icon: Clock, trend: 'Urgent attention needed' },
    { label: 'Verified Cases', value: '892', icon: Shield, trend: '+5% this month' },
  ];

  const recentActivity = [
    { id: 1, action: 'New claim filed by John Smith', timestamp: '2 hours ago', type: 'claim' },
    { id: 2, action: 'Map layer updated - Boundary Data', timestamp: '4 hours ago', type: 'map' },
    { id: 3, action: 'User registered: Sarah Johnson', timestamp: '6 hours ago', type: 'user' },
    { id: 4, action: 'Analytics report generated', timestamp: '8 hours ago', type: 'report' },
    { id: 5, action: 'System backup completed', timestamp: '12 hours ago', type: 'system' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">{user?.role.toUpperCase()}</Badge>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-2">{stat.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common admin operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Review Claims
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{user?.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant="default">{user?.role.toUpperCase()}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Database</span>
                  <Badge variant="outline" className="bg-green-50">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API Server</span>
                  <Badge variant="outline" className="bg-green-50">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Map Service</span>
                  <Badge variant="outline" className="bg-green-50">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Storage</span>
                  <Badge variant="outline" className="bg-yellow-50">93% Used</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
