'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function AdminLoginPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const adminEmail = 'helpnestil@gmail.com';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "helpnestil@gmail.com",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      
      if (userCredential.user.email === adminEmail) {
        toast({
          title: "Admin Login Successful",
          description: "Welcome to the admin dashboard.",
        });
        router.push('/admin');
      } else {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You are not an authorized administrator.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <Shield className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl mt-4">Admin Login</CardTitle>
          <CardDescription>
            Use the administrator credentials to manage the application. If you haven't, sign up with the admin email first.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="helpnestil@gmail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col">
              <Button type="submit" className="w-full">Sign in as Admin</Button>
               <div className="mt-4 text-center text-sm">
                Not an admin?{" "}
                <Link href="/user-login" className="underline">
                  Login as User
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
