
'use client';

import { Logo } from '@/components/logo';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';

export function Footer() {
  const { t } = useTranslation();

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
            <h4 className="font-semibold">{t('company')}</h4>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">{t('about_us')}</Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">{t('contact')}</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold">{t('quick_links')}</h4>
            <Link href="/properties?status=For+Rent" className="text-sm text-muted-foreground hover:text-primary">{t('rent')}</Link>
            <Link href="/properties?status=For+Sale" className="text-sm text-muted-foreground hover:text-primary">{t('buy')}</Link>
            <Link href="/post-property" className="text-sm text-muted-foreground hover:text-primary">{t('sell')}</Link>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="font-semibold">{t('legal')}</h4>
            <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">{t('privacy_policy')}</Link>
            <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary">{t('terms_of_service')}</Link>
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

    