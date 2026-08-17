import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, FileText, CreditCard, Tag } from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { lt, enUS } from 'date-fns/locale';
import { useTranslations } from '@/hooks/use-translations';
import { ReservationFlowShell } from '@/components/booking/ReservationFlowShell';
import { getRoute } from '@/utils/routes';

export default function ReservationReview() {
  const navigate = useNavigate();
  const { bookingData, getTotalPrice, clearBooking } = useBooking();
  const { toast } = useToast();
  const { t, language } = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'pay_at_counter'>('online');
  const [promoInput, setPromoInput] = useState('');
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(null);

  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });

  const [isCorporate, setIsCorporate] = useState(false);
  const [corporateData, setCorporateData] = useState({
    companyName: '',
    companyCode: '',
    vatCode: '',
    representativeName: '',
    representativePhone: '',
    representativeEmail: '',
  });

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    if (!bookingData) {
      navigate(getRoute('cars', language));
    }
  }, [bookingData, navigate, language]);

  if (!bookingData) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoChecking(true);
    setPromoError(null);
    try {
      const { data, error } = await supabase.rpc('validate_promo_code' as any, {
        p_code: code,
        p_rental_days: bookingData.rentalDays,
      });
      if (error) throw error;
      const res = data as any;
      if (res?.valid) {
        setAppliedPromo({ code: res.code, percent: Number(res.discount_percent) });
        setPromoError(null);
        toast({
          title: language === 'lt' ? 'Nuolaidos kodas pritaikytas' : 'Promo code applied',
          description: language === 'lt'
            ? `-${Number(res.discount_percent)}% nuomos kainai`
            : `-${Number(res.discount_percent)}% off the rental price`,
        });
      } else {
        setAppliedPromo(null);
        const reason = res?.reason;
        setPromoError(
          reason === 'MIN_DAYS'
            ? (language === 'lt'
                ? `Kodas galioja tik nuo ${res.min_rental_days} parų nuomos.`
                : `Code requires a minimum rental of ${res.min_rental_days} days.`)
            : reason === 'EXPIRED'
              ? (language === 'lt' ? 'Kodo galiojimas pasibaigęs.' : 'This code has expired.')
              : (language === 'lt' ? 'Neteisingas nuolaidos kodas.' : 'Invalid promo code.')
        );
      }
    } catch (e: any) {
      setAppliedPromo(null);
      setPromoError(language === 'lt' ? 'Nepavyko patikrinti kodo.' : 'Could not verify the code.');
    } finally {
      setPromoChecking(false);
    }
  };


  const handleCorporateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCorporateData(prev => ({ ...prev, [name]: value }));
  };

  const processStripePayment = async (reservationId: string, amount: number, paymentType: 'full' | 'advance') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
        body: {
          reservationId,
          amount,
          currency: 'eur',
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          carName: bookingData.carName,
          carId: bookingData.carId,
          paymentType
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone format
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3,9}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: t('review.errorTitle'),
        description: t('commonMessages.invalidPhoneFormat'),
        variant: 'destructive',
      });
      return;
    }

    // Validate corporate fields if corporate booking
    if (isCorporate) {
      if (!corporateData.companyName || !corporateData.companyCode) {
        toast({
          title: t('review.errorTitle'),
          description: t('commonMessages.corporateFieldsRequired'),
          variant: 'destructive',
        });
        return;
      }
      
      // Validate company code format (Lithuanian format: 9 digits)
      if (!/^\d{9}$/.test(corporateData.companyCode)) {
        toast({
          title: t('review.errorTitle'),
          description: t('commonMessages.invalidCompanyCode'),
          variant: 'destructive',
        });
        return;
      }
    }
    
    setIsSubmitting(true);

    try {
      // Use RPC to create or get customer (bypasses RLS for public users)
      const { data: customerId, error: customerError } = await supabase.rpc('create_or_get_customer', {
        p_email: formData.email.trim(),
        p_first_name: formData.firstName.trim(),
        p_last_name: formData.lastName.trim(),
        p_phone: formData.phone.trim(),
        p_address: formData.address?.trim() || null,
      });

      if (customerError) {
        console.error('Customer creation error:', customerError);
        throw new Error(`Failed to create customer: ${customerError.message}`);
      }

      if (!customerId) {
        throw new Error('No customer ID returned from database');
      }

      // Update corporate information if applicable
      if (isCorporate) {
        const { error: corporateError } = await supabase
          .from('customers')
          .update({
            is_corporate: true,
            company_name: corporateData.companyName,
            company_code: corporateData.companyCode,
            vat_code: corporateData.vatCode || null,
            representative_name: corporateData.representativeName || null,
            representative_phone: corporateData.representativePhone || null,
            representative_email: corporateData.representativeEmail || null,
          })
          .eq('id', customerId);

        if (corporateError) {
          console.error('Corporate data update error:', corporateError);
          // Don't throw - reservation can continue even if corporate update fails
        }
      }

      // Build pricing notes (informational only — server computes totals)
      const pricingNotes = (() => {
        const notes: string[] = [];
        if (bookingData.selectedPackage) {
          notes.push(`📦 ${bookingData.selectedPackage.name}: ${bookingData.selectedPackage.priceDisplay} €`);
        }
        if (bookingData.insurance) {
          notes.push(t('review.pricingNoteInsurance')
            .replace('{title}', bookingData.insurance.title)
            .replace('{pricePerDay}', bookingData.insurance.pricePerDay.toString())
            .replace('{excess}', bookingData.insurance.excess.toString())
          );
        }
        if (bookingData.services && bookingData.services.length > 0) {
          const servicesList = bookingData.services
            .map(s => `${s.title} (€${s.price}${s.unit === 'perDay' ? t('review.perDay') : ''})`)
            .join(', ');
          notes.push(t('review.pricingNoteServices').replace('{services}', servicesList));
        }
        return notes.length > 0 ? notes.join('. ') : null;
      })();

      // Map selected package to server pricing_extras code
      const packageCode = bookingData.selectedPackage
        ? (bookingData.selectedPackage.type === 'wedding' ? 'package-wedding' : 'package-romantic')
        : null;

      // Server computes ALL prices from cars + pricing_extras. Frontend
      // only passes selection codes; never numeric prices or totals.
      const { data: rpcData, error: reservationError } = await supabase.rpc('create_reservation', {
        p_customer_id: customerId,
        p_car_id: bookingData.carId,
        p_start_date: bookingData.startDate,
        p_end_date: bookingData.endDate,
        p_pickup_time: bookingData.pickupTime || '10:00',
        p_return_time: bookingData.returnTime || '10:00',
        p_insurance_code: bookingData.insurance?.id ?? null,
        p_service_codes: (bookingData.services || []).map(s => s.id),
        p_package_code: packageCode,
        p_delivery_fee: Math.min(200, Math.max(0, Math.round(bookingData.delivery?.fee || 0))),
        p_payment_method: paymentMethod,
        p_payment_provider: 'stripe',
        p_status: 'awaiting_payment',
        p_language: language,
        p_pricing_notes: pricingNotes,
        p_promo_code: appliedPromo?.code ?? null,
        p_delivery_address: bookingData.delivery?.pickupAddress ?? null,
        p_return_address: bookingData.delivery?.returnAddress ?? null,

      } as any);

      if (reservationError || !rpcData) {
        throw reservationError || new Error('No reservation returned');
      }

      const snapshot = rpcData as {
        id: string;
        total_amount: number;
        daily_rate: number;
        deposit_amount: number;
      };
      const reservationId = snapshot.id;
      const totalAmount = Number(snapshot.total_amount);
      const dailyRate = Number(snapshot.daily_rate);
      const paymentAmount = paymentMethod === 'pay_at_counter' ? dailyRate : totalAmount;

      // Process Stripe payment
      const stripeAmount = paymentMethod === 'pay_at_counter' ? paymentAmount : totalAmount;

      // Send notification email BEFORE redirecting to Stripe (otherwise redirect cancels it)
      try {
        await supabase.functions.invoke('send-booking-email', {
          body: {
            customerName: `${formData.firstName} ${formData.lastName}`,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            carName: bookingData.carName,
            startDate: format(new Date(bookingData.startDate), 'yyyy-MM-dd'),
            endDate: format(new Date(bookingData.endDate), 'yyyy-MM-dd'),
            pickupTime: bookingData.pickupTime || '10:00',
            returnTime: bookingData.returnTime || '10:00',
            rentalDays: bookingData.rentalDays,
            totalAmount: totalAmount,
            depositAmount: bookingData.depositAmount || 200,
            advancePayment: stripeAmount,
            paymentMethod: paymentMethod,
            language: language,
            packageName: bookingData.selectedPackage?.name || undefined,
            packagePrice: bookingData.selectedPackage?.priceDisplay || undefined,
            deliveryAddress: bookingData.delivery?.pickupAddress || undefined,
            returnAddress: bookingData.delivery?.returnAddress || undefined,
            deliveryFee: bookingData.delivery?.fee || 0,
          }
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        toast({
          title: t('commonMessages.emailWarningTitle'),
          description: t('commonMessages.emailWarningDescription'),
          variant: 'default',
        });
      }

      await processStripePayment(reservationId, stripeAmount, paymentMethod === 'pay_at_counter' ? 'advance' : 'full');
    } catch (error: any) {
      console.error('Booking error:', error);
      const msg = error?.message || '';
      const isConflict = msg.includes('DATE_CONFLICT') || msg.includes('DATE_BLOCKED') || msg.includes('reservations_no_overlap');
      if (isConflict) {
        toast({
          title: language === 'lt' ? 'Datos jau užimtos' : 'Dates no longer available',
          description: language === 'lt'
            ? 'Deja, pasirinktos datos ką tik tapo neprieinamos. Prašome pasirinkti kitą laikotarpį.'
            : 'The selected dates just became unavailable. Please pick a different period.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('review.errorTitle'),
          description: t('review.errorDescription').replace('{error}', msg),
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const insuranceTotal = bookingData.insurance ? bookingData.insurance.pricePerDay * bookingData.rentalDays : 0;
  const servicesTotal = bookingData.services.reduce((sum, service) => {
    return sum + (service.unit === 'perDay' ? service.price * bookingData.rentalDays : service.price);
  }, 0);
  const deliveryFee = bookingData.delivery?.fee || 0;
  const discountAmount = appliedPromo
    ? Math.round(bookingData.basePrice * appliedPromo.percent) / 100
    : 0;
  const totalPrice = Math.max(0, bookingData.basePrice - discountAmount) + insuranceTotal + servicesTotal + deliveryFee;

  const dailyRate = bookingData.basePrice / bookingData.rentalDays;
  const displayAmount = paymentMethod === 'pay_at_counter' ? dailyRate : totalPrice;
  const dateLocale = language === 'en' ? enUS : lt;

  return (
    <ReservationFlowShell
      step={4}
      title={t('review.reviewTitle')}
      subtitle={t('review.reviewSubtitle')}
      totalLabel={paymentMethod === 'pay_at_counter' ? t('review.reservationFee') : t('review.totalToPay')}
      total={displayAmount}
      backLabel={t('review.back')}
      onBack={() => navigate(-1)}
      language={language}
    >
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">


            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('review.personalInfo.title')}
                </h3>
                
                {/* Corporate checkbox */}
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="corporate"
                    checked={isCorporate}
                    onCheckedChange={(checked) => setIsCorporate(checked as boolean)}
                  />
                  <Label htmlFor="corporate">{t('review.corporateLabel')}</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t('review.personalInfo.firstName')}</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t('review.personalInfo.lastName')}</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('review.personalInfo.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">{t('review.personalInfo.phone')}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      pattern="^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3,9}$"
                      placeholder="+370 XXX XXXXX"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('commonMessages.phoneFormatHelper')}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="address">{t('review.personalInfo.residentialAddress')}</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder={t('review.personalInfo.residentialAddressPlaceholder')}
                    />
                  </div>
                </div>
                
                {/* Corporate Information - shown when checkbox is checked */}
                {isCorporate && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h4 className="font-semibold text-base mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {t('review.corporateInfo.title')}
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="companyName">
                        {t('review.corporateInfo.name')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={corporateData.companyName}
                        onChange={handleCorporateChange}
                        required={isCorporate}
                        className={isCorporate && !corporateData.companyName ? 'border-destructive' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyCode">
                        {t('review.corporateInfo.code')} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="companyCode"
                        name="companyCode"
                        value={corporateData.companyCode}
                        onChange={handleCorporateChange}
                        required={isCorporate}
                        pattern="\d{9}"
                        placeholder="123456789"
                        className={isCorporate && !corporateData.companyCode ? 'border-destructive' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vatCode">{t('review.corporateInfo.vat')}</Label>
                      <Input
                        id="vatCode"
                        name="vatCode"
                        value={corporateData.vatCode}
                        onChange={handleCorporateChange}
                      />
                    </div>
                  </div>
                    </div>
                  </>
                )}
              </Card>

              {/* Promo code */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  {language === 'lt' ? 'Nuolaidos kodas' : 'Promo code'}
                </h3>
                {appliedPromo ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <div>
                      <p className="font-semibold text-primary">{appliedPromo.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {language === 'lt'
                          ? `Pritaikyta −${appliedPromo.percent}% nuomos kainai`
                          : `Applied −${appliedPromo.percent}% off the rental price`}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => { setAppliedPromo(null); setPromoInput(''); }}
                    >
                      {language === 'lt' ? 'Pašalinti' : 'Remove'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(null); }}
                      placeholder={language === 'lt' ? 'Įveskite nuolaidos kodą' : 'Enter promo code'}
                      className="uppercase"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleApplyPromo}
                      disabled={promoChecking || !promoInput.trim()}
                    >
                      {promoChecking
                        ? (language === 'lt' ? 'Tikrinama...' : 'Checking...')
                        : (language === 'lt' ? 'Pritaikyti' : 'Apply')}
                    </Button>
                  </div>
                )}
                {promoError && (
                  <p className="text-sm text-destructive mt-2">{promoError}</p>
                )}
              </Card>



              {/* Payment Method */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('review.paymentMethod.title')}
                </h3>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'online' | 'pay_at_counter')}>
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="cursor-pointer">
                      <span className="font-medium">{t('review.onlinePayment')}</span>
                      <span className="text-sm text-muted-foreground block">
                        {t('review.paymentDescription')}
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pay_at_counter" id="pay_at_counter" />
                    <Label htmlFor="pay_at_counter" className="cursor-pointer">
                      <span className="font-medium">{t('review.payAtCounter')}</span>
                      <span className="text-sm text-muted-foreground block">
                        {t('review.reservationFeeAmount').replace('{amount}', (bookingData.basePrice / bookingData.rentalDays).toFixed(2))}
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </Card>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('review.processing') : t('review.payButton').replace('{amount}', displayAmount.toFixed(2))}
              </Button>
            </form>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">{t('review.summary.title')}</h3>
              
              {/* Car Image */}
              {bookingData.carImage && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={bookingData.carImage} 
                    alt={bookingData.carName}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-1 mb-4">
                <p className="font-medium text-base">{bookingData.carName}</p>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(bookingData.startDate), 'MMM d', { locale: dateLocale })} - {format(new Date(bookingData.endDate), 'MMM d, yyyy', { locale: dateLocale })}
                  </p>
                  {bookingData.pickupTime && bookingData.returnTime && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{t('review.pickupLabel')} {bookingData.pickupTime}</span>
                      <span>{t('review.returnLabel')} {bookingData.returnTime}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {bookingData.rentalDays} {bookingData.rentalDays === 1 ? t('review.day') : t('review.days')}
                </p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>{t('review.summary.rental')}</span>
                  <span>{bookingData.basePrice.toFixed(2)} €</span>
                </div>

                {discountAmount > 0 && appliedPromo && (
                  <div className="flex justify-between text-sm text-primary font-medium">
                    <span>{language === 'lt' ? 'Nuolaida' : 'Discount'} ({appliedPromo.code} −{appliedPromo.percent}%)</span>
                    <span>−{discountAmount.toFixed(2)} €</span>
                  </div>
                )}
                

                
                {servicesTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{t('review.summary.services')}</span>
                    <span>{servicesTotal.toFixed(2)} €</span>
                  </div>
                )}

                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{language === 'lt' ? 'Pristatymas / paėmimas' : 'Delivery / collection'}</span>
                    <span>{deliveryFee.toFixed(2)} €</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg mb-2">
                <span>{t('review.summary.total')}</span>
                <span className="text-primary">{totalPrice.toFixed(2)} €</span>
              </div>

              {/* Deposit Info */}
              <div className="bg-muted/50 rounded-lg p-3 mb-6">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-muted-foreground">{language === 'lt' ? 'Užstatas' : 'Security deposit'}</span>
                  <span className="font-semibold">{(bookingData.depositAmount || 200).toFixed(2)} €</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'lt' 
                    ? '💳 Mokamas atsiimant automobilį (kortele arba grynaisiais). Grąžinamas per 7 d.d. po automobilio grąžinimo.' 
                    : '💳 Paid at vehicle pickup (card or cash). Refunded within 7 business days after return.'}
                </p>
              </div>

              {paymentMethod === 'pay_at_counter' && (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-md">
                  <p className="text-sm font-semibold text-primary mb-2">{t('review.payAtCounterTitle')}</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t('review.payAtCounterNow').replace('{amount}', dailyRate.toFixed(2))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('review.payAtCounterLater').replace('{amount}', (totalPrice - dailyRate).toFixed(2))}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
    </ReservationFlowShell>
  );
}
