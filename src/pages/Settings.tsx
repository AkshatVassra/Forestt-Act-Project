import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Settings,
  Bell,
  Lock,
  User,
  MapPin,
  Eye,
  EyeOff,
  Save,
  ChevronRight,
  Moon,
  Sun,
  Globe,
} from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
}

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const [mapSettings, setMapSettings] = useState({
    defaultZoom: 5,
    showLabels: true,
    showGrid: false,
  });
  const [language, setLanguage] = useState('en');
  const [saveStatus, setSaveStatus] = useState('');

  const handleSaveSettings = () => {
    setSaveStatus('Settings saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            ← Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-forest-600" />
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Success Message */}
        {saveStatus && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {saveStatus}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <nav className="flex flex-col">
                {[
                  { icon: User, label: 'Account', id: 'account' },
                  { icon: Bell, label: 'Notifications', id: 'notifications' },
                  { icon: MapPin, label: 'Map Settings', id: 'map' },
                  { icon: Sun, label: 'Appearance', id: 'appearance' },
                  { icon: Globe, label: 'Language', id: 'language' },
                  { icon: Lock, label: 'Privacy & Security', id: 'security' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 text-left"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.label}</span>
                      <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Account Settings */}
            <Card className="p-6 border-border">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-forest-600" />
                <h2 className="text-xl font-semibold">Account Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-sm cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Your email address cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.name || 'User'}
                    className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <input
                    type="text"
                    value={user?.role || 'user'}
                    disabled
                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-sm cursor-not-allowed capitalize"
                  />
                </div>
              </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6 border-border">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="h-5 w-5 text-forest-600" />
                <h2 className="text-xl font-semibold">Notification Preferences</h2>
              </div>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{key} Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        {key === 'email' && 'Receive updates via email'}
                        {key === 'push' && 'Receive push notifications'}
                        {key === 'sms' && 'Receive SMS alerts'}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [key]: !value })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        value ? 'bg-forest-600' : 'bg-muted-foreground'
                      } flex items-center ${value ? 'justify-end' : 'justify-start'} p-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Map Settings */}
            <Card className="p-6 border-border">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="h-5 w-5 text-forest-600" />
                <h2 className="text-xl font-semibold">Map Settings</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Zoom Level: {mapSettings.defaultZoom}</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={mapSettings.defaultZoom}
                    onChange={(e) => setMapSettings({ ...mapSettings, defaultZoom: parseInt(e.target.value) })}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <p className="font-medium">Show Map Labels</p>
                  <button
                    onClick={() => setMapSettings({ ...mapSettings, showLabels: !mapSettings.showLabels })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      mapSettings.showLabels ? 'bg-forest-600' : 'bg-muted-foreground'
                    } flex items-center ${mapSettings.showLabels ? 'justify-end' : 'justify-start'} p-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <p className="font-medium">Show Grid</p>
                  <button
                    onClick={() => setMapSettings({ ...mapSettings, showGrid: !mapSettings.showGrid })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      mapSettings.showGrid ? 'bg-forest-600' : 'bg-muted-foreground'
                    } flex items-center ${mapSettings.showGrid ? 'justify-end' : 'justify-start'} p-1`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </button>
                </div>
              </div>
            </Card>

            {/* Appearance Settings */}
            <Card className="p-6 border-border">
              <div className="flex items-center gap-3 mb-6">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-forest-600" />
                ) : (
                  <Sun className="h-5 w-5 text-forest-600" />
                )}
                <h2 className="text-xl font-semibold">Appearance</h2>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Enable dark theme</p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    darkMode ? 'bg-forest-600' : 'bg-muted-foreground'
                  } flex items-center ${darkMode ? 'justify-end' : 'justify-start'} p-1`}
                >
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </button>
              </div>
            </Card>

            {/* Language Settings */}
            <Card className="p-6 border-border">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="h-5 w-5 text-forest-600" />
                <h2 className="text-xl font-semibold">Language</h2>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Select Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="pt">Portuguese</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </Card>

            {/* Privacy & Security */}
            <Card className="p-6 border-border">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="h-5 w-5 text-forest-600" />
                <h2 className="text-xl font-semibold">Privacy & Security</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Change Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 pr-10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Security Tip:</strong> Use a strong password with uppercase, lowercase, numbers, and symbols.
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Enable two-factor authentication</span>
                  </label>
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex gap-4">
              <Button
                onClick={handleSaveSettings}
                className="flex items-center gap-2 bg-forest-600 hover:bg-forest-700 text-white"
              >
                <Save className="h-4 w-4" />
                Save All Settings
              </Button>
              <Button
                variant="outline"
                onClick={onBack}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
