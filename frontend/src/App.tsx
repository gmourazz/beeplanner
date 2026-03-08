import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import AppHeader from './components/AppHeader';
import LandingPage from './pages/LandingPage';
import Auth2 from './pages/Auth2';
import DashboardPage from './pages/DashboardPage';
import WeeklyPage from './pages/WeeklyPage';
import MonthlyPage from './pages/MonthlyPage';
import HabitsPage from './pages/HabitsPage';
import { DatesPage } from './pages/DatesPage';
import SettingsPage from './pages/SettingsPage';
import PageEditor from './components/PageEditor';
import { Page } from './types';
import './styles/globals.css';

function ProtectedApp() {
  const { user, loading } = useAuth();
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ fontSize: '56px', animation: 'beePulse 2s infinite' }}>🐝</div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar onPageSelect={setSelectedPage} selectedPageId={selectedPage?.id} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AppHeader />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/weekly" element={<WeeklyPage />} />
            <Route path="/monthly" element={<MonthlyPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/dates" element={<DatesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/page/:id" element={selectedPage ? <PageEditor page={selectedPage} onUpdate={setSelectedPage} /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Auth2 />} />
            <Route path="/auth" element={<Auth2 />} />
            <Route path="/app/*" element={<ProtectedApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
