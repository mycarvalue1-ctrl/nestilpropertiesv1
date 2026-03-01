'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { PropertyCard, PropertyCardSkeleton } from '@/components/property-card';
import { useFavorites } from '@/hooks/use-favorites';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { favoriteIds, toggleFavorite, isLoadingFavorites } = useFavorites();

  const favoritePropertyIds = useMemo(() => Array.from(favoriteIds), [favoriteIds]);

  const favPropertiesQuery = useMemoFirebase(() => {
    if (!firestore || favoritePropertyIds.length === 0) return null;
    // Firestore 'in' query is limited to 30 elements at a time.
    return query(
        collection(firestore, 'properties'), 
        where(documentId(), 'in', favoritePropertyIds.slice(0, 30))
    );
  }, [firestore, favoritePropertyIds]);

  const { data: favoriteProperties, isLoading: isLoadingProperties } = useCollection<Property>(favPropertiesQuery);

  const isLoading = isLoadingFavorites || (favoritePropertyIds.length > 0 && isLoadingProperties !== false);

  if (!user) {
    return (
      <div className="container py-12">
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <h2 className="text-xl font-semibold">Please log in to see your favorites.</h2>
            <p className="text-muted-foreground mt-2">Login is currently disabled. You cannot view favorites at this time.</p>
        </div>
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
        <p className="text-muted-foreground">The properties you've saved for later.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(favoritePropertyIds.length || 3)].map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      ) : favoriteProperties && favoriteProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoriteProperties.map((prop) => (
            <PropertyCard 
              key={prop.id} 
              property={prop}
              isFavorited={true}
              onToggleFavorite={() => toggleFavorite(prop.id, true)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
          <h2 className="text-xl font-semibold">You have no favorite properties yet.</h2>
          <p className="text-muted-foreground mt-2">Start exploring and click the heart icon to save properties.</p>
          <Button asChild className="mt-4">
            <Link href="/properties">Explore Properties</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
