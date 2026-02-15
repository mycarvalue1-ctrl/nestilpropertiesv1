'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
import { CheckCircle, XCircle, Clock, Download, Users, Eye, Ban, Trash2, MoreVertical, Filter, Search } from "lucide-react";
import type { User as AppUser, Property } from "@/lib/types";
import Link from "next/link";
import { format, fromUnixTime } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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


export default function AdminPage() {
  const { user: currentUser, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && (!currentUser || currentUser.email !== 'mycarvalue1@gmail.com')) {
      router.push('/login');
    }
  }, [currentUser, isUserLoading, router]);

  const isAdmin = currentUser?.email === 'mycarvalue1@gmail.com';

  const propertiesQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'properties');
  }, [firestore, isAdmin]);
  const { data: allProperties, isLoading: propertiesLoading } = useCollection<Property>(propertiesQuery);
    
  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'users');
  }, [firestore, isAdmin]);
  const { data: users, isLoading: usersLoading } = useCollection<AppUser>(usersQuery);
  
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


  const handleUserCsvDownload = () => {
    if (!users) return;
    const headers = ['id', 'name', 'email', 'phone', 'dateJoined', 'role', 'listings'];
    
    const escapeCsvCell = (cell: string | number) => {
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
      ].map(v => escapeCsvCell(v || '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-t8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];

    link.setAttribute('href', url);
    link.setAttribute('download', `nestil_users_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(firestore, 'properties', id), { listingStatus: 'approved', isApproved: true });
      toast({ title: "Property Approved", description: "The listing is now live." });
    } catch (error) {
      toast({ title: "Error", description: "Could not approve property.", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(firestore, 'properties', id), { listingStatus: 'rejected', isApproved: false });
      toast({ title: "Property Rejected" });
    } catch (error) {
      toast({ title: "Error", description: "Could not reject property.", variant: "destructive" });
    }
  };
  
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (typeof date === 'string') {
      return format(new Date(date), 'dd/MM/yyyy');
    }
    // Handle Firestore Timestamp
    if (date.seconds) {
      return format(fromUnixTime(date.seconds), 'dd/MM/yyyy');
    }
    return 'Invalid Date';
  };

  return (
    <div className="container py-12">
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
              A total of {usersCount} users found. Search by phone number.
            </CardDescription>
          </div>
           <div className="flex items-center gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search phone..." className="pl-10"/>
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
              {users && users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
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
                         <DropdownMenuItem className="text-orange-600 focus:text-orange-600 cursor-pointer">
                             <Ban className="mr-2 h-4 w-4" /> Block User
                         </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
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
                        <Input placeholder="Search title or area..." className="pl-10"/>
                    </div>
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="rented">Rented</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select>
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
               {allProperties && allProperties.map((prop) => (
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
                           prop.listingStatus === 'sold' || prop.listingStatus === 'rented' ? 'outline' : 'destructive'
                        } className="capitalize flex items-center gap-1 w-fit">
                           {prop.listingStatus === 'approved' && <CheckCircle className="h-3 w-3" />}
                           {prop.listingStatus === 'pending' && <Clock className="h-3 w-3" />}
                           {prop.listingStatus === 'rejected' && <XCircle className="h-3 w-3" />}
                           {prop.listingStatus}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">Edit</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">Mark as Sold/Rented</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">Delete</DropdownMenuItem>
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
