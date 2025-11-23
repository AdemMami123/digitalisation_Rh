'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'RH' | 'USER';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth check to complete
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (requiredRole && user.role !== requiredRole) {
        router.push('/dashboard');
      } else {
        setIsChecking(false);
      }
    }
  }, [user, loading, router, requiredRole]);

  // Show loading while checking auth or redirecting
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

  // Don't render if wrong role (will redirect)
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
