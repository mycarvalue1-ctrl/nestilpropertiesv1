'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Menu, Building2 } from 'lucide-react';
import { UserNav } from './user-nav';
import { LocationSelector } from './location-selector';
import { useState } from 'react';

const NavLogo = () => (
    <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
        <Building2 className="h-7 w-7 text-primary" />
        <span>Nestil</span>
    </Link>
)

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/properties', label: 'Properties' },
    { href: '/agents', label: 'Agents' },
    { href: '/about', label: 'About' },
  ];

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-[68px] px-4 md:px-10 bg-white/90 backdrop-blur-2xl border-b">
        {/* Left Side: Logo and Desktop Nav */}
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <NavLogo />
                <LocationSelector className="md:hidden" />
            </div>
            <nav className="hidden md:flex items-center gap-4">
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            'text-sm font-medium transition-colors hover:text-primary',
                            pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                        )}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>
        </div>

        {/* Right Side: Actions and Mobile Menu */}
        <div className="flex items-center gap-2">
            <LocationSelector className="hidden md:flex" />
            <Button asChild className="hidden md:inline-flex !font-bold text-[13px] bg-primary hover:bg-blue-700 hover:-translate-y-px shadow-lg shadow-blue-500/10">
                <Link href="/post-property">+ List Property</Link>
            </Button>
            <UserNav />
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-4 mt-8">
                        {navLinks.map(link => (
                             <Link 
                                key={link.href} 
                                href={link.href} 
                                onClick={handleMobileLinkClick}
                                className={cn(
                                "px-4 py-2 rounded-lg text-lg font-medium text-slate-600 transition-colors",
                                pathname === link.href ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100 hover:text-slate-900"
                            )}>
                                {link.label}
                            </Link>
                        ))}
                         <div className="border-t pt-4 mt-4 space-y-2">
                             <Button asChild className="w-full justify-start">
                                <Link href="/post-property" onClick={handleMobileLinkClick}>+ List Property</Link>
                             </Button>
                         </div>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    </header>
  );
}
