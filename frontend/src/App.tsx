import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Profile from './pages/profile/Profile';
import Attendance from './pages/attendance/Attendance';
import TimeOff from './pages/timeoff/TimeOff';
import NewTimeOff from './pages/timeoff/NewTimeOff';
import Payroll from './pages/payroll/Payroll';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Default route redirects to dashboard as requested */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Layout><Attendance /></Layout></ProtectedRoute>} />
          <Route path="/timeoff" element={<ProtectedRoute><Layout><TimeOff /></Layout></ProtectedRoute>} />
          <Route path="/timeoff/new" element={<ProtectedRoute><Layout><NewTimeOff /></Layout></ProtectedRoute>} />
          <Route path="/payroll" element={<ProtectedRoute><Layout><Payroll /></Layout></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
