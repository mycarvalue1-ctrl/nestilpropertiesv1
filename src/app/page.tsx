
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyCard, PropertyCardSkeleton } from '@/components/property-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Home as HomeIcon, Search, Trees, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { locationData } from '@/lib/locations';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


function RecentListings() {
  const firestore = useFirestore();

  const recentPropertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'properties'),
      where('listingStatus', '==', 'approved')
    );
  }, [firestore]);

  const { data: approvedProperties, isLoading } = useCollection<Property>(recentPropertiesQuery);
  
  const recentProperties = useMemo(() => {
    if (!approvedProperties) return [];
    
    return [...approvedProperties]
      .sort((a, b) => {
          try {
              return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
          } catch (e) {
              return 0;
          }
      })
      .slice(0, 6);
  }, [approvedProperties]);

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
                {recentProperties && recentProperties.length > 0 ? (
                  recentProperties.map((prop, index) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      priority={index < 3}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No approved properties found at the moment. Check back later!</p>
                  </div>
                )}
              </div>
              {recentProperties && recentProperties.length > 0 && (
                <div className="text-center mt-12">
                    <Button size="lg" asChild>
                    <Link href="/properties">View All Properties</Link>
                    </Button>
                </div>
              )}
            </>
          )}

        </div>
      </section>
  )
}


export default function Home() {
  const [shuffledLocalAreas, setShuffledLocalAreas] = useState<any[]>([]);
  const [searchTab, setSearchTab] = useState('Buy');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [budget, setBudget] = useState('any');
  const router = useRouter();

  useEffect(() => {
    const allLocalAreas =
      locationData[0]?.districts
        .flatMap((d) => d.localities.map((l) => ({ ...l, district: d.name }))) || [];
    
    for (let i = allLocalAreas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLocalAreas[i], allLocalAreas[j]] = [allLocalAreas[j], allLocalAreas[i]];
    }

    setShuffledLocalAreas(allLocalAreas.slice(0, 10));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (location) {
        params.set('keyword', location);
    }
    
    if (searchTab === 'Buy') {
        params.set('transaction', 'Sale');
    } else if (searchTab === 'Rent') {
        params.set('transaction', 'Rent');
    } else if (searchTab === 'Commercial') {
        params.set('type', 'Commercial');
        params.delete('transaction'); 
    } else if (searchTab === 'Plot / Land') {
        params.set('type', 'Plot');
        params.delete('transaction');
    }

    if (propertyType !== 'all') {
        params.set('type', propertyType);
    }

    if (budget !== 'any') {
        const [min, max] = budget.split('-');
        if(min && min !== '0') params.set('minPrice', min);
        if(max && max !== 'Infinity') params.set('maxPrice', max);
    }
    
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <>
      <section className="py-20 md:py-24 bg-secondary/50 text-center">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight text-foreground">
            Find Your
            <br />
            <span className="text-accent">Dream Home</span>
            <br />
            Across AP
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-foreground/80">
            Browse thousands of verified properties across every district and small city of Andhra Pradesh.
          </p>

          <div className="max-w-4xl mx-auto mt-8">
            <Tabs defaultValue="Buy" onValueChange={setSearchTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex mx-auto bg-transparent p-1 rounded-full border">
                <TabsTrigger value="Buy" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Buy</TabsTrigger>
                <TabsTrigger value="Rent" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Rent</TabsTrigger>
                <TabsTrigger value="Commercial" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Commercial</TabsTrigger>
                <TabsTrigger value="Plot / Land" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Plot / Land</TabsTrigger>
              </TabsList>
              
              <div className="mt-6 p-2 rounded-lg bg-background/80 backdrop-blur-sm border shadow-lg">
                <form onSubmit={handleSearch}>
                  <div className="flex flex-col md:flex-row items-center">
                    
                    <div className="p-2 flex-1 w-full">
                      <Label htmlFor="location" className="text-xs font-semibold uppercase text-muted-foreground">Location</Label>
                      <Input
                        id="location"
                        placeholder="City, locality or project..."
                        className="h-auto text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    
                    <div className="w-full md:w-px h-px md:h-10 bg-border"></div>

                    <div className="p-2 flex-1 w-full">
                      <Label htmlFor="property-type" className="text-xs font-semibold uppercase text-muted-foreground">Property Type</Label>
                      <Select value={propertyType} onValueChange={setPropertyType}>
                          <SelectTrigger id="property-type" className="h-auto text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 data-[placeholder]:text-foreground">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="House">House</SelectItem>
                            <SelectItem value="Flat">Flat</SelectItem>
                            <SelectItem value="Plot">Plot</SelectItem>
                            <SelectItem value="Commercial">Commercial</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="w-full md:w-px h-px md:h-10 bg-border"></div>
                    
                    <div className="p-2 flex-1 w-full">
                      <Label htmlFor="budget" className="text-xs font-semibold uppercase text-muted-foreground">Budget</Label>
                      <Select value={budget} onValueChange={setBudget}>
                          <SelectTrigger id="budget" className="h-auto text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 data-[placeholder]:text-foreground">
                            <SelectValue placeholder="Any Budget" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any Budget</SelectItem>
                            {searchTab === 'Rent' ? (
                              <>
                                <SelectItem value="0-10000">Below ₹10,000</SelectItem>
                                <SelectItem value="10000-20000">₹10k - ₹20k</SelectItem>
                                <SelectItem value="20000-50000">₹20k - ₹50k</SelectItem>
                                <SelectItem value="50000-Infinity">Above ₹50k</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="0-2000000">Below ₹20 Lacs</SelectItem>
                                <SelectItem value="2000000-5000000">₹20L - ₹50L</SelectItem>
                                <SelectItem value="5000000-10000000">₹50L - ₹1 Cr</SelectItem>
                                <SelectItem value="10000000-Infinity">Above ₹1 Cr</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                    </div>

                    <div className="p-2 w-full md:w-auto">
                       <Button type="submit" size="lg" className="h-11 text-base w-full" variant="accent">
                          <Search className="mr-2 h-5 w-5" />
                          Search
                      </Button>
                    </div>

                  </div>
                </form>
              </div>
            </Tabs>
          </div>

          <div className="container mt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
                <div>
                    <p className="text-3xl font-bold text-accent">12,400+</p>
                    <p className="text-sm uppercase text-muted-foreground tracking-wider">Active Listings</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-accent">26+</p>
                    <p className="text-sm uppercase text-muted-foreground tracking-wider">Districts Covered</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-accent">8,200+</p>
                    <p className="text-sm uppercase text-muted-foreground tracking-wider">Happy Families</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-accent">500+</p>
                    <p className="text-sm uppercase text-muted-foreground tracking-wider">Verified Agents</p>
                </div>
            </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-8">
            <Link href="/properties?type=House&transaction=Rent" className="group">
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
            <Link href="/properties?type=House&transaction=Sale" className="group">
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
            <Link href="/properties?type=Apartment" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-shadow border-none">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center bg-card h-full">
                  <div className="bg-secondary p-4 rounded-full mb-3">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold group-hover:text-accent">
                    Apartments
                  </h3>
                </CardContent>
              </Card>
            </Link>
            <Link href="/properties?type=Villa" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-shadow border-none">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center bg-card h-full">
                  <div className="bg-secondary p-4 rounded-full mb-3">
                    <HomeIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold group-hover:text-accent">
                    Villas
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
                    <Briefcase className="h-8 w-8 text-primary" />
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
