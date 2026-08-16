import type { ReactNode } from 'react';
import { Headphones, LockKeyhole, ShieldCheck } from 'lucide-react';
import headerLogo from '@/assets/brand-header-car-silhouette.png';
import './reservation-flow.css';

interface ReservationResultLayoutProps {
  eyebrow: string;
  children: ReactNode;
  language: 'lt' | 'en';
}

export function ReservationResultLayout({ eyebrow, children, language }: ReservationResultLayoutProps) {
  return (
    <main className="reservation-result-page">
      <div className="reservation-result-shell">
        <div className="reservation-result-head">
          <a href="/" aria-label="Carbonus">
            <img src={headerLogo} alt="Carbonus" className="reservation-result-logo" />
          </a>
          <div className="reservation-result-security">
            <LockKeyhole className="h-4 w-4" />
            <span>{language === 'en' ? 'Secure booking environment' : 'Saugi rezervacijos aplinka'}</span>
          </div>
        </div>

        <section className="reservation-result-card">
          <div className="reservation-result-card-top" />
          <div className="reservation-result-eyebrow"><ShieldCheck className="h-4 w-4" /> {eyebrow}</div>
          {children}
        </section>

        <a className="reservation-result-help" href="tel:+37069818781">
          <Headphones className="h-4 w-4" />
          <span>{language === 'en' ? 'Need help? +370 698 18 781' : 'Reikia pagalbos? +370 698 18 781'}</span>
        </a>
      </div>
    </main>
  );
}
