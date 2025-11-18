
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './components/admin/DashboardPage';
import LoginPage from './components/admin/LoginPage';
import NoticiasAdminPage from './components/admin/NoticiasAdminPage';
import TroposAdminPage from './components/admin/TroposAdminPage';
import AxiosHomePage from './components/public/AxiosHomePage';
import NoticiaDetailPage from './components/public/NoticiaDetailPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import PublicLayout from './components/public/PublicLayout';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('authToken', 'dummy_token');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-600"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<AxiosHomePage />} />
          <Route 
            path="/:tropoSlug/:noticiaSlug" 
            element={
              <ErrorBoundary>
                <NoticiaDetailPage />
              </ErrorBoundary>
            } 
          />
        </Route>

        <Route path="/login" element={isAuthenticated ? <Navigate to="/admin" /> : <LoginPage onLogin={handleLogin} />} />
        
        <Route path="/admin" element={isAuthenticated ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route index element={<DashboardPage />} />
          <Route path="noticias" element={<NoticiasAdminPage />} />
          <Route path="tropos" element={<TroposAdminPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
