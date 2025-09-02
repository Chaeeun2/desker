import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import OverviewManager from './pages/OverviewManager';
import LeadershipManager from './pages/LeadershipManager';
import ContactManager from './pages/ContactManager';
import NewsManager from './pages/NewsManager';
import PortfolioManager from './pages/PortfolioManager';
import DisclosureManager from './pages/DisclosureManager';
import InvestmentStrategyManager from './pages/InvestmentStrategyManager';
import InvestmentProcessManager from './pages/InvestmentProcessManager';
import OrganizationManager from './pages/OrganizationManager';
import RiskComplianceManager from './pages/RiskComplianceManager';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext'
import './styles/admin.css'

function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="" element={
          <ProtectedRoute>
            <Navigate to="overview" replace />
          </ProtectedRoute>
        } />
        <Route path="overview" element={
          <ProtectedRoute>
            <OverviewManager />
          </ProtectedRoute>
        } />
        <Route path="leadership" element={
          <ProtectedRoute>
            <LeadershipManager />
          </ProtectedRoute>
        } />
        <Route path="contact" element={
          <ProtectedRoute>
            <ContactManager />
          </ProtectedRoute>
        } />
        <Route path="news" element={
          <ProtectedRoute>
            <NewsManager />
          </ProtectedRoute>
        } />
        <Route path="portfolio" element={
          <ProtectedRoute>
            <PortfolioManager />
          </ProtectedRoute>
        } />
        <Route path="disclosure" element={
          <ProtectedRoute>
            <DisclosureManager />
          </ProtectedRoute>
        } />
        <Route path="investment-strategy" element={
          <ProtectedRoute>
            <InvestmentStrategyManager />
          </ProtectedRoute>
        } />
        <Route path="investment-process" element={
          <ProtectedRoute>
            <InvestmentProcessManager />
          </ProtectedRoute>
        } />
        <Route path="organization" element={
          <ProtectedRoute>
            <OrganizationManager />
          </ProtectedRoute>
        } />
        <Route path="risk-compliance" element={
          <ProtectedRoute>
            <RiskComplianceManager />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default AdminApp;
