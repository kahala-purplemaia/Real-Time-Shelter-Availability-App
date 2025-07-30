import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import PublicDashboard from './components/PublicDashboard';
import AuthForm from './components/AuthForm';
import StaffDashboard from './components/StaffDashboard';
import ShelterDetail from './components/ShelterDetail';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading Emergency Shelter Network...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicDashboard />} />
        <Route path="/shelter/:id" element={<ShelterDetail />} />
        <Route 
          path="/staff/login" 
          element={
            isAuthenticated 
              ? <Navigate to="/staff/dashboard" replace /> 
              : <AuthForm onAuth={handleAuth} />
          } 
        />
        <Route 
          path="/staff/dashboard" 
          element={
            isAuthenticated 
              ? <StaffDashboard onLogout={handleLogout} />
              : <Navigate to="/staff/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;