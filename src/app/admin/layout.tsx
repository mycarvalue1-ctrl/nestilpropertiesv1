'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { LoaderCircle } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: currentUser, isUserLoading } = useUser();
  const router = useRouter();
  const adminEmail = 'helpnestil@gmail.com';
  
  const isAdmin = useMemo(() => currentUser?.email === adminEmail, [currentUser]);

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isUserLoading, isAdmin, router]);

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
