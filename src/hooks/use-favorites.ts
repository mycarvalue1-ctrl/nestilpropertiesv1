'use client';

import React, { useMemo, useCallback } from 'react';
import { useToast } from './use-toast';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, setDoc, deleteDoc, collection } from 'firebase/firestore';
import { ToastAction } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

export function useFavorites() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const favoritesColRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/favorites`);
  }, [firestore, user]);

  const { data: favoriteDocs, isLoading: isLoadingFavorites } = useCollection(favoritesColRef);

  const favoriteIds = useMemo(() => {
    if (!favoriteDocs) return new Set<string>();
    return new Set(favoriteDocs.map(doc => doc.id));
  }, [favoriteDocs]);

  const toggleFavorite = useCallback(async (propertyId: string, isCurrentlyFavorited: boolean) => {
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You need to be logged in to save favorites.',
        action: (
          <ToastAction asChild altText="Login">
            <Button variant="outline" size="sm" onClick={() => router.push(`/login?redirect=/properties/${propertyId}`)}>
              Login
            </Button>
          </ToastAction>
        ),
      });
      return;
    }
    if (!firestore) return;

    const favoriteDocRef = doc(firestore, `users/${user.uid}/favorites`, propertyId);

    try {
      if (isCurrentlyFavorited) {
        await deleteDoc(favoriteDocRef);
        toast({ title: 'Removed from Favorites' });
      } else {
        await setDoc(favoriteDocRef, { propertyId, addedAt: new Date() });
        toast({ title: 'Added to Favorites' });
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update your favorites.',
      });
    }
  }, [user, firestore, toast, router]);

  return { favoriteIds, toggleFavorite, isLoadingFavorites: isUserLoading || isLoadingFavorites };
}
