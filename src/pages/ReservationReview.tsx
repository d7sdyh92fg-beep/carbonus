import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, FileText, CreditCard } from 'lucide-react';
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
import { getRoute } from '@/utils/routes';

export default function ReservationReview() {
  const navigate = useNavigate();
  const { bookingData, getTotalPrice, clearBooking } = useBooking();
  const { toast } = useToast();
  const { t, language } = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'pay_at_counter'>('online');
  const [paymentProvider, setPaymentProvider] = useState<'stripe'>('stripe');
  
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
      const carsRoute = language === 'en' ? '/cars' : '/automobiliai';
      navigate(carsRoute);
    }
  }, [bookingData, navigate, language]);

  if (!bookingData) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCorporateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCorporateData(prev => ({ ...prev, [name]: value }));
  };

  const processStripePayment = async (reservationId: string, rentalAmount: number, depositAmount: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
        body: {
          reservationId,
          rentalAmount,
          depositAmount,
          currency: 'eur',
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          carName: bookingData.carName,
          paymentType: 'full'
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);

    try {
      // Create or get customer
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      let customerId;

      if (existingCustomer) {
        customerId = existingCustomer.id;
        await supabase
          .from('customers')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            is_corporate: isCorporate,
            company_name: isCorporate ? corporateData.companyName : null,
            company_code: isCorporate ? corporateData.companyCode : null,
            vat_code: isCorporate ? corporateData.vatCode : null,
            representative_name: isCorporate ? corporateData.representativeName : null,
            representative_phone: isCorporate ? corporateData.representativePhone : null,
            representative_email: isCorporate ? corporateData.representativeEmail : null,
          })
          .eq('id', customerId);
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert([{
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            is_corporate: isCorporate,
            company_name: isCorporate ? corporateData.companyName : null,
            company_code: isCorporate ? corporateData.companyCode : null,
            vat_code: isCorporate ? corporateData.vatCode : null,
            representative_name: isCorporate ? corporateData.representativeName : null,
            representative_phone: isCorporate ? corporateData.representativePhone : null,
            representative_email: isCorporate ? corporateData.representativeEmail : null,
          }])
          .select('id')
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      const dailyRate = bookingData.basePrice / bookingData.rentalDays;
      const insuranceTotal = bookingData.insurance ? bookingData.insurance.pricePerDay * bookingData.rentalDays : 0;
      const servicesTotal = bookingData.services.reduce((sum, service) => {
        return sum + (service.unit === 'perDay' ? service.price * bookingData.rentalDays : service.price);
      }, 0);
      const totalAmount = bookingData.basePrice + insuranceTotal + servicesTotal;
      const depositAmount = 200;
      const paymentAmount = paymentMethod === 'pay_at_counter' ? dailyRate : totalAmount;

      // Create reservation
      const reservationData = {
        customer_id: customerId,
        car_name: bookingData.carName,
        car_id: bookingData.carId,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        rental_days: bookingData.rentalDays,
        daily_rate: dailyRate,
        total_rental_cost: totalAmount,
        deposit_amount: depositAmount,
        total_amount: totalAmount,
        status: 'awaiting_payment',
        payment_method: paymentMethod,
        payment_provider: paymentProvider,
        pricing_notes: (() => {
          const notes: string[] = [];
          
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
        })(),
      };

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single();

      if (reservationError) throw reservationError;

      // Process Stripe payment - for pay_at_counter, only charge 1 day rate (no deposit)
      const stripeRentalAmount = paymentMethod === 'pay_at_counter' ? paymentAmount : totalAmount;
      const stripeDepositAmount = paymentMethod === 'pay_at_counter' ? 0 : depositAmount;
      await processStripePayment(reservation.id, stripeRentalAmount, stripeDepositAmount);

      // Send notification email
      try {
        await supabase.functions.invoke('send-booking-email', {
          body: {
            customerName: `${formData.firstName} ${formData.lastName}`,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            carName: bookingData.carName,
            startDate: format(new Date(bookingData.startDate), 'yyyy-MM-dd'),
            endDate: format(new Date(bookingData.endDate), 'yyyy-MM-dd'),
            rentalDays: bookingData.rentalDays,
            totalAmount: totalAmount,
            depositAmount: 200,
            advancePayment: totalAmount,
          }
        });
      } catch (emailError) {
        console.warn('Email sending failed:', emailError);
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: t('review.errorTitle'),
        description: t('review.errorDescription').replace('{error}', error.message),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const insuranceTotal = bookingData.insurance ? bookingData.insurance.pricePerDay * bookingData.rentalDays : 0;
  const servicesTotal = bookingData.services.reduce((sum, service) => {
    return sum + (service.unit === 'perDay' ? service.price * bookingData.rentalDays : service.price);
  }, 0);
  const totalPrice = bookingData.basePrice + insuranceTotal + servicesTotal;
  const depositAmount = 200;
  const dailyRate = bookingData.basePrice / bookingData.rentalDays;
  const displayAmount = paymentMethod === 'pay_at_counter' ? dailyRate : totalPrice;
  const dateLocale = language === 'en' ? enUS : lt;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('review.back')}
            </Button>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {paymentMethod === 'pay_at_counter' ? t('review.reservationFee') : t('review.totalToPay')}
              </p>
              <p className="text-2xl font-bold text-primary">
                {displayAmount.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">{t('review.reviewTitle')}</h1>
              <p className="text-muted-foreground">
                {t('review.reviewSubtitle')}
              </p>
            </div>

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
                      required
                    />
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
                      <Label htmlFor="companyName">{t('review.corporateInfo.name')}</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={corporateData.companyName}
                        onChange={handleCorporateChange}
                        required={isCorporate}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyCode">{t('review.corporateInfo.code')}</Label>
                      <Input
                        id="companyCode"
                        name="companyCode"
                        value={corporateData.companyCode}
                        onChange={handleCorporateChange}
                        required={isCorporate}
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
                
                {servicesTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{t('review.summary.services')}</span>
                    <span>{servicesTotal.toFixed(2)} €</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg mb-6">
                <span>{t('review.summary.total')}</span>
                <span className="text-primary">{totalPrice.toFixed(2)} €</span>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div className="bg-muted/30 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">
                    {t('review.depositInfo')}
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
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
