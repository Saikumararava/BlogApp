import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../utils/auth';

/**
 * Usage:
 * <Route path="/write" element={
 *   <PrivateRoute requiredRoles={['AUTHOR','APP_ADMIN']}>
 *     <PostEditor />
 *   </PrivateRoute>
 * } />
 *
 * If requiredRoles is omitted, any authenticated user can access.
 */
export default function PrivateRoute({ children, requiredRoles = [] }) {
  const token = getToken();
  const user = getUser();

  if (!token) {
    // not signed in
    return <Navigate to="/signin" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.some(role => user?.roles?.includes(role));
    if (!hasRole) {
      // authenticated but not authorized
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
