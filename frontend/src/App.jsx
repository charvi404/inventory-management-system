import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import Views (we will create these next)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Requests from './pages/Requests';
import Allocations from './pages/Allocations';
import Maintenance from './pages/Maintenance';
import Notifications from './pages/Notifications';
import Layout from './components/Layout';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="app-container" style={{justifyContent: 'center', alignItems: 'center'}}>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes inside Layout */}
        <Route path="/" element={<RoleRoute><Navigate to="/dashboard" replace /></RoleRoute>} />
        
        <Route path="/dashboard" element={
          <RoleRoute allowedRoles={['Admin', 'Manager', 'Staff']}>
            <Dashboard />
          </RoleRoute>
        } />
        
        <Route path="/inventory" element={
          <RoleRoute allowedRoles={['Admin', 'Manager', 'Staff']}>
            <Inventory />
          </RoleRoute>
        } />
        
        <Route path="/requests" element={
          <RoleRoute allowedRoles={['Admin', 'Manager', 'Staff']}>
            <Requests />
          </RoleRoute>
        } />

        <Route path="/allocations" element={
          <RoleRoute allowedRoles={['Admin', 'Manager']}>
            <Allocations />
          </RoleRoute>
        } />

        <Route path="/maintenance" element={
          <RoleRoute allowedRoles={['Admin', 'Manager']}>
            <Maintenance />
          </RoleRoute>
        } />

        <Route path="/notifications" element={
          <RoleRoute allowedRoles={['Admin', 'Manager', 'Staff']}>
            <Notifications />
          </RoleRoute>
        } />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
