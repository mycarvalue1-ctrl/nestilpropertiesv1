import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Admin Access</h1>
        <p className="text-xl text-muted-foreground mt-2">Please proceed to the admin login page.</p>
      </div>
      <div className="max-w-xs mx-auto w-full">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="items-center text-center">
             <div className="p-4 bg-destructive/10 rounded-full mb-2">
                <Shield className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>For site administrators only.</CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6 pt-0">
            <Button asChild variant="destructive" size="lg">
                <Link href="/admin/login">Login as Admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
