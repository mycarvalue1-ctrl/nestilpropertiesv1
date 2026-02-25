'use client';

import { useMemo } from 'react';
import { PropertyCard, PropertyCardSkeleton } from '@/components/property-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Home as HomeIcon, Search, Trees } from 'lucide-react';
import Link from 'next/link';
import { locationData } from '@/lib/locations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';


export default function Home() {
  const firestore = useFirestore();

  // Fetch all approved properties
  const approvedPropertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'properties'),
      where('isApproved', '==', true)
    );
  }, [firestore]);

  const { data: approvedProperties, isLoading: propertiesLoading } =
    useCollection<Property>(approvedPropertiesQuery);

  // Perform sorting and slicing on the client-side
  const { recentProperties, isLoading } = useMemo(() => {
    if (propertiesLoading) {
      return { recentProperties: [], isLoading: true };
    }
    if (!approvedProperties) {
      return { recentProperties: [], isLoading: false };
    }

    // Sort by dateAdded in descending order
    const sorted = [...approvedProperties].sort((a, b) => 
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    );
    
    // Get the first 3
    return { recentProperties: sorted.slice(0, 3), isLoading: false };
  }, [approvedProperties, propertiesLoading]);


  const localAreas =
    locationData[0]?.districts
      .flatMap((d) => d.localities.map((l) => ({ ...l, district: d.name })))
      .slice(0, 10) || [];
      
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');

  return (
    <>
      <section className="relative py-20 md:py-32 bg-secondary/20 flex items-center justify-center text-center">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
        <div className="container relative z-10 text-white">
          <h1 className="text-4xl md:text-6xl font-bold font-headline drop-shadow-md">
            Your Nearby Property Marketplace
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-white/90 drop-shadow">
            Buy, Sell, or Rent Homes & Plots Around You with Ease
          </p>
          <Card className="max-w-4xl mx-auto mt-8 p-4 shadow-lg bg-background/90 backdrop-blur-sm">
            <form className="grid sm:grid-cols-4 items-center gap-4">
              <div className="sm:col-span-2">
                <Input
                  placeholder="Search for location or property..."
                  className="h-12 text-base"
                />
              </div>
              <div>
                <Select>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="lg" className="h-12 w-full text-base" variant="accent">
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Latest Listings
            </h2>
            <p className="text-muted-foreground mt-2">
              Check out the latest properties fresh on the market.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <>
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
                <PropertyCardSkeleton />
              </>
            ) : (
              recentProperties?.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))
            )}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/properties">View All Properties</Link>
            </Button>
          </div>
        </div>
      </section>

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
            <Link href="/properties?type=Land" className="group">
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
            <h2 className="text-3xl md:text-4xl font-bold font-headline">
              Explore Local Areas
            </h2>
            <p className="text-muted-foreground mt-2">
              Find properties in your favorite neighborhoods.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {localAreas.map((locality) => (
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
