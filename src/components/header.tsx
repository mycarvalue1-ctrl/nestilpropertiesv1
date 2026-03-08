'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';

const NavLogo = () => (
    <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
        Nest<span className="text-primary">il</span>
    </Link>
)

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/properties', label: 'Properties' },
    { href: '/agents', label: 'Agents' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-[68px] px-4 md:px-10 bg-white/90 backdrop-blur-2xl border-b">
        <NavLogo />
        <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map(link => (
                <Link key={link.href} href={link.href} className={cn(
                    "px-3.5 py-[7px] rounded-lg text-sm font-medium text-slate-600 transition-colors",
                    pathname === link.href ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100 hover:text-slate-900"
                )}>
                    {link.label}
                </Link>
            ))}
        </nav>
        <div className="flex items-center gap-2.5">
            <Button variant="ghost" asChild className="hidden md:inline-flex border border-slate-700/20 text-slate-600 !font-semibold text-[13px] hover:border-primary hover:text-primary hover:bg-primary/5">
                <Link href="/contact">Contact</Link>
            </Button>
             <Button asChild className="hidden md:inline-flex !font-bold text-[13px] bg-primary hover:bg-blue-700 hover:-translate-y-px shadow-lg shadow-blue-500/10">
                <Link href="/post-property">+ List Property</Link>
            </Button>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <nav className="flex flex-col gap-4 mt-8">
                        {navLinks.map(link => (
                             <Link key={link.href} href={link.href} className={cn(
                                "px-4 py-2 rounded-lg text-lg font-medium text-slate-600 transition-colors",
                                pathname === link.href ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100 hover:text-slate-900"
                            )}>
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    </header>
  );
}
