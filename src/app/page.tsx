
'use client';

import { useMemo, useState, useEffect } from 'react';
import { PropertyCard, PropertyCardSkeleton } from '@/components/property-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Home as HomeIcon, Search, Trees, User, LogIn } from 'lucide-react';
import Link from 'next/link';
import { locationData } from '@/lib/locations';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { useFavorites } from '@/hooks/use-favorites';


function RecentListings() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { favoriteIds, toggleFavorite, isLoadingFavorites } = useFavorites();

  const recentPropertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    
    return query(
      collection(firestore, 'properties'),
      where('isApproved', '==', true),
      orderBy('dateAdded', 'desc'),
      limit(6)
    );
  }, [firestore]);

  const { data: recentProperties, isLoading: isLoadingProperties } = useCollection<Property>(recentPropertiesQuery);
  const isLoading = isLoadingFavorites || isLoadingProperties || isUserLoading;

  return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold">
                Latest Listings
              </h2>
              <p className="text-muted-foreground mt-2">
                Check out the latest properties fresh on the market.
              </p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentProperties?.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    isFavorited={user ? favoriteIds.has(prop.id) : false}
                    onToggleFavorite={user ? () => toggleFavorite(prop.id, favoriteIds.has(prop.id)) : undefined}
                  />
                ))}
              </div>
              <div className="text-center mt-12">
                <Button size="lg" asChild>
                  <Link href="/properties">View All Properties</Link>
                </Button>
              </div>
            </>
          )}

        </div>
      </section>
  )
}


export default function Home() {
  const [shuffledLocalAreas, setShuffledLocalAreas] = useState<any[]>([]);

  useEffect(() => {
    const allLocalAreas =
      locationData[0]?.districts
        .flatMap((d) => d.localities.map((l) => ({ ...l, district: d.name }))) || [];
    
    // Fisher-Yates shuffle algorithm to shuffle in place
    for (let i = allLocalAreas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLocalAreas[i], allLocalAreas[j]] = [allLocalAreas[j], allLocalAreas[i]];
    }

    setShuffledLocalAreas(allLocalAreas.slice(0, 10));
  }, []); // Empty dependency array ensures this runs once on the client after mount.

  return (
    <>
      <section className="py-20 md:py-24 bg-secondary/50 text-center">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">
            Find Your Perfect Place
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-foreground/80">
            Discover homes, plots, and commercial properties tailored for you.
          </p>

          <div className="max-w-3xl mx-auto mt-8">
            <Tabs defaultValue="rent" className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mx-auto">
                <TabsTrigger value="rent">Rent</TabsTrigger>
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="plots">Plots</TabsTrigger>
              </TabsList>
              <div className="mt-4 p-4 md:p-6 rounded-lg bg-background/80 backdrop-blur-sm border shadow-lg">
                <form className="grid sm:grid-cols-4 items-center gap-4">
                  <div className="sm:col-span-3">
                    <Input
                      placeholder="Search for properties..."
                      className="h-12 text-base"
                    />
                  </div>
                  <Button size="lg" className="h-12 w-full text-base" variant="default">
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </Button>
                </form>
              </div>
            </Tabs>
          </div>

        </div>
      </section>

      <RecentListings />

      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Explore by Category
            </h2>
            <p className="text-muted-foreground mt-2">
              Find properties that match your needs.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <Link href="/properties?type=House&status=For%20Rent" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-shadow border-none">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center bg-card h-full">
                  <div className="bg-secondary p-4 rounded-full mb-3">
                    <HomeIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold group-hover:text-accent">
                    Rent House
                  </h3>
                </CardContent>
              </Card>
            </Link>
            <Link href="/properties?type=House&status=For%20Sale" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-shadow border-none">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center bg-card h-full">
                  <div className="bg-secondary p-4 rounded-full mb-3">
                    <HomeIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold group-hover:text-accent">
                    Buy House
                  </h3>
                </CardContent>
              </Card>
            </Link>
            <Link href="/properties?type=Plot" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-shadow border-none">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center bg-card h-full">
                  <div className="bg-secondary p-4 rounded-full mb-3">
                    <Trees className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold group-hover:text-accent">
                    Plots
                  </h3>
                </CardContent>
              </Card>
            </Link>
            <Link href="/properties?type=Commercial" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-shadow border-none">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center bg-card h-full">
                  <div className="bg-secondary p-4 rounded-full mb-3">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold group-hover:text-accent">
                    Commercial
                  </h3>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline">
              Explore Local Areas
            </h2>
            <p className="text-muted-foreground mt-2">
              Find properties in your favorite neighborhoods.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {shuffledLocalAreas.map((locality) => (
              <Link
                key={locality.name}
                href={`/properties?location=${locality.name}`}
              >
                <Card className="text-center p-4 hover:bg-card hover:shadow-md transition-all h-full flex items-center justify-center hover:border-accent">
                  <h3 className="font-semibold">{locality.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold font-headline">
            Have a property to sell or rent?
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Join thousands of owners and agents to list your property for free
            on Nestil.
          </p>
          <Button size="lg" variant="accent" asChild className="mt-8 text-lg">
            <Link href="/post-property">Post Property Free</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
