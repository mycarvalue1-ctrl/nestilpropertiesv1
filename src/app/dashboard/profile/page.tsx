'use client';
import { useUser } from '@/firebase';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateProfile, updateEmail } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

const profileSchema = z.object({
  name: z.string().min(2, "Name is too short."),
  email: z.string().email(),
  phone: z.string().min(10, "Invalid phone number."),
});

export default function ProfilePage() {
  const { user } = useUser();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '', // This needs to be fetched from firestore
    },
  });

  const handleProfileUpdate = async (values: z.infer<typeof profileSchema>) => {
    if (!user || !firestore) return;
    setIsLoading(true);

    try {
      // Update Auth profile
      if (values.name !== user.displayName) {
        await updateProfile(user, { displayName: values.name });
      }
      if (values.email !== user.email) {
        // Email update requires re-authentication, so we'll just show a message for now.
        toast({ title: 'Email Change', description: 'Changing email requires re-authentication, which is not implemented.' });
      }

      // Update Firestore profile
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        name: values.name,
        phone: values.phone,
      });

      toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input type="tel" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/>}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
