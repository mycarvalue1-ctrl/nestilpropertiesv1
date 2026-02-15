'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PropertyCard } from '@/components/property-card';
import { properties } from '@/lib/data';
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

function PropertyList() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const type = searchParams.get('type');

  const filteredProperties = properties.filter(p => {
    if (p.listingStatus !== 'approved') return false;
    let match = true;
    if (status && p.status !== status) {
      match = false;
    }
    if (type && p.type.toLowerCase() !== type.toLowerCase()) {
      match = false;
    }
    return match;
  });

  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{`Showing ${filteredProperties.length} properties`}</h2>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p>No properties match your criteria.</p>
        </div>
      )}
    </div>
  );
}

function Filters() {
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

          <Button className="w-full">Apply Filters</Button>

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
