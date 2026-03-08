'use client';

import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';

const NavLogo = () => (
    <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold">
        Nest<span className="text-primary">il</span>
    </Link>
);

const SocialIcon = ({ children }: { children: React.ReactNode }) => (
    <a href="#" className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-sm cursor-pointer transition-colors hover:border-primary hover:bg-primary/5">
        {children}
    </a>
)

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 md:pt-20">
        <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-14 border-b border-slate-200">
                <div className="flex flex-col gap-3.5">
                    <NavLogo />
                    <p className="text-sm text-slate-500 leading-7 max-w-[280px]">
                        Andhra Pradesh's most trusted property marketplace. Buy, sell, rent with complete confidence across all 26 districts.
                    </p>
                    <div className="flex gap-2 mt-2">
                        <SocialIcon><Twitter size={16} /></SocialIcon>
                        <SocialIcon><Facebook size={16} /></SocialIcon>
                        <SocialIcon><Linkedin size={16} /></SocialIcon>
                        <SocialIcon><Youtube size={16} /></SocialIcon>
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold tracking-[1.5px] uppercase text-slate-500 mb-5">Properties</h4>
                    <ul className="flex flex-col gap-3">
                        <li><Link href="/properties?transaction=Sale" className="text-sm text-slate-500 hover:text-primary">Buy</Link></li>
                        <li><Link href="/properties?transaction=Rent" className="text-sm text-slate-500 hover:text-primary">Rent</Link></li>
                        <li><Link href="/properties" className="text-sm text-slate-500 hover:text-primary">New Projects</Link></li>
                        <li><Link href="/properties?type=Commercial" className="text-sm text-slate-500 hover:text-primary">Commercial</Link></li>
                        <li><Link href="/properties?type=Plot" className="text-sm text-slate-500 hover:text-primary">Plots & Land</Link></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="text-xs font-bold tracking-[1.5px] uppercase text-slate-500 mb-5">Cities</h4>
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
                    </ul>
                </div>
            </div>
            <div className="flex justify-between items-center py-5 text-sm text-slate-500">
                <span>© 2025 Nestil Technologies Pvt. Ltd. — Andhra Pradesh, India</span>
                <span>RERA Registered · Made with ♥ in AP</span>
            </div>
        </div>
    </footer>
  );
}
