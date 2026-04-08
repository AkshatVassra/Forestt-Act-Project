import { useState, useEffect } from 'react';
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
  Check,
} from 'lucide-react';

interface SettingsPageProps {
  onBack: () => void;
}

interface SettingsState {
  darkMode: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  mapSettings: {
    defaultZoom: number;
    showLabels: boolean;
    showGrid: boolean;
  };
  language: string;
  password: string;
  twoFactorEnabled: boolean;
  userName: string;
}

const DEFAULT_SETTINGS: SettingsState = {
  darkMode: false,
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  mapSettings: {
    defaultZoom: 5,
    showLabels: true,
    showGrid: false,
  },
  language: 'en',
  password: '',
  twoFactorEnabled: false,
  userName: 'User',
};

export default function SettingsPage({ onBack }: SettingsPageProps) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'account' | 'notifications' | 'map' | 'appearance' | 'language' | 'security'>('account');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('appSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('[v0] Failed to load settings:', e);
      }
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleSettingChange = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleNestedChange = (parent: 'notifications' | 'mapSettings', key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [key]: value }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSaveStatus('Settings saved successfully!');
    setHasChanges(false);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const sidebarItems = [
    { icon: User, label: 'Account', id: 'account' as const },
    { icon: Bell, label: 'Notifications', id: 'notifications' as const },
    { icon: MapPin, label: 'Map Settings', id: 'map' as const },
    { icon: Sun, label: 'Appearance', id: 'appearance' as const },
    { icon: Globe, label: 'Language', id: 'language' as const },
    { icon: Lock, label: 'Privacy & Security', id: 'security' as const },
  ];

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
            <div className="bg-card rounded-lg border border-border overflow-hidden sticky top-24">
              <nav className="flex flex-col">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors border-b border-border last:border-b-0 text-left ${
                        isActive 
                          ? 'bg-forest-50 text-forest-700 border-l-4 border-l-forest-600' 
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-forest-600' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {isActive && <ChevronRight className="h-4 w-4 text-forest-600" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Account Settings */}
            {activeSection === 'account' && (
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
                      value={settings.userName}
                      onChange={(e) => handleSettingChange('userName', e.target.value)}
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
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <Card className="p-6 border-border">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="h-5 w-5 text-forest-600" />
                  <h2 className="text-xl font-semibold">Notification Preferences</h2>
                </div>
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:border-forest-300 transition">
                      <div>
                        <p className="font-medium capitalize">{key} Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          {key === 'email' && 'Receive updates via email'}
                          {key === 'push' && 'Receive push notifications'}
                          {key === 'sms' && 'Receive SMS alerts'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNestedChange('notifications', key, !value)}
                        className={`relative w-14 h-8 rounded-full transition-all ${
                          value ? 'bg-forest-600' : 'bg-muted-foreground'
                        } flex items-center ${value ? 'justify-end' : 'justify-start'} p-1`}
                        aria-label={`Toggle ${key} notifications`}
                      >
                        <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Map Settings */}
            {activeSection === 'map' && (
              <Card className="p-6 border-border">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="h-5 w-5 text-forest-600" />
                  <h2 className="text-xl font-semibold">Map Settings</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Default Zoom Level</label>
                      <span className="text-lg font-bold text-forest-600">{settings.mapSettings.defaultZoom}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={settings.mapSettings.defaultZoom}
                      onChange={(e) => handleNestedChange('mapSettings', 'defaultZoom', parseInt(e.target.value))}
                      className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-forest-600"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Current zoom: {settings.mapSettings.defaultZoom}x</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:border-forest-300 transition">
                    <div>
                      <p className="font-medium">Show Map Labels</p>
                      <p className="text-sm text-muted-foreground">Display place names and boundaries</p>
                    </div>
                    <button
                      onClick={() => handleNestedChange('mapSettings', 'showLabels', !settings.mapSettings.showLabels)}
                      className={`relative w-14 h-8 rounded-full transition-all ${
                        settings.mapSettings.showLabels ? 'bg-forest-600' : 'bg-muted-foreground'
                      } flex items-center ${settings.mapSettings.showLabels ? 'justify-end' : 'justify-start'} p-1`}
                    >
                      <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:border-forest-300 transition">
                    <div>
                      <p className="font-medium">Show Grid Overlay</p>
                      <p className="text-sm text-muted-foreground">Display coordinate grid on map</p>
                    </div>
                    <button
                      onClick={() => handleNestedChange('mapSettings', 'showGrid', !settings.mapSettings.showGrid)}
                      className={`relative w-14 h-8 rounded-full transition-all ${
                        settings.mapSettings.showGrid ? 'bg-forest-600' : 'bg-muted-foreground'
                      } flex items-center ${settings.mapSettings.showGrid ? 'justify-end' : 'justify-start'} p-1`}
                    >
                      <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <Card className="p-6 border-border">
                <div className="flex items-center gap-3 mb-6">
                  {settings.darkMode ? (
                    <Moon className="h-5 w-5 text-forest-600" />
                  ) : (
                    <Sun className="h-5 w-5 text-forest-600" />
                  )}
                  <h2 className="text-xl font-semibold">Appearance</h2>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:border-forest-300 transition">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Enable dark theme for better nighttime viewing</p>
                  </div>
                  <button
                    onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                    className={`relative w-14 h-8 rounded-full transition-all ${
                      settings.darkMode ? 'bg-forest-600' : 'bg-muted-foreground'
                    } flex items-center ${settings.darkMode ? 'justify-end' : 'justify-start'} p-1`}
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow-md"></div>
                  </button>
                </div>
              </Card>
            )}

            {/* Language Settings */}
            {activeSection === 'language' && (
              <Card className="p-6 border-border">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="h-5 w-5 text-forest-600" />
                  <h2 className="text-xl font-semibold">Language Preference</h2>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-3">Select Your Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-background"
                  >
                    <optgroup label="International">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="pt">Portuguese</option>
                    </optgroup>
                    <optgroup label="Indian Languages">
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="mr">मराठी (Marathi)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="te">తెలుగు (Telugu)</option>
                      <option value="od">ଓଡ଼ିଆ (Odia)</option>
                      <option value="bh">भोजपुरी (Bhojpuri)</option>
                    </optgroup>
                  </select>
                  <p className="text-xs text-muted-foreground mt-2">Current language: <strong>{settings.language.toUpperCase()}</strong></p>
                </div>
              </Card>
            )}

            {/* Privacy & Security */}
            {activeSection === 'security' && (
              <Card className="p-6 border-border">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="h-5 w-5 text-forest-600" />
                  <h2 className="text-xl font-semibold">Privacy & Security</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2">Change Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={settings.password}
                        onChange={(e) => handleSettingChange('password', e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 pr-10"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                        title="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Security Tip:</strong> Use a strong password with uppercase, lowercase, numbers, and symbols.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border hover:border-forest-300 transition cursor-pointer">
                    <input 
                      type="checkbox" 
                      id="2fa" 
                      checked={settings.twoFactorEnabled}
                      onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
                      className="w-4 h-4 accent-forest-600 cursor-pointer"
                    />
                    <label htmlFor="2fa" className="cursor-pointer flex-1">
                      <p className="font-medium">Enable Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </label>
                    {settings.twoFactorEnabled && <Check className="h-4 w-4 text-green-600" />}
                  </div>
                </div>
              </Card>
            )}

            {/* Save Button */}
            <div className="flex gap-4 sticky bottom-0 bg-background p-4 border-t border-border rounded-lg">
              <Button
                onClick={handleSaveSettings}
                disabled={!hasChanges}
                className={`flex items-center gap-2 text-white transition-all ${
                  hasChanges 
                    ? 'bg-forest-600 hover:bg-forest-700' 
                    : 'bg-muted-foreground cursor-not-allowed'
                }`}
              >
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
              <Button
                variant="outline"
                onClick={onBack}
              >
                Cancel
              </Button>
              {hasChanges && <span className="text-xs text-orange-600 ml-auto self-center">*Unsaved changes</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
