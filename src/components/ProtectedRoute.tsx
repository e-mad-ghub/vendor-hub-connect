import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/LoadingState';
import NotAuthorized from '@/pages/NotAuthorized';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user, sessionExpired, clearSessionExpired } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && sessionExpired) {
      clearSessionExpired();
    }
  }, [isLoading, isAuthenticated, sessionExpired, clearSessionExpired]);

  if (isLoading) {
    return (
      <div className="container py-12">
        <LoadingState title="جاري التحقق من الجلسة" message="برجاء الانتظار..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, reason: sessionExpired ? 'expired' : 'auth' }}
      />
    );
  }

  if (requireRole && user?.role !== requireRole) {
    return <NotAuthorized />;
  }

  return <>{children}</>;
};
