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
import { lt } from 'date-fns/locale';

export default function ReservationReview() {
  const navigate = useNavigate();
  const { bookingData, getTotalPrice, clearBooking } = useBooking();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<'stripe'>('stripe');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    refundAccount: '',
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
    if (!bookingData || !bookingData.insurance) {
      navigate('/automobiliai');
    }
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCorporateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCorporateData(prev => ({ ...prev, [name]: value }));
  };

  const processStripePayment = async (reservationId: string, amount: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
        body: {
          reservationId,
          amount,
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
    
    if (!agreementAccepted) {
      toast({
        title: 'Klaida',
        description: 'Turite sutikti su nuomos taisyklėmis ir sąlygomis',
        variant: 'destructive',
      });
      return;
    }
    
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
            refund_account_number: formData.refundAccount || null,
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
            refund_account_number: formData.refundAccount || null,
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

      const totalAmount = getTotalPrice();
      const dailyRate = bookingData.basePrice / bookingData.rentalDays;

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
        deposit_amount: 300,
        total_amount: totalAmount,
        status: 'awaiting_payment',
        payment_method: 'online',
        payment_provider: paymentProvider,
        pricing_notes: JSON.stringify({
          insurance: bookingData.insurance,
          services: bookingData.services,
        }),
      };

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single();

      if (reservationError) throw reservationError;

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
            depositAmount: 300,
            advancePayment: totalAmount,
          }
        });
      } catch (emailError) {
        console.warn('Email sending failed:', emailError);
      }

      // Process payment
      await processStripePayment(reservation.id, totalAmount);
      
      // Clear booking data after successful submission
      clearBooking();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Klaida',
        description: `Nepavyko sukurti rezervacijos: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = getTotalPrice();
  const insuranceTotal = bookingData.insurance ? bookingData.insurance.pricePerDay * bookingData.rentalDays : 0;
  const servicesTotal = bookingData.services.reduce((sum, service) => {
    return sum + (service.unit === 'perDay' ? service.price * bookingData.rentalDays : service.price);
  }, 0);

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
              Grįžti
            </Button>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Viso mokėti</p>
              <p className="text-2xl font-bold text-primary">
                {totalPrice.toFixed(2)} €
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
              <h1 className="text-3xl font-bold mb-4">Peržiūrėkite užsakymą</h1>
              <p className="text-muted-foreground">
                Užpildykite informaciją ir užbaikite užsakymą
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Type */}
              <Card className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="corporate"
                    checked={isCorporate}
                    onCheckedChange={(checked) => setIsCorporate(checked as boolean)}
                  />
                  <Label htmlFor="corporate">Nuomoju kaip įmonė</Label>
                </div>
              </Card>

              {/* Personal Information */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Asmeninė informacija
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Vardas *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Pavardė *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">El. paštas *</Label>
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
                    <Label htmlFor="phone">Telefonas *</Label>
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
                    <Label htmlFor="refundAccount">Sąskaitos numeris (grąžinimams)</Label>
                    <Input
                      id="refundAccount"
                      name="refundAccount"
                      value={formData.refundAccount}
                      onChange={handleInputChange}
                      placeholder="LT..."
                    />
                  </div>
                </div>
              </Card>

              {/* Corporate Information */}
              {isCorporate && (
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Įmonės informacija
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="companyName">Įmonės pavadinimas *</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={corporateData.companyName}
                        onChange={handleCorporateChange}
                        required={isCorporate}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyCode">Įmonės kodas *</Label>
                      <Input
                        id="companyCode"
                        name="companyCode"
                        value={corporateData.companyCode}
                        onChange={handleCorporateChange}
                        required={isCorporate}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vatCode">PVM kodas</Label>
                      <Input
                        id="vatCode"
                        name="vatCode"
                        value={corporateData.vatCode}
                        onChange={handleCorporateChange}
                      />
                    </div>
                  </div>
                </Card>
              )}

              {/* Payment Method */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Mokėjimo būdas
                </h3>
                <RadioGroup value={paymentProvider} onValueChange={(value) => setPaymentProvider(value as 'stripe')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="cursor-pointer">
                      <span className="font-medium">Mokėjimo kortelė</span>
                      <span className="text-sm text-muted-foreground block">
                        Visa, Mastercard, Apple Pay, Google Pay
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </Card>

              {/* Terms & Conditions */}
              <Card className="p-6">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreementAccepted}
                    onCheckedChange={(checked) => setAgreementAccepted(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="cursor-pointer">
                    Sutinku su{' '}
                    <a
                      href="/nuomos-sutartis"
                      target="_blank"
                      className="text-primary underline"
                    >
                      nuomos taisyklėmis ir sąlygomis
                    </a>
                  </Label>
                </div>
              </Card>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || !agreementAccepted}
              >
                {isSubmitting ? 'Vykdoma...' : `Mokėti ${totalPrice.toFixed(2)} €`}
              </Button>
            </form>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Užsakymo santrauka</h3>
              
              <div className="space-y-3 mb-4">
                <div>
                  <p className="font-medium text-lg">{bookingData.carName}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(bookingData.startDate), 'MMM d', { locale: lt })} - {format(new Date(bookingData.endDate), 'MMM d, yyyy', { locale: lt })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.rentalDays} {bookingData.rentalDays === 1 ? 'diena' : 'dienos'}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Nuomos kaina</span>
                  <span>{bookingData.basePrice.toFixed(2)} €</span>
                </div>
                
                {bookingData.insurance && (
                  <div className="flex justify-between text-sm">
                    <span>{bookingData.insurance.title}</span>
                    <span>{insuranceTotal.toFixed(2)} €</span>
                  </div>
                )}

                {bookingData.services.map(service => {
                  const price = service.unit === 'perDay' 
                    ? service.price * bookingData.rentalDays 
                    : service.price;
                  return (
                    <div key={service.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{service.title}</span>
                      <span>{price.toFixed(2)} €</span>
                    </div>
                  );
                })}

                <div className="flex justify-between text-sm">
                  <span>Užstatas</span>
                  <span>300.00 €</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg mb-2">
                <span>Iš viso</span>
                <span className="text-primary">{totalPrice.toFixed(2)} €</span>
              </div>

              <p className="text-xs text-muted-foreground">
                * Užstatas grąžinamas po automobilio grąžinimo
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
