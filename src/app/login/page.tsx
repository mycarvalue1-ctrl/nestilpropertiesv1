import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Shield, User } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Welcome to Nestil</h1>
        <p className="text-xl text-muted-foreground mt-2">Please select your login type.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto w-full">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="items-center text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-2">
                <User className="h-10 w-10 text-primary" />
            </div>
            <CardTitle>User Login</CardTitle>
            <CardDescription>For property owners, agents, and buyers.</CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6 pt-0">
            <Button asChild size="lg">
              <Link href="/user-login">Login as User</Link>
            </Button>
          </CardContent>
        </Card>
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
