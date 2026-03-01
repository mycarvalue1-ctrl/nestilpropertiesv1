'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: currentUser, isUserLoading } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const adminEmail = 'helpnestil@gmail.com';
  
  useEffect(() => {
    if (isUserLoading) {
      return; // Wait for user status to be determined
    }

    const isAdmin = currentUser?.email === adminEmail;
    
    if (isAdmin) {
      setIsAuthorized(true);
    } else {
      router.replace('/admin/login');
    }
  }, [isUserLoading, currentUser, router, adminEmail]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
