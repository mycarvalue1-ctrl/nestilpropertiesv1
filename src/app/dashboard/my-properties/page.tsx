'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { properties } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreVertical, Trash, EyeOff, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MyPropertiesPage() {
  const userId = 'user-1';
  const userProperties = properties.filter(p => p.owner.id === userId);

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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Properties</h1>
        <Button asChild>
          <Link href="/post-property">Post New Property</Link>
        </Button>
      </div>

      {userProperties.length > 0 ? (
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
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:border-red-500">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                    </Button>
                 </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        {prop.listingStatus === 'rented' || prop.listingStatus === 'sold' ? 
                            <><Eye className="mr-2 h-4 w-4" /> Mark as Available</> :
                            <><EyeOff className="mr-2 h-4 w-4" /> Mark as Rented/Sold</>
                        }
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
