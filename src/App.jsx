import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import ScheduleMessagePage from './pages/ScheduleMessagePage';
import SettingsPage from './pages/SettingsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';

// Component to protect routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* PWA Components */}
        <PWAInstallPrompt />
        <OfflineIndicator />
        
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="clientes" element={<ClientsPage />} />
            <Route path="produtos" element={<ProductsPage />} />
            <Route path="agendar-mensagem" element={<ScheduleMessagePage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
