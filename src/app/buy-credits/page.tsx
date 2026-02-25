'use client';

import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Coins, Gem, Crown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { add, format } from 'date-fns';

const purchasePlans = [
  { id: '15_credits', name: '15 Contacts', price: 99, type: 'credits', amount: 15, icon: Coins, popular: false },
  { id: '20_credits', name: '20 Contacts', price: 145, type: 'credits', amount: 20, icon: Gem, popular: true },
  { id: 'unlimited_1m', name: '1 Month Unlimited', price: 199, type: 'subscription', duration: 1, unit: 'month', icon: Crown, popular: false },
];


export default function BuyCreditsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [currentUserCredits, setCurrentUserCredits] = useState(0);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/user-login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && firestore) {
        setIsFetchingData(true);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setCurrentUserCredits(data.credits || 0);
           if (data.subscriptionEndDate) {
            setSubscriptionEndDate(new Date(data.subscriptionEndDate));
          }
        }
        setIsFetchingData(false);
      }
    };
    fetchUserData();
  }, [user, firestore]);

  const handlePurchase = async (plan: (typeof purchasePlans)[0]) => {
    if (!user || !firestore) return;
    
    setIsPurchasing(plan.id);
    const userDocRef = doc(firestore, 'users', user.uid);

    try {
      // In a real app, you would integrate a payment gateway here.
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      if (plan.type === 'credits') {
        await updateDoc(userDocRef, {
          credits: increment(plan.amount)
        });
        setCurrentUserCredits(prev => prev + (plan.amount ?? 0));
        toast({
          title: "Purchase Successful!",
          description: `${plan.amount} credits have been added to your account.`,
        });
      } else if (plan.type === 'subscription') {
        const now = new Date();
        const currentSubEnd = subscriptionEndDate && subscriptionEndDate > now ? subscriptionEndDate : now;
        const newEndDate = add(currentSubEnd, { months: plan.duration });
        
        await updateDoc(userDocRef, {
          subscriptionEndDate: newEndDate.toISOString()
        });

        setSubscriptionEndDate(newEndDate);
        toast({
          title: "Subscription Activated!",
          description: `Your unlimited access is now active until ${newEndDate.toLocaleDateString()}.`,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
        setIsPurchasing(null);
    }
  };
  
  if (isUserLoading || isFetchingData) {
      return (
          <div className="container py-12 max-w-4xl mx-auto">
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-5 w-80 mx-auto mb-10" />
              <div className="flex items-center justify-center p-4 mb-8">
                  <Skeleton className="h-12 w-52" />
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
                  <Skeleton className="h-64" />
              </div>
          </div>
      )
  }

  const hasActiveSubscription = subscriptionEndDate && subscriptionEndDate > new Date();

  return (
    <div className="container py-12 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold font-headline">Buy a Plan</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Purchase credits or a subscription to view owner contact details.
        </p>
      </div>

       <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Card className="inline-flex flex-col items-center p-4 bg-muted border-dashed">
                <CardTitle className="text-lg text-muted-foreground">Your Credit Balance</CardTitle>
                <p className="text-4xl font-bold text-primary flex items-center gap-2">
                    <Coins className="h-8 w-8" />
                    {currentUserCredits}
                </p>
            </Card>
             {hasActiveSubscription && (
                <Card className="inline-flex flex-col items-center p-4 bg-muted border-dashed">
                    <CardTitle className="text-lg text-muted-foreground">Subscription Status</CardTitle>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-primary">Active</p>
                        <p className="text-xs text-muted-foreground">Expires on {format(subscriptionEndDate, 'PPP')}</p>
                    </div>
                </Card>
             )}
        </div>


      <div className="grid md:grid-cols-3 gap-8">
        {purchasePlans.map((plan) => (
          <Card key={plan.id} className={`flex flex-col text-center ${plan.popular ? 'border-primary border-2 shadow-lg' : ''}`}>
            {plan.popular && <div className="bg-primary text-primary-foreground text-sm font-bold py-1 rounded-t-lg -mt-px">Most Popular</div>}
            <CardHeader>
                <plan.icon className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-3xl">{plan.name}</CardTitle>
              <CardDescription className="text-lg font-semibold">
                ₹{plan.price}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* You can add more details here */}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg" 
                variant={plan.popular ? 'default' : 'outline'}
                onClick={() => handlePurchase(plan)}
                disabled={isPurchasing !== null}
              >
                {isPurchasing === plan.id ? (
                    <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    'Buy Now'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
