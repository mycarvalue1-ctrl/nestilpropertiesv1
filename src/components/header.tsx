'use client';

import Link from 'next/link';
import { Menu, Search, User, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LocationSelector } from './location-selector';
import { Input } from './ui/input';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';

const navLinks = [
  { href: '/properties?status=For+Rent', label: 'Rent' },
  { href: '/properties?status=For+Sale', label: 'Buy' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { user: currentUser, isUserLoading } = useUser();
  const auth = useAuth();
  
  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    router.push('/');
  };

  const adminUid = 'IultEIQMgAUPwoqAEWX7ZIunjNB3';
  const isAdmin = currentUser?.uid === adminUid;

  // Create a specific list for the mobile menu to avoid duplicate keys.
  const mobileNavLinks = [...navLinks];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        
        <div className="ml-4 hidden md:flex">
          <LocationSelector />
        </div>
        
        <div className="ml-6 hidden lg:flex items-center w-full max-w-md">
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search for properties..." className="pl-10"/>
            </div>
        </div>

        <nav className="ml-auto hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith(link.href.split('?')[0]) ? "text-foreground font-semibold" : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>

          {/* Post Property button is removed */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isUserLoading ? (
                <DropdownMenuLabel>Loading...</DropdownMenuLabel>
              ) : currentUser ? (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/dashboard/my-properties">My Properties</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/dashboard/profile">Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/favorites">Favorites</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/buy-credits" className="flex items-center gap-2"><Coins /> Buy Credits</Link></DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild><Link href="/admin">Admin Panel</Link></DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>Login/Signup Disabled</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Search Properties</DialogTitle>
                </DialogHeader>
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search for properties..." className="pl-10"/>
                </div>
              </DialogContent>
            </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
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
                <div className="border-t pt-4 mt-4">
                    <p className="p-2 text-lg font-medium text-foreground/60">Login/Signup Disabled</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
