import { Building2 } from 'lucide-react';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-xl font-bold text-primary ${className}`}>
      <Building2 className="h-6 w-6" />
      <span>Nestil</span>
    </Link>
  );
}
