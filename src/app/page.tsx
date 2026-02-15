import { PropertyCard } from '@/components/property-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { properties } from '@/lib/data';
import { Building, Home as HomeIcon, Search, Trees } from 'lucide-react';
import Link from 'next/link';
import { locationData } from '@/lib/locations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function Home() {
  const featuredProperties = properties
    .filter((p) => p.featured && p.listingStatus === 'approved')
    .slice(0, 3);
  const recentProperties = properties
    .filter((p) => p.listingStatus === 'approved')
    .sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    )
    .slice(0, 3);

  const localAreas =
    locationData[0]?.districts
      .flatMap((d) => d.localities.map((l) => ({ ...l, district: d.name })))
      .slice(0, 10) || [];

  return (
    <>
      <section className="py-20 md:py-24 bg-secondary">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">
            Nestil.in
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-foreground/80">
            Your Nearby Property Marketplace
          </p>
          <p className="mt-1 max-w-2xl mx-auto text-lg text-foreground/60">
            Buy • Sell • Rent Homes & Plots Around You
          </p>
          <Card className="max-w-4xl mx-auto mt-8 p-4 shadow-lg">
            <form className="grid sm:grid-cols-4 items-center gap-4">
              <div className="sm:col-span-2">
                <Input
                  placeholder="Search for location or property..."
                  className="h-12 text-base"
                />
              </div>
              <div>
                <Select>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="lg" className="h-12 w-full text-base">
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Latest Listings
            </h2>
            <p className="text-muted-foreground mt-2">
              Check out the latest listings on Nestil.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" asChild variant="outline">
              <Link href="/properties">View All Properties</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Explore by Category
            </h2>
            <p className="text-muted-foreground mt-2">
              Find properties that match your needs.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <Link href="/properties?type=House&status=For%20Rent" className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="bg-secondary p-4 rounded-full mb-3">
                    <HomeIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary">
                    Rent House
                  </h3>
                </CardContent>
              </Card>
            </Link>
            <Link href="/properties?type=House&status=For%20Sale" className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="bg-secondary p-4 rounded-full mb-3">
                    <HomeIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary">
                    Buy House
                  </h3>
                </CardContent>
              </Card>
            </Link>
            <Link href="/properties?type=Land" className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="bg-secondary p-4 rounded-full mb-3">
                    <Trees className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary">
                    Plots
                  </h3>
                </CardContent>
              </Card>
            </Link>
            <Link href="/properties?type=Commercial" className="group">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="bg-secondary p-4 rounded-full mb-3">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary">
                    Commercial
                  </h3>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">
              Explore Local Areas
            </h2>
            <p className="text-muted-foreground mt-2">
              Find properties in your favorite neighborhoods.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {localAreas.map((locality) => (
              <Link
                key={locality.name}
                href={`/properties?location=${locality.name}`}
              >
                <Card className="text-center p-4 hover:bg-card hover:shadow-md transition-all h-full flex items-center justify-center">
                  <h3 className="font-semibold">{locality.name}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container text-center">
          <h2 className="text-3xl font-bold font-headline">
            Have a property to sell or rent?
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Join thousands of owners and agents to list your property for free
            on Nestil.
          </p>
          <Button size="lg" variant="accent" asChild className="mt-8 text-lg">
            <Link href="/post-property">Post Property Free</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
