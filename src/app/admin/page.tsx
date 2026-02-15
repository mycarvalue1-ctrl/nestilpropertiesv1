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
import { properties } from "@/lib/data";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminPage() {
  const pendingProperties = properties.filter(
    (p) => p.listingStatus === "pending"
  );
  
  const allProperties = properties;

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage property listings and users.
        </p>
      </div>

      <Card>
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
                    <TableCell className="hidden sm:table-cell">{prop.owner.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(prop.dateAdded).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                        <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700">
                          <CheckCircle className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700">
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
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>All Listings</CardTitle>
           <CardDescription>
            View and manage all property listings.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead className="hidden sm:table-cell">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
               {allProperties.map((prop) => (
                  <TableRow key={prop.id}>
                    <TableCell className="font-medium">{prop.title}</TableCell>
                    <TableCell className="hidden sm:table-cell">₹{prop.price.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                       <Badge variant={
                           prop.listingStatus === 'approved' ? 'default' : 
                           prop.listingStatus === 'pending' ? 'secondary' : 'destructive'
                        } className="capitalize flex items-center gap-1 w-fit">
                           {prop.listingStatus === 'approved' && <CheckCircle className="h-3 w-3" />}
                           {prop.listingStatus === 'pending' && <Clock className="h-3 w-3" />}
                           {prop.listingStatus === 'rejected' && <XCircle className="h-3 w-3" />}
                           {prop.listingStatus}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm">Edit</Button>
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
