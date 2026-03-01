
'use client';

import { Suspense, useMemo, useCallback, useState } from 'react';
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
import { Filter, Search, User, LogIn } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { useFavorites } from '@/hooks/use-favorites';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


function PropertyList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const firestore = useFirestore();
  const { favoriteIds, toggleFavorite, isLoadingFavorites } = useFavorites();
  
  const [sortOption, setSortOption] = useState('newest');

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Base query now filters for approved properties, as per security rules.
    return query(
        collection(firestore, 'properties'),
        where('isApproved', '==', true)
    );
  }, [firestore]);

  const { data: serverFilteredProperties, isLoading: isLoadingProperties } = useCollection<Property>(propertiesQuery);
  
  const filteredAndSortedProperties = useMemo(() => {
    // This block now filters on the pre-filtered 'approved' properties from Firestore.
    if (!serverFilteredProperties) return [];

    const types = searchParams.getAll('type');
    const transaction = searchParams.get('transaction');
    const minPrice = Number(searchParams.get('minPrice') || 0);
    const maxPrice = Number(searchParams.get('maxPrice') || 50000000);
    const minSize = Number(searchParams.get('minSize') || 0);
    const maxSize = Number(searchParams.get('maxSize') || 10000);
    const keyword = searchParams.get('keyword')?.toLowerCase() || '';

    let properties = serverFilteredProperties.filter(p => {
        const typeLower = p.type?.toLowerCase() || '';
        const typeMatch = types.length === 0 || types.some(filterType => {
            const filterTypeLower = filterType.toLowerCase();
            if (filterTypeLower === 'apartment') return typeLower.includes('flat') || typeLower.includes('apartment');
            if (filterTypeLower === 'house') return typeLower.includes('house') || typeLower.includes('villa');
            if (filterTypeLower === 'land') return typeLower.includes('land') || typeLower.includes('plot');
            return typeLower.includes(filterTypeLower);
        });

        const transactionMatch = !transaction || transaction === 'all' || p.listingFor === transaction;
        const priceMatch = p.price >= minPrice && p.price <= maxPrice;
        const sizeMatch = p.areaSqFt >= minSize && p.areaSqFt <= maxSize;

        const keywordMatch = !keyword || 
                                p.title.toLowerCase().includes(keyword) || 
                                p.address.toLowerCase().includes(keyword) ||
                                p.city.toLowerCase().includes(keyword);

        return typeMatch && transactionMatch && priceMatch && sizeMatch && keywordMatch;
    });

    // Sorting logic
    switch (sortOption) {
        case 'price_asc':
            properties.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            properties.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
        default:
            properties.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
            break;
    }

    return properties;

  }, [serverFilteredProperties, searchParams, sortOption]);

  const isLoading = isLoadingFavorites || isLoadingProperties;

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold">{`Showing ${filteredAndSortedProperties.length} properties`}</h2>
        <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="newest">Sort by: Newest</SelectItem>
                <SelectItem value="price_asc">Sort by: Price Low to High</SelectItem>
                <SelectItem value="price_desc">Sort by: Price High to Low</SelectItem>
            </SelectContent>
        </Select>
      </div>
      {filteredAndSortedProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredAndSortedProperties.map((prop) => (
            <PropertyCard 
              key={prop.id} 
              property={prop}
              isFavorited={user ? favoriteIds.has(prop.id) : false}
              onToggleFavorite={user ? () => toggleFavorite(prop.id, favoriteIds.has(prop.id)) : undefined}
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

const propertyTypesForFilter = ['Apartment', 'House', 'Villa', 'Plot', 'Land', 'Commercial', 'PG'];

function Filters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)
            return params.toString()
        },
        [searchParams]
    )

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
    
    const handleRadioChange = useCallback((name: string, value: string) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        if (!value || value === 'all') {
            current.delete(name);
        } else {
            current.set(name, value);
        }
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`${pathname}${query}`, {scroll: false});
    }, [searchParams, router, pathname]);

    const handleSliderChange = useCallback((name: string, value: number[]) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set(`min${name}`, String(value[0]));
        current.set(`max${name}`, String(value[1]));
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`${pathname}${query}`, {scroll: false});
    }, [searchParams, router, pathname]);


    const selectedTypes = searchParams.getAll('type');
    const selectedTransaction = searchParams.get('transaction') || 'all';
    const minPrice = Number(searchParams.get('minPrice') || 0);
    const maxPrice = Number(searchParams.get('maxPrice') || 50000000);
    const minSize = Number(searchParams.get('minSize') || 0);
    const maxSize = Number(searchParams.get('maxSize') || 10000);
    const keyword = searchParams.get('keyword') || '';


    return (
        <Card className="sticky top-20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="search">Keyword Search</Label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="search" placeholder="Search city, area, title..." className="pl-10" 
                    defaultValue={keyword}
                    onBlur={(e) => handleRadioChange('keyword', e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRadioChange('keyword', e.currentTarget.value) }}
                />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Transaction Type</Label>
            <RadioGroup value={selectedTransaction} onValueChange={(v) => handleRadioChange('transaction', v)} className="flex flex-wrap gap-x-4 gap-y-2">
                <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="tx-all" /><Label htmlFor="tx-all" className="font-normal">All</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Sale" id="tx-buy" /><Label htmlFor="tx-buy" className="font-normal">Buy</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Rent" id="tx-rent" /><Label htmlFor="tx-rent" className="font-normal">Rent</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Lease" id="tx-lease" /><Label htmlFor="tx-lease" className="font-normal">Lease</Label></div>
            </RadioGroup>
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
            <Label>Price Range (₹)</Label>
            <Slider defaultValue={[minPrice, maxPrice]} max={50000000} step={100000} onValueCommit={(v) => handleSliderChange('Price', v)} />
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{minPrice.toLocaleString('en-IN')}</span>
                <span>{maxPrice.toLocaleString('en-IN')}{maxPrice >= 50000000 && '+'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Size (sq ft)</Label>
            <Slider defaultValue={[minSize, maxSize]} max={10000} step={100} onValueCommit={(v) => handleSliderChange('Size', v)} />
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>{minSize.toLocaleString('en-IN')}</span>
                <span>{maxSize.toLocaleString('en-IN')}{maxSize >= 10000 && '+'}</span>
            </div>
          </div>

          <Button className="w-full" onClick={() => router.push(pathname, {scroll: false})} variant="outline">Clear All Filters</Button>

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
