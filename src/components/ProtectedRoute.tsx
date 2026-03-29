import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
