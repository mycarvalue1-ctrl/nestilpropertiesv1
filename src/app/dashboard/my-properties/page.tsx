'use client';
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import Link from "next/link";
import { PropertyCard, PropertyCardSkeleton } from "@/components/property-card";
import type { Property } from "@/lib/types";

export default function MyPropertiesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const myPropertiesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'properties'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: myProperties, isLoading } = useCollection<Property>(myPropertiesQuery);

  if (isLoading || isUserLoading) {
    return (
      <div className="w-full">
         <h1 className="text-3xl font-bold mb-6">My Properties</h1>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <PropertyCardSkeleton key={i} />)}
         </div>
      </div>
    );
  }

  if (!myProperties || myProperties.length === 0) {
    return (
       <div className="w-full">
          <h1 className="text-3xl font-bold mb-6">My Properties</h1>
          <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <h2 className="text-xl font-semibold">No properties found.</h2>
            <p className="text-muted-foreground mt-2">You haven't posted any properties yet.</p>
            <Button asChild className="mt-4">
              <Link href="/post-property">Post Your First Property</Link>
            </Button>
          </div>
       </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Properties</h1>
        <Button asChild>
          <Link href="/post-property">Post New Property</Link>
        </Button>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myProperties.map((prop, index) => (
          <PropertyCard key={prop.id} property={prop} priority={index < 3} />
        ))}
      </div>
    </div>
  )
}
