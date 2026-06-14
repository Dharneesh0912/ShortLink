import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import AnimatedLayout from './components/Layout/AnimatedLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AnalyticsListPage from './pages/AnalyticsListPage';

// Shell wraps protected pages with sidebar + navbar
const Shell = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={`app-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <div className="app-content">
          {children}
        </div>
      </div>
    </div>
  );
};

// Inner app — has access to Router context
const AppInner = () => {
  const location = useLocation();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />

      <AnimatedLayout>
        <Routes>
          {/* ── Auth pages (full screen) ── */}
          <Route path="/login"  element={<LoginPage  />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* ── Protected pages (inside Shell) ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Shell><DashboardPage /></Shell>
              </ProtectedRoute>
            }
          />

          {/* Analytics list — all links overview */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Shell><AnalyticsListPage /></Shell>
              </ProtectedRoute>
            }
          />

          {/* Analytics detail — per link */}
          <Route
            path="/analytics/:shortCode"
            element={
              <ProtectedRoute>
                <Shell><AnalyticsPage /></Shell>
              </ProtectedRoute>
            }
          />

          {/* Settings placeholder */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Shell>
                  <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>Settings</h2>
                    <p className="muted">Account management and preferences — coming soon.</p>
                  </div>
                </Shell>
              </ProtectedRoute>
            }
          />

          {/* Default redirects */}
          <Route path="/"  element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatedLayout>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </Router>
  );
}

export default App;