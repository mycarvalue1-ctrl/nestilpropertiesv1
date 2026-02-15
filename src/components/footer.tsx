import { Logo } from '@/components/logo';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-muted-foreground text-sm">
              Your Nearby Property Marketplace
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold">Company</h4>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold">Quick Links</h4>
            <Link href="/properties?status=For+Rent" className="text-sm text-muted-foreground hover:text-primary">Rent</Link>
            <Link href="/properties?status=For+Sale" className="text-sm text-muted-foreground hover:text-primary">Buy</Link>
            <Link href="/post-property" className="text-sm text-muted-foreground hover:text-primary">Sell</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold">Legal</h4>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
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
