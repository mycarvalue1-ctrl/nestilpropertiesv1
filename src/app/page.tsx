import { PropertyCard } from '@/components/property-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { properties } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Search, Building, Home as HomeIcon, Trees, Handshake } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');
  const featuredProperties = properties.filter(p => p.featured && p.listingStatus === 'approved').slice(0, 3);
  const recentProperties = properties.filter(p => p.listingStatus === 'approved').sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 3);

  return (
    <>
      <section className="relative w-full h-[70vh] min-h-[450px] md:h-[60vh] md:min-h-[500px] flex items-center justify-center text-white">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Nestil.in
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-2xl font-semibold text-white/90">
            Your Nearby Property Marketplace
          </p>
          <p className="mt-2 max-w-2xl mx-auto text-lg text-white/80">
            Buy • Sell • Rent Homes & Plots Around You
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" asChild>
                <Link href="/properties" className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Search Properties
                </Link>
            </Button>
            <Button size="lg" variant="accent" asChild>
                <Link href="/post-property">Post Property Free</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Properties</h2>
            <p className="text-muted-foreground mt-2">Handpicked properties by our team.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Explore by Category</h2>
            <p className="text-muted-foreground mt-2">Find properties that match your needs.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <Link href="/properties?type=House" className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <div className="bg-secondary p-4 rounded-full mb-3">
                           <HomeIcon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold group-hover:text-primary">Houses</h3>
                    </CardContent>
                </Card>
            </Link>
             <Link href="/properties?type=Flat" className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                         <div className="bg-secondary p-4 rounded-full mb-3">
                           <Building className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold group-hover:text-primary">Flats</h3>
                    </CardContent>
                </Card>
            </Link>
             <Link href="/properties?type=Land" className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                         <div className="bg-secondary p-4 rounded-full mb-3">
                           <Trees className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold group-hover:text-primary">Land</h3>
                    </CardContent>
                </Card>
            </Link>
             <Link href="/post-property" className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                         <div className="bg-secondary p-4 rounded-full mb-3">
                           <Handshake className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold group-hover:text-primary">Sell</h3>
                    </CardContent>
                </Card>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Recently Added Properties</h2>
            <p className="text-muted-foreground mt-2">Check out the latest listings on Nestil.</p>
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
    </>
  );
}
