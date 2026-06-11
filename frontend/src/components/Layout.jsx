import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import { LanguageSwitcher } from './LanguageSwitcher.jsx';
import {
  LayoutDashboard,
  Activity,
  Sprout,
  Wallet,
  GraduationCap,
  History,
  Settings,
  LogOut,
  BookOpen,
  Menu,
  X,
  ShieldAlert,
  Sparkles,
  Bell,
  Trash2,
  Clock
} from 'lucide-react';

export const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { notifications, clearAllNotifications, removeNotification, addNotification } = useNotifications();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/medical', icon: Activity, label: t('landing.hubs.medical') },
    { path: '/agriculture', icon: Sprout, label: t('landing.hubs.agriculture') },
    { path: '/finance', icon: Wallet, label: t('landing.hubs.finance') },
    { path: '/student', icon: GraduationCap, label: t('landing.hubs.student') },
    { path: '/history', icon: History, label: t('nav.history') },
    { path: '/guide', icon: BookOpen, label: t('nav.guide') },
    { path: '/admin', icon: ShieldAlert, label: t('nav.admin') },
    { path: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  const handleLogout = async () => {
    try {
      addNotification('Logging out...', 'info');
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  const formatNotiTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-dark-blue flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy border-r border-white/10 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center">
                <span className="text-dark-blue font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                Multi-Model AI
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-glass border border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-cyan flex items-center justify-center">
                <span className="text-dark-blue font-bold">
                  {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.name || user?.username || 'User'}</p>
                <p className="text-xs text-white/60 truncate">{user?.email || ''}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                    ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan'
                    : 'text-white/60 hover:bg-glass hover:text-white'
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-navy/50 backdrop-blur-glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="ml-auto flex items-center gap-4 relative">
            {/* Real-time Notification Bell Drawer */}
            <div className="relative">
              <button
                onClick={() => setNotiOpen(!notiOpen)}
                className="relative p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/5 transition-all"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-cyan"></span>
                  </span>
                )}
              </button>

              {notiOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setNotiOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-80 bg-navy-light/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-neon-cyan" />
                        <h4 className="font-bold text-sm text-white">Live Event Log</h4>
                      </div>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-white/40 hover:text-red-400 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                      {notifications.length > 0 ? (
                        notifications.map((noti) => (
                          <div key={noti.id} className="p-3.5 flex items-start gap-2.5 group relative hover:bg-white/[0.02]">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-white/80 leading-normal font-medium">{noti.message}</p>
                              <span className="text-[10px] text-white/30 font-semibold flex items-center gap-1 mt-1">
                                <Clock className="w-2.5 h-2.5" />
                                {formatNotiTime(noti.timestamp)}
                              </span>
                            </div>
                            <button
                              onClick={() => removeNotification(noti.id)}
                              className="text-white/20 hover:text-white absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center text-white/40">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-xs">No recent notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <LanguageSwitcher />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
