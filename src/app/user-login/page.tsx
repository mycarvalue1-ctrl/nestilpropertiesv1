'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import Link from 'next/link';

export default function LoginDisabledPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-background">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <Info className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4">Login Disabled</CardTitle>
          <CardDescription>
            User login is temporarily disabled. Please check back later.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Link href="/" className="text-sm underline">Go back to Homepage</Link>
        </CardContent>
      </Card>
    </div>
  );
}
