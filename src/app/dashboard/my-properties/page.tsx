
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, Trash, EyeOff, Eye, LoaderCircle, Download, Building2, BedDouble, Bath, Expand, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useUser, useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, query, where, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import type { Property, PropertyOwner } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { useRef, useState, useEffect } from "react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from "@/hooks/use-toast";

// PDF Template Component - This will be rendered off-screen
const PropertyPdfCard = ({ property, owner, innerRef }: { property: Property | null, owner: PropertyOwner | null, innerRef: React.Ref<HTMLDivElement> }) => {
    if (!property || !owner) return null;

    const photoUrl = (property.photos && property.photos.length > 0) ? property.photos[0] : 'https://placehold.co/800x600/e2e8f0/e2e8f0?text=No+Image';
    const maskedPhone = owner.phone ? `******${owner.phone.slice(-4)}` : 'N/A';

    return (
        <div ref={innerRef} className="w-[595px] bg-white text-gray-800 fixed -z-10 -left-[9999px] font-sans">
            {/* Page Wrapper */}
            <div className="min-h-[842px] flex flex-col"> 
                {/* Header */}
                <header className="bg-primary text-primary-foreground p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8" />
                        <span className="text-3xl font-bold">Nestil</span>
                    </div>
                    <p className="text-sm">www.nestil.in</p>
                </header>

                {/* Main content */}
                <main className="p-8 flex-grow">
                    {/* Image */}
                    <img src={photoUrl} crossOrigin="anonymous" className="w-full h-64 object-cover rounded-xl shadow-lg border-4 border-white" alt={property.title} />

                    {/* Title & Price */}
                    <div className="mt-6 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-primary">{property.title}</h1>
                            <p className="text-muted-foreground mt-1 flex items-center gap-2">
                                <MapPin className="h-4 w-4"/>
                                {property.address}, {property.city}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">{property.listingFor === 'Rent' ? 'For Rent' : 'For Sale'}</p>
                            <p className="text-3xl font-bold text-accent">
                                ₹{property.price.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                    
                    {/* Details Section */}
                    <div className="mt-8 grid grid-cols-3 gap-6 text-center bg-secondary/50 p-4 rounded-lg">
                         <div className="flex flex-col items-center gap-1">
                            <BedDouble className="h-7 w-7 text-primary" />
                            <p className="font-bold text-lg">{property.bhk || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">BHK</p>
                        </div>
                         <div className="flex flex-col items-center gap-1">
                            <Bath className="h-7 w-7 text-primary" />
                            <p className="font-bold text-lg">{property.baths || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">Baths</p>
                        </div>
                         <div className="flex flex-col items-center gap-1">
                            <Expand className="h-7 w-7 text-primary" />
                            <p className="font-bold text-lg">{property.areaSqFt ? property.areaSqFt.toLocaleString('en-IN') : 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">sqft</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-primary border-b-2 border-primary/20 pb-2">About this property</h2>
                        <p className="text-foreground/80 mt-3 text-sm leading-relaxed">
                            {property.description.substring(0, 400)}{property.description.length > 400 ? '...' : ''}
                        </p>
                    </div>
                </main>
                
                {/* Footer */}
                <footer className="mt-auto p-6 bg-secondary/30">
                    <div className="flex justify-between items-center">
                         <div>
                            <p className="font-bold text-lg text-primary">Contact {owner.isAgent ? 'Agent' : 'Owner'}</p>
                            <p className="text-foreground">{owner.name} - {maskedPhone}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs text-muted-foreground">Property ID: {property.id}</p>
                             <p className="text-xs text-muted-foreground">Visit Nestil.in for more details</p>
                         </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

function MyPropertiesSkeleton() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="flex flex-col">
            <Skeleton className="h-48 w-full rounded-t-lg" />
            <CardContent className="p-4 flex-grow space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
            </CardContent>
            <CardFooter className="p-4 border-t flex justify-between items-center">
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function MyPropertiesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const pdfRef = useRef<HTMLDivElement>(null);
  const [pdfProperty, setPdfProperty] = useState<{ property: Property, owner: PropertyOwner } | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const userPropertiesQuery = useMemoFirebase(() => {
    if (!user || !firestore || isUserLoading) return null;
    return query(collection(firestore, 'properties'), where('ownerId', '==', user.uid));
  }, [user, firestore, isUserLoading]);

  const { data: userProperties, isLoading } = useCollection<Property>(userPropertiesQuery);

  useEffect(() => {
    const generatePdf = async () => {
        if (pdfProperty && pdfRef.current) {
            setIsGeneratingPdf(true);
            try {
                const canvas = await html2canvas(pdfRef.current, { useCORS: true, scale: 2 });
                const imgData = canvas.toDataURL('image/png');
                
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${pdfProperty.property.title.replace(/\s/g, '_')}_nestil.pdf`);

                toast({ title: "PDF Generated", description: "Your property PDF has been downloaded." });
            } catch (e) {
                console.error("Error generating PDF", e);
                toast({ variant: "destructive", title: "PDF Generation Failed", description: "Could not download property PDF." });
            } finally {
                setPdfProperty(null);
                setIsGeneratingPdf(false);
            }
        }
    };
    generatePdf();
  }, [pdfProperty, toast]);

  const handleDownloadPdfClick = async (property: Property) => {
    if (isGeneratingPdf || !firestore) return;
    setIsGeneratingPdf(true);
    const privateDocRef = doc(firestore, 'propertyPrivateDetails', property.id);
    const privateDocSnap = await getDoc(privateDocRef);

    if (privateDocSnap.exists()) {
        const owner = privateDocSnap.data() as PropertyOwner;
        setPdfProperty({ property, owner });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find owner details for this property.' });
        setIsGeneratingPdf(false);
    }
  }

  const handleDeleteProperty = (propertyId: string) => {
    if (!firestore || !user) return;
    if (!window.confirm("Are you sure you want to permanently delete this property? This action cannot be undone.")) return;

    const propRef = doc(firestore, 'properties', propertyId);
    const privateDetailsRef = doc(firestore, 'propertyPrivateDetails', propertyId);
    
    // In a real app, you might use a transaction or a batch write.
    deleteDoc(propRef)
      .then(() => {
          deleteDoc(privateDetailsRef); // Also delete private details
          toast({ title: "Property Deleted", description: "The property has been permanently removed." });
      })
      .catch((error) => {
        console.error("Error deleting property:", error);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: propRef.path,
          operation: 'delete',
        }));
      });
  };

  const handleToggleAvailability = (property: Property) => {
      if (!firestore || !user) return;
      
      const isRentedOrSold = property.listingStatus === 'sold' || property.listingStatus === 'rented';
      const newStatus = isRentedOrSold ? 'approved' : (property.listingFor === 'Rent' ? 'rented' : 'sold');
      const docRef = doc(firestore, 'properties', property.id);
      const data = { listingStatus: newStatus };
      
      updateDoc(docRef, data)
        .then(() => toast({ title: "Status Updated", description: `Property marked as ${newStatus}.` }))
        .catch((error) => {
          console.error("Error updating status:", error);
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: data,
          }));
        });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rented':
      case 'sold':
        return 'outline';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  if (isLoading) {
    return <MyPropertiesSkeleton />;
  }

  return (
    <div className="w-full">
      <PropertyPdfCard property={pdfProperty?.property || null} owner={pdfProperty?.owner || null} innerRef={pdfRef} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Properties</h1>
        <Button asChild>
          <Link href="/post-property">Post New Property</Link>
        </Button>
      </div>

      {userProperties && userProperties.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {userProperties.map((prop) => (
            <Card key={prop.id} className="flex flex-col">
              <CardHeader className="p-0 relative">
                <Image
                  src={prop.photos[0]}
                  alt={prop.title}
                  width={400}
                  height={250}
                  className="object-cover w-full h-48 rounded-t-lg"
                />
                <Badge variant={getStatusBadgeVariant(prop.listingStatus)} className="absolute top-2 right-2 capitalize">
                  {prop.listingStatus === 'approved' ? 'Active' : prop.listingStatus}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <h3 className="font-bold text-lg">{prop.title}</h3>
                <p className="text-muted-foreground text-sm">{prop.address}, {prop.city}</p>
                <p className="font-bold text-primary text-xl mt-2">₹{prop.price.toLocaleString('en-IN')}</p>
              </CardContent>
              <CardFooter className="p-4 border-t flex justify-between items-center">
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/post-property?edit=${prop.id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:border-red-500" onClick={() => handleDeleteProperty(prop.id)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                    </Button>
                 </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isGeneratingPdf && pdfProperty?.property.id === prop.id}>
                        {isGeneratingPdf && pdfProperty?.property.id === prop.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleToggleAvailability(prop)} className="cursor-pointer">
                        {prop.listingStatus === 'rented' || prop.listingStatus === 'sold' ? 
                            <><Eye className="mr-2 h-4 w-4" /> Mark as Available</> :
                            <><EyeOff className="mr-2 h-4 w-4" /> Mark as Rented/Sold</>
                        }
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadPdfClick(prop)} disabled={isGeneratingPdf} className="cursor-pointer">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
          <h2 className="text-xl font-semibold">No properties found.</h2>
          <p className="text-muted-foreground mt-2">Get started by posting your first property.</p>
          <Button asChild className="mt-4">
            <Link href="/post-property">Post Property</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
