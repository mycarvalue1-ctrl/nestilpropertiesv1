
'use client';

import { Heart, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/use-favorites';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Property } from '@/lib/types';
import { collection, query, where } from 'firebase/firestore';
import { PropertyCard, PropertyCardSkeleton } from '@/components/property-card';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function FavoritesList() {
  const { favoriteIds, isLoadingFavorites } = useFavorites();
  const firestore = useFirestore();

  const favoritesQuery = useMemoFirebase(() => {
    if (!firestore || !favoriteIds || favoriteIds.size === 0) return null;
    const favoriteIdsArray = Array.from(favoriteIds);
    // Firestore 'in' queries are limited to 30 elements.
    // For a real app with many favorites, pagination or multiple queries would be needed.
    return query(collection(firestore, 'properties'), where('id', 'in', favoriteIdsArray.slice(0, 30)));
  }, [firestore, favoriteIds]);

  const { data: favoriteProperties, isLoading: isLoadingProperties } = useCollection<Property>(favoritesQuery);

  const isLoading = isLoadingFavorites || isLoadingProperties;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <PropertyCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!favoriteProperties || favoriteProperties.length === 0) {
    return (
      <div className="text-center py-16 border-dashed border-2 rounded-lg">
          <h2 className="text-xl font-semibold">No Favorites Yet</h2>
          <p className="text-muted-foreground mt-2">You haven't saved any properties to your favorites.</p>
           <Button asChild className="mt-4">
              <Link href="/properties">Explore Properties</Link>
          </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favoriteProperties.map((prop, index) => <PropertyCard key={prop.id} property={prop} priority={index < 3} />)}
    </div>
  )
}

export default function FavoritesPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login?redirect=/favorites');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
       <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="text-destructive fill-destructive" />
          My Favorite Properties
        </h1>
      </div>
      <FavoritesList />
    </div>
  );
}
