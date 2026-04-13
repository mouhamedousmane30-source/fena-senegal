import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
  fallbackPath?: string;
}

/**
 * Route protégée avec authentification et contrôle de rôle
 */
const ProtectedRoute = ({
  children,
  requiredRole,
  fallbackPath = '/auth?redirect=declarer',
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // En cours de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label="Chargement..." />
      </div>
    );
  }

  // Non authentifié
  if (!isAuthenticated) {
    return <Navigate to={`${fallbackPath}&from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Vérifier le rôle requis
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <ErrorMessage
            type="error"
            title="Accès refusé"
            message={`Cette page est réservée aux ${requiredRole === 'admin' ? 'administrateurs' : 'utilisateurs'}.`}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
