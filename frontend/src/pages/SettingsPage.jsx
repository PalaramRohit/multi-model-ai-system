import React, { useState } from 'react';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNavigate } from 'react-router-dom';
import { User, Save } from 'lucide-react';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // In a real app, you'd call an API to save settings
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('nav.settings')}</h1>
          <p className="text-white/60">Manage your account and preferences</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-neon-cyan" />
            <h2 className="text-xl font-semibold">Profile Settings</h2>
          </div>
          
          <div className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
            
            <Input
              label="Email"
              type="email"
              value={profileData.email}
              disabled
              className="opacity-60"
            />

            <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
              {saving ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4" />
                  {t('common.save')}
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Language Settings */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Language Preference</h2>
          <div className="flex gap-2">
            {['en', 'hi', 'te'].map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  language === lang
                    ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan'
                    : 'bg-glass border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </Card>

        {/* Danger Zone */}
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            {t('nav.logout')}
          </Button>
        </Card>
      </div>
    </Layout>
  );
};

export default SettingsPage;
