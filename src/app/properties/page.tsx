
'use client';

import { Suspense, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PropertyCard, PropertyCardSkeleton } from '@/components/property-card';
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
import { Button } from '@/components/ui/button';
import { Filter, Search } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { useFavorites } from '@/hooks/use-favorites';


function PropertyList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const status = searchParams.get('status');
  const types = searchParams.getAll('type');

  const firestore = useFirestore();
  const { favoriteIds, toggleFavorite } = useFavorites();

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;

    const q = collection(firestore, 'properties');
    const constraints: any[] = [
        where('isApproved', '==', true),
        orderBy('dateAdded', 'desc')
    ];

    if (status) {
      constraints.push(where('status', '==', status));
    }

    return query(q, ...constraints);
  }, [firestore, status]);

  const { data: serverFilteredProperties, isLoading } = useCollection<Property>(propertiesQuery);
  
  const filteredProperties = useMemo(() => {
    if (!serverFilteredProperties) return [];

    const lowerCaseTypes = types.map(t => t.toLowerCase());

    if (lowerCaseTypes.length === 0) {
      return serverFilteredProperties;
    }

    // This client-side filter is still needed because the 'type' field in the database
    // is more specific (e.g., "2 BHK Flat") than the filter categories (e.g., "Apartment").
    return serverFilteredProperties.filter(p => {
      if (!p.type) return false;
      const propTypeLower = p.type.toLowerCase();

      return lowerCaseTypes.some(filterType => {
        if (filterType === 'apartment') {
          return propTypeLower.includes('flat') || propTypeLower.includes('apartment');
        }
        if (filterType === 'house') {
            return propTypeLower.includes('house') || propTypeLower.includes('villa');
        }
        return propTypeLower.includes(filterType);
      });
    });
  }, [serverFilteredProperties, types]);

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{`Showing ${filteredProperties.length} properties`}</h2>
      </div>
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProperties.map((prop) => (
            <PropertyCard 
              key={prop.id} 
              property={prop}
              isFavorited={favoriteIds.has(prop.id)}
              onToggleFavorite={() => toggleFavorite(prop.id, favoriteIds.has(prop.id))}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg mt-4">
          <h2 className="text-xl font-semibold">No Properties Found</h2>
          <p className="text-muted-foreground mt-2">No properties match your current criteria. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}

const propertyTypesForFilter = ['Apartment', 'House', 'Villa', 'Plot', 'Commercial', 'PG'];

function Filters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleTypeChange = useCallback((checked: boolean | 'indeterminate', type: string) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        
        let newTypes = current.getAll('type');

        if (checked) {
            if (!newTypes.some(t => t.toLowerCase() === type.toLowerCase())) {
                newTypes.push(type);
            }
        } else {
            newTypes = newTypes.filter(t => t.toLowerCase() !== type.toLowerCase());
        }

        current.delete('type');
        newTypes.forEach(t => current.append('type', t));

        const search = current.toString();
        const query = search ? `?${search}` : "";

        router.push(`${pathname}${query}`, {scroll: false});
    }, [searchParams, router, pathname]);

    const selectedTypes = searchParams.getAll('type');

    return (
        <Card className="sticky top-20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="search">Keyword</Label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="search" placeholder="Search..." className="pl-10" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Property Type</Label>
            <div className="space-y-2">
                {propertyTypesForFilter.map(item => (
                    <div key={item} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`type-${item}`} 
                            checked={selectedTypes.some(t => t.toLowerCase() === item.toLowerCase())}
                            onCheckedChange={(checked) => handleTypeChange(checked, item)}
                        />
                        <Label htmlFor={`type-${item}`} className="font-normal">{item}</Label>
                    </div>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Price Range</Label>
            <Slider defaultValue={[0, 2000000]} max={5000000} step={10000} />
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹0</span>
                <span>₹50,00,000+</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label htmlFor="beds">Beds</Label>
                <Select>
                    <SelectTrigger id="beds"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                    {[1, 2, 3, 4, 5].map(i => <SelectItem key={i} value={String(i)}>{i} Bed{i>1 && 's'}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label htmlFor="baths">Baths</Label>
                <Select>
                    <SelectTrigger id="baths"><SelectValue placeholder="Any" /></SelectTrigger>
                    <SelectContent>
                     {[1, 2, 3, 4, 5].map(i => <SelectItem key={i} value={String(i)}>{i} Bath{i>1 && 's'}</SelectItem>)}
                    </SelectContent>
                </Select>
             </div>
          </div>
          
          <div className="space-y-2">
            <Label>Furnishing</Label>
            <div className="space-y-2">
                {['Furnished', 'Semi-furnished', 'Unfurnished'].map(item => (
                    <div key={item} className="flex items-center space-x-2">
                        <Checkbox id={`furnish-${item}`} />
                        <Label htmlFor={`furnish-${item}`} className="font-normal">{item}</Label>
                    </div>
                ))}
            </div>
          </div>

          <Button className="w-full" disabled>Apply Filters</Button>

        </CardContent>
      </Card>
    )
}

export default function PropertiesPage() {
  return (
    <div className="container py-10">
       <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Property Listings</h1>
        <p className="text-muted-foreground">Find the perfect property that meets your needs.</p>
       </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/4">
          <Suspense fallback={<div>Loading filters...</div>}>
            <Filters/>
          </Suspense>
        </div>
        <div className="w-full lg:w-3/4">
          <Suspense fallback={<div>Loading properties...</div>}>
            <PropertyList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
