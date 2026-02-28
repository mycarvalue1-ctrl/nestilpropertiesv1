'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
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
import { CheckCircle, XCircle, Clock, Download, Users, Eye, Ban, Trash2, MoreVertical, Filter, Search, Edit, Building2, LoaderCircle, BedDouble, Bath, Expand, MapPin, Archive } from "lucide-react";
import type { User as AppUser, Property } from "@/lib/types";
import Link from "next/link";
import { format, fromUnixTime } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function AdminSkeleton() {
  return (
    <div className="container py-12 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-96" />
      <Skeleton className="h-96" />
    </div>
  );
}

// PDF Template Component - This will be rendered off-screen
const PropertyPdfCard = ({ property, innerRef }: { property: Property | null, innerRef: React.Ref<HTMLDivElement> }) => {
    if (!property) return null;

    const photoUrl = (property.photos && property.photos.length > 0) ? property.photos[0] : 'https://placehold.co/800x600/e2e8f0/e2e8f0?text=No+Image';
    const maskedPhone = property.owner?.phone ? `******${property.owner.phone.slice(-4)}` : 'N/A';

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
                            <p className="font-bold text-lg text-primary">Contact {property.owner?.isAgent ? 'Agent' : 'Owner'}</p>
                            <p className="text-foreground">{property.owner?.name} - {maskedPhone}</p>
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
  const { user: currentUser, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const adminUid = 'IultEIQMgAUPwoqAEWX7ZIunjNB3';
  const isAdmin = currentUser?.uid === adminUid;

  const pdfRef = useRef<HTMLDivElement>(null);
  const [pdfProperty, setPdfProperty] = useState<Property | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [propertySearch, setPropertySearch] = useState('');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('all');

  useEffect(() => {
    const generatePdf = async () => {
        if (pdfProperty && pdfRef.current) {
            setIsGeneratingPdf(true);
            try {
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
                pdf.save(`${pdfProperty.title.replace(/\s/g, '_')}_nestil.pdf`);

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

  const handleDownloadPdfClick = (property: Property) => {
    if (isGeneratingPdf) return;
    setPdfProperty(property);
  }

  useEffect(() => {
    if (!isUserLoading && (!currentUser || currentUser.uid !== adminUid)) {
      router.push('/admin/login');
    }
  }, [currentUser, isUserLoading, router]);

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return query(collection(firestore, 'properties'));
  }, [firestore, isAdmin]);

  const { data: allProperties, isLoading: propertiesLoading } = useCollection<Property>(propertiesQuery);
    
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'users');
  }, [firestore, isAdmin]);
  const { data: users, isLoading: usersLoading } = useCollection<AppUser>(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user =>
      user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.phone?.includes(userSearch)
    );
  }, [users, userSearch]);

  const filteredProperties = useMemo(() => {
    if (!allProperties) return [];
    return allProperties.filter(prop => {
      const statusMatch = propertyStatusFilter === 'all'
        ? prop.listingStatus !== 'archived'
        : prop.listingStatus === propertyStatusFilter;

      const typeMatch = propertyTypeFilter === 'all' || prop.listingFor.toLowerCase() === propertyTypeFilter.toLowerCase();

      const searchMatch = prop.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
                          prop.address.toLowerCase().includes(propertySearch.toLowerCase());

      return statusMatch && typeMatch && searchMatch;
    });
  }, [allProperties, propertySearch, propertyStatusFilter, propertyTypeFilter]);
  
  if (isUserLoading || !isAdmin || propertiesLoading || usersLoading) {
    if (isUserLoading || propertiesLoading || usersLoading) {
      return <AdminSkeleton />;
    }
    return (
      <div className="container py-12 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. This area is for administrators only.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const pendingProperties = allProperties?.filter((p) => p.listingStatus === "pending") || [];
  const activeListings = allProperties?.filter(p => p.listingStatus === 'approved').length || 0;
  const soldRentedCount = allProperties?.filter(p => p.listingStatus === 'sold' || p.listingStatus === 'rented').length || 0;
  const usersCount = users?.length || 0;
  const propertiesCount = allProperties?.length || 0;

  const handleApprove = async (id: string) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, 'properties', id), { listingStatus: 'approved', isApproved: true });
      toast({ title: "Property Approved", description: "The listing is now live." });
    } catch (error) {
      toast({ title: "Error", description: "Could not approve property.", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, 'properties', id), { listingStatus: 'rejected', isApproved: false });
      toast({ title: "Property Rejected" });
    } catch (error) {
      toast({ title: "Error", description: "Could not reject property.", variant: "destructive" });
    }
  };

  const handleBlockUser = async (userId: string, isCurrentlyBanned: boolean) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, 'users', userId), { isBanned: !isCurrentlyBanned });
      toast({ title: `User ${isCurrentlyBanned ? 'Unbanned' : 'Banned'}`, description: `The user has been successfully ${isCurrentlyBanned ? 'unbanned' : 'banned'}.` });
    } catch (error) {
      toast({ title: "Error", description: "Could not update user status.", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
      if (!firestore) return;
      if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
      try {
        await deleteDoc(doc(firestore, 'users', userId));
        toast({ title: "User Deleted", description: "The user document has been removed." });
      } catch (error) {
        toast({ title: "Error", description: "Could not delete user.", variant: "destructive" });
      }
  };

  const handleArchiveProperty = async (propertyId: string) => {
    if (!firestore) return;
    if (!window.confirm("Are you sure you want to archive this property? It will be hidden from public view but not permanently deleted.")) return;
    try {
      await updateDoc(doc(firestore, 'properties', propertyId), { listingStatus: 'archived' });
      toast({ title: "Property Archived", description: "The property listing has been archived." });
    } catch (error) {
      toast({ title: "Error", description: "Could not archive property.", variant: "destructive" });
    }
  };
  
  const handleMarkAsSoldRented = async (propertyId: string, currentStatus: string) => {
      if (!firestore) return;
      const property = allProperties?.find(p => p.id === propertyId);
      if (!property) return;

      const isForRent = property.listingFor === 'Rent';
      const newStatus = currentStatus === 'sold' || currentStatus === 'rented' ? 'approved' : (isForRent ? 'rented' : 'sold');
      
      try {
        await updateDoc(doc(firestore, 'properties', propertyId), { listingStatus: newStatus });
        toast({ title: "Status Updated", description: `Property marked as ${newStatus}.` });
      } catch (error) {
        toast({ title: "Error", description: "Could not update property status.", variant: "destructive" });
      }
  };

  const handleUserCsvDownload = () => {
    if (!users) return;
    const headers = ['id', 'name', 'email', 'phone', 'dateJoined', 'role', 'listings'];
    
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
      ...users.map(user => [
        user.id,
        user.name,
        user.email,
        user.phone,
        user.dateJoined,
        user.role,
        user.listings
      ].map(v => escapeCsvCell(v)).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `nestil_users_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePropertyCsvDownload = () => {
    if (!allProperties) return;

    // Sort properties by date added, newest first
    const sortedProperties = [...allProperties].sort((a, b) => {
        try {
            return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        } catch (e) {
            return 0; // if date is invalid, don't sort
        }
    });

    const headers = ['id', 'title', 'listingFor', 'propertyType', 'price', 'city', 'address', 'pincode', 'areaSqFt', 'bhk', 'listingStatus', 'dateAdded', 'ownerId', 'ownerName', 'ownerPhone'];
    
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
        prop.owner?.id,
        prop.owner?.name,
        prop.owner?.phone,
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
      <PropertyPdfCard property={pdfProperty} innerRef={pdfRef} />
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage property listings and users.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{usersCount}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{propertiesCount}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{activeListings}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Listings</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{pendingProperties.length}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sold/Rented</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{soldRentedCount}</div>
            </CardContent>
        </Card>
       </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><Users /> User Management</CardTitle>
            <CardDescription>
              A total of {usersCount} users found. Search by name, email, or phone.
            </CardDescription>
          </div>
           <div className="flex items-center gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-10" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
            </div>
            <Button onClick={handleUserCsvDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download CSV
            </Button>
           </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers && filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div>{user.name}</div>
                    {user.isBanned && <Badge variant="destructive" className="mt-1">Banned</Badge>}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                  <TableCell className="hidden md:table-cell">{user.phone}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={user.role === 'Agent' || user.role === 'Builder' ? 'secondary' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.listings ?? 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem asChild>
                            <Link href={`/properties?userId=${user.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> View Listings
                            </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem 
                            className={cn("cursor-pointer", user.isBanned ? "text-green-600 focus:text-green-600" : "text-orange-600 focus:text-orange-600")}
                            onClick={() => handleBlockUser(user.id, user.isBanned || false)}
                         >
                             <Ban className="mr-2 h-4 w-4" /> {user.isBanned ? 'Unban User' : 'Ban User'}
                         </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                            onClick={() => handleDeleteUser(user.id)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
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
                <TableHead className="hidden sm:table-cell">Owner</TableHead>
                <TableHead className="hidden md:table-cell">Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingProperties.length > 0 ? (
                pendingProperties.map((prop) => (
                  <TableRow key={prop.id}>
                    <TableCell className="font-medium">{prop.title}</TableCell>
                    <TableCell className="hidden sm:table-cell">{prop.owner?.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatDate(prop.dateAdded)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                        <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleApprove(prop.id)}>
                          <CheckCircle className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleReject(prop.id)}>
                          <XCircle className="mr-1 h-4 w-4" /> Reject
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
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>All Listings</CardTitle>
                    <CardDescription>View and manage all property listings.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search title or area..." className="pl-10" value={propertySearch} onChange={(e) => setPropertySearch(e.target.value)} />
                    </div>
                    <Select value={propertyStatusFilter} onValueChange={setPropertyStatusFilter}>
                        <SelectTrigger className="w-[180px]">
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
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="sale">For Sale</SelectItem>
                            <SelectItem value="rent">For Rent</SelectItem>
                            <SelectItem value="lease">For Lease</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handlePropertyCsvDownload}>
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
                <TableHead className="hidden sm:table-cell">Owner</TableHead>
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
                        <div>{prop.owner?.name}</div>
                        <div className="text-xs text-muted-foreground">{prop.owner?.phone}</div>
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
                            <Button variant="ghost" size="icon" disabled={isGeneratingPdf}>
                                {isGeneratingPdf && pdfProperty?.id === prop.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
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
                                onClick={() => handleMarkAsSoldRented(prop.id, prop.listingStatus)}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {prop.listingStatus === 'sold' || prop.listingStatus === 'rented' ? 'Mark as Available' : 'Mark as Sold/Rented'}
                            </DropdownMenuItem>
                             <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleDownloadPdfClick(prop)}
                                disabled={isGeneratingPdf}
                            >
                                <Download className="mr-2 h-4 w-4" />Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-orange-600 focus:text-orange-600 cursor-pointer"
                                onClick={() => handleArchiveProperty(prop.id)}
                            >
                                <Archive className="mr-2 h-4 w-4" />Archive
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
