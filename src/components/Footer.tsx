'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight, Instagram, Facebook } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/context/TranslationContext';

export default function Footer() {
  const { t } = useTranslation();
  const { cartCount, cartTotal } = useCart();
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="py-20 border-t border-border bg-white relative">
      <div className="container mx-auto px-4 text-center">
        {/* Dynamic Cart Action for Easy Navigation */}
        {cartCount > 0 && (
          <div className="mb-16 p-8 rounded-[3rem] bg-primary/5 border-2 border-dashed border-primary/20 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left">
                <div className="flex items-center gap-2 text-primary font-black text-sm mb-2 uppercase tracking-widest">
                  <ShoppingBag size={18} />
                  <span>{t('footer.items_in_basket')}</span>
                </div>
                <h3 className="text-3xl font-black text-foreground">
                  {cartCount === 1 
                    ? t('footer.basket_title_single') 
                    : t('footer.basket_title_plural').replace('{count}', String(cartCount))
                  }
                </h3>
                <p className="text-muted-foreground font-medium mt-1 text-lg">{t('footer.basket_value')} <span className="text-primary font-black">₹{cartTotal}</span></p>
              </div>
              <Link 
                href="/cart"
                className="w-full md:w-auto px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 transform hover:scale-105"
              >
                {t('footer.checkout')}
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-border bg-[#1a4d36]">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <span className="text-2xl font-black uppercase tracking-tighter text-foreground">FARMERS FACTORY</span>
        </div>
        
        <p className="text-muted-foreground mb-8 max-w-md mx-auto font-medium">
          {t('footer.desc')}
        </p>

        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">
          <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">{t('nav.products')}</Link>
          <Link href="/cart" className="text-muted-foreground hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">{t('footer.items_in_basket')}</Link>
          <Link href="/streams" className="text-muted-foreground hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">{t('streams.title')}</Link>
          <Link href="/products?category=Vegetables" className="text-muted-foreground hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest">{t('products.vegetables')}</Link>
          <Link href="/delivery" className="hover:text-primary transition-colors">{t('nav.about')}</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">{t('nav.contact')}</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">{t('privacy.title')}</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">{t('terms.title')}</Link>
        </div>

        {/* Social Media Links */}
        <div className="flex justify-center gap-6 mt-12">
          <a href="https://www.instagram.com/the_farmers_factory/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-muted-foreground hover:bg-[#E1306C] hover:text-white transition-all hover:scale-110 shadow-sm border border-border">
            <Instagram size={20} />
          </a>
          <a href="https://www.facebook.com/profile.php?id=100068904620757" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-muted-foreground hover:bg-[#1877F2] hover:text-white transition-all hover:scale-110 shadow-sm border border-border">
            <Facebook size={20} />
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-muted/30">
          <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} FARMERS FACTORY. {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
