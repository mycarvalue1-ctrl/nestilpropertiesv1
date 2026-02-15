import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { properties, users } from "@/lib/data";
import { List, PlusCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // Mocking a logged in user
  const userId = 'user-1';
  const user = users.find(u => u.id === userId);
  const userProperties = properties.filter(p => p.owner.id === userId);
  const activeListings = userProperties.filter(p => p.listingStatus === 'approved').length;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name || 'User'}!</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties Posted</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProperties.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings}</div>
          </CardContent>
        </Card>
        <Card className="flex flex-col items-center justify-center bg-secondary">
           <CardContent className="pt-6">
            <Button asChild size="lg" variant="accent">
                <Link href="/post-property">
                    <PlusCircle className="mr-2 h-5 w-5"/>
                    Post New Property
                </Link>
            </Button>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
