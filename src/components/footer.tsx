'use client';

import { Logo } from '@/components/logo';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function Footer() {
  const companyLinks = (
    <div className="flex flex-col gap-2 text-sm">
      <Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link>
      <Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link>
    </div>
  );

  const quickLinks = (
    <div className="flex flex-col gap-2 text-sm">
      <Link href="/properties?transaction=Rent" className="text-muted-foreground hover:text-primary">Rent</Link>
      <Link href="/properties?transaction=Sale" className="text-muted-foreground hover:text-primary">Buy</Link>
      <Link href="/post-property" className="text-muted-foreground hover:text-primary">Sell</Link>
    </div>
  );

  const legalLinks = (
     <div className="flex flex-col gap-2 text-sm">
      <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link>
      <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">Terms of Service</Link>
    </div>
  );

  return (
    <footer className="border-t bg-card">
      <div className="container py-12">

        {/* Mobile View: Accordion */}
        <div className="md:hidden">
           <div className="mb-8">
            <Logo />
            <p className="text-muted-foreground text-sm mt-4">
              Your Nearby Property Marketplace
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="company">
              <AccordionTrigger className="font-semibold">Company</AccordionTrigger>
              <AccordionContent>
                {companyLinks}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="quick-links">
              <AccordionTrigger className="font-semibold">Quick Links</AccordionTrigger>
              <AccordionContent>
                {quickLinks}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="legal">
              <AccordionTrigger className="font-semibold">Legal</AccordionTrigger>
              <AccordionContent>
                {legalLinks}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        {/* Desktop View: Grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-muted-foreground text-sm">
              Your Nearby Property Marketplace
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold">Company</h4>
            {companyLinks}
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold">Quick Links</h4>
            {quickLinks}
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold">Legal</h4>
            {legalLinks}
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Nestil. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
