import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('jwt');
  const userRole = localStorage.getItem('userRole');

  // Check if user is authenticated and has admin/manager role
  if (!token || (userRole !== 'admin' && userRole !== 'manager')) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}