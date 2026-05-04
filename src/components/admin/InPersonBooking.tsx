import React, { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { lt } from 'date-fns/locale';
import { calculateRentalDays } from '@/utils/rentalDuration';
import { Camera, Upload, FileText, CreditCard, Banknote, CheckCircle, Package, Baby, Shield, Map, Navigation, Users, UserCircle } from 'lucide-react';
import { DriverLicenseUpload } from './DriverLicenseUpload';
import { CustomerPicker } from './CustomerPicker';
import { DigitalSignature } from './DigitalSignature';
import { AdditionalService } from '@/contexts/BookingContext';
import { useQuery } from '@tanstack/react-query';

interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
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
  pickupTime: string;
  returnTime: string;
  dailyRate: number;
}

// Only show available cars (BMW and Chrysler are sold)
const cars = [
  { 
    id: '3', 
    name: 'Volkswagen Passat', 
    year: '2015', 
    available: true
  },
  { 
    id: '4', 
    name: 'KIA CEED', 
    year: '2013', 
    available: true
  },
  { 
    id: '5', 
    name: 'KIA CEED', 
    year: '2020', 
    available: true
  },
  { 
    id: '6', 
    name: 'Mercedes-Benz SLK', 
    year: '2015', 
    available: true
  },
  { 
    id: '7', 
    name: 'Citroën SpaceTourer', 
    year: '2025', 
    available: true
  },
];


const availableServices: AdditionalService[] = [
  {
    id: 'additional-driver',
    title: 'Papildomas vairuotojas',
    description: 'Galimybė nuomoti automobilį su papildomu vairuotoju',
    price: 4.01,
    unit: 'perDay',
    icon: Users,
  },
  {
    id: 'abroad-zone3',
    title: 'Naudojimas užsienyje - Zona 3',
    description: 'Rusija, Baltarusija, Ukraina, Moldavija',
    price: 500,
    unit: 'oneTime',
    icon: Map,
  },
  {
    id: 'abroad-zone2',
    title: 'Naudojimas užsienyje - Zona 2',
    description: 'Lenkija, Čekija, Slovakija, Vengrija, Rumunija',
    price: 300,
    unit: 'oneTime',
    icon: Map,
  },
  {
    id: 'abroad-zone1',
    title: 'Naudojimas užsienyje - Zona 1',
    description: 'Latvija, Estija',
    price: 150,
    unit: 'oneTime',
    icon: Map,
  },
  {
    id: 'roadside-assistance',
    title: 'Pagalba kelyje 24/7',
    description: 'Visą parą veikianti pagalba kelyje Lietuvoje',
    price: 15,
    unit: 'oneTime',
    icon: Navigation,
  },
  {
    id: 'tire-glass-protection',
    title: 'Padangų ir stiklų apsauga',
    description: 'Papildoma apsauga padangoms ir stiklams',
    price: 5.5,
    unit: 'perDay',
    icon: Shield,
  },
  {
    id: 'baby-seat',
    title: 'Kūdikio kėdutė (0-13kg)',
    description: 'Kūdikio kėdutė iki 13 kg svorio',
    price: 3,
    unit: 'perDay',
    icon: Baby,
  },
  {
    id: 'child-seat',
    title: 'Vaikiška kėdutė (9-36kg)',
    description: 'Vaikiška kėdutė nuo 9 iki 36 kg svorio',
    price: 3,
    unit: 'perDay',
    icon: UserCircle,
  },
];

export function InPersonBooking() {
  const [step, setStep] = useState<'details' | 'services' | 'documents' | 'payment' | 'complete'>('details');
  const [selectedServices, setSelectedServices] = useState<AdditionalService[]>([]);
  const [customer, setCustomer] = useState<Customer>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
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
    pickupTime: '10:00',
    returnTime: '10:00',
    dailyRate: 0
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'pay_at_counter'>('cash');
  const [driverLicenseUrls, setDriverLicenseUrls] = useState<{ front?: string; back?: string }>({});
  const [secondDriverLicenseUrls, setSecondDriverLicenseUrls] = useState<{ front?: string; back?: string }>({});
  const [contractSigned, setContractSigned] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [useCustomPricing, setUseCustomPricing] = useState(false);
  const [customRentalPrice, setCustomRentalPrice] = useState<string>('');
  const [customDeposit, setCustomDeposit] = useState<string>('200');
  const [pricingNotes, setPricingNotes] = useState('');
  const [isRetroactive, setIsRetroactive] = useState(false);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [skipDocuments, setSkipDocuments] = useState(false);
  const [previousDocs, setPreviousDocs] = useState<{
    licenseFront?: string;
    licenseBack?: string;
    signature?: string;
    signedAt?: string;
    fromCarName?: string;
    fromDate?: string;
  } | null>(null);

  // Fetch car pricing from DB
  const { data: dbCarPricing } = useQuery({
    queryKey: ['cars-pricing-admin'],
    queryFn: async () => {
      const { data } = await supabase
        .from('cars')
        .select('id, price_tier1, price_tier2, price_tier3, price_weekend');
      return data || [];
    },
  });

  // Get daily rate from DB pricing, with fallback defaults
  const getDbDailyRate = (days: number, carId: string): number => {
    const dbCar = (dbCarPricing || []).find(c => c.id === carId);
    if (dbCar) {
      if (days >= 7 && dbCar.price_tier3) return Number(dbCar.price_tier3);
      if (days >= 3 && dbCar.price_tier2) return Number(dbCar.price_tier2);
      if (dbCar.price_tier1) return Number(dbCar.price_tier1);
    }
    // Fallback for Mercedes SLK
    if (carId === '6') {
      if (days >= 7) return 90;
      if (days >= 3) return 100;
      return 110;
    }
    // Fallback defaults
    if (days >= 7) return 30;
    if (days >= 3) return 40;
    return 50;
  };

  // Get pricing tiers for display
  const getCarPricingTiers = (carId: string) => {
    const dbCar = (dbCarPricing || []).find(c => c.id === carId);
    if (dbCar && (dbCar.price_tier1 || dbCar.price_tier2 || dbCar.price_tier3)) {
      return {
        tier1: dbCar.price_tier1 ? Number(dbCar.price_tier1) : (carId === '6' ? 110 : 50),
        tier2: dbCar.price_tier2 ? Number(dbCar.price_tier2) : (carId === '6' ? 100 : 40),
        tier3: dbCar.price_tier3 ? Number(dbCar.price_tier3) : (carId === '6' ? 90 : 30),
      };
    }
    if (carId === '6') return { tier1: 110, tier2: 100, tier3: 90 };
    return { tier1: 50, tier2: 40, tier3: 30 };
  };

  // Fetch booked dates when car is selected
  useEffect(() => {
    if (booking.carId) {
      fetchBookedDates();
    }
  }, [booking.carId]);

  const fetchBookedDates = async () => {
    if (!booking.carId) return;
    
    console.log('🔍 Fetching booked dates for car:', booking.carId);
    
    try {
      const { data: reservations, error } = await supabase
        .from("reservations")
        .select("start_date, end_date, car_id, status")
        .eq("car_id", booking.carId)
        .in("status", ["paid", "pending", "requested", "picked_up"])
        .is("deleted_at", null);

      if (error) {
        console.error("❌ Error fetching booked dates:", error);
        return;
      }

      console.log('📅 Found reservations:', reservations);

      const dates: Date[] = [];
      reservations?.forEach((reservation) => {
        const start = new Date(reservation.start_date);
        const end = new Date(reservation.end_date);
        
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          dates.push(new Date(date));
        }
      });

      // Also fetch blocked dates
      const { data: blockedDates } = await supabase
        .from("car_blocked_dates")
        .select("blocked_date")
        .eq("car_id", booking.carId);

      blockedDates?.forEach((bd) => {
        dates.push(new Date(bd.blocked_date));
      });

      console.log('🚫 Booked dates count:', dates.length, dates);
      setBookedDates(dates);
    } catch (error) {
      console.error("❌ Error fetching booked dates:", error);
    }
  };

  const isDateBooked = (date: Date) => {
    const isBooked = bookedDates.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
    );
    if (isBooked) {
      console.log('🚫 Date is booked:', date.toDateString());
    }
    return isBooked;
  };

  const calculateTotal = () => {
    if (!booking.startDate || !booking.endDate) return 0;
    
    let total = 0;
    
    if (useCustomPricing) {
      total = parseFloat(customRentalPrice) || 0;
    } else {
      const days = getRentalDays();
      const dailyRate = getDbDailyRate(days, booking.carId);
      total = days * dailyRate;
    }
    
    // Add services cost
    const days = getRentalDays();
    selectedServices.forEach(service => {
      if (service.unit === 'perDay') {
        total += service.price * days;
      } else {
        total += service.price;
      }
    });
    
    return total;
  };
  
  const getRentalCost = () => {
    if (!booking.startDate || !booking.endDate) return 0;
    
    if (useCustomPricing) {
      return parseFloat(customRentalPrice) || 0;
    }
    
    const days = getRentalDays();
    return days * getDbDailyRate(days, booking.carId);
  };
  
  const getDepositAmount = () => {
    return 0;
  };

  const getRentalDays = () => {
    if (!booking.startDate || !booking.endDate) return 0;
    return calculateRentalDays(booking.startDate, booking.pickupTime, booking.endDate, booking.returnTime);
  };

  const handleCarSelect = (carId: string) => {
    console.log('🚗 Car selected:', carId);
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

  const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  // Check if any booked date falls within selected range
  const hasBookedDateInRange = (start: Date, end: Date, includeBoundaries = false): boolean => {
    const s = normalizeDate(start);
    const e = normalizeDate(end);

    return bookedDates.some((bookedDate) => {
      const bd = normalizeDate(bookedDate);
      return includeBoundaries ? bd >= s && bd <= e : bd > s && bd < e;
    });
  };

  const handleNextStep = () => {
    // Scroll to top when moving to next step
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (step === 'details') {
      if (!customer.firstName || !customer.lastName || !customer.email || !customer.phone || 
          !customer.address || !booking.carId || !booking.startDate || !booking.endDate ||
          !booking.pickupTime || !booking.returnTime) {
        toast.error('Prašome užpildyti visus privalomius laukus');
        return;
      }
      // Validate no booked dates in range
      if (hasBookedDateInRange(booking.startDate, booking.endDate)) {
        toast.error('Pasirinktas laikotarpis apima užimtas datas. Pasirinkite kitą laikotarpį.');
        return;
      }
      setStep('services');
    } else if (step === 'services') {
      setStep('documents');
    } else if (step === 'documents') {
      if (!skipDocuments) {
        const hasAdditionalDriver = selectedServices.some(s => s.id === 'additional-driver');
        
        if (!driverLicenseUrls.front || !contractSigned) {
          toast.error('Prašome įkelti vairuotojo pažymėjimo priekį ir pasirašyti sutartį');
          return;
        }
        
        if (hasAdditionalDriver && (!secondDriverLicenseUrls.front || !secondDriverLicenseUrls.back)) {
          toast.error('Prašome įkelti antro vairuotojo pažymėjimo priekį ir galą');
          return;
        }
      }
      
      setStep('payment');
    } else if (step === 'payment') {
      handleCompleteBooking();
    }
  };

  const toggleService = (service: AdditionalService) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
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
          p_phone: customer.phone,
          p_address: customer.address
        });

      if (customerError) throw customerError;

      // Update customer with additional info
      await supabase
        .from('customers')
        .update({
          address: customer.address,
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
      const depositAmount = 0;
      const totalAmount = rentalCost;

      const { data: reservation, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          customer_id: customerData,
          car_id: booking.carId,
          car_name: booking.carName,
          start_date: format(booking.startDate!, 'yyyy-MM-dd'),
          end_date: format(booking.endDate!, 'yyyy-MM-dd'),
          pickup_date: format(booking.startDate!, 'yyyy-MM-dd'),
          pickup_time: booking.pickupTime,
          return_date: format(booking.endDate!, 'yyyy-MM-dd'),
          return_time: booking.returnTime,
          rental_days: rentalDays,
          daily_rate: useCustomPricing ? 0 : getDbDailyRate(rentalDays, booking.carId),
          total_rental_cost: rentalCost,
          deposit_amount: depositAmount,
          total_amount: totalAmount,
          status: 'paid',
          payment_method: paymentMethod,
          payment_completed_at: new Date().toISOString(),
          driver_license_url: driverLicenseUrls.front || null,
          driver_license_back_url: driverLicenseUrls.back || null,
          second_driver_license_url: secondDriverLicenseUrls.front || null,
          second_driver_license_back_url: secondDriverLicenseUrls.back || null,
          contract_signed_at: new Date().toISOString(),
          notes: notes,
          custom_rental_price: useCustomPricing ? rentalCost : null,
          custom_deposit_amount: useCustomPricing ? depositAmount : null,
          pricing_notes: useCustomPricing ? pricingNotes : null,
          additional_services: selectedServices.length > 0 ? JSON.stringify(selectedServices) : null,
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

      // Generate contract PDF (stored in storage, attached by send-status-email)
      await supabase.functions.invoke('generate-contract-pdf', {
        body: {
          reservationId: reservation.id,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerEmail: customer.email,
          carName: booking.carName,
          startDate: format(booking.startDate!, 'yyyy-MM-dd'),
          endDate: format(booking.endDate!, 'yyyy-MM-dd'),
          totalAmount: totalAmount,
          signatureData: signatureData,
          skipEmail: true
        }
      });

      // Send status email with "paid" status (with duplicate protection)
      await supabase.functions.invoke('send-status-email', {
        body: {
          reservationId: reservation.id,
          customerEmail: customer.email,
          customerName: `${customer.firstName} ${customer.lastName}`,
          carName: booking.carName,
          startDate: format(booking.startDate!, 'yyyy-MM-dd'),
          endDate: format(booking.endDate!, 'yyyy-MM-dd'),
          totalAmount: totalAmount,
          status: 'paid',
          language: 'lt'
        }
      });
      await supabase.from('reservations').update({ last_email_sent_status: 'paid' }).eq('id', reservation.id);

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
      address: '',
      refundAccount: '',
      isCorporate: false,
      companyName: '',
      companyCode: '',
      vatCode: '',
      representativeName: '',
      representativePhone: '',
      representativeEmail: '',
    });
    setBooking({ carId: '', carName: '', startDate: null, endDate: null, pickupTime: '10:00', returnTime: '10:00', dailyRate: 0 });
    setSelectedServices([]);
    setDriverLicenseUrls({});
    setSecondDriverLicenseUrls({});
    setContractSigned(false);
    setSignatureData('');
    setNotes('');
    setUseCustomPricing(false);
    setCustomRentalPrice('');
    setCustomDeposit('200');
    setPricingNotes('');
    setIsRetroactive(false);
    setIsReturningCustomer(false);
    setSkipDocuments(false);
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
            { key: 'services', label: 'Paslaugos', shortLabel: 'Paslaugos', icon: Package },
            { key: 'documents', label: 'Dokumentai', shortLabel: 'Dokumentai', icon: Upload },
            { key: 'payment', label: 'Mokėjimas', shortLabel: 'Mokėjimas', icon: CreditCard }
          ].map(({ key, label, shortLabel, icon: Icon }, index) => (
            <div key={key} className="flex items-center flex-1">
              <div className={`rounded-full p-2 sm:p-3 lg:p-4 flex-shrink-0 ${
                step === key ? 'bg-primary text-primary-foreground' : 
                (step === 'services' && key === 'details') ||
                (step === 'documents' && (key === 'details' || key === 'services')) ||
                (step === 'payment' && (key === 'details' || key === 'services' || key === 'documents'))
                  ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </div>
              <span className="ml-2 sm:ml-3 font-medium text-sm sm:text-base lg:text-lg">
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </span>
              {index < 3 && (
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
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-lg sm:text-xl">Kliento informacija</CardTitle>
                  <CustomerPicker
                    size="sm"
                    onSelect={async (c) => {
                      setCustomer({
                        firstName: c.firstName,
                        lastName: c.lastName,
                        email: c.email,
                        phone: c.phone,
                        address: c.address,
                        refundAccount: c.refundAccount,
                        isCorporate: c.isCorporate,
                        companyName: c.companyName,
                        companyCode: c.companyCode,
                        vatCode: c.vatCode,
                        representativeName: c.representativeName,
                        representativePhone: c.representativePhone,
                        representativeEmail: c.representativeEmail,
                      });
                      setIsReturningCustomer(true);
                      setSkipDocuments(true);
                      toast.success(`Užkrautas pakartotinis klientas: ${c.firstName} ${c.lastName}. Dokumentų ir parašo etapas praleidžiamas.`);

                      // Fetch latest reservation with documents/signature
                      try {
                        const { data: prevRes } = await supabase
                          .from('reservations')
                          .select('id, car_name, start_date, driver_license_url, driver_license_back_url, contract_signed_at')
                          .eq('customer_id', c.id)
                          .is('deleted_at', null)
                          .not('driver_license_url', 'is', null)
                          .order('created_at', { ascending: false })
                          .limit(1)
                          .maybeSingle();

                        let signature: string | undefined;
                        let signedAt: string | undefined;
                        if (prevRes?.id) {
                          const { data: sig } = await supabase
                            .from('contract_signatures')
                            .select('signature_data, signed_at')
                            .eq('reservation_id', prevRes.id)
                            .order('signed_at', { ascending: false })
                            .limit(1)
                            .maybeSingle();
                          signature = sig?.signature_data;
                          signedAt = sig?.signed_at ?? prevRes.contract_signed_at ?? undefined;
                        }

                        if (prevRes) {
                          setPreviousDocs({
                            licenseFront: prevRes.driver_license_url ?? undefined,
                            licenseBack: prevRes.driver_license_back_url ?? undefined,
                            signature,
                            signedAt,
                            fromCarName: prevRes.car_name ?? undefined,
                            fromDate: prevRes.start_date ?? undefined,
                          });
                          // Pre-fill so PDF / DB still get values
                          setDriverLicenseUrls({
                            front: prevRes.driver_license_url ?? undefined,
                            back: prevRes.driver_license_back_url ?? undefined,
                          });
                          if (signature) {
                            setSignatureData(signature);
                            setContractSigned(true);
                          }
                        } else {
                          setPreviousDocs(null);
                        }
                      } catch (err) {
                        console.error('Failed to load previous documents', err);
                      }
                    }}
                  />
                </div>
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
                  <Label htmlFor="address" className="text-sm sm:text-base">Gyvenamasis adresas *</Label>
                  <Input
                    id="address"
                    value={customer.address}
                    onChange={(e) => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base"
                    placeholder="Gatvė, namo nr., miestas"
                  />
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
                        <SelectItem key={car.id} value={car.id} disabled={!car.available} className="text-sm p-3 sm:p-4">
                          <div className="flex items-center justify-between w-full gap-2 sm:gap-4">
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                              <span className="font-medium text-sm sm:text-base truncate">{car.name}</span>
                              <span className="text-xs sm:text-sm text-muted-foreground">{car.year}</span>
                            </div>
                            {car.available ? (
                              <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white shrink-0 text-xs">Laisvas</Badge>
                            ) : (
                              <Badge variant="destructive" className="shrink-0 text-xs">Užimtas</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Retroactive Booking Toggle */}
                  <div className="p-3 sm:p-4 border rounded-lg bg-amber-50 border-amber-200">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Checkbox 
                        id="isRetroactive" 
                        checked={isRetroactive} 
                        onCheckedChange={(checked) => {
                          setIsRetroactive(checked as boolean);
                          if (!checked) {
                            setBooking(prev => ({ ...prev, startDate: null, endDate: null }));
                          }
                        }}
                        className="mt-1"
                      />
                      <Label htmlFor="isRetroactive" className="cursor-pointer font-medium text-xs sm:text-sm leading-tight flex-1">
                        Atgalinė rezervacija (leisti praeities datas)
                      </Label>
                    </div>
                    {isRetroactive && (
                      <p className="text-xs text-amber-700 mt-2 ml-6 sm:ml-7">
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
                        onSelect={(date) => {
                          setBooking((prev) => {
                            if (!date) {
                              return { ...prev, startDate: null, endDate: null };
                            }

                            const nextStart = normalizeDate(date);
                            const currentEnd = prev.endDate ? normalizeDate(prev.endDate) : null;
                            const shouldClearEnd =
                              !currentEnd ||
                              currentEnd <= nextStart ||
                              hasBookedDateInRange(nextStart, currentEnd);

                            return {
                              ...prev,
                              startDate: date,
                              endDate: shouldClearEnd ? null : prev.endDate,
                            };
                          });
                        }}
                        disabled={(date) => {
                          if (isDateBooked(date)) return true;

                          if (isRetroactive) {
                            return false;
                          }

                          const today = normalizeDate(new Date());
                          const compareDate = normalizeDate(date);
                          return compareDate < today;
                        }}
                        modifiers={{
                          booked: (date) => isDateBooked(date)
                        }}
                        modifiersClassNames={{
                          booked: "bg-destructive/20 text-destructive font-semibold"
                        }}
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
                        onSelect={(date) => {
                          if (!date) {
                            setBooking((prev) => ({ ...prev, endDate: null }));
                            return;
                          }

                          if (!booking.startDate) {
                            return;
                          }

                          if (hasBookedDateInRange(booking.startDate, date)) {
                            toast.error('Pasirinktas laikotarpis apima užimtas datas. Pasirinkite kitą pabaigos datą.');
                            setBooking((prev) => ({ ...prev, endDate: null }));
                            return;
                          }

                          setBooking((prev) => ({ ...prev, endDate: date }));
                        }}
                        disabled={(date) => {
                          if (!booking.startDate) return true;

                          const startDate = normalizeDate(booking.startDate);
                          const endDate = normalizeDate(date);

                          if (endDate <= startDate) return true;
                          if (isDateBooked(date)) return true;

                          return hasBookedDateInRange(startDate, endDate);
                        }}
                        modifiers={{
                          booked: (date) => isDateBooked(date)
                        }}
                        modifiersClassNames={{
                          booked: "bg-destructive/20 text-destructive font-semibold"
                        }}
                        locale={lt}
                        className="rounded-lg border-2 bg-card shadow-sm w-full"
                      />
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="pickupTime" className="text-sm sm:text-base">Paėmimo laikas *</Label>
                      <Select value={booking.pickupTime} onValueChange={(value) => setBooking(prev => ({ ...prev, pickupTime: value }))}>
                        <SelectTrigger id="pickupTime" className="h-10 sm:h-12 text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          {Array.from({ length: 25 }, (_, i) => {
                            const hour = Math.floor(8 + i / 2);
                            const minute = i % 2 === 0 ? '00' : '30';
                            if (hour > 20) return null;
                            const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                            return (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="returnTime" className="text-sm sm:text-base">Grąžinimo laikas *</Label>
                      <Select value={booking.returnTime} onValueChange={(value) => setBooking(prev => ({ ...prev, returnTime: value }))}>
                        <SelectTrigger id="returnTime" className="h-10 sm:h-12 text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border z-50">
                          {Array.from({ length: 25 }, (_, i) => {
                            const hour = Math.floor(8 + i / 2);
                            const minute = i % 2 === 0 ? '00' : '30';
                            if (hour > 20) return null;
                            const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                            return (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {booking.startDate && booking.endDate && booking.carId && (
                  <div className="space-y-4">
                    {/* Pricing Explanation */}
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm sm:text-base font-medium text-blue-900 mb-2">
                        Kainų struktūra ({booking.carName}):
                      </div>
                      {(() => {
                        const tiers = getCarPricingTiers(booking.carId);
                        return (
                          <div className="space-y-1 text-xs sm:text-sm text-blue-800">
                            <div>• 1-3 dienos: €{tiers.tier1}/dieną</div>
                            <div>• 3-7 dienos: €{tiers.tier2}/dieną</div>
                            <div>• 7+ dienų: €{tiers.tier3}/dieną</div>
                          </div>
                        );
                      })()}
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
                          <span className="font-medium text-primary">
                            {(() => {
                              const days = getRentalDays();
                              if (days >= 7) return '7+ dienų';
                              if (days >= 3) return '3-7 dienos';
                              return '1-3 dienos';
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Dienos kaina:</span>
                          <span className="font-medium">€{getDbDailyRate(getRentalDays(), booking.carId)}</span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Nuomos kaina:</span>
                          <span className="font-medium">€{useCustomPricing ? customRentalPrice : getRentalCost()}</span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Užstatas:</span>
                          <span className="font-medium">€{useCustomPricing ? customDeposit : 200}</span>
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
                              setCustomDeposit('200');
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
                                placeholder="200.00"
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

      {step === 'services' && (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Pasirinkite papildomas paslaugas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {availableServices.map((service) => {
                  const isSelected = selectedServices.find(s => s.id === service.id);
                  const Icon = service.icon;
                  const servicePrice = service.unit === 'perDay' 
                    ? service.price * getRentalDays() 
                    : service.price;
                  
                  return (
                    <div key={service.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-base mb-1">{service.title}</div>
                          <div className="text-sm text-muted-foreground mb-2">{service.description}</div>
                          <div className="text-sm font-medium text-primary">
                            €{servicePrice.toFixed(2)}
                            {service.unit === 'perDay' && ` (€${service.price}/dieną × ${getRentalDays()} d.)`}
                            {service.unit === 'oneTime' && ' (vienkartinis)'}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={!!isSelected}
                        onCheckedChange={() => toggleService(service)}
                      />
                    </div>
                  );
                })}
              </div>

              {selectedServices.length > 0 && (
                <div className="mt-6 p-4 bg-muted rounded-lg border-2">
                  <div className="space-y-2">
                    <div className="font-medium text-base mb-3">Pasirinktos paslaugos:</div>
                    {selectedServices.map((service) => {
                      const servicePrice = service.unit === 'perDay' 
                        ? service.price * getRentalDays() 
                        : service.price;
                      return (
                        <div key={service.id} className="flex justify-between text-sm">
                          <span>{service.title}</span>
                          <span className="font-medium">€{servicePrice.toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-base">
                      <span>Paslaugų suma:</span>
                      <span>
                        €{selectedServices.reduce((total, service) => {
                          const price = service.unit === 'perDay' 
                            ? service.price * getRentalDays() 
                            : service.price;
                          return total + price;
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'documents' && (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {isReturningCustomer && (
            <Card className="w-full border-primary/40 bg-primary/5">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="skipDocuments"
                    checked={skipDocuments}
                    onCheckedChange={(checked) => setSkipDocuments(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="skipDocuments" className="cursor-pointer font-medium text-sm sm:text-base">
                      Pakartotinis klientas — praleisti dokumentus ir parašą
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Klientas jau yra pateikęs vairuotojo pažymėjimą ir pasirašęs anksčiau. Šio etapo nereikia kartoti.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!skipDocuments && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Main Driver License */}
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Pagrindinis vairuotojas</CardTitle>
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

              {/* Second Driver License - shown only if additional driver service selected */}
              {selectedServices.some(s => s.id === 'additional-driver') && (
                <>
                  <Separator className="my-8" />
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Antras vairuotojas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Įkelkite antro vairuotojo pažymėjimo priekį ir galą
                      </p>
                      <DriverLicenseUpload
                        onUpload={(urls) => setSecondDriverLicenseUrls(urls)}
                        uploadedUrls={secondDriverLicenseUrls}
                      />
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
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
                    <span className="font-medium">€{getDbDailyRate(getRentalDays(), booking.carId)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base">
                  <span>Nuomos kaina:</span>
                  <span className="font-medium">€{getRentalCost()}</span>
                </div>
                {selectedServices.length > 0 && (
                  <>
                    <Separator />
                    <div className="text-sm font-medium">Papildomos paslaugos:</div>
                    {selectedServices.map((service) => {
                      const servicePrice = service.unit === 'perDay' 
                        ? service.price * getRentalDays() 
                        : service.price;
                      return (
                        <div key={service.id} className="flex justify-between text-sm text-muted-foreground">
                          <span>{service.title}</span>
                          <span>€{servicePrice.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <span>Iš viso:</span>
                  <span>€{calculateTotal()}</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Mokėjimo būdas</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cash' | 'pay_at_counter')} className="mt-3">
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-3 text-base cursor-pointer">
                    <Banknote className="h-5 w-5" />
                    Mokėjimas grynaisiais
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="pay_at_counter" id="pay_at_counter" />
                  <Label htmlFor="pay_at_counter" className="flex items-center gap-3 text-base cursor-pointer">
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
            if (step === 'services') setStep('details');
            else if (step === 'documents') setStep('services');
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