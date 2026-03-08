'use client'; 

import { useUser } from "@/firebase";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { List, Heart, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome, {user.displayName || user.email}!</h1>
      <p className="text-muted-foreground mb-8">Here's a summary of your account.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><List /> My Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">properties listed</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/dashboard/my-properties">Manage Properties</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart /> Favorites</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">properties saved</p>
             <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/favorites">View Favorites</Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare /> Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">new messages</p>
             <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/dashboard/visit-requests">Check Inquiries</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

       <div className="mt-8 text-center">
        <Button asChild size="lg" variant="accent">
          <Link href="/post-property">Post a New Property</Link>
        </Button>
       </div>
    </div>
  );
}
