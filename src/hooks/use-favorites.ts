'use client';

import { useMemo, useCallback } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from './use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useRouter } from 'next/navigation';

export function useFavorites() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const favoritesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'favorite_properties');
  }, [user, firestore]);

  const { data: favoriteDocs, isLoading: isLoadingFavorites } = useCollection<{ propertyId: string }>(favoritesQuery);

  const favoriteIds = useMemo(() => {
    return new Set(favoriteDocs?.map(fav => fav.propertyId) || []);
  }, [favoriteDocs]);

  const toggleFavorite = useCallback((propertyId: string, isCurrentlyFavorited: boolean) => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Please log in",
        description: "You need to be logged in to save favorites.",
      });
      router.push('/user-login');
      return;
    }

    const favoriteRef = doc(firestore, 'users', user.uid, 'favorite_properties', propertyId);

    if (isCurrentlyFavorited) {
      deleteDoc(favoriteRef)
        .then(() => {
          toast({ title: "Removed from favorites" });
        })
        .catch(error => {
          console.error("Error removing favorite: ", error);
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: favoriteRef.path,
            operation: 'delete',
          }));
        });
    } else {
      setDoc(favoriteRef, {
        userId: user.uid,
        propertyId,
        favoritedAt: serverTimestamp(),
      })
      .then(() => {
        toast({ title: "Added to favorites" });
      })
      .catch(error => {
        console.error("Error adding favorite: ", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: favoriteRef.path,
          operation: 'create',
          requestResourceData: { userId: user.uid, propertyId },
        }));
      });
    }
  }, [user, firestore, toast, router]);

  return { favoriteIds, toggleFavorite, isLoadingFavorites };
}
