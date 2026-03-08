
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function AgentsPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-background">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <Users className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4">Agents</CardTitle>
          <CardDescription>
            This page is under construction.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Information about our verified agents will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
