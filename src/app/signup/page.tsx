'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <CardTitle className="text-2xl mt-4">Sign Up Disabled</CardTitle>
          <CardDescription>
            User sign up is currently deactivated.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/" className="text-sm underline">Go back to Homepage</Link>
        </CardContent>
      </Card>
    </div>
  );
}
