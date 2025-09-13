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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Camera, Upload, FileText, CreditCard, Banknote, CheckCircle } from 'lucide-react';
import { DriverLicenseUpload } from './DriverLicenseUpload';
import { DigitalSignature } from './DigitalSignature';

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface BookingDetails {
  carId: string;
  carName: string;
  startDate: Date | null;
  endDate: Date | null;
  dailyRate: number;
}

const cars = [
  { id: 'kia-ceed-2020', name: 'Kia Ceed 2020', dailyRate: 30, available: true },
  { id: 'bmw-3-2017', name: 'BMW 3 Series 2017', dailyRate: 50, available: true },
  { id: 'vw-passat-2019', name: 'VW Passat 2019', dailyRate: 40, available: false },
  { id: 'chrysler-town-country', name: 'Chrysler Town & Country', dailyRate: 35, available: true },
];

export function InPersonBooking() {
  const [step, setStep] = useState<'details' | 'documents' | 'payment' | 'complete'>('details');
  const [customer, setCustomer] = useState<Customer>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [booking, setBooking] = useState<BookingDetails>({
    carId: '',
    carName: '',
    startDate: null,
    endDate: null,
    dailyRate: 0
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card_reader'>('cash');
  const [driverLicenseUrl, setDriverLicenseUrl] = useState<string>('');
  const [contractSigned, setContractSigned] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    if (!booking.startDate || !booking.endDate) return 0;
    const days = Math.ceil((booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const rentalCost = days * booking.dailyRate;
    const deposit = 300;
    return rentalCost + deposit;
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
        carName: selectedCar.name,
        dailyRate: selectedCar.dailyRate
      }));
    }
  };

  const handleNextStep = () => {
    if (step === 'details') {
      if (!customer.firstName || !customer.lastName || !customer.email || !customer.phone || 
          !booking.carId || !booking.startDate || !booking.endDate) {
        toast.error('Prašome užpildyti visus privalomius laukus');
        return;
      }
      setStep('documents');
    } else if (step === 'documents') {
      if (!driverLicenseUrl || !contractSigned) {
        toast.error('Prašome įkelti vairuotojo pažymėjimą ir pasirašyti sutartį');
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

      // Create reservation
      const rentalDays = getRentalDays();
      const rentalCost = rentalDays * booking.dailyRate;
      const totalAmount = rentalCost + 300; // 300 EUR deposit

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          customer_id: customerData,
          car_id: booking.carId,
          car_name: booking.carName,
          start_date: format(booking.startDate!, 'yyyy-MM-dd'),
          end_date: format(booking.endDate!, 'yyyy-MM-dd'),
          rental_days: rentalDays,
          daily_rate: booking.dailyRate,
          total_rental_cost: rentalCost,
          total_amount: totalAmount,
          status: 'confirmed',
          payment_method: paymentMethod,
          payment_completed_at: new Date().toISOString(),
          driver_license_url: driverLicenseUrl,
          contract_signed_at: new Date().toISOString(),
          notes: notes
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
    setCustomer({ firstName: '', lastName: '', email: '', phone: '' });
    setBooking({ carId: '', carName: '', startDate: null, endDate: null, dailyRate: 0 });
    setDriverLicenseUrl('');
    setContractSigned(false);
    setSignatureData('');
    setNotes('');
  };

  if (step === 'complete') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-primary flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6" />
            Rezervacija užbaigta!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-lg">
            Ačiū, {customer.firstName}! Jūsų rezervacija buvo patvirtinta.
          </div>
          <div className="text-muted-foreground">
            Patvirtinimo laiškas su pasirašyta sutartimi išsiųstas į {customer.email}
          </div>
          <Button onClick={resetForm} className="w-full" size="lg">
            Sukurti naują rezervaciją
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-8 bg-background p-4 rounded-lg border">
        {[
          { key: 'details', label: 'Rezervacijos duomenys', icon: FileText },
          { key: 'documents', label: 'Dokumentai', icon: Upload },
          { key: 'payment', label: 'Mokėjimas', icon: CreditCard }
        ].map(({ key, label, icon: Icon }, index) => (
          <div key={key} className="flex items-center">
            <div className={`rounded-full p-4 ${
              step === key ? 'bg-primary text-primary-foreground' : 
              (step === 'documents' && key === 'details') ||
              (step === 'payment' && (key === 'details' || key === 'documents'))
                ? 'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              <Icon className="h-6 w-6" />
            </div>
            <span className="ml-3 font-medium text-lg">{label}</span>
            {index < 2 && <div className="w-16 h-px bg-muted mx-6" />}
          </div>
        ))}
      </div>

      {step === 'details' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Kliento informacija</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-base">Vardas *</Label>
                  <Input
                    id="firstName"
                    value={customer.firstName}
                    onChange={(e) => setCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-base">Pavardė *</Label>
                  <Input
                    id="lastName"
                    value={customer.lastName}
                    onChange={(e) => setCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    className="h-12 text-base"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-base">El. paštas *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-base">Telefonas *</Label>
                <Input
                  id="phone"
                  value={customer.phone}
                  onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  required
                  className="h-12 text-base"
                  placeholder="+370..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Nuomos duomenys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="car" className="text-base">Pasirinkite automobilį *</Label>
                <Select value={booking.carId} onValueChange={handleCarSelect}>
                  <SelectTrigger className="h-12 text-base bg-background border-2">
                    <SelectValue placeholder="Pasirinkite automobilį" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={car.id} disabled={!car.available} className="text-base p-3">
                        <div className="flex items-center justify-between w-full">
                          <span>{car.name}</span>
                          <div className="flex items-center gap-2 ml-4">
                            <span>€{car.dailyRate}/d.</span>
                            {car.available ? (
                              <Badge variant="default" className="bg-green-500">Laisvas</Badge>
                            ) : (
                              <Badge variant="destructive">Užimtas</Badge>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base">Pradžios data *</Label>
                  <Calendar
                    mode="single"
                    selected={booking.startDate || undefined}
                    onSelect={(date) => setBooking(prev => ({ ...prev, startDate: date || null }))}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border-2 bg-background"
                  />
                </div>
                <div>
                  <Label className="text-base">Pabaigos data *</Label>
                  <Calendar
                    mode="single"
                    selected={booking.endDate || undefined}
                    onSelect={(date) => setBooking(prev => ({ ...prev, endDate: date || null }))}
                    disabled={(date) => !booking.startDate || date <= booking.startDate}
                    className="rounded-md border-2 bg-background"
                  />
                </div>
              </div>

              {booking.startDate && booking.endDate && booking.dailyRate > 0 && (
                <div className="p-6 bg-muted rounded-lg border-2">
                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span>Nuomos dienų:</span>
                      <span className="font-medium">{getRentalDays()} d.</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span>Dienos kaina:</span>
                      <span className="font-medium">€{booking.dailyRate}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span>Nuomos kaina:</span>
                      <span className="font-medium">€{getRentalDays() * booking.dailyRate}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span>Užstatas:</span>
                      <span className="font-medium">€300</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Iš viso:</span>
                      <span>€{calculateTotal()}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'documents' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Vairuotojo pažymėjimo įkėlimas</CardTitle>
            </CardHeader>
            <CardContent>
              <DriverLicenseUpload
                onUpload={(url) => setDriverLicenseUrl(url)}
                uploadedUrl={driverLicenseUrl}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Sutarties pasirašymas</CardTitle>
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
      )}

      {step === 'payment' && (
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">Mokėjimo apdorojimas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-muted rounded-lg border-2">
              <div className="text-xl font-semibold mb-2">Bendra suma: €{calculateTotal()}</div>
              <div className="text-base text-muted-foreground">
                {customer.firstName} {customer.lastName} • {booking.carName}
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