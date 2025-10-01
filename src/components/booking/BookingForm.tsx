import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, FileText } from "lucide-react";

interface BookingFormProps {
  carId: string;
  carName: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  rentalDays: number;
  dailyRate: number;
  onBookingSuccess: () => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  carId,
  carName,
  startDate,
  endDate,
  totalAmount,
  rentalDays,
  dailyRate,
  onBookingSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    refundAccount: "",
  });
  const [isCorporate, setIsCorporate] = useState(false);
  const [corporateData, setCorporateData] = useState({
    companyName: "",
    companyCode: "",
    vatCode: "",
    representativeName: "",
    representativePhone: "",
    representativeEmail: "",
  });
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"pay_now" | "pay_at_counter">("pay_now");
  const [paymentProvider, setPaymentProvider] = useState<"stripe" | "paysera">("paysera");

  const calculateAdvancePayment = (): number => {
    if (rentalDays <= 3) return 50;
    if (rentalDays <= 7) return 40;
    return 30;
  };

  const advancePayment = calculateAdvancePayment();
  const depositAmount = 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreementAccepted) {
      toast({
        title: "Klaida",
        description: "Turite sutikti su nuomos taisyklėmis ir sąlygomis",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log("Starting reservation creation:", {
        carId,
        carName,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        formData
      });

      // First, create or get customer
      const { data: existingCustomer, error: customerCheckError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      if (customerCheckError) {
        console.error("Customer check error:", customerCheckError);
        throw customerCheckError;
      }

      let customerId;

      if (existingCustomer) {
        customerId = existingCustomer.id;
        console.log("Found existing customer:", customerId);
        
        // Update customer with new data including corporate info
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
        console.log("Creating new customer...");
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

        if (customerError) {
          console.error("Customer creation error:", customerError);
          throw customerError;
        }
        customerId = newCustomer.id;
        console.log("Created new customer:", customerId);
      }

      // Ensure carId is in correct format
      const normalizedCarId = carId || carName.toLowerCase().replace(/\s+/g, '-');
      console.log("Using carId:", normalizedCarId);

      // Create reservation with "awaiting_payment" status
      const reservationData = {
        customer_id: customerId,
        car_name: carName,
        car_id: normalizedCarId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        rental_days: rentalDays,
        daily_rate: dailyRate,
        total_rental_cost: totalAmount,
        deposit_amount: 0,
        total_amount: totalAmount,
        status: 'awaiting_payment',
        payment_method: paymentMethod
      };

      console.log("Creating reservation with data:", reservationData);

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert([reservationData])
        .select()
        .single();

      if (reservationError) {
        console.error("Reservation creation error:", reservationError);
        throw reservationError;
      }

      console.log("Reservation created successfully:", reservation);

      // Send notification email
      try {
        await supabase.functions.invoke('send-booking-email', {
          body: {
            customerName: `${formData.firstName} ${formData.lastName}`,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            carName: carName,
            startDate: startDate.toLocaleDateString('lt-LT'),
            endDate: endDate.toLocaleDateString('lt-LT'),
            rentalDays: rentalDays,
            totalAmount: totalAmount,
            depositAmount: depositAmount,
            advancePayment: advancePayment,
          }
        });
        console.log("Email sent successfully");
      } catch (emailError) {
        console.warn("Email sending failed, but reservation was created:", emailError);
      }

      // Process payment based on selected method
      if (paymentMethod === "pay_now") {
        const paymentAmount = totalAmount;
        if (paymentProvider === "stripe") {
          await processStripePayment(reservation.id, paymentAmount, 'full');
          return; // Exit here as Stripe will redirect
        } else {
          await processPayseraPayment(reservation.id, paymentAmount, 'full');
          return; // Exit here as Paysera will redirect
        }
      } else {
        // Pay at counter - advance payment
        if (paymentProvider === "stripe") {
          await processStripePayment(reservation.id, advancePayment, 'advance');
          return; // Exit here as Stripe will redirect
        } else {
          await processPayseraPayment(reservation.id, advancePayment, 'advance');
          return; // Exit here as Paysera will redirect
        }
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Klaida",
        description: `Nepavyko sukurti rezervacijos: ${error.message}. Bandykite dar kartą arba susisiekite telefonu.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const processPayseraPayment = async (reservationId: string, amount: number, paymentType: 'full' | 'advance') => {
    try {
      console.log('Processing Paysera payment:', { reservationId, amount, paymentType });
      
      const { data, error } = await supabase.functions.invoke('create-paysera-payment', {
        body: {
          reservationId,
          amount,
          currency: 'eur',
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          carName: carName,
          paymentType
        }
      });

      if (error) {
        console.error('Paysera payment error:', error);
        throw error;
      }

      if (data?.success && data?.paymentUrl && data?.formData) {
        // Create and submit form to Paysera
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paymentUrl;
        
        const dataInput = document.createElement('input');
        dataInput.type = 'hidden';
        dataInput.name = 'data';
        dataInput.value = data.formData.data;
        form.appendChild(dataInput);
        
        const signInput = document.createElement('input');
        signInput.type = 'hidden';
        signInput.name = 'sign';
        signInput.value = data.formData.sign;
        form.appendChild(signInput);
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } else {
        throw new Error('No payment form data received');
      }
    } catch (error) {
      console.error('Error processing Paysera payment:', error);
      toast({
        title: "Mokėjimo klaida",
        description: 'Klaida apdorojant Paysera mokėjimą. Bandykite dar kartą.',
        variant: "destructive",
      });
      throw error;
    }
  };

  const processStripePayment = async (reservationId: string, amount: number, paymentType: 'full' | 'advance') => {
    try {
      console.log('Processing Stripe payment:', { reservationId, amount, paymentType });
      
      const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
        body: {
          reservationId,
          amount,
          currency: 'eur',
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          carName: carName,
          paymentType
        }
      });

      if (error) {
        console.error('Stripe payment error:', error);
        throw error;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Mokėjimo klaida",
        description: 'Klaida apdorojant mokėjimą. Bandykite dar kartą.',
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Užbaigti rezervaciją</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Booking Summary */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Rezervacijos santrauka</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Automobilis:</span>
              <span className="font-medium">{carName}</span>
            </div>
            <div className="flex justify-between">
              <span>Datos:</span>
              <span className="font-medium">
                {startDate.toLocaleDateString('lt-LT')} - {endDate.toLocaleDateString('lt-LT')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dienų skaičius:</span>
              <span className="font-medium">{rentalDays}</span>
            </div>
            <div className="flex justify-between">
              <span>Nuomos kaina:</span>
              <span className="font-medium">€{totalAmount}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Iš viso:</span>
                <span>€{totalAmount}</span>
              </div>
              {paymentMethod === "pay_at_counter" && (
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Mokėti vietoje:</span>
                  <span>€{totalAmount - advancePayment}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6 p-4 border rounded-lg">
          <h4 className="font-semibold mb-3">Mokėjimo būdas</h4>
          <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "pay_now" | "pay_at_counter")}>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pay_now" id="pay_now" />
                <Label htmlFor="pay_now">Mokėti dabar (pilną sumą)</Label>
              </div>
              
              {paymentMethod === "pay_now" && (
                <div className="ml-6 space-y-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Pasirinkite mokėjimo būdą:</p>
                  <RadioGroup value={paymentProvider} onValueChange={(value) => setPaymentProvider(value as "stripe" | "paysera")}>
                    <div className="hidden flex items-center space-x-2">
                      <RadioGroupItem value="paysera" id="paysera" />
                      <Label htmlFor="paysera" className="cursor-pointer">
                        <span className="font-medium">Lietuvos bankai</span>
                        <span className="text-sm text-muted-foreground block">Swedbank, SEB, Luminor, Šiaulių bankas ir kiti</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="stripe" id="stripe" />
                      <Label htmlFor="stripe" className="cursor-pointer">
                        <span className="font-medium">Mokėjimo kortelė</span>
                        <span className="text-sm text-muted-foreground block">Visa, Mastercard, Apple Pay, Google Pay</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pay_at_counter" id="pay_at_counter" />
                <Label htmlFor="pay_at_counter">Mokėti vietoje (išankstinis mokėjimas €{advancePayment})</Label>
              </div>
              
              {paymentMethod === "pay_at_counter" && (
                <div className="ml-6 space-y-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Išankstinio mokėjimo būdas:</p>
                  <RadioGroup value={paymentProvider} onValueChange={(value) => setPaymentProvider(value as "stripe" | "paysera")}>
                    <div className="hidden flex items-center space-x-2">
                      <RadioGroupItem value="paysera" id="paysera_advance" />
                      <Label htmlFor="paysera_advance" className="cursor-pointer">
                        <span className="font-medium">Lietuvos bankai</span>
                        <span className="text-sm text-muted-foreground block">Swedbank, SEB, Luminor, Šiaulių bankas ir kiti</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="stripe" id="stripe_advance" />
                      <Label htmlFor="stripe_advance" className="cursor-pointer">
                        <span className="font-medium">Mokėjimo kortelė</span>
                        <span className="text-sm text-muted-foreground block">Visa, Mastercard, Apple Pay, Google Pay</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          </RadioGroup>
        </div>

        {/* Important Notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-semibold text-amber-800 mb-2">Svarbi informacija</h4>
          <div className="text-sm text-amber-700 space-y-1">
            <p>• Mokamas vienos dienos automobilio nuomos kaina kaip išankstinis mokėjimas.</p>
            <p>• Ši suma įskaičiuojama į bendrą nuomos kainą.</p>
            <p>• Likusi suma ir saugumo užstatas mokami automobilio atsiėmimo metu.</p>
            <p>• Atšaukus rezervaciją likus ne mažiau kaip 24 val. iki atsiėmimo – avansas grąžinamas pilnai.</p>
            <p>• Atšaukus vėliau arba neatvykus – avansas negrąžinamas.</p>
            <p>• Ši politika užtikrina, kad jūsų pasirinktas automobilis būtų rezervuotas ir paruoštas, bei apsaugo nuo „no-show" atvejų.</p>
            <p>• Saugumo užstatas – 200 €, grąžinamas per 7 d. d. po automobilio grąžinimo.</p>
            <p>• Rezervacijos keitimas galimas iki 24 val. prieš atsiėmimą.</p>
            <p>• Klausimams ir rezervacijos keitimui: <strong>+370 698 18 781</strong> arba <strong>info@carbonus.lt</strong></p>
          </div>
        </div>

        {/* Customer Type Selection */}
        <div className="mb-6 p-4 border rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox 
              id="isCorporate" 
              checked={isCorporate} 
              onCheckedChange={(checked) => setIsCorporate(checked as boolean)}
            />
            <Label htmlFor="isCorporate" className="cursor-pointer font-medium">
              Įmonės rezervacija
            </Label>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isCorporate && (
            <div className="p-4 border rounded-lg space-y-4 bg-muted/30">
              <h4 className="font-semibold">Įmonės duomenys</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Įmonės pavadinimas *</Label>
                  <Input
                    id="companyName"
                    value={corporateData.companyName}
                    onChange={(e) => setCorporateData(prev => ({ ...prev, companyName: e.target.value }))}
                    required={isCorporate}
                  />
                </div>
                <div>
                  <Label htmlFor="companyCode">Įmonės kodas *</Label>
                  <Input
                    id="companyCode"
                    value={corporateData.companyCode}
                    onChange={(e) => setCorporateData(prev => ({ ...prev, companyCode: e.target.value }))}
                    required={isCorporate}
                  />
                </div>
                <div>
                  <Label htmlFor="vatCode">PVM mokėtojo kodas</Label>
                  <Input
                    id="vatCode"
                    value={corporateData.vatCode}
                    onChange={(e) => setCorporateData(prev => ({ ...prev, vatCode: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="representativeName">Atstovas *</Label>
                  <Input
                    id="representativeName"
                    value={corporateData.representativeName}
                    onChange={(e) => setCorporateData(prev => ({ ...prev, representativeName: e.target.value }))}
                    required={isCorporate}
                  />
                </div>
                <div>
                  <Label htmlFor="representativePhone">Atstovo telefonas *</Label>
                  <Input
                    id="representativePhone"
                    value={corporateData.representativePhone}
                    onChange={(e) => setCorporateData(prev => ({ ...prev, representativePhone: e.target.value }))}
                    required={isCorporate}
                  />
                </div>
                <div>
                  <Label htmlFor="representativeEmail">Atstovo el. paštas *</Label>
                  <Input
                    id="representativeEmail"
                    type="email"
                    value={corporateData.representativeEmail}
                    onChange={(e) => setCorporateData(prev => ({ ...prev, representativeEmail: e.target.value }))}
                    required={isCorporate}
                  />
                </div>
              </div>
            </div>
          )}

          <h4 className="font-semibold mt-6">Kontaktinė informacija</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Vardas *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lastName">Pavardė *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="email">El. paštas *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Telefono numeris *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Lease Agreement Checkbox */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="agreement" 
                checked={agreementAccepted}
                onCheckedChange={(checked) => setAgreementAccepted(checked as boolean)}
                className="mt-1"
              />
              <div className="space-y-2 flex-1">
                <Label 
                  htmlFor="agreement" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Susipažinau ir patvirtinu, kad sutinku su nuomos taisyklėmis ir sąlygomis *
                </Label>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <a 
                    href="/carbonus-nuomos-sutartis.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Peržiūrėti nuomos sutartį
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Atšaukti
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Kuriama rezervacija..." : (paymentMethod === "pay_now" ? "Mokėti dabar" : "Užbaigti rezervaciją")}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p>* Rezervacija bus patvirtinta po to, kai susisieksime su jumis dėl mokėjimo ir automobilio perdavimo detalių.</p>
          <p>* Atšaukimams kreipkitės: <strong>info@carbonus.lt</strong></p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingForm;