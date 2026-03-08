
'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PropertyCard, PropertyCardSkeleton } from '@/components/property-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, X } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const propertyTypesList = [
    '1 BHK Flat', '2 BHK Flat', '3 BHK Flat', 'Independent House', 
    'Villa', 'Row House', 'Duplex', 'Studio Apartment', 'PG / Hostel', 'Land', 'Plot', 'Commercial properties', 'Godowns', 'Warehouses', 'Agricultural Land'
];

function PropertySearchComponent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const getInitialPriceRange = (): [number, number] => {
    const min = searchParams.get('minPrice');
    const max = searchParams.get('maxPrice');
    const maxVal = (max === 'Infinity' || !max) ? 10000000 : parseInt(max, 10);
    return [
      min ? parseInt(min, 10) : 0,
      maxVal > 10000000 ? 10000000 : maxVal,
    ];
  };

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [transaction, setTransaction] = useState(searchParams.get('transaction') || 'all');
  const [propertyType, setPropertyType] = useState(searchParams.get('type') || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>(getInitialPriceRange());

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'properties'),
      where('listingStatus', '==', 'approved')
    );
  }, [firestore]);

  const { data: allProperties, isLoading } = useCollection<Property>(propertiesQuery);

  const filteredProperties = useMemo(() => {
    if (!allProperties) return [];

    return allProperties.filter(prop => {
      if (!prop || typeof prop.price !== 'number') {
        return false;
      }

      const keywordMatch = keyword
        ? (prop.title?.toLowerCase() || '').includes(keyword.toLowerCase()) ||
          (prop.address?.toLowerCase() || '').includes(keyword.toLowerCase()) ||
          (prop.city?.toLowerCase() || '').includes(keyword.toLowerCase())
        : true;

      const transactionMatch =
        transaction !== 'all'
          ? (prop.listingFor?.toLowerCase() || '') === transaction.toLowerCase()
          : true;

      const typeMatch = propertyType !== 'all' ? prop.propertyType === propertyType : true;

      const priceMatch = prop.price >= priceRange[0] && prop.price <= priceRange[1];

      return keywordMatch && transactionMatch && typeMatch && priceMatch;
    });
  }, [allProperties, keyword, transaction, propertyType, priceRange]);

  const handleReset = () => {
    setKeyword('');
    setTransaction('all');
    setPropertyType('all');
    setPriceRange([0, 10000000]);
  };
  
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setTransaction(searchParams.get('transaction') || 'all');
    setPropertyType(searchParams.get('type') || 'all');
    setPriceRange(getInitialPriceRange());
  }, [searchParams]);


  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 sticky top-20 h-min">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Filters
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <X className="mr-2 h-4 w-4" /> Reset
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="search-keyword">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="search-keyword" 
                    placeholder="City, Area, Title..." 
                    className="pl-10"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction-type">For</Label>
                <Select value={transaction} onValueChange={setTransaction}>
                  <SelectTrigger id="transaction-type">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Rent / Sale / Lease</SelectItem>
                    <SelectItem value="Rent">Rent</SelectItem>
                    <SelectItem value="Sale">Sale</SelectItem>
                    <SelectItem value="Lease">Lease</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property-type">Property Type</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger id="property-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {propertyTypesList.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Price Range</Label>
                <Slider
                  min={0}
                  max={10000000}
                  step={50000}
                  value={priceRange}
                  onValueChange={(value: [number, number]) => setPriceRange(value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
                    <span>₹{priceRange[1].toLocaleString('en-IN')}{priceRange[1] === 10000000 ? '+' : ''}</span>
                </div>
              </div>

            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-3">
          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => <PropertyCardSkeleton key={i} />)}
             </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((prop, index) => (
                <PropertyCard key={prop.id} property={prop} priority={index < 3} />
              ))}
            </div>
          ) : (
             <div className="text-center py-16 border-dashed border-2 rounded-lg">
                <h2 className="text-xl font-semibold">No Properties Found</h2>
                <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                <Button className="mt-4" onClick={handleReset}>Clear All Filters</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
        <div className="container py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1"><Skeleton className="h-96 w-full" /></div>
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <PropertyCardSkeleton key={i} />)}
                </div>
            </div>
        </div>
    }>
      <PropertySearchComponent />
    </Suspense>
  )
}
