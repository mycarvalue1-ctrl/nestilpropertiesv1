
'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { BedDouble, Bath, Expand, MapPin, Building, School, Hospital, Phone, BadgeCheck, Sparkles, Flame, Car, Fish } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Property, PropertyOwner } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const WhatsappIcon = () => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 fill-current"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );


function PropertyDetailSkeleton() {
  return (
    <div className="container py-10 animate-pulse">
      <div className="mb-6 space-y-3">
        <Skeleton className="h-10 w-3/4 rounded-lg" />
        <Skeleton className="h-6 w-1/2 rounded-lg" />
        <div className="flex gap-2 pt-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-1 space-y-8">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const [privateDetails, setPrivateDetails] = useState<PropertyOwner | null>(null);
  
  const firestore = useFirestore();

  const propertyRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'properties', params.id);
  }, [firestore, params.id]);

  const { data: property, isLoading: isPropertyLoading } = useDoc<Property>(propertyRef);
  
  useEffect(() => {
    async function fetchPrivateDetails() {
      if (!firestore || !params.id) return;
      const privateDocRef = doc(firestore, 'propertyPrivateDetails', params.id);
      const docSnap = await getDoc(privateDocRef);
      if (docSnap.exists()) {
        setPrivateDetails(docSnap.data() as PropertyOwner);
      } else {
        setPrivateDetails(null);
      }
    }

    if (property) {
      fetchPrivateDetails().catch(error => {
        if (error.code === 'permission-denied') {
          console.log("Permission denied when fetching private details (expected for public users).");
          setPrivateDetails(null);
        } else {
          console.error("Error fetching private details:", error);
        }
      });
    }
  }, [property, firestore, params.id]);

  const mapUrl = useMemo(() => {
    if (!property) return '';
    if (property.googleMapsLink) {
      return property.googleMapsLink;
    }
    const mapQuery = encodeURIComponent(`${property.address}, ${property.city}, ${property.pincode}`);
    return `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  }, [property]);


  if (isPropertyLoading) {
    return <PropertyDetailSkeleton />;
  }

  if (!property || property.listingStatus !== 'approved') {
    return (
        <div className="container py-10 text-center">
          <h1 className="text-2xl font-bold">Property Not Available</h1>
          <p className="text-muted-foreground mt-2">
            The property you are looking for is either not available or does not exist.
          </p>
           <Button asChild className="mt-4">
              <Link href="/properties">Browse Other Properties</Link>
          </Button>
        </div>
    );
  }

  const validPhotos = (property.photos || []).filter(p => !p.includes('ik.imagekit.io'));
  const propertyPhotos = validPhotos.length > 0 ? validPhotos : ['https://picsum.photos/seed/property/800/600'];

  return (
    <div className="bg-background">
      <div className="container py-10">
        <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold">{property.title}</h1>
            <div className="flex items-center text-muted-foreground text-md gap-2 mt-2">
                <MapPin className="h-5 w-5" />
                <span>{property.address}, {property.city}, {property.pincode}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
                {property.listingStatus === 'approved' && (
                    <Badge variant="default" className="text-base font-medium bg-green-100 text-green-800 border-green-200">
                        <BadgeCheck className="mr-1.5 h-5 w-5" /> Verified by Nestil
                    </Badge>
                )}
                {privateDetails?.verified && !privateDetails?.isAgent && (
                    <Badge variant="default" className="text-base font-medium bg-green-100 text-green-800 border-green-200">
                        <BadgeCheck className="mr-1.5 h-5 w-5" /> Verified Owner
                    </Badge>
                )}
                {privateDetails?.verified && privateDetails?.isAgent && (
                    <Badge variant="secondary" className="text-base font-medium">
                        <BadgeCheck className="mr-1.5 h-5 w-5" /> Verified Agent
                    </Badge>
                )}
                {property.isNew && (
                    <Badge variant="outline" className="text-base font-medium border-blue-500 text-blue-600">
                        <Sparkles className="mr-1.5 h-5 w-5" /> New Property
                    </Badge>
                )}
                {property.isUrgent && (
                    <Badge variant="destructive" className="text-base font-medium">
                        <Flame className="mr-1.5 h-5 w-5" /> Urgent Sale
                    </Badge>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <Carousel className="w-full">
                      <CarouselContent>
                        {propertyPhotos.map((photo, index) => {
                          return (
                          <CarouselItem key={index}>
                            <div className="aspect-video relative">
                                <Image
                                  src={photo}
                                  alt={`${property.title} photo ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 1024px) 100vw, 66vw"
                                  priority={index === 0}
                                />
                            </div>
                          </CarouselItem>
                        )})}
                      </CarouselContent>
                      <CarouselPrevious className="left-4" />
                      <CarouselNext className="right-4" />
                    </Carousel>
                  </CardContent>
                </Card>
                
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{property.description || 'No description available.'}</p>
                    </CardContent>
                </Card>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Amenities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {(property.amenities || []).map((amenity, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="bg-secondary p-2 rounded-full">
                                      <Building className="h-4 w-4 text-secondary-foreground" />
                                    </div>
                                    <span>{amenity}</span>
                                </div>
                            ))}
                             {(property.amenities || []).length === 0 && (
                                <p className="text-muted-foreground text-sm col-span-full">No amenities listed.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                 <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Nearby Places</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(property.nearbyPlaces || []).map((place, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {place.name.toLowerCase().includes('school') ? <School className="h-5 w-5 text-primary" /> : <Hospital className="h-5 w-5 text-primary" />}
                                    <span>{place.name}</span>
                                </div>
                                <span className="text-muted-foreground">{place.distance}</span>
                            </div>
                        ))}
                         {(property.nearbyPlaces || []).length === 0 && (
                            <p className="text-muted-foreground text-sm">No nearby places listed.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" size="lg" className="w-full">
                            <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                                <MapPin className="mr-2 h-4 w-4" /> View on Google Maps
                            </a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            <div className="lg:col-span-1 space-y-8 sticky top-24 h-min">
                <Card className="shadow-lg">
                    <CardHeader className="bg-secondary rounded-t-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-secondary-foreground text-sm">{property.listingFor === 'Rent' ? 'For Rent' : 'For Sale'}</p>
                                <p className="text-3xl font-bold text-primary">₹{(property.price || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <Badge variant="default">{property.type}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                       <div className="flex justify-around items-center text-center flex-wrap gap-x-4 gap-y-6">
                          <div>
                            <BedDouble className="h-6 w-6 mx-auto text-primary" />
                            <p className="font-bold">{property.bhk || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">BHK</p>
                          </div>
                          <div>
                            <Bath className="h-6 w-6 mx-auto text-primary" />
                            <p className="font-bold">{property.baths || 'N/A'}</p>
                             <p className="text-xs text-muted-foreground">Baths</p>
                          </div>
                           <div>
                            <Expand className="h-6 w-6 mx-auto text-primary" />
                            <p className="font-bold">{(property.areaSqFt || 0).toLocaleString('en-IN')}</p>
                             <p className="text-xs text-muted-foreground">sqft</p>
                          </div>
                           {property.vehicleParking && property.vehicleParking !== 'None' && (
                            <div>
                                <Car className="h-6 w-6 mx-auto text-primary" />
                                <p className="font-bold">{property.vehicleParking}</p>
                                <p className="text-xs text-muted-foreground">Parking</p>
                            </div>
                          )}
                          {property.nonVegAllowed !== undefined && (
                              <div>
                              <Fish className="h-6 w-6 mx-auto text-primary" />
                              <p className="font-bold">{property.nonVegAllowed ? 'Allowed' : 'Not Allowed'}</p>
                              <p className="text-xs text-muted-foreground">Non-Veg</p>
                              </div>
                          )}
                        </div>
                    </CardContent>
                </Card>

                {privateDetails && (
                    <Card className="shadow-lg text-center">
                        <CardHeader>
                            <CardTitle>Contact {privateDetails?.isAgent ? "Agent" : "Owner"}</CardTitle>
                            <p className="text-xl font-bold text-primary">{privateDetails?.name || 'Owner Name'}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Phone Number</p>
                                <p className="text-2xl font-bold tracking-widest">{privateDetails?.phone || 'N/A'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Button asChild size="lg">
                                    <a href={`tel:${privateDetails?.phone}`}>
                                        <Phone className="mr-2 h-5 w-5" /> Call
                                    </a>
                                </Button>
                                <Button asChild size="lg" variant="accent">
                                    <a href={`https://wa.me/${(privateDetails?.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                                        <WhatsappIcon /> WhatsApp
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
