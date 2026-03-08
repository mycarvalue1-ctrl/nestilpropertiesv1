'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { PropertyCard } from '@/components/property-card';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Property } from '@/lib/types';
import { PropertyCardSkeleton } from '@/components/property-card';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const HeroSection = () => (
    <section className="relative flex flex-col justify-center min-h-[calc(100vh-68px)] py-20 overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50">
        {/* Blobs */}
        <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-blue-500/5 rounded-full filter blur-3xl animate-blob pointer-events-none"></div>
        <div className="absolute bottom-[-100px] left-[-50px] w-[500px] h-[500px] bg-emerald-500/5 rounded-full filter blur-3xl animate-blob animation-delay-[-3s] pointer-events-none"></div>
        <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full filter blur-3xl animate-blob animation-delay-[-5s] pointer-events-none"></div>

        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[length:60px_60px] pointer-events-none"></div>

        <div className="container mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary mb-7">
                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span></span>
                Andhra Pradesh's #1 Property Platform
            </div>

            <h1 className="font-extrabold text-5xl md:text-7xl lg:text-8xl leading-none tracking-tighter max-w-4xl text-slate-800">
                Find Your Home<br />
                <span className="glow-text">Anywhere in AP</span><br />
                <span className="text-slate-400">Instantly.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl leading-relaxed mt-6 mb-11">
                12,400+ verified properties across all 26 districts of Andhra Pradesh. From Visakhapatnam to Tirupati — we've got you covered.
            </p>

            <SearchWidget />
            <HeroStats />
        </div>
    </section>
);

const SearchWidget = () => {
  const router = useRouter();

  const [searchTab, setSearchTab] = useState('buy');
  const [keyword, setKeyword] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [budget, setBudget] = useState('any');

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (keyword) {
      params.set('keyword', keyword);
    }

    if (searchTab === 'buy') {
      params.set('transaction', 'Sale');
    } else if (searchTab === 'rent') {
      params.set('transaction', 'Rent');
    } else if (searchTab === 'commercial') {
      params.set('type', 'Commercial properties');
    } else if (searchTab === 'plot') {
      params.set('type', 'Plot');
    }

    if (propertyType !== 'all') {
      params.set('type', propertyType);
    }

    if (budget !== 'any') {
      const [min, max] = budget.split('-');
      if (min) params.set('minPrice', min);
      if (max) params.set('maxPrice', max);
    }

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-300 rounded-2xl p-2 max-w-3xl shadow-2xl shadow-slate-600/10">
        <Tabs defaultValue={searchTab} onValueChange={setSearchTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-200 rounded-xl p-1 mb-2">
                <TabsTrigger value="buy" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Buy</TabsTrigger>
                <TabsTrigger value="rent" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Rent</TabsTrigger>
                <TabsTrigger value="commercial" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Commercial</TabsTrigger>
                <TabsTrigger value="plot" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Plot / Land</TabsTrigger>
            </TabsList>
        </Tabs>
        <div className="flex flex-col md:flex-row items-stretch gap-0">
             <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 border border-slate-300 rounded-lg overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-slate-300">
                <div className="p-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Location</label>
                    <Input 
                      placeholder="City, locality or project…" 
                      className="border-0 p-0 h-auto text-sm focus-visible:ring-0" 
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
                 <div className="p-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Property Type</label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                        <SelectTrigger className="border-0 p-0 h-auto text-sm focus-visible:ring-0"><SelectValue placeholder="All Types" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="1 BHK Flat">1 BHK Flat</SelectItem>
                          <SelectItem value="2 BHK Flat">2 BHK Flat</SelectItem>
                          <SelectItem value="3 BHK Flat">3 BHK Flat</SelectItem>
                          <SelectItem value="Independent House">Independent House</SelectItem>
                          <SelectItem value="Villa">Villa</SelectItem>
                          <SelectItem value="Plot">Plot</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="p-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Budget</label>
                     <Select value={budget} onValueChange={setBudget}>
                        <SelectTrigger className="border-0 p-0 h-auto text-sm focus-visible:ring-0"><SelectValue placeholder="Any Budget" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any Budget</SelectItem>
                          <SelectItem value="0-3000000">Under ₹30 Lac</SelectItem>
                          <SelectItem value="3000000-6000000">₹30 - ₹60 Lac</SelectItem>
                          <SelectItem value="6000000-10000000">₹60 Lac - ₹1 Cr</SelectItem>
                          <SelectItem value="10000000-Infinity">Above ₹1 Cr</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Button onClick={handleSearch} className="md:ml-2 mt-2 md:mt-0 bg-gradient-to-r from-primary to-[#6366F1] text-white text-sm font-bold rounded-lg hover:-translate-y-px hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
                <Search size={16} className="mr-2" /> Search
            </Button>
        </div>
    </div>
  );
};

const HeroStats = () => (
    <div className="flex flex-wrap gap-x-10 gap-y-5 mt-14">
        <div className="flex flex-col"><div className="text-3xl font-extrabold text-slate-800">12,<span>400</span>+</div><div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Active Listings</div></div>
        <div className="w-px bg-slate-300 self-stretch hidden sm:block"></div>
        <div className="flex flex-col"><div className="text-3xl font-extrabold text-slate-800">26<span>+</span></div><div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Districts</div></div>
        <div className="w-px bg-slate-300 self-stretch hidden sm:block"></div>
        <div className="flex flex-col"><div className="text-3xl font-extrabold text-slate-800">8,<span>200</span>+</div><div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Families Helped</div></div>
        <div className="w-px bg-slate-300 self-stretch hidden sm:block"></div>
        <div className="flex flex-col"><div className="text-3xl font-extrabold text-slate-800">500<span>+</span></div><div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Verified Agents</div></div>
    </div>
);

const Ticker = () => (
    <div className="bg-white border-y border-slate-200 py-3 overflow-hidden">
        <div className="container mx-auto flex items-center gap-6">
            <div className="text-[10px] font-bold tracking-[2.5px] uppercase text-primary whitespace-nowrap flex-shrink-0 flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span></span>
                All Cities
            </div>
            <div className="flex gap-7 animate-ticker whitespace-nowrap">
                {['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore', 'Kurnool', 'Kakinada', 'Rajahmundry', 'Eluru', 'Ongole', 'Anantapur', 'Kadapa', 'Nandyal', 'Srikakulam', 'Vizianagaram', 'Proddutur'].concat(...['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Nellore', 'Kurnool', 'Kakinada', 'Rajahmundry', 'Eluru', 'Ongole', 'Anantapur', 'Kadapa', 'Nandyal', 'Srikakulam', 'Vizianagaram', 'Proddutur']).map((city, i) => (
                    <span key={i} className="text-sm text-slate-500 flex items-center gap-2.5 after:content-['◆'] after:text-slate-200 after:text-[8px]">{city}</span>
                ))}
            </div>
        </div>
    </div>
);

const FeaturedProperties = () => {
    const firestore = useFirestore();
    
    const approvedPropertiesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'properties'), 
            where('listingStatus', '==', 'approved'), 
            limit(10)
        );
    }, [firestore]);

    const { data: approvedProperties, isLoading } = useCollection<Property>(approvedPropertiesQuery);

    const propertiesToShow = useMemo(() => {
        if (!approvedProperties) return [];
        
        // Prioritize properties marked as 'featured'
        const featured = approvedProperties.filter(prop => prop.featured);
        if (featured.length > 0) {
            return featured.slice(0, 3);
        }
        
        // Fallback to the 3 most recently added approved properties
        return approvedProperties.slice(0, 3);

    }, [approvedProperties]);

    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto">
                <div className="flex flex-col text-center md:flex-row md:text-left items-center md:items-end justify-between mb-12 gap-y-4">
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold tracking-widest uppercase text-primary mb-4">
                            <span className="w-5 h-0.5 bg-primary rounded-full"></span>Featured Listings
                        </div>
                        <h2 className="font-extrabold text-3xl md:text-5xl leading-none tracking-tight text-slate-800">Verified Properties<br/>Hand-Picked for <span className="text-primary">You</span></h2>
                    </div>
                    <Button variant="outline" asChild className="border-primary/20 text-primary hover:bg-primary/5 hover:text-primary gap-1.5 hover:gap-2.5 transition-all md:shrink-0">
                        <Link href="/properties">Browse All →</Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => <PropertyCardSkeleton key={i} />)
                    ) : propertiesToShow.length > 0 ? (
                        propertiesToShow.map((prop, index) => <PropertyCard key={prop.id} property={prop} priority={index < 3} />)
                    ) : (
                        <div className="col-span-3 text-center py-10 border-dashed border-2 rounded-lg bg-background">
                            <h3 className="text-xl font-semibold">No Featured Properties</h3>
                            <p className="text-muted-foreground mt-2">Check back later to see our hand-picked listings.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};


const CtaBand = () => (
    <div className="py-20">
        <div className="container mx-auto rounded-2xl p-10 md:p-16 bg-gradient-to-r from-blue-50 to-emerald-50 border border-primary/10 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full bg-primary/5 pointer-events-none"></div>
            <div className="absolute bottom-[-60px] left-[20%] w-72 h-72 rounded-full bg-emerald-500/5 pointer-events-none"></div>
            <h2 className="font-extrabold text-3xl md:text-5xl leading-tight text-slate-800 max-w-lg text-center lg:text-left relative z-10">Ready to List Your <span className="glow-text">Property</span> on Nestil?</h2>
            <div className="flex gap-3 flex-shrink-0 relative z-10">
                <Button size="lg" asChild className="bg-gradient-to-r from-primary to-[#6366F1] text-white font-bold text-base rounded-xl hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/20 transition-all">
                    <Link href="/post-property">List for Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="bg-white/50 border-slate-300 text-slate-600 font-semibold text-base rounded-xl hover:border-primary hover:text-primary">
                    <Link href="/contact">Talk to Us</Link>
                </Button>
            </div>
        </div>
    </div>
)


export default function Home() {
  return (
    <>
      <HeroSection />
      <Ticker />
      <FeaturedProperties />
      <CtaBand />
    </>
  );
}
