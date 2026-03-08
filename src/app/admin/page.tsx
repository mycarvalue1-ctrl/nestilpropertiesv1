
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Image from 'next/image';
import { CheckCircle, XCircle, Clock, Download, Users, Ban, Trash2, MoreVertical, Filter, Search, Edit, Building2, LoaderCircle, BedDouble, Bath, Expand, MapPin, Archive, Eye } from "lucide-react";
import type { Property, PropertyOwner } from "@/lib/types";
import Link from "next/link";
import { format, fromUnixTime } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, doc, updateDoc, deleteDoc, query, where, getDoc, getCountFromServer } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';


function AdminSkeleton() {
  return (
    <div className="container py-12 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-96" />
      <Skeleton className="h-96" />
    </div>
  );
}

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


export default function AdminPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const pdfRef = useRef<HTMLDivElement>(null);
  const [pdfProperty, setPdfProperty] = useState<{ property: Property, owner: PropertyOwner } | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [processingPropertyId, setProcessingPropertyId] = useState<string | null>(null);

  const [propertySearch, setPropertySearch] = useState('');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');

  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);

  const [summaryCounts, setSummaryCounts] = useState({ total: 0, active: 0, soldRented: 0 });
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
        if (!firestore) return;
        setCountsLoading(true);
        try {
            const allPropsCol = collection(firestore, 'properties');
            const totalPromise = getCountFromServer(allPropsCol);
            const activePromise = getCountFromServer(query(allPropsCol, where('listingStatus', '==', 'approved')));
            const soldPromise = getCountFromServer(query(allPropsCol, where('listingStatus', '==', 'sold')));
            const rentedPromise = getCountFromServer(query(allPropsCol, where('listingStatus', '==', 'rented')));

            const [totalSnap, activeSnap, soldSnap, rentedSnap] = await Promise.all([totalPromise, activePromise, soldPromise, rentedPromise]);
            
            setSummaryCounts({
                total: totalSnap.data().count,
                active: activeSnap.data().count,
                soldRented: soldSnap.data().count + rentedSnap.data().count,
            });

        } catch (e) {
            console.error("Error fetching summary counts", e);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load summary statistics.'});
        } finally {
            setCountsLoading(false);
        }
    }
    fetchCounts();
  }, [firestore, toast]);


  useEffect(() => {
    const generatePdf = async () => {
        if (pdfProperty && pdfRef.current) {
            setIsGeneratingPdf(true);
            try {
                const { default: jsPDF } = await import('jspdf');
                const { default: html2canvas } = await import('html2canvas');

                const canvas = await html2canvas(pdfRef.current, {
                    useCORS: true,
                    scale: 2, // Higher scale for better quality
                    backgroundColor: '#ffffff',
                });
                const imgData = canvas.toDataURL('image/png');
                
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${pdfProperty.property.title.replace(/\s/g, '_')}_nestil.pdf`);

                toast({
                    title: "PDF Generated",
                    description: "Your property PDF has been downloaded."
                });
            } catch (e) {
                console.error("Error generating PDF", e);
                toast({
                    variant: "destructive",
                    title: "PDF Generation Failed",
                    description: "Could not download the property PDF. Check console for details.",
                });
            } finally {
                setPdfProperty(null); // Reset after generation
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

  // Separate query for pending properties
  const pendingPropertiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'properties'), where('listingStatus', '==', 'pending'));
  }, [firestore]);

  const { data: pendingProperties, isLoading: pendingLoading } = useCollection<Property>(pendingPropertiesQuery);
    
  // Dynamic query for the main table
  const tableQuery = useMemoFirebase(() => {
      if (!firestore) return null;

      let q = query(collection(firestore, 'properties'));
      
      if (propertyStatusFilter === 'all') {
          // A query with a `!=` clause is not supported on its own. 
          // We fetch all and filter client-side for this specific case.
          // For other statuses, we filter directly in the query.
      } else {
          q = query(q, where('listingStatus', '==', propertyStatusFilter));
      }

      if (propertyTypeFilter !== 'all') {
          q = query(q, where('listingFor', '==', propertyTypeFilter.toLowerCase()));
      }
      
      return q;
  }, [firestore, propertyStatusFilter, propertyTypeFilter]);

  const { data: tableProperties, isLoading: tableLoading } = useCollection<Property>(tableQuery);

  const filteredProperties = useMemo(() => {
    if (!tableProperties) return [];
    
    let props = tableProperties;

    if (propertyStatusFilter === 'all') {
        props = props.filter(p => p.listingStatus !== 'archived');
    }

    if (propertySearch) {
        props = props.filter(prop => 
            prop.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
            prop.address.toLowerCase().includes(propertySearch.toLowerCase())
        );
    }

    return props;
  }, [tableProperties, propertySearch, propertyStatusFilter]);
  
  if (pendingLoading || tableLoading || countsLoading) {
      return <AdminSkeleton />;
  }

  const handleApprove = async (id: string) => {
    if (!firestore) return;
    setProcessingPropertyId(id);
    const propRef = doc(firestore, 'properties', id);
    try {
      await updateDoc(propRef, { isApproved: true, listingStatus: 'approved' });
      toast({ title: "Property Approved", description: "The listing is now live." });
    } catch (error) {
      console.error("Error approving property:", error);
      toast({ variant: "destructive", title: "Approval Failed", description: "Could not approve the property." });
    } finally {
      setProcessingPropertyId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!firestore) return;
    setProcessingPropertyId(id);
    const propRef = doc(firestore, 'properties', id);
    try {
      await updateDoc(propRef, { isApproved: false, listingStatus: 'rejected' });
      toast({ title: "Property Rejected" });
    } catch (error) {
      console.error("Error rejecting property:", error);
      toast({ variant: "destructive", title: "Rejection Failed", description: "Could not reject the property." });
    } finally {
      setProcessingPropertyId(null);
    }
  };

  const handleArchiveProperty = async (propertyId: string) => {
    if (!firestore) return;
    if (!window.confirm("Are you sure you want to archive this property? It will be hidden from public view but not permanently deleted.")) return;
    setProcessingPropertyId(propertyId);
    const propRef = doc(firestore, 'properties', propertyId);
    try {
      await updateDoc(propRef, { listingStatus: 'archived' });
      toast({ title: "Property Archived", description: "The property listing has been archived." });
    } catch (error) {
      console.error("Error archiving property:", error);
      toast({ variant: "destructive", title: "Archive Failed", description: "Could not archive the property." });
    } finally {
      setProcessingPropertyId(null);
    }
  };
  
  const handleMarkAsSoldRented = async (property: Property) => {
      if (!firestore) return;
      
      const newStatus = property.listingStatus === 'sold' || property.listingStatus === 'rented' ? 'approved' : (property.listingFor === 'Rent' ? 'rented' : 'sold');
      setProcessingPropertyId(property.id);
      const propRef = doc(firestore, 'properties', property.id);
      try {
        await updateDoc(propRef, { listingStatus: newStatus });
        toast({ title: "Status Updated", description: `Property marked as ${newStatus}.` });
      } catch (error) {
        console.error("Error updating property status:", error);
        toast({ variant: "destructive", title: "Update Failed", description: "Could not update property status." });
      } finally {
        setProcessingPropertyId(null);
      }
  };

  
  const handlePropertyCsvDownload = () => {
    if (!tableProperties) return;

    // Sort properties by date added, newest first
    const sortedProperties = [...tableProperties].sort((a, b) => {
        try {
            return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        } catch (e) {
            return 0; // if date is invalid, don't sort
        }
    });

    const headers = ['id', 'title', 'listingFor', 'propertyType', 'price', 'city', 'address', 'pincode', 'areaSqFt', 'bhk', 'listingStatus', 'dateAdded', 'ownerId'];
    
    const escapeCsvCell = (cell: string | number | boolean | undefined | null) => {
      if (cell === null || cell === undefined) return '';
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    };

    const csvContent = [
      headers.join(','),
      ...sortedProperties.map(prop => [
        prop.id,
        prop.title,
        prop.listingFor,
        prop.type,
        prop.price,
        prop.city,
        prop.address,
        prop.pincode,
        prop.areaSqFt,
        prop.bhk,
        prop.listingStatus,
        prop.dateAdded,
        prop.ownerId,
      ].map(v => escapeCsvCell(v)).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `nestil_properties_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (typeof date === 'string') {
      return format(new Date(date), 'dd/MM/yyyy');
    }
    if (date.seconds) {
      return format(fromUnixTime(date.seconds), 'dd/MM/yyyy');
    }
    return 'Invalid Date';
  };

  return (
    <div className="container py-12">
      <PropertyPdfCard property={pdfProperty?.property || null} owner={pdfProperty?.owner || null} innerRef={pdfRef} />
      
      <Dialog open={!!previewProperty} onOpenChange={(isOpen) => !isOpen && setPreviewProperty(null)}>
        <DialogContent className="max-w-4xl w-full">
            {previewProperty && (
                <>
                    <DialogHeader>
                        <DialogTitle>{previewProperty.title}</DialogTitle>
                        <DialogDescription>
                            <MapPin className="inline-block h-4 w-4 mr-1" />
                            {previewProperty.address}, {previewProperty.city}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[75vh] overflow-y-auto pr-4">
                        <div className="space-y-4">
                            {previewProperty.photos && previewProperty.photos.length > 0 ? (
                                <Carousel className="w-full">
                                    <CarouselContent>
                                        {previewProperty.photos.map((photo, index) => (
                                        <CarouselItem key={index}>
                                            <div className="aspect-video relative">
                                                <Image src={photo} alt={`Property image ${index + 1}`} fill className="object-cover rounded-md"/>
                                            </div>
                                        </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="ml-14" />
                                    <CarouselNext className="mr-14" />
                                </Carousel>
                            ) : (
                                <div className="aspect-video bg-muted rounded-md flex items-center justify-center text-muted-foreground">No photos</div>
                            )}
                            
                            <Card>
                                <CardHeader><CardTitle className="text-lg">Key Details</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-3 gap-4 text-center">
                                     <div className="flex flex-col items-center gap-1">
                                        <BedDouble className="h-6 w-6 text-primary" />
                                        <p className="font-bold">{previewProperty.bhk || 'N/A'}</p>
                                        <p className="text-xs text-muted-foreground">BHK</p>
                                    </div>
                                     <div className="flex flex-col items-center gap-1">
                                        <Bath className="h-6 w-6 text-primary" />
                                        <p className="font-bold">{previewProperty.baths || 'N/A'}</p>
                                        <p className="text-xs text-muted-foreground">Baths</p>
                                    </div>
                                     <div className="flex flex-col items-center gap-1">
                                        <Expand className="h-6 w-6 text-primary" />
                                        <p className="font-bold">{previewProperty.areaSqFt ? previewProperty.areaSqFt.toLocaleString('en-IN') : 'N/A'}</p>
                                        <p className="text-xs text-muted-foreground">sqft</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="space-y-4">
                            <Card>
                                 <CardHeader><CardTitle className="text-lg">Price Details</CardTitle></CardHeader>
                                 <CardContent className="space-y-2">
                                    <p className="text-3xl font-bold text-primary">₹{previewProperty.price.toLocaleString('en-IN')}</p>
                                    {previewProperty.listingFor === 'Rent' && <p className="text-sm text-muted-foreground">/month</p>}
                                    <p className="text-sm">Maintenance: ₹{previewProperty.maintenance?.toLocaleString('en-IN') || 0} /month</p>
                                    {previewProperty.listingFor === 'Rent' && <p className="text-sm">Deposit: ₹{previewProperty.deposit?.toLocaleString('en-IN') || 0}</p>}
                                 </CardContent>
                            </Card>
                            <Card>
                                 <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
                                 <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{previewProperty.description}</p></CardContent>
                            </Card>
                            <Card>
                                 <CardHeader><CardTitle className="text-lg">Amenities</CardTitle></CardHeader>
                                 <CardContent className="flex flex-wrap gap-2">
                                    {(previewProperty.amenities || []).length > 0 ? (
                                        previewProperty.amenities.map(a => <Badge key={a} variant="secondary">{a}</Badge>)
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No amenities listed.</p>
                                    )}
                                 </CardContent>
                            </Card>
                        </div>
                    </div>
                     <DialogFooter className="sm:justify-between items-center border-t pt-4">
                        <div className="text-xs text-muted-foreground">
                            <p>Property ID: {previewProperty.id}</p>
                            <p>Owner ID: {previewProperty.ownerId}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => { handleReject(previewProperty.id); setPreviewProperty(null); }}>Reject</Button>
                            <Button onClick={() => { handleApprove(previewProperty.id); setPreviewProperty(null); }}>Approve</Button>
                        </div>
                    </DialogFooter>
                </>
            )}
        </DialogContent>
    </Dialog>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage property listings.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{summaryCounts.total}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{summaryCounts.active}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Listings</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{pendingProperties?.length || 0}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sold/Rented</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{summaryCounts.soldRented}</div>
            </CardContent>
        </Card>
       </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending Approval</CardTitle>
          <CardDescription>
            Review and approve new property listings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead className="hidden sm:table-cell">Owner ID</TableHead>
                <TableHead className="hidden md:table-cell">Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingProperties && pendingProperties.length > 0 ? (
                pendingProperties.map((prop) => (
                  <TableRow key={prop.id}>
                    <TableCell className="font-medium">{prop.title}</TableCell>
                    <TableCell className="hidden sm:table-cell">{prop.ownerId}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(prop.dateAdded)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewProperty(prop)}>
                            <span className="sr-only">Preview</span>
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleApprove(prop.id)} disabled={processingPropertyId === prop.id}>
                          {processingPropertyId === prop.id ? <LoaderCircle className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1 h-4 w-4" />}<span className="hidden sm:inline">Approve</span>
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleReject(prop.id)} disabled={processingPropertyId === prop.id}>
                          {processingPropertyId === prop.id ? <LoaderCircle className="mr-1 h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />}<span className="hidden sm:inline">Reject</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No properties pending approval.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <CardTitle>All Listings</CardTitle>
                    <CardDescription>View and manage all property listings.</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search title or area..." className="pl-10 w-full" value={propertySearch} onChange={(e) => setPropertySearch(e.target.value)} />
                    </div>
                    <Select value={propertyStatusFilter} onValueChange={setPropertyStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Active Listings</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="rented">Rented</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="sale">For Sale</SelectItem>
                            <SelectItem value="rent">For Rent</SelectItem>
                            <SelectItem value="lease">For Lease</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handlePropertyCsvDownload} className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Download CSV
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead className="hidden sm:table-cell">Owner ID</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {filteredProperties && filteredProperties.map((prop) => (
                  <TableRow key={prop.id}>
                    <TableCell className="font-medium">{prop.title}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <div>{prop.ownerId}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">₹{prop.price.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                       <Badge variant={
                           prop.listingStatus === 'approved' ? 'default' : 
                           prop.listingStatus === 'pending' ? 'secondary' :
                           prop.listingStatus === 'sold' || prop.listingStatus === 'rented' ? 'outline' : 
                           prop.listingStatus === 'archived' ? 'secondary' :
                           'destructive'
                        } className="capitalize flex items-center gap-1 w-fit">
                           {prop.listingStatus === 'approved' && <CheckCircle className="h-3 w-3" />}
                           {prop.listingStatus === 'pending' && <Clock className="h-3 w-3" />}
                           {prop.listingStatus === 'rejected' && <XCircle className="h-3 w-3" />}
                           {prop.listingStatus === 'archived' && <Archive className="h-3 w-3" />}
                           {prop.listingStatus}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={(isGeneratingPdf && pdfProperty?.property.id === prop.id) || processingPropertyId === prop.id}>
                                {(isGeneratingPdf && pdfProperty?.property.id === prop.id) || processingPropertyId === prop.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/post-property?edit=${prop.id}`}>
                                    <Edit className="mr-2 h-4 w-4" />Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleMarkAsSoldRented(prop)}
                                disabled={processingPropertyId === prop.id}
                            >
                                {processingPropertyId === prop.id ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                {prop.listingStatus === 'sold' || prop.listingStatus === 'rented' ? 'Mark as Available' : 'Mark as Sold/Rented'}
                            </DropdownMenuItem>
                             <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleDownloadPdfClick(prop)}
                                disabled={isGeneratingPdf || processingPropertyId === prop.id}
                            >
                                {isGeneratingPdf && pdfProperty?.property.id === prop.id ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-orange-600 focus:text-orange-600 cursor-pointer"
                                onClick={() => handleArchiveProperty(prop.id)}
                                disabled={processingPropertyId === prop.id}
                            >
                                {processingPropertyId === prop.id ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
