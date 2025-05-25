
import React, { useContext } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import DashboardPage from '@/pages/DashboardPage';
import ClientSitesPage from '@/pages/ClientSitesPage';
import ServicesPage from '@/pages/ServicesPage';
import EmployeesPage from '@/pages/EmployeesPage';
import VehiclesPage from '@/pages/VehiclesPage';
import InvoicingPage from '@/pages/InvoicingPage';
import CalendarPage from '@/pages/CalendarPage';
import ReportsPage from '@/pages/ReportsPage';
import UserProfilePage from '@/pages/UserProfilePage';
import AppSettingsPage from '@/pages/AppSettingsPage';
import LoginPage from '@/pages/Auth/LoginPage';
import { AuthProvider, AuthContext } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AnimatePresence } from 'framer-motion';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    // You can return a loading spinner here
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading && location.pathname !== "/login") {
     return <div className="flex justify-center items-center h-screen">Chargement de l'application...</div>;
  }


  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="sites-clients" element={<ClientSitesPage />} />
          <Route path="prestations" element={<ServicesPage />} />
          <Route path="employes" element={<EmployeesPage />} />
          <Route path="vehicules" element={<VehiclesPage />} />
          <Route path="facturation" element={<InvoicingPage />} />
          <Route path="calendrier" element={<CalendarPage />} />
          <Route path="rapports" element={<ReportsPage />} />
          <Route path="profil" element={<UserProfilePage />} />
          <Route path="parametres" element={<AppSettingsPage />} />
        </Route>
        {!isAuthenticated && !loading && location.pathname !== "/login" && (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
