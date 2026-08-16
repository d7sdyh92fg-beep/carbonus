import type { ReactNode } from 'react';
import { ArrowLeft, Check, Headphones, LockKeyhole, ShieldCheck } from 'lucide-react';
import headerLogo from '@/assets/brand-header-car-silhouette.png';
import './reservation-flow.css';

interface ReservationFlowShellProps {
  step: 2 | 3 | 4;
  title: string;
  subtitle: string;
  totalLabel: string;
  total: number;
  backLabel: string;
  onBack: () => void;
  language: string;
  children: ReactNode;
}

export function ReservationFlowShell({ step, title, subtitle, totalLabel, total, backLabel, onBack, language, children }: ReservationFlowShellProps) {
  const steps = language === 'en'
    ? ['Dates', 'Options', 'Terms', 'Confirmation']
    : ['Datos', 'Priedai', 'Sąlygos', 'Patvirtinimas'];
  const support = language === 'en' ? 'Need help?' : 'Reikia pagalbos?';
  const secure = language === 'en' ? 'Secure booking' : 'Saugi rezervacija';
  const stepLabel = language === 'en' ? `Step ${step} of 4` : `${step} žingsnis iš 4`;

  return (
    <div className="reservation-flow min-h-screen">
      <header className="reservation-flow-topbar">
        <div className="reservation-flow-topbar-inner">
          <a href={language === 'en' ? '/' : '/'} aria-label="Carbonus pradinis puslapis" className="reservation-flow-logo-link">
            <img src={headerLogo} alt="Carbonus" className="reservation-flow-logo" />
          </a>
          <div className="reservation-flow-topbar-actions">
            <span className="reservation-flow-secure"><LockKeyhole className="h-3.5 w-3.5" /> {secure}</span>
            <a href="tel:+37069818781" className="reservation-flow-support"><Headphones className="h-4 w-4" /><span><small>{support}</small><strong>+370 698 18 781</strong></span></a>
          </div>
        </div>
      </header>

      <main className="reservation-flow-main">
        <nav className="reservation-flow-steps" aria-label={language === 'en' ? 'Booking progress' : 'Rezervacijos eiga'}>
          {steps.map((label, index) => {
            const number = index + 1;
            const completed = number < step;
            const active = number === step;
            return (
              <div key={label} className={`reservation-flow-step ${completed ? 'is-complete' : ''} ${active ? 'is-active' : ''}`}>
                <span className="reservation-flow-step-number">{completed ? <Check className="h-3.5 w-3.5" /> : number}</span>
                <span className="reservation-flow-step-label">{label}</span>
                {index < steps.length - 1 && <i className="reservation-flow-step-line" />}
              </div>
            );
          })}
        </nav>

        <section className="reservation-flow-hero">
          <div className="reservation-flow-hero-copy">
            <button type="button" onClick={onBack} className="reservation-flow-back"><ArrowLeft className="h-4 w-4" /> {backLabel}</button>
            <p className="reservation-flow-kicker"><ShieldCheck className="h-4 w-4" /> {stepLabel}</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="reservation-flow-total">
            <span>{totalLabel}</span>
            <strong>{total.toFixed(2)} €</strong>
            <small>{language === 'en' ? 'Transparent final price' : 'Aiški galutinė kaina'}</small>
          </div>
        </section>

        <div className="reservation-flow-content">{children}</div>

        <div className="reservation-flow-trust">
          <span><ShieldCheck className="h-4 w-4" /> {language === 'en' ? 'Encrypted payment' : 'Saugus mokėjimas'}</span>
          <span><Check className="h-4 w-4" /> {language === 'en' ? 'Clear rental terms' : 'Aiškios nuomos sąlygos'}</span>
          <span><Headphones className="h-4 w-4" /> {language === 'en' ? 'Personal support' : 'Asmeninė pagalba'}</span>
        </div>
      </main>
    </div>
  );
}
