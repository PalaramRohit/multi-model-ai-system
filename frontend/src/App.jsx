import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

// Pages
import AdminPage from './pages/AdminPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MedicalPage from './pages/MedicalPage.jsx';
import AgriculturePage from './pages/AgriculturePage.jsx';
import FinancePage from './pages/FinancePage.jsx';
import StudentPage from './pages/StudentPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import UserGuidePage from './pages/UserGuidePage.jsx';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <LanguageProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/guide"
              element={
                <ProtectedRoute>
                  <UserGuidePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medical"
              element={
                <ProtectedRoute>
                  <MedicalPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agriculture"
              element={
                <ProtectedRoute>
                  <AgriculturePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance"
              element={
                <ProtectedRoute>
                  <FinancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute>
                  <StudentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LanguageProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
