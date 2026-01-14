"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const userRoles = user?.role ? [user.role] : [];
        
        // Check if user has any of the required roles
        const hasRequiredRole = roles.some(role => {
          if (role === 'admin') {
            return userRoles.includes('admin') || userRoles.includes('super_admin');
          }
          return userRoles.includes(role);
        });

        if (!hasRequiredRole) {
          router.push('/dashboard'); // Redirect to dashboard if not authorized
          return;
        }
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userRoles = user?.role ? [user.role] : [];
    
    const hasRequiredRole = roles.some(role => {
      if (role === 'admin') {
        return userRoles.includes('admin') || userRoles.includes('super_admin');
      }
      return userRoles.includes(role);
    });

    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}
