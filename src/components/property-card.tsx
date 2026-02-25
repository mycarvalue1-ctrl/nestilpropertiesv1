import type { Property } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MapPin, Phone, CheckCircle, Sparkles, Flame, BedDouble, Bath, Expand } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, parseISO } from 'date-fns';

const WhatsappIcon = () => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 fill-current"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const ownerType = property.owner?.isAgent ? 'Agent' : 'Owner';
  const isJustListed = property.dateAdded ? differenceInDays(new Date(), parseISO(property.dateAdded)) <= 3 : false;

  return (
    <Card className="group w-full overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col bg-card relative">
      <Link href={`/properties/${property.id}`} className="absolute inset-0 z-10" aria-label={property.title} target="_blank" />

      <div className="relative">
        <Image
          src={(property.photos && property.photos[0]) || 'https://picsum.photos/seed/property/600/400'}
          alt={`Photo of ${property.title}`}
          width={600}
          height={400}
          className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="modern house"
        />
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-20">
            {property.featured && (
                <Badge variant="default" className="bg-accent text-accent-foreground">Featured</Badge>
            )}
             {isJustListed && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    <Sparkles className="mr-1 h-3 w-3" /> Just Listed
                </Badge>
            )}
            {property.isUrgent && (
                <Badge variant="destructive">
                    <Flame className="mr-1 h-3 w-3" /> Urgent
                </Badge>
            )}
        </div>
         <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent z-20 text-white">
            <h3 className="font-bold font-headline text-lg truncate">{property.title}</h3>
            <p className="flex items-center text-sm gap-1 truncate text-white/90">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{property.address}, {property.city}</span>
            </p>
          </div>
      </div>
      <CardContent className="p-4 space-y-4 flex-grow flex flex-col">
        <div className="flex-grow space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold font-headline text-primary">
              ₹{new Intl.NumberFormat('en-IN').format(property.price || 0)}
              {property.status === 'For Rent' && (
                <span className="text-sm font-normal text-muted-foreground"> /month</span>
              )}
            </p>
             <Badge variant="secondary" className="capitalize">{property.type}</Badge>
          </div>
          
          <div className="flex justify-around items-center text-center border-y py-3 text-sm">
             <div className="flex items-center gap-1.5">
                <BedDouble className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{property.beds || 'N/A'} <span className="font-normal text-muted-foreground">Beds</span></span>
             </div>
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{property.baths || 'N/A'} <span className="font-normal text-muted-foreground">Baths</span></span>
             </div>
              <div className="flex items-center gap-1.5">
                <Expand className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{property.areaSqFt || 'N/A'} <span className="font-normal text-muted-foreground">sqft</span></span>
             </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
             Posted by <span className="font-semibold text-foreground">{property.owner?.name}</span> ({ownerType})
          </div>
        </div>

        <div className="flex gap-2 pt-3 mt-auto relative z-20">
          <Button asChild className="w-full" variant="outline">
            <a href={`tel:${property.owner?.phone}`} onClick={(e) => e.stopPropagation()}>
              <Phone className="mr-2 h-4 w-4" /> Call
            </a>
          </Button>
          <Button asChild className="w-full bg-green-500 hover:bg-green-600 text-white" >
            <a href={`https://wa.me/${(property.owner?.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              <WhatsappIcon /> WhatsApp
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PropertyCardSkeleton() {
  return (
    <Card className="w-full overflow-hidden shadow-sm flex flex-col bg-card">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3 flex-grow flex flex-col">
        <div className="space-y-2 flex-grow">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex gap-2 border-t pt-3 mt-auto">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </Card>
  );
}
