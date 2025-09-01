import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * Usage:
 * <ProtectedRoute roles={['admin']}><SettingsPage /></ProtectedRoute>
 * <ProtectedRoute permissions={{ module: 'products', actions: ['edit'] }}><EditProduct /></ProtectedRoute>
 */
export default function ProtectedRoute({ roles, permissions, children }) {
  const { role, permissions: userPerms } = useAuth();
  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  if (permissions) {
    const { module, actions } = permissions;
    const allowed = userPerms && userPerms[module] && actions.every(a => userPerms[module].includes(a));
    if (!allowed) return <Navigate to="/" replace />;
  }
  return children;
}
