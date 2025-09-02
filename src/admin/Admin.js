import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SurveyManager from './pages/SurveyManager';
import EmailTemplateManager from './pages/EmailTemplateManager';
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
            <Navigate to="survey" replace />
          </ProtectedRoute>
        } />
        <Route path="survey" element={
          <ProtectedRoute>
            <SurveyManager />
          </ProtectedRoute>
        } />
        <Route path="email-templates" element={
          <ProtectedRoute>
            <EmailTemplateManager />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default AdminApp;
