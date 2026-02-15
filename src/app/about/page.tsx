import { Building2, Goal, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
              About Nestil
            </h1>
            <p className="mt-4 text-xl text-foreground/80">
              Your Nearby Property Marketplace
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-foreground/90 space-y-8">
            <p className="lead text-xl">
              Nestil is a local property marketplace built to make finding and
              listing homes simple, fast, and trustworthy. We started Nestil with
              one clear goal — help people easily{' '}
              <strong className="text-primary">
                rent, buy, sell, or advertise properties within their own area
              </strong>{' '}
              without confusion, middlemen pressure, or complicated processes.
            </p>

            <p>
              Most property websites focus only on big cities. But in reality,
              thousands of families search for houses every day in towns,
              mandals, and villages. Nestil is designed especially for these
              local communities.
            </p>

            <div className="bg-secondary/50 p-6 rounded-lg border">
                <h3 className="text-2xl font-semibold font-headline text-secondary-foreground mb-4">Our platform allows:</h3>
                <ul className="space-y-2 list-disc list-inside">
                    <li>Owners to directly post their property</li>
                    <li>Tenants to quickly find nearby houses</li>
                    <li>Buyers to explore genuine listings</li>
                    <li>Agents to connect with real customers</li>
                </ul>
            </div>
            
            <p>
              We keep things simple: No complex steps, no unnecessary details,
              and no wasted time. Just open Nestil, select your location, and
              see available properties around you.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-lg bg-card border">
                <div className="flex items-center gap-4 mb-3">
                  <Goal className="h-10 w-10 text-accent" />
                  <h3 className="text-2xl font-bold font-headline text-primary">Our Mission</h3>
                </div>
                <p className="text-muted-foreground">
                  To create a trusted local housing network where anyone can easily find a home near them.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-card border">
                <div className="flex items-center gap-4 mb-3">
                  <Target className="h-10 w-10 text-accent" />
                  <h3 className="text-2xl font-bold font-headline text-primary">Our Vision</h3>
                </div>
                <p className="text-muted-foreground">
                  To become Andhra Pradesh’s most reliable hyper-local property platform connecting people with homes in every town and village.
                </p>
              </div>
            </div>
          </div>
          
           <div className="mt-16 text-center border-t pt-8">
             <div className="flex justify-center items-center gap-2 text-2xl font-bold text-primary">
                <Building2 className="h-7 w-7" />
                <span>Nestil</span>
             </div>
             <p className="text-muted-foreground mt-2">Your Nearby Property Marketplace</p>
           </div>

        </div>
      </div>
    </div>
  );
}
