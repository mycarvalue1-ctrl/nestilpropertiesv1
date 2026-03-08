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
  const propertyLinks = (
    <div className="flex flex-col gap-2 text-sm">
      <Link href="/properties?transaction=Sale&keyword=Visakhapatnam" className="text-muted-foreground hover:text-primary">Buy in Vizag</Link>
      <Link href="/properties?transaction=Rent&keyword=Vijayawada" className="text-muted-foreground hover:text-primary">Rent in Vijayawada</Link>
      <Link href="/properties?keyword=New+Project" className="text-muted-foreground hover:text-primary">New Projects</Link>
      <Link href="/properties?type=Commercial" className="text-muted-foreground hover:text-primary">Commercial</Link>
      <Link href="/properties?type=Plot" className="text-muted-foreground hover:text-primary">Plots & Land</Link>
    </div>
  );

  const cityLinks = (
    <div className="flex flex-col gap-2 text-sm">
        <Link href="/properties?keyword=Visakhapatnam" className="text-muted-foreground hover:text-primary">Visakhapatnam</Link>
        <Link href="/properties?keyword=Vijayawada" className="text-muted-foreground hover:text-primary">Vijayawada</Link>
        <Link href="/properties?keyword=Guntur" className="text-muted-foreground hover:text-primary">Guntur</Link>
        <Link href="/properties?keyword=Tirupati" className="text-muted-foreground hover:text-primary">Tirupati</Link>
        <Link href="/properties" className="text-muted-foreground hover:text-primary">All Cities →</Link>
    </div>
  );

  const companyLinks = (
     <div className="flex flex-col gap-2 text-sm">
      <Link href="/about" className="text-muted-foreground hover:text-primary">About Nestil</Link>
      <Link href="/contact" className="text-muted-foreground hover:text-primary">Careers</Link>
      <Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link>
      <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link>
      <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">Terms of Use</Link>
    </div>
  );

  return (
    <footer className="border-t bg-card">
      <div className="container py-12">

        {/* Mobile View: Accordion */}
        <div className="md:hidden">
           <div className="mb-8">
            <Logo />
            <p className="text-muted-foreground text-sm mt-4 max-w-xs">
              Andhra Pradesh's most trusted property marketplace. Find, buy, rent or sell with complete confidence.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="properties">
              <AccordionTrigger className="font-semibold uppercase">Properties</AccordionTrigger>
              <AccordionContent>
                {propertyLinks}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cities">
              <AccordionTrigger className="font-semibold uppercase">Cities</AccordionTrigger>
              <AccordionContent>
                {cityLinks}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="company">
              <AccordionTrigger className="font-semibold uppercase">Company</AccordionTrigger>
              <AccordionContent>
                {companyLinks}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        {/* Desktop View: Grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-muted-foreground text-sm max-w-xs">
              Andhra Pradesh's most trusted property marketplace. Find, buy, rent or sell with complete confidence.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold uppercase">Properties</h4>
            {propertyLinks}
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold uppercase">Cities</h4>
            {cityLinks}
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold uppercase">Company</h4>
            {companyLinks}
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-center md:text-left">
                    © 2025 Nestil Technologies Pvt. Ltd. — Andhra Pradesh, India
                </p>
                <p className="text-center md:text-right">
                    RERA Registered · Trusted by 8,200+ families
                </p>
            </div>
        </div>
      </div>
    </footer>
  );
}
