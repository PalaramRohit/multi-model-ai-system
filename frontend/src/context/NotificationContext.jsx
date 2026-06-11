import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, Bell } from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('multimodel_notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load notifications from localStorage:', e);
    }
  }, []);

  // Save history to localStorage on change
  const saveNotifications = (newNotifications) => {
    setNotifications(newNotifications);
    try {
      localStorage.setItem('multimodel_notifications', JSON.stringify(newNotifications));
    } catch (e) {
      console.error('Failed to save notifications to localStorage:', e);
    }
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newNotification = {
      id,
      message,
      type,
      timestamp: new Date().toISOString(),
    };

    // Add to persistent logs (max 30)
    saveNotifications([newNotification, ...notifications].slice(0, 30));

    // Add to active visual toasts (dismiss after 4.5 seconds)
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  const removeNotification = (id) => {
    saveNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        addNotification,
        clearAllNotifications,
        removeNotification,
      }}
    >
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let bgColor = 'bg-navy/90 border-neon-blue';
            let Icon = Info;
            let iconColor = 'text-neon-cyan';

            if (toast.type === 'success') {
              bgColor = 'bg-emerald-950/90 border-emerald-500/50 shadow-emerald-500/10';
              Icon = CheckCircle;
              iconColor = 'text-emerald-400';
            } else if (toast.type === 'warning' || toast.type === 'error') {
              bgColor = 'bg-red-950/90 border-red-500/50 shadow-red-500/10';
              Icon = AlertTriangle;
              iconColor = 'text-red-400';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-lg ${bgColor}`}
              >
                <div className="mt-0.5">
                  <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="flex-1 text-sm font-semibold text-white/90 leading-snug">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
