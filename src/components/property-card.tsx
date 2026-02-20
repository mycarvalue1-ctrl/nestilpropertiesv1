import type { Property } from '@/lib/types';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MapPin, Phone, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
  const keyAmenities = ['Parking', 'Bore Water'];
  const displayAmenities = (property.amenities || [])
    .filter((a) => keyAmenities.some(ka => a.toLowerCase().includes(ka.toLowerCase())))
    .slice(0, 2);
  const ownerType = property.owner?.isAgent ? 'Agent' : 'Owner';

  return (
    <Card className="group w-full overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col bg-card relative">
      {/* This link covers the entire card, except for elements with a higher z-index */}
      <Link href={`/properties/${property.id}`} className="absolute inset-0 z-10" aria-label={property.title} />

      <div className="relative">
        <Image
          src={(property.photos && property.photos[0]) || 'https://picsum.photos/seed/property/600/400'}
          alt={`Photo of ${property.title}`}
          width={600}
          height={400}
          className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="modern house"
        />
      </div>
      <div className="p-4 space-y-2 flex-grow flex flex-col">
        <div className="flex-grow space-y-2">
          <div>
            <p className="text-lg font-bold font-headline text-primary">
              ₹{new Intl.NumberFormat('en-IN').format(property.price || 0)}
              {property.status === 'For Rent' && (
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              )}
            </p>
            <h3 className="font-bold font-headline text-lg -mt-1">
              {property.bhk || ''} {property.type || ''}
            </h3>
          </div>
          <p className="flex items-center text-muted-foreground text-sm gap-1 truncate">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>
              {property.address}, {property.city}
            </span>
          </p>
          <div className="flex items-center text-sm text-muted-foreground gap-2.5 pt-1 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-foreground/80">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {ownerType}
            </span>
            {displayAmenities.map((amenity) => (
              <span
                key={amenity}
                className="flex items-center gap-1 before:content-['•'] before:mr-2"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
        {/* These buttons need a higher z-index to be clickable */}
        <div className="flex gap-2 border-t pt-3 mt-auto relative z-20">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/properties/${property.id}`}>
              <Phone className="mr-2 h-4 w-4" /> Call
            </Link>
          </Button>
          <Button asChild variant="accent" className="w-full">
            <Link href={`/properties/${property.id}`}>
              <WhatsappIcon /> WhatsApp
            </Link>
          </Button>
        </div>
      </div>
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
