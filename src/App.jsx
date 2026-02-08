import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import ClientsPage from './pages/ClientsPage';
import ProductsPage from './pages/ProductsPage';
import ScheduleMessagePage from './pages/ScheduleMessagePage';

// Component to protect routes
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem('petcontrol_auth');
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
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
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
