import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { lt } from 'date-fns/locale';
import { Camera, Upload, FileText, CreditCard, Banknote, CheckCircle } from 'lucide-react';
import { DriverLicenseUpload } from './DriverLicenseUpload';
import { DigitalSignature } from './DigitalSignature';

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  refundAccount: string;
  isCorporate: boolean;
  companyName: string;
  companyCode: string;
  vatCode: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
}

interface BookingDetails {
  carId: string;
  carName: string;
  startDate: Date | null;
  endDate: Date | null;
  dailyRate: number;
}

const cars = [
  { 
    id: '1', 
    name: 'BMW 3 series', 
    year: '2017', 
    available: true
  },
  { 
    id: '2', 
    name: 'Chrysler Town & Country', 
    year: '2008', 
    available: true
  },
  { 
    id: '3', 
    name: 'Volkswagen Passat', 
    year: '2015', 
    available: true
  },
  { 
    id: '4', 
    name: 'KIA CEED', 
    year: '2020', 
    available: true
  },
  { 
    id: '5', 
    name: 'KIA CEED', 
    year: '2018', 
    available: true
  },
];

// Tiered pricing function
const getDailyRate = (days: number): number => {
  if (days >= 7) return 30;
  if (days >= 3) return 40;
  return 50; // 1-3 days
};

const getPricingTier = (days: number): string => {
  if (days >= 7) return '7+ dienų: €30/dieną';
  if (days >= 3) return '3-7 dienos: €40/dieną';
  return '1-3 dienos: €50/dieną';
};

export function InPersonBooking() {
  const [step, setStep] = useState<'details' | 'documents' | 'payment' | 'complete'>('details');
  const [customer, setCustomer] = useState<Customer>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    refundAccount: '',
    isCorporate: false,
    companyName: '',
    companyCode: '',
    vatCode: '',
    representativeName: '',
    representativePhone: '',
    representativeEmail: '',
  });
  const [booking, setBooking] = useState<BookingDetails>({
    carId: '',
    carName: '',
    startDate: null,
    endDate: null,
    dailyRate: 0
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card_reader'>('cash');
  const [driverLicenseUrls, setDriverLicenseUrls] = useState<{ front?: string; back?: string }>({});
  const [contractSigned, setContractSigned] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [useCustomPricing, setUseCustomPricing] = useState(false);
  const [customRentalPrice, setCustomRentalPrice] = useState<string>('');
  const [customDeposit, setCustomDeposit] = useState<string>('300');
  const [pricingNotes, setPricingNotes] = useState('');
  const [isRetroactive, setIsRetroactive] = useState(false);

  const calculateTotal = () => {
    if (!booking.startDate || !booking.endDate) return 0;
    
    if (useCustomPricing) {
      const rental = parseFloat(customRentalPrice) || 0;
      const deposit = parseFloat(customDeposit) || 0;
      return rental + deposit;
    }
    
    const days = Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyRate = getDailyRate(days);
    const rentalCost = days * dailyRate;
    const deposit = 300;
    return rentalCost + deposit;
  };
  
  const getRentalCost = () => {
    if (!booking.startDate || !booking.endDate) return 0;
    
    if (useCustomPricing) {
      return parseFloat(customRentalPrice) || 0;
    }
    
    const days = getRentalDays();
    return days * getDailyRate(days);
  };
  
  const getDepositAmount = () => {
    if (useCustomPricing) {
      return parseFloat(customDeposit) || 0;
    }
    return 300;
  };

  const getRentalDays = () => {
    if (!booking.startDate || !booking.endDate) return 0;
    return Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleCarSelect = (carId: string) => {
    const selectedCar = cars.find(car => car.id === carId);
    if (selectedCar) {
      setBooking(prev => ({
        ...prev,
        carId,
        carName: `${selectedCar.name} (${selectedCar.year})`,
        dailyRate: 0 // Will be calculated dynamically based on days
      }));
    }
  };

  const handleNextStep = () => {
    // Scroll to top when moving to next step
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (step === 'details') {
      if (!customer.firstName || !customer.lastName || !customer.email || !customer.phone || 
          !booking.carId || !booking.startDate || !booking.endDate) {
        toast.error('Prašome užpildyti visus privalomius laukus');
        return;
      }
      setStep('documents');
    } else if (step === 'documents') {
      if (!driverLicenseUrls.front || !contractSigned) {
        toast.error('Prašome įkelti vairuotojo pažymėjimo priekį ir pasirašyti sutartį');
        return;
      }
      setStep('payment');
    } else if (step === 'payment') {
      handleCompleteBooking();
    }
  };

  const handleCompleteBooking = async () => {
    setLoading(true);
    try {
      // Create or get customer
      const { data: customerData, error: customerError } = await supabase
        .rpc('create_or_get_customer', {
          p_email: customer.email,
          p_first_name: customer.firstName,
          p_last_name: customer.lastName,
          p_phone: customer.phone
        });

      if (customerError) throw customerError;

      // Update customer with additional info
      await supabase
        .from('customers')
        .update({
          refund_account_number: customer.refundAccount || null,
          is_corporate: customer.isCorporate,
          company_name: customer.isCorporate ? customer.companyName : null,
          company_code: customer.isCorporate ? customer.companyCode : null,
          vat_code: customer.isCorporate ? customer.vatCode : null,
          representative_name: customer.isCorporate ? customer.representativeName : null,
          representative_phone: customer.isCorporate ? customer.representativePhone : null,
          representative_email: customer.isCorporate ? customer.representativeEmail : null,
        })
        .eq('id', customerData);

      // Create reservation
      const rentalDays = getRentalDays();
      const rentalCost = getRentalCost();
      const depositAmount = getDepositAmount();
      const totalAmount = rentalCost + depositAmount;

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          customer_id: customerData,
          car_id: booking.carId,
          car_name: booking.carName,
          start_date: format(booking.startDate!, 'yyyy-MM-dd'),
          end_date: format(booking.endDate!, 'yyyy-MM-dd'),
          rental_days: rentalDays,
          daily_rate: useCustomPricing ? 0 : getDailyRate(rentalDays),
          total_rental_cost: rentalCost,
          deposit_amount: depositAmount,
          total_amount: totalAmount,
          status: 'confirmed',
          payment_method: paymentMethod,
          payment_completed_at: new Date().toISOString(),
          driver_license_url: driverLicenseUrls.front || null,
          driver_license_back_url: driverLicenseUrls.back || null,
          contract_signed_at: new Date().toISOString(),
          notes: notes,
          custom_rental_price: useCustomPricing ? rentalCost : null,
          custom_deposit_amount: useCustomPricing ? depositAmount : null,
          pricing_notes: useCustomPricing ? pricingNotes : null,
        })
        .select()
        .single();

      if (reservationError) throw reservationError;

      // Save signature data
      if (signatureData) {
        await supabase.from('contract_signatures').insert({
          reservation_id: reservation.id,
          signature_data: signatureData,
          signed_by: `${customer.firstName} ${customer.lastName}`
        });
      }

      // Generate and send contract
      await supabase.functions.invoke('generate-contract-pdf', {
        body: {
          reservationId: reservation.id,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerEmail: customer.email,
          carName: booking.carName,
          startDate: format(booking.startDate!, 'yyyy-MM-dd'),
          endDate: format(booking.endDate!, 'yyyy-MM-dd'),
          totalAmount: totalAmount,
          signatureData: signatureData
        }
      });

      toast.success('Rezervacija sėkmingai užbaigta!');
      setStep('complete');
    } catch (error) {
      console.error('Error completing booking:', error);
      toast.error('Nepavyko užbaigti rezervacijos. Bandykite dar kartą.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('details');
    setCustomer({ 
      firstName: '', 
      lastName: '', 
      email: '', 
      phone: '',
      refundAccount: '',
      isCorporate: false,
      companyName: '',
      companyCode: '',
      vatCode: '',
      representativeName: '',
      representativePhone: '',
      representativeEmail: '',
    });
    setBooking({ carId: '', carName: '', startDate: null, endDate: null, dailyRate: 0 });
    setDriverLicenseUrls({});
    setContractSigned(false);
    setSignatureData('');
    setNotes('');
    setUseCustomPricing(false);
    setCustomRentalPrice('');
    setCustomDeposit('300');
    setPricingNotes('');
    setIsRetroactive(false);
  };

  if (step === 'complete') {
    return (
      <div className="w-full max-w-2xl mx-auto p-3 sm:p-4">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center text-primary flex items-center justify-center gap-2 text-lg sm:text-xl">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              Rezervacija užbaigta!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3 sm:space-y-4">
            <div className="text-base sm:text-lg">
              Ačiū, {customer.firstName}! Jūsų rezervacija buvo patvirtinta.
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">
              Patvirtinimo laiškas su pasirašyta sutartimi išsiųstas į {customer.email}
            </div>
            <Button onClick={resetForm} className="w-full h-11 sm:h-12" size="lg">
              Sukurti naują rezervaciją
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6">
      {/* Progress Steps - Mobile Optimized */}
      <div className="bg-background p-3 sm:p-4 rounded-lg border overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-2">
          {[
            { key: 'details', label: 'Rezervacijos duomenys', shortLabel: 'Duomenys', icon: FileText },
            { key: 'documents', label: 'Dokumentai', shortLabel: 'Dokumentai', icon: Upload },
            { key: 'payment', label: 'Mokėjimas', shortLabel: 'Mokėjimas', icon: CreditCard }
          ].map(({ key, label, shortLabel, icon: Icon }, index) => (
            <div key={key} className="flex items-center flex-1">
              <div className={`rounded-full p-2 sm:p-3 lg:p-4 flex-shrink-0 ${
                step === key ? 'bg-primary text-primary-foreground' : 
                (step === 'documents' && key === 'details') ||
                (step === 'payment' && (key === 'details' || key === 'documents'))
                  ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </div>
              <span className="ml-2 sm:ml-3 font-medium text-sm sm:text-base lg:text-lg">
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </span>
              {index < 2 && (
                <div className="hidden sm:block w-8 lg:w-16 h-px bg-muted mx-3 lg:mx-6 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 'details' && (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Customer Details */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Kliento informacija</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm sm:text-base">Vardas *</Label>
                    <Input
                      id="firstName"
                      value={customer.firstName}
                      onChange={(e) => setCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm sm:text-base">Pavardė *</Label>
                    <Input
                      id="lastName"
                      value={customer.lastName}
                      onChange={(e) => setCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      className="h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm sm:text-base">El. paštas *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm sm:text-base">Telefonas *</Label>
                  <Input
                    id="phone"
                    value={customer.phone}
                    onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base"
                    placeholder="+370..."
                  />
                </div>
                <div>
                  <Label htmlFor="refundAccount" className="text-sm sm:text-base">Sąskaitos numeris</Label>
                  <Input
                    id="refundAccount"
                    value={customer.refundAccount}
                    onChange={(e) => setCustomer(prev => ({ ...prev, refundAccount: e.target.value }))}
                    className="h-10 sm:h-12 text-sm sm:text-base"
                    placeholder="LT..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">Užstato grąžinimui</p>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isCorporate" 
                    checked={customer.isCorporate} 
                    onCheckedChange={(checked) => setCustomer(prev => ({ ...prev, isCorporate: checked as boolean }))}
                  />
                  <Label htmlFor="isCorporate" className="cursor-pointer font-medium">
                    Įmonės rezervacija
                  </Label>
                </div>
                
                {customer.isCorporate && (
                  <div className="p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-4 bg-muted/30">
                    <div>
                      <Label htmlFor="companyName" className="text-sm sm:text-base">Įmonės pavadinimas *</Label>
                      <Input
                        id="companyName"
                        value={customer.companyName}
                        onChange={(e) => setCustomer(prev => ({ ...prev, companyName: e.target.value }))}
                        required={customer.isCorporate}
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="companyCode" className="text-sm sm:text-base">Įmonės kodas *</Label>
                        <Input
                          id="companyCode"
                          value={customer.companyCode}
                          onChange={(e) => setCustomer(prev => ({ ...prev, companyCode: e.target.value }))}
                          required={customer.isCorporate}
                          className="h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vatCode" className="text-sm sm:text-base">PVM mokėtojo kodas</Label>
                        <Input
                          id="vatCode"
                          value={customer.vatCode}
                          onChange={(e) => setCustomer(prev => ({ ...prev, vatCode: e.target.value }))}
                          className="h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="representativeName" className="text-sm sm:text-base">Atstovas *</Label>
                      <Input
                        id="representativeName"
                        value={customer.representativeName}
                        onChange={(e) => setCustomer(prev => ({ ...prev, representativeName: e.target.value }))}
                        required={customer.isCorporate}
                        className="h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label htmlFor="representativePhone" className="text-sm sm:text-base">Atstovo tel. *</Label>
                        <Input
                          id="representativePhone"
                          value={customer.representativePhone}
                          onChange={(e) => setCustomer(prev => ({ ...prev, representativePhone: e.target.value }))}
                          required={customer.isCorporate}
                          className="h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="representativeEmail" className="text-sm sm:text-base">Atstovo el. paštas *</Label>
                        <Input
                          id="representativeEmail"
                          type="email"
                          value={customer.representativeEmail}
                          onChange={(e) => setCustomer(prev => ({ ...prev, representativeEmail: e.target.value }))}
                          required={customer.isCorporate}
                          className="h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Nuomos duomenys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="car" className="text-sm sm:text-base">Pasirinkite automobilį *</Label>
                  <Select value={booking.carId} onValueChange={handleCarSelect}>
                    <SelectTrigger className="h-10 sm:h-12 text-sm sm:text-base bg-background border-2">
                      <SelectValue placeholder="Pasirinkite automobilį" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      {cars.map((car) => (
                        <SelectItem key={car.id} value={car.id} disabled={!car.available} className="text-sm p-3">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col gap-1">
                              <span className="font-medium text-sm">{car.name}</span>
                              <span className="text-xs text-muted-foreground">{car.year}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-4">
                              <div className="text-xs text-muted-foreground">
                                Kaina priklauso nuo dienų skaičiaus
                              </div>
                              {car.available ? (
                                <Badge variant="default" className="bg-green-500 text-xs">Laisvas</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">Užimtas</Badge>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Retroactive Booking Toggle */}
                  <div className="p-3 sm:p-4 border rounded-lg bg-amber-50 border-amber-200">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isRetroactive" 
                        checked={isRetroactive} 
                        onCheckedChange={(checked) => {
                          setIsRetroactive(checked as boolean);
                          if (!checked) {
                            setBooking(prev => ({ ...prev, startDate: null, endDate: null }));
                          }
                        }}
                      />
                      <Label htmlFor="isRetroactive" className="cursor-pointer font-medium text-sm sm:text-base">
                        Atgalinė rezervacija (leisti praeities datas)
                      </Label>
                    </div>
                    {isRetroactive && (
                      <p className="text-xs text-amber-700 mt-2">
                        Įjungtas režimas praeities datoms. Galite sukurti rezervaciją už automobilio, kuris jau grąžintas.
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm sm:text-base">Pradžios data *</Label>
                    <div className="mt-2">
                      <Calendar
                        mode="single"
                        selected={booking.startDate || undefined}
                        onSelect={(date) => setBooking(prev => ({ ...prev, startDate: date || null }))}
                        disabled={isRetroactive ? undefined : (date) => date < new Date()}
                        locale={lt}
                        className="rounded-lg border-2 bg-card shadow-sm w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm sm:text-base">Pabaigos data *</Label>
                    <div className="mt-2">
                      <Calendar
                        mode="single"
                        selected={booking.endDate || undefined}
                        onSelect={(date) => setBooking(prev => ({ ...prev, endDate: date || null }))}
                        disabled={(date) => !booking.startDate || date <= booking.startDate}
                        locale={lt}
                        className="rounded-lg border-2 bg-card shadow-sm w-full"
                      />
                    </div>
                  </div>
                </div>

                {booking.startDate && booking.endDate && booking.carId && (
                  <div className="space-y-4">
                    {/* Pricing Explanation */}
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm sm:text-base font-medium text-blue-900 mb-2">
                        Kainų struktūra:
                      </div>
                      <div className="space-y-1 text-xs sm:text-sm text-blue-800">
                        <div>• 1-3 dienos: €50/dieną</div>
                        <div>• 3-7 dienos: €40/dieną</div>
                        <div>• 7+ dienų: €30/dieną</div>
                      </div>
                    </div>
                    
                    {/* Price Calculation */}
                    <div className="p-4 sm:p-6 bg-muted rounded-lg border-2">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Nuomos dienų:</span>
                          <span className="font-medium">{getRentalDays()} d.</span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Kainų kategorija:</span>
                          <span className="font-medium text-primary">{getPricingTier(getRentalDays())}</span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Dienos kaina:</span>
                          <span className="font-medium">€{getDailyRate(getRentalDays())}</span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Nuomos kaina:</span>
                          <span className="font-medium">€{useCustomPricing ? customRentalPrice : getRentalCost()}</span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Užstatas:</span>
                          <span className="font-medium">€{useCustomPricing ? customDeposit : 300}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-base sm:text-lg">
                          <span>Iš viso:</span>
                          <span>€{calculateTotal()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Custom Pricing Override */}
                    <div className="p-4 border rounded-lg bg-amber-50 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="useCustomPricing" 
                          checked={useCustomPricing} 
                          onCheckedChange={(checked) => {
                            setUseCustomPricing(checked as boolean);
                            if (!checked) {
                              setCustomRentalPrice('');
                              setCustomDeposit('300');
                              setPricingNotes('');
                            }
                          }}
                        />
                        <Label htmlFor="useCustomPricing" className="cursor-pointer font-medium text-amber-900">
                          Specialus kainodaros režimas
                        </Label>
                      </div>
                      
                      {useCustomPricing && (
                        <div className="space-y-3 pl-6">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="customRentalPrice" className="text-sm">Nuomos kaina (€) *</Label>
                              <Input
                                id="customRentalPrice"
                                type="number"
                                step="0.01"
                                value={customRentalPrice}
                                onChange={(e) => setCustomRentalPrice(e.target.value)}
                                placeholder="0.00"
                                className="h-10"
                                required={useCustomPricing}
                              />
                            </div>
                            <div>
                              <Label htmlFor="customDeposit" className="text-sm">Užstatas (€) *</Label>
                              <Input
                                id="customDeposit"
                                type="number"
                                step="0.01"
                                value={customDeposit}
                                onChange={(e) => setCustomDeposit(e.target.value)}
                                placeholder="300.00"
                                className="h-10"
                                required={useCustomPricing}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="pricingNotes" className="text-sm">Pastabos *</Label>
                            <Textarea
                              id="pricingNotes"
                              value={pricingNotes}
                              onChange={(e) => setPricingNotes(e.target.value)}
                              placeholder="Priežastis (nuolaida, VIP klientas, užstato atsisakyta ir kt.)"
                              className="h-20"
                              required={useCustomPricing}
                            />
                          </div>
                          <p className="text-xs text-amber-700">
                            Šis režimas leidžia pakeisti standartines kainas. Bus taikomos tik čia nurodytos sumos.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === 'documents' && (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Vairuotojo pažymėjimo įkėlimas</CardTitle>
              </CardHeader>
              <CardContent>
                <DriverLicenseUpload
                  onUpload={(urls) => setDriverLicenseUrls(urls)}
                  uploadedUrls={driverLicenseUrls}
                />
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Sutarties pasirašymas</CardTitle>
              </CardHeader>
              <CardContent>
                <DigitalSignature
                  onSign={(signature) => {
                    setSignatureData(signature);
                    setContractSigned(true);
                  }}
                  customerName={`${customer.firstName} ${customer.lastName}`}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">Mokėjimo apdorojimas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-muted rounded-lg border-2">
              <div className="text-base text-muted-foreground mb-4">
                {customer.firstName} {customer.lastName} • {booking.carName}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-base">
                  <span>Nuomos dienų:</span>
                  <span className="font-medium">{getRentalDays()} d.</span>
                </div>
                {!useCustomPricing && (
                  <div className="flex justify-between text-base">
                    <span>Dienos kaina:</span>
                    <span className="font-medium">€{getDailyRate(getRentalDays())}</span>
                  </div>
                )}
                <div className="flex justify-between text-base">
                  <span>Nuomos kaina:</span>
                  <span className="font-medium">€{getRentalCost()}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span>Užstatas:</span>
                  <span className="font-medium">€{getDepositAmount()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <span>Iš viso:</span>
                  <span>€{calculateTotal()}</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Mokėjimo būdas</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cash' | 'card_reader')} className="mt-3">
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-3 text-base cursor-pointer">
                    <Banknote className="h-5 w-5" />
                    Mokėjimas grynaisiais
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="card_reader" id="card_reader" />
                  <Label htmlFor="card_reader" className="flex items-center gap-3 text-base cursor-pointer">
                    <CreditCard className="h-5 w-5" />
                    Mokėjimas kortele
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="notes" className="text-base">Papildomi komentarai (neprivaloma)</Label>
              <Textarea
                id="notes"
                placeholder="Pridėkite papildomus komentarus apie šią rezervaciją..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2 min-h-24 text-base"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={() => {
            if (step === 'documents') setStep('details');
            else if (step === 'payment') setStep('documents');
          }}
          disabled={step === 'details'}
          size="lg"
          className="min-w-32"
        >
          Atgal
        </Button>
        <Button
          onClick={handleNextStep}
          disabled={loading}
          size="lg"
          className="min-w-40"
        >
          {loading ? 'Apdorojama...' : step === 'payment' ? 'Užbaigti rezervaciją' : 'Toliau'}
        </Button>
      </div>
    </div>
  );
}