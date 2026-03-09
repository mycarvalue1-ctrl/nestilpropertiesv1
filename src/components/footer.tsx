
import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Youtube, Building2 } from 'lucide-react';

const NavLogo = () => (
    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
        <Building2 className="h-7 w-7" />
        <span>Nestil</span>
    </Link>
);

const SocialIcon = ({ children, href }: { children: React.ReactNode; href: string; }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary">
        {children}
    </a>
)

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 md:pt-16">
        <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10 pb-12 border-b border-slate-200">
                <div className="lg:col-span-1 flex flex-col items-center text-center lg:items-start lg:text-left gap-3.5">
                    <NavLogo />
                    <p className="text-sm text-slate-500 leading-7 max-w-xs">
                        Andhra Pradesh's most trusted property marketplace. Buy, sell, rent with complete confidence across all 26 districts.
                    </p>
                    <div className="flex gap-2 mt-2">
                        <SocialIcon href="#"><Twitter size={16} /></SocialIcon>
                        <SocialIcon href="#"><Facebook size={16} /></SocialIcon>
                        <SocialIcon href="#"><Linkedin size={16} /></SocialIcon>
                        <SocialIcon href="#"><Youtube size={16} /></SocialIcon>
                    </div>
                </div>
                <div className="lg:col-span-3 grid grid-cols-3 gap-8">
                    <div>
                        <h4 className="text-xs font-bold tracking-[1.5px] uppercase text-slate-500 mb-5">Properties</h4>
                        <ul className="flex flex-col gap-3">
                            <li><Link href="/properties?transaction=Sale" className="text-sm text-slate-500 hover:text-primary">For Sale</Link></li>
                            <li><Link href="/properties?transaction=Rent" className="text-sm text-slate-500 hover:text-primary">For Rent</Link></li>
                            <li><Link href="/properties" className="text-sm text-slate-500 hover:text-primary">New Projects</Link></li>
                            <li><Link href="/properties?type=Commercial" className="text-sm text-slate-500 hover:text-primary">Commercial</Link></li>
                            <li><Link href="/properties?type=Plot" className="text-sm text-slate-500 hover:text-primary">Plots & Land</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold tracking-[1.5px] uppercase text-slate-500 mb-5">Popular Cities</h4>
                        <ul className="flex flex-col gap-3">
                            <li><Link href="/properties?keyword=Visakhapatnam" className="text-sm text-slate-500 hover:text-primary">Visakhapatnam</Link></li>
                            <li><Link href="/properties?keyword=Vijayawada" className="text-sm text-slate-500 hover:text-primary">Vijayawada</Link></li>
                            <li><Link href="/properties?keyword=Guntur" className="text-sm text-slate-500 hover:text-primary">Guntur</Link></li>
                            <li><Link href="/properties?keyword=Tirupati" className="text-sm text-slate-500 hover:text-primary">Tirupati</Link></li>
                            <li><Link href="/properties" className="text-sm text-slate-500 hover:text-primary">All Cities →</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold tracking-[1.5px] uppercase text-slate-500 mb-5">Company</h4>
                        <ul className="flex flex-col gap-3">
                            <li><Link href="/about" className="text-sm text-slate-500 hover:text-primary">About</Link></li>
                            <li><Link href="/agents" className="text-sm text-slate-500 hover:text-primary">Agents</Link></li>
                            <li><Link href="/post-property" className="text-sm text-slate-500 hover:text-primary">List Property</Link></li>
                            <li><Link href="/contact" className="text-sm text-slate-500 hover:text-primary">Contact</Link></li>
                            <li><Link href="/privacy-policy" className="text-sm text-slate-500 hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="/terms-of-service" className="text-sm text-slate-500 hover:text-primary">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center py-5 text-sm text-slate-500 gap-4">
                <span>© 2025 Nestil Technologies Pvt. Ltd. — Andhra Pradesh, India</span>
                <span>RERA Registered · Made with ♥ in AP</span>
            </div>
        </div>
    </footer>
  );
}
