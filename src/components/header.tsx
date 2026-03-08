
'use client';

import Link from 'next/link';
import { Menu, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LocationSelector } from './location-selector';
import { UserNav } from './user-nav';

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const navLinks = [
    { href: '/properties?transaction=Rent', label: 'Rent' },
    { href: '/properties?transaction=Sale', label: 'Buy' },
  ];
  
  const mobileNavLinks = [...navLinks, { href: '/post-property', label: 'Post Property Free' }];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        
        <div className="ml-4 hidden md:flex">
          <LocationSelector />
        </div>

        <nav className="ml-6 hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === '/properties' && searchParams.get('transaction') === link.label ? "text-foreground font-semibold" : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="accent" asChild className="hidden sm:inline-flex">
            <Link href="/post-property">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post Property Free
            </Link>
          </Button>
          
          <UserNav />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Logo />
               <div className="mt-8">
                <LocationSelector className="w-full justify-between p-2 hover:bg-accent rounded-md" />
              </div>
              <div className="flex flex-col space-y-4 mt-4">
                {mobileNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium text-foreground/80 hover:text-foreground p-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
