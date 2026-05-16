import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface AdminRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * AdminRoute - Guards admin pages by checking authentication AND role.
 * Redirects to /login if not authenticated.
 * Redirects to /unauthorized if authenticated but lacking admin role.
 */
export default function AdminRoute({ children, allowedRoles = ['admin', 'superadmin'] }: AdminRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but wrong role - redirect to unauthorized
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
