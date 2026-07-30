import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2, Ban, Car, Users, BarChart3, Settings, Edit, CheckCircle, XCircle, FileText, DollarSign, History, Mail, CheckSquare, Square, Receipt } from 'lucide-react';
import { InvoiceManager } from '@/components/admin/InvoiceManager';
import { InvoiceList } from '@/components/admin/InvoiceList';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/sections/footer';
import CarManagementModal from '@/components/admin/CarManagementModal';

import { ConfirmationDialog } from '@/components/ui/alert-confirmation-dialog';
import bmw3Clean from "@/assets/bmw-3-clean.png";
import chryslerTownCountrySide from "@/assets/chrysler-town-country-side.png";
import vwPassatSideClean from "@/assets/vw-passat-side-clean.png";
import kiaCeedWagonSideClean from "@/assets/kia-ceed-wagon-side-clean.png";
import kiaCeedHatchbackSideCleanGray from "@/assets/kia-ceed-hatchback-side-khaki.png.asset.json";
import mercedesSlkSideClean from "@/assets/mercedes-slk-side-clean.png.asset.json";
import citroenSpacetourerSide from "@/assets/citroen-spacetourer-side-clean.png.asset.json";
import hyundaiBayonSide from "@/assets/hyundai-bayon-side-clean.png.asset.json";

// Image mapping object for car images
const imageMap: { [key: string]: string } = {
  bmw3Clean,
  chryslerTownCountrySide,
  vwPassatSideClean,
  kiaCeedWagonSideClean,
  kiaCeedHatchbackSideCleanGray,
  mercedesSlkSideClean,
  citroenSpacetourerSide,
  hyundaiBayonSide,
};

// Function to get the correct image for a car
const getCarImage = (car: any) => {
  // Map car names to image keys
  const nameToImageMap: { [key: string]: string } = {
    'BMW 3 series': 'bmw3Clean',
    'Chrysler Town & Country': 'chryslerTownCountrySide',
    'Volkswagen Passat': 'vwPassatSideClean',
    'KIA CEED': car.category === 'Universalas' ? 'kiaCeedWagonSideClean' : 'kiaCeedHatchbackSideCleanGray',
    'Mercedes-Benz SLK': 'mercedesSlkSideClean',
    'Citroën SpaceTourer': 'citroenSpacetourerSide',
    'Hyundai Bayon Cross': 'hyundaiBayonSide',
  };
  
  const imageKey = nameToImageMap[car.name] || 'bmw3Clean';
  return imageMap[imageKey] || car.image_url || '';
};

// Function to parse pricing notes from JSON to readable text
const parsePricingNotes = (notes: string | null | undefined): string => {
  if (!notes) return '';
  
  // If it's already readable text (not JSON), return as-is
  if (!notes.trim().startsWith('{')) return notes;
  
  try {
    const parsed = JSON.parse(notes);
    const notesList: string[] = [];
    
    if (parsed.insurance) {
      notesList.push(`Draudimas: ${parsed.insurance.title} (€${parsed.insurance.pricePerDay}/d, Išskaita €${parsed.insurance.excess})`);
    }
    
    if (parsed.services && Array.isArray(parsed.services) && parsed.services.length > 0) {
      const servicesList = parsed.services
        .map((s: any) => `${s.title} (€${s.price}${s.unit === 'perDay' ? '/d' : ''})`)
        .join(', ');
      notesList.push(`Paslaugos: ${servicesList}`);
    }
    
    return notesList.join('. ');
  } catch (e) {
    console.error('Failed to parse pricing_notes:', e);
    return notes; // Return original if parsing fails
  }
};
import kiaCeedFrontEnhanced from "@/assets/kia-ceed-front-enhanced.png";
import { InPersonBooking } from "@/components/admin/InPersonBooking";
import { ReservationReview } from "@/components/admin/ReservationReview";
import { RecycleBin } from "@/components/admin/RecycleBin";
import { PricingOverrideModal } from "@/components/admin/PricingOverrideModal";
import { EmailTester } from "@/components/admin/EmailTester";

interface Reservation {
  id: string;
  car_name: string;
  car_id: string;
  start_date: string;
  end_date: string;
  rental_days: number;
  daily_rate: number;
  total_rental_cost: number;
  deposit_amount: number;
  total_amount: number;
  custom_rental_price?: number;
  custom_deposit_amount?: number;
  pricing_notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
  returned_at?: string;
  driver_license_url?: string;
  customers: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCarCalendar, setShowCarCalendar] = useState(false);
  const [selectedCar, setSelectedCar] = useState<{id: string, name: string} | null>(null);
  const [showReservationReview, setShowReservationReview] = useState(false);
  const [reviewingReservation, setReviewingReservation] = useState<Reservation | null>(null);
  const [showPricingOverride, setShowPricingOverride] = useState(false);
  const [pricingReservation, setPricingReservation] = useState<Reservation | null>(null);
  const [invoiceReservation, setInvoiceReservation] = useState<Reservation | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    variant: "default"
  });

  const [cars, setCars] = useState<any[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set());
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  // IDs of sold cars to hide from admin panel
  const hiddenCarIds = ["1", "2"]; // BMW 3 series, Chrysler Town & Country

  const fetchCars = async () => {
    try {
      setIsLoadingCars(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('name');

      if (error) throw error;
      // Filter out sold cars
      const visibleCars = (data || []).filter(car => !hiddenCarIds.includes(car.id));
      setCars(visibleCars);
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko gauti automobilių: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingCars(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const carOptions = cars.map(car => car.name);

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    console.log('Admin page - Auth state:', { user: !!user, isAdmin, loading, userEmail: user?.email });
    if (!loading && user && isAdmin) {
      console.log('Admin authenticated - fetching reservations');
      fetchReservations();
    } else if (!loading && user && !isAdmin) {
      console.log('User authenticated but not admin:', user.email);
    } else if (!loading && !user) {
      console.log('No user authenticated');
    }
  }, [user, isAdmin, loading]);

  // Redirect non-admin users to auth page with better error handling
  if (!loading && !user) {
    console.log('Admin redirect - no user:', { user: !!user, isAdmin, loading });
    return <Navigate to="/auth" replace />;
  }

  if (!loading && user && !isAdmin) {
    console.log('Admin redirect - not admin:', { user: !!user, isAdmin, loading, email: user?.email });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Prieiga draudžiama</h2>
          <p className="text-muted-foreground">Jūs neturite administratoriaus teisių</p>
          <Button onClick={() => window.location.href = '/'}>
            Grįžti į pagrindinį puslapį
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const fetchReservations = async () => {
    try {
      const [resResult, phoneResult, carsResult] = await Promise.all([
        supabase
          .from('reservations')
          .select(`
            *,
            customers (
              id,
              first_name,
              last_name,
              email,
              phone,
              address
            )
          `)
          .is('deleted_at', null)
          .order('created_at', { ascending: false }),
        supabase
          .from('car_blocked_dates')
          .select('*')
          .eq('reservation_type', 'phone_reservation')
          .order('blocked_date', { ascending: true }),
        supabase.from('cars').select('id, name'),
      ]);

      if (resResult.error) throw resResult.error;

      // Group phone_reservation blocked_dates into consecutive ranges per (car_id, contact_name, contact_phone, reason)
      const carNameMap = new Map<string, string>();
      (carsResult.data || []).forEach((c: any) => carNameMap.set(c.id, c.name));

      const phoneRows = (phoneResult.data || []) as any[];
      const groups = new Map<string, any[]>();
      phoneRows.forEach(row => {
        const key = `${row.car_id}|${row.contact_name || ''}|${row.contact_phone || ''}|${row.reason || ''}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(row);
      });

      const phoneReservations: Reservation[] = [];
      groups.forEach((rows) => {
        rows.sort((a, b) => a.blocked_date.localeCompare(b.blocked_date));
        let runStart = rows[0];
        let prev = rows[0];
        const flush = (start: any, end: any) => {
          const startDate = new Date(start.blocked_date + 'T12:00:00');
          const endDate = new Date(end.blocked_date + 'T12:00:00');
          const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          phoneReservations.push({
            id: `phone-${start.id}`,
            car_name: carNameMap.get(start.car_id) || start.car_id,
            car_id: start.car_id,
            start_date: start.blocked_date,
            end_date: end.blocked_date,
            rental_days: days,
            daily_rate: 0,
            total_rental_cost: 0,
            deposit_amount: 0,
            total_amount: 0,
            status: 'phone_reservation',
            created_at: start.created_at,
            updated_at: start.created_at,
            customers: {
              id: '',
              first_name: start.contact_name || 'Telefoninė',
              last_name: '',
              email: start.reason || '',
              phone: start.contact_phone || '',
            },
          } as Reservation);
        };
        for (let i = 1; i < rows.length; i++) {
          const prevDate = new Date(prev.blocked_date + 'T12:00:00');
          const currDate = new Date(rows[i].blocked_date + 'T12:00:00');
          const diff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          if (diff > 1) {
            flush(runStart, prev);
            runStart = rows[i];
          }
          prev = rows[i];
        }
        flush(runStart, prev);
      });

      const merged = [...(resResult.data || []), ...phoneReservations].sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setReservations(merged as any);
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko gauti rezervacijų: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  const deleteReservation = async (id: string) => {
    const isPhone = id.startsWith('phone-');
    setConfirmDialog({
      isOpen: true,
      title: isPhone ? "Ar tikrai norite ištrinti šią telefoninę rezervaciją?" : "Ar tikrai norite ištrinti šią rezervaciją?",
      description: isPhone ? "Telefoninė rezervacija bus visam laikui pašalinta iš kalendoriaus." : "Rezervacija bus perkelta į šiukšlinę. Galėsite ją atkurti.",
      variant: "destructive",
      onConfirm: async () => {
        try {
          if (isPhone) {
            // Find the source row by the seed id stored in synthetic id
            const seedId = id.replace('phone-', '');
            const { data: seedRow } = await supabase
              .from('car_blocked_dates')
              .select('*')
              .eq('id', seedId)
              .maybeSingle();

            if (seedRow) {
              const { error } = await supabase
                .from('car_blocked_dates')
                .delete()
                .eq('car_id', (seedRow as any).car_id)
                .eq('reservation_type', 'phone_reservation')
                .eq('contact_name', (seedRow as any).contact_name)
                .eq('contact_phone', (seedRow as any).contact_phone)
                .eq('reason', (seedRow as any).reason);
              if (error) throw error;
            }

            toast({ title: "Ištrinta", description: "Telefoninė rezervacija pašalinta." });
            fetchReservations();
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          const { error } = await supabase
            .from('reservations')
            .update({ 
              deleted_at: new Date().toISOString(),
              deleted_by: user?.id || null 
            })
            .eq('id', id);

          if (error) throw error;

          toast({
            title: "Perkelta į šiukšlinę",
            description: "Rezervacija perkelta į šiukšlinę.",
          });

          fetchReservations();
        } catch (error: any) {
          toast({
            title: "Klaida",
            description: "Nepavyko ištrinti rezervacijos: " + error.message,
            variant: "destructive",
          });
        } finally {
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };


  const cancelReservation = async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Ar tikrai norite atšaukti šią rezervaciją?",
      description: "Rezervacija bus atšaukta ir perkelta į šiukšlinę. Klientui bus pranešta apie atšaukimą.",
      variant: "default",
      onConfirm: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          // Get reservation details for email
          const { data: reservation } = await supabase
            .from('reservations')
            .select('*, customers(*)')
            .eq('id', id)
            .single();

          const { error } = await supabase
            .from('reservations')
            .update({ 
              status: 'cancelled',
              deleted_at: new Date().toISOString(),
              deleted_by: user?.id || null
            })
            .eq('id', id);

          if (error) throw error;

          // Send cancellation email (only if not already sent)
          if (reservation && reservation.last_email_sent_status !== 'cancelled') {
            await supabase.functions.invoke('send-status-email', {
              body: {
                reservationId: reservation.id,
                customerEmail: reservation.customers.email,
                customerName: `${reservation.customers.first_name} ${reservation.customers.last_name}`,
                carName: reservation.car_name,
                startDate: format(new Date(reservation.start_date), 'yyyy-MM-dd'),
                endDate: format(new Date(reservation.end_date), 'yyyy-MM-dd'),
                totalAmount: reservation.total_amount,
                status: 'cancelled',
                language: (reservation as any).language || 'lt'
              }
            });
            await supabase.from('reservations').update({ last_email_sent_status: 'cancelled' }).eq('id', id);
          }

          toast({
            title: "Sėkmingai atšaukta",
            description: "Rezervacija atšaukta ir perkelta į šiukšlinę.",
          });

          fetchReservations();
        } catch (error: any) {
          toast({
            title: "Klaida",
            description: "Nepavyko atšaukti rezervacijos: " + error.message,
            variant: "destructive",
          });
        } finally {
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };


  const approveReservation = async (id: string) => {
    try {
      // Get reservation details for email
      const { data: reservation } = await supabase
        .from('reservations')
        .select('*, customers(*)')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('reservations')
        .update({ status: 'paid' })
        .eq('id', id);

      if (error) throw error;

      // Generate PDF if it doesn't exist, then send confirmation email
      if (reservation) {
        let contractPdfUrl = reservation.contract_pdf_url;
        
        // Generate PDF if not already generated
        if (!contractPdfUrl) {
          try {
            const { data: pdfData } = await supabase.functions.invoke('generate-contract-pdf', {
              body: {
                reservationId: reservation.id,
                customerName: `${reservation.customers.first_name} ${reservation.customers.last_name}`,
                customerEmail: reservation.customers.email,
                customerPhone: reservation.customers.phone,
                carName: reservation.car_name,
                startDate: format(new Date(reservation.start_date), 'yyyy-MM-dd'),
                endDate: format(new Date(reservation.end_date), 'yyyy-MM-dd'),
                totalAmount: reservation.total_amount,
                depositAmount: reservation.deposit_amount,
                language: (reservation as any).language || 'lt',
                skipEmail: true
              }
            });
            
            if (pdfData?.contractUrl) {
              contractPdfUrl = pdfData.contractUrl;
              // Update reservation with PDF URL
              await supabase
                .from('reservations')
                .update({ contract_pdf_url: contractPdfUrl })
                .eq('id', id);
            }
          } catch (pdfError) {
            console.error('Error generating PDF:', pdfError);
            // Continue without PDF if generation fails
          }
        }
        
        // Send confirmation email with PDF (only if not already sent for this status)
        if (reservation.last_email_sent_status !== 'paid') {
          await supabase.functions.invoke('send-status-email', {
            body: {
              reservationId: reservation.id,
              customerEmail: reservation.customers.email,
              customerName: `${reservation.customers.first_name} ${reservation.customers.last_name}`,
              carName: reservation.car_name,
              startDate: format(new Date(reservation.start_date), 'yyyy-MM-dd'),
              endDate: format(new Date(reservation.end_date), 'yyyy-MM-dd'),
              totalAmount: reservation.total_amount,
              status: 'paid',
              contractPdfUrl: contractPdfUrl,
              language: (reservation as any).language || 'lt'
            }
          });
          await supabase.from('reservations').update({ last_email_sent_status: 'paid' }).eq('id', id);
        }
      }

      toast({
        title: "Rezervacija patvirtinta",
        description: "Rezervacija buvo sėkmingai patvirtinta ir klientui išsiųstas pranešimas.",
      });

      fetchReservations();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko patvirtinti rezervacijos: " + error.message,
        variant: "destructive",
      });
    }
  };

  const denyReservation = async (id: string) => {
    try {
      // Get reservation details for email
      const { data: reservation } = await supabase
        .from('reservations')
        .select('*, customers(*)')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('reservations')
        .update({ status: 'denied' })
        .eq('id', id);

      if (error) throw error;

      // Send denial email (only if not already sent)
      if (reservation && reservation.last_email_sent_status !== 'denied') {
        await supabase.functions.invoke('send-status-email', {
          body: {
            reservationId: reservation.id,
            customerEmail: reservation.customers.email,
            customerName: `${reservation.customers.first_name} ${reservation.customers.last_name}`,
            carName: reservation.car_name,
            startDate: format(new Date(reservation.start_date), 'yyyy-MM-dd'),
            endDate: format(new Date(reservation.end_date), 'yyyy-MM-dd'),
            totalAmount: reservation.total_amount,
            status: 'cancelled',
            language: (reservation as any).language || 'lt'
          }
        });
        await supabase.from('reservations').update({ last_email_sent_status: 'denied' }).eq('id', id);
      }

      toast({
        title: "Rezervacija atmesta",
        description: "Rezervacija buvo atmesta ir klientui išsiųstas pranešimas.",
      });

      fetchReservations();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko atmesti rezervacijos: " + error.message,
        variant: "destructive",
      });
    }
  };


  const handleCarClick = (car: { id: string; name: string }) => {
    setSelectedCar(car);
    setShowCarCalendar(true);  
  };

  const handleReviewReservation = (reservation: Reservation) => {
    setReviewingReservation(reservation);
    setShowReservationReview(true);
  };

  const handlePricingOverride = (reservation: Reservation) => {
    setPricingReservation(reservation);
    setShowPricingOverride(true);
  };

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      // Get reservation details for email
      const { data: reservation } = await supabase
        .from('reservations')
        .select('*, customers(*)')
        .eq('id', reservationId)
        .single();

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      // Prepare update data
      const updateData: any = { status: newStatus };

      // If status is being changed to cancelled, also mark as deleted (soft delete)
      if (newStatus === 'cancelled') {
        updateData.deleted_at = new Date().toISOString();
        updateData.deleted_by = user?.id;
      }

      const { error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId);

      if (error) throw error;

      // Generate PDF and send email for paid status, or just send email for other statuses
      if (['paid', 'cancelled', 'completed', 'picked_up'].includes(newStatus)) {
        let contractPdfUrl = reservation.contract_pdf_url;
        
        // Generate PDF if status is paid and PDF doesn't exist
        if (newStatus === 'paid' && !contractPdfUrl) {
          try {
            const { data: pdfData } = await supabase.functions.invoke('generate-contract-pdf', {
              body: {
                reservationId: reservation.id,
                customerName: `${reservation.customers.first_name} ${reservation.customers.last_name}`,
                customerEmail: reservation.customers.email,
                customerPhone: reservation.customers.phone,
                carName: reservation.car_name,
                startDate: format(new Date(reservation.start_date), 'yyyy-MM-dd'),
                endDate: format(new Date(reservation.end_date), 'yyyy-MM-dd'),
                totalAmount: reservation.total_amount,
                depositAmount: reservation.deposit_amount,
                language: (reservation as any).language || 'lt',
                skipEmail: true
              }
            });
            
            if (pdfData?.contractUrl) {
              contractPdfUrl = pdfData.contractUrl;
              // Update reservation with PDF URL
              await supabase
                .from('reservations')
                .update({ contract_pdf_url: contractPdfUrl })
                .eq('id', reservationId);
            }
          } catch (pdfError) {
            console.error('Error generating PDF:', pdfError);
            // Continue without PDF if generation fails
          }
        }
        
        // Only send email if not already sent for this status
        if (reservation.last_email_sent_status !== newStatus) {
          await supabase.functions.invoke('send-status-email', {
            body: {
              reservationId: reservation.id,
              customerEmail: reservation.customers.email,
              customerName: `${reservation.customers.first_name} ${reservation.customers.last_name}`,
              carName: reservation.car_name,
              startDate: format(new Date(reservation.start_date), 'yyyy-MM-dd'),
              endDate: format(new Date(reservation.end_date), 'yyyy-MM-dd'),
              totalAmount: reservation.total_amount,
              status: newStatus,
              contractPdfUrl: newStatus === 'paid' ? contractPdfUrl : undefined,
              language: (reservation as any).language || 'lt'
            }
          });
          await supabase.from('reservations').update({ last_email_sent_status: newStatus }).eq('id', reservationId);
        }
      }

      toast({
        title: "Statusas atnaujintas",
        description: newStatus === 'cancelled' 
          ? "Rezervacija atšaukta ir perkelta į šiukšlinę. El. paštas išsiųstas klientui."
          : `Rezervacijos statusas pakeistas į "${newStatus}". ${['paid', 'completed', 'picked_up'].includes(newStatus) ? 'El. paštas išsiųstas klientui.' : ''}`,
      });

      fetchReservations();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko atnaujinti statuso: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Filter reservations
  const activeReservations = reservations.filter(r => 
    ['pending', 'paid', 'awaiting_payment', 'requested', 'picked_up', 'phone_reservation'].includes(r.status)
  );
  
  const completedReservations = reservations.filter(r => 
    r.status === 'completed'
  );

  const getStatusBadge = (status: string, reservationId?: string, clickable: boolean = false) => {
    const variants = {
      pending: 'secondary',
      cancelled: 'destructive',
      completed: 'outline',
      requested: 'outline',
      paid: 'default',
      picked_up: 'default',
      denied: 'destructive',
      awaiting_payment: 'secondary',
      phone_reservation: 'default',
    } as const;

    const labels = {
      pending: 'Laukiama',
      cancelled: 'Atšaukta',
      completed: 'Baigta',
      requested: 'Prašoma',
      paid: 'Apmokėta',
      picked_up: 'Atsiimta',
      denied: 'Atmesta',
      awaiting_payment: 'Laukiama apmokėjimo',
      phone_reservation: '📞 Telefoninė',
    } as const;

    const colors = {
      requested: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
      picked_up: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      denied: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      pending: 'bg-gray-100 text-gray-800 border-gray-300',
      awaiting_payment: 'bg-orange-100 text-orange-800 border-orange-300',
      phone_reservation: 'bg-blue-100 text-blue-800 border-blue-300',
    } as const;

    const statusOptions = [
      { value: 'awaiting_payment', label: 'Laukiama apmokėjimo' },
      { value: 'paid', label: 'Apmokėta' },
      { value: 'picked_up', label: 'Atsiimta' },
      { value: 'cancelled', label: 'Atšaukta' },
      { value: 'completed', label: 'Baigta' },
    ];

    // Phone reservations are non-clickable (no status workflow)
    if (status === 'phone_reservation') {
      return (
        <Badge variant="default" className={colors.phone_reservation}>
          {labels.phone_reservation}
        </Badge>
      );
    }

    if (clickable && reservationId) {

      return (
        <Select value={status} onValueChange={(value) => handleStatusChange(reservationId, value)}>
          <SelectTrigger className="h-auto w-auto border-0 p-0 hover:bg-transparent">
            <SelectValue asChild>
              <Badge 
                variant={variants[status as keyof typeof variants] || 'secondary'}
                className={`${colors[status as keyof typeof colors] || ''} cursor-pointer hover:opacity-80`}
              >
                {labels[status as keyof typeof labels] || status}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || 'secondary'}
        className={colors[status as keyof typeof colors] || ''}
      >
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <img 
                src="/__l5e/assets-v1/eb52b609-dc60-4b38-b63c-1e1348dc083a/logo-white.png" 
                alt="Carbonus" 
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex-shrink-0"
              />
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">Admin</Badge>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <span className="text-xs sm:text-sm text-muted-foreground hidden md:block truncate">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/'} className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Grįžti į svetainę</span>
                <span className="sm:hidden">Svetainė</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Administratoriaus skydelis</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Valdykite automobilių nuomą ir klientų duomenis</p>

          <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-6">
            <TabsList className="grid grid-cols-6 gap-1 h-auto p-1 bg-muted rounded-lg">
              <TabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-card">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Skydelis</span>
                <span className="sm:hidden text-[10px]">Duomenys</span>
              </TabsTrigger>
              <TabsTrigger value="in-person" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-card">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Vietinė rezervacija</span>
                <span className="sm:hidden text-[10px] text-center leading-3">Vietinė</span>
              </TabsTrigger>
              <TabsTrigger value="recycle" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-card">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Šiukšlinė</span>
                <span className="sm:hidden text-[10px]">Šiukšlinė</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-card">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">Istorija</span>
                <span className="sm:hidden text-[10px]">Istorija</span>
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-card">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Sąskaitos</span>
                <span className="sm:hidden text-[10px] text-center leading-3">Sąskaitos</span>
              </TabsTrigger>
              <TabsTrigger value="email-test" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-card">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">El. paštas</span>
                <span className="sm:hidden text-[10px] text-center leading-3">El. paštas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Bendra</CardTitle>
                    <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg sm:text-2xl font-bold">{activeReservations.length}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Aktyvios rezervacijos</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Prašomos</CardTitle>
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg sm:text-2xl font-bold text-yellow-600">
                      {reservations.filter(r => r.status === 'requested').length}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Laukia patvirtinimo</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Patvirtintos</CardTitle>
                    <Car className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg sm:text-2xl font-bold text-green-600">
                      {reservations.filter(r => r.status === 'paid').length}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Apmokėtos</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Automobilių</CardTitle>
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg sm:text-2xl font-bold">{cars.length}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Galimų auto</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">Pajamos</CardTitle>
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg sm:text-2xl font-bold">
                      €{reservations.reduce((sum, r) => sum + (r.total_rental_cost || 0), 0)}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Nuomos pajamos (be užstato)</p>
                  </CardContent>
                </Card>
              </div>

              {/* Cars Management Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Automobilių parkas
                  </CardTitle>
                  <CardDescription>Mūsų turimų automobilių sąrašas</CardDescription>
                </CardHeader>
                 <CardContent>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                     {cars.map((car) => (
                       <Card 
                         key={car.id} 
                         className="overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                         onClick={() => handleCarClick({ id: car.id, name: car.name })}
                       >
                          <div className="aspect-video relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f3f4f6 0%, #e9eaec 100%)' }}>
                            <div className="relative w-full h-full">
                              <img 
                                src={getCarImage(car)} 
                                alt={car.name}
                                className={`w-full h-full object-contain mix-blend-multiply ${
                                  car.name === "Volkswagen Passat" 
                                    ? "scale-[1.0]" 
                                    : car.name === "Mercedes-Benz SLK"
                                    ? "scale-[0.92] translate-y-4"
                                    : car.id === "5"
                                    ? "scale-[1.35] translate-y-4"
                                    : car.id === "4"
                                    ? "scale-[1.08] translate-y-4"
                                    : car.id === "8"
                                    ? "scale-[1.45] translate-y-2"
                                    : "scale-100 translate-y-2"
                                }`}
                              />
                              {(car.id === "5" || car.id === "6") && (
                                <div 
                                  className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-[85%] h-5 rounded-[50%]"
                                  style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 70%)' }}
                                />
                              )}
                              {car.id === "7" && (
                                <div 
                                  className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-[98%] h-5 rounded-[50%]"
                                  style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, transparent 70%)' }}
                                />
                              )}
                            </div>
                            <Badge className="absolute top-2 right-2 text-xs">{car.category}</Badge>
                          </div>
                         <CardContent className="p-3 sm:p-4">
                           <h3 className="font-semibold mb-2 text-sm sm:text-base">{car.name}</h3>
                           <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                             <div className="flex items-center gap-2">
                               <Users className="h-3 w-3 flex-shrink-0" />
                               <span>{car.passengers} vietos</span>
                             </div>
                               <div className="flex items-center justify-between">
                                 <span>{car.fuel} • {car.transmission}</span>
                                 <span className="font-semibold text-primary">{car.price_tier1 || 50}-{car.price_tier3 || 30}€/d.</span>
                               </div>
                           </div>
                         </CardContent>
                       </Card>
                     ))}
                  </div>
                </CardContent>
              </Card>


              {/* Reservations Management */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Aktyvios rezervacijos
                    </CardTitle>
                    <CardDescription>Laukiančios, patvirtintos ir apmokėtos rezervacijos</CardDescription>
                  </div>
                </CardHeader>
                 
                 <CardContent>
                   {/* Desktop Table View */}
                   <div className="hidden lg:block">
                     <Table>
                       <TableHeader>
                         <TableRow>
                            <TableHead>Klientas</TableHead>
                            <TableHead>Automobilis</TableHead>
                            <TableHead>Datos</TableHead>
                            <TableHead>Dienų</TableHead>
                            <TableHead>Suma / Kaina</TableHead>
                            <TableHead>Statusas</TableHead>
                            <TableHead>Sukurta</TableHead>
                            <TableHead>Veiksmai</TableHead>
                         </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeReservations.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                Nėra aktyvių rezervacijų
                              </TableCell>
                            </TableRow>
                          ) : (
                            activeReservations.map((reservation) => (
                           <TableRow key={reservation.id}>
                             <TableCell>
                               <div>
                                 <div className="font-medium">
                                   {reservation.customers.first_name} {reservation.customers.last_name}
                                 </div>
                                 <div className="text-sm text-muted-foreground">
                                   {reservation.customers.email}
                                 </div>
                                 <div className="text-sm text-muted-foreground">
                                   {reservation.customers.phone}
                                 </div>
                               </div>
                             </TableCell>
                             <TableCell className="font-medium">{reservation.car_name}</TableCell>
                              <TableCell>
                                <div className="text-sm space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span>{reservation.start_date}</span>
                                    {(reservation as any).pickup_time && (
                                      <span className="text-xs text-muted-foreground">
                                        {(reservation as any).pickup_time.substring(0, 5)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span>{reservation.end_date}</span>
                                    {(reservation as any).return_time && (
                                      <span className="text-xs text-muted-foreground">
                                        {(reservation as any).return_time.substring(0, 5)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{reservation.rental_days}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-semibold">€{reservation.total_amount}</div>
                                  {(reservation as any).custom_rental_price && (
                                    <Badge variant="secondary" className="text-xs">
                                      Individuali kaina
                                    </Badge>
                                  )}
                                  {(reservation as any).pricing_notes && (
                                    <div className="text-xs text-muted-foreground max-w-[150px] truncate" title={parsePricingNotes((reservation as any).pricing_notes)}>
                                      {parsePricingNotes((reservation as any).pricing_notes)}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(reservation.status, reservation.id, true)}</TableCell>
                             <TableCell>{format(new Date(reservation.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                               <TableCell>
                                 <div className="flex gap-2 flex-wrap">
                                   {reservation.status !== 'phone_reservation' && (
                                     <>
                                       <Button
                                         variant="secondary"
                                         size="sm"
                                         onClick={() => handleReviewReservation(reservation)}
                                       >
                                         <FileText className="h-4 w-4" />
                                       </Button>
                                       <Button
                                         variant="outline"
                                         size="sm"
                                         onClick={() => handlePricingOverride(reservation)}
                                         title="Nustatyti specialią kainą"
                                       >
                                         <DollarSign className="h-4 w-4" />
                                       </Button>
                                       <Button
                                         variant="outline"
                                         size="sm"
                                         onClick={() => { setInvoiceReservation(reservation); setShowInvoice(true); }}
                                         title="Sąskaita faktūra"
                                       >
                                         <Receipt className="h-4 w-4" />
                                       </Button>
                                     </>
                                   )}
                                   {reservation.status === 'requested' && (
                                    <>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => approveReservation(reservation.id)}
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => denyReservation(reservation.id)}
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  {reservation.status === 'paid' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => cancelReservation(reservation.id)}
                                    >
                                      <Ban className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteReservation(reservation.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>

                            </TableRow>
                          ))
                          )}
                        </TableBody>
                     </Table>
                   </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-3">
                      {activeReservations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Nėra aktyvių rezervacijų
                        </div>
                      ) : (
                        activeReservations.map((reservation) => (
                       <Card key={reservation.id} className="p-4">
                         <div className="space-y-3">
                           <div className="flex items-start justify-between">
                             <div className="flex-1 min-w-0">
                               <div className="font-semibold text-sm truncate">
                                 {reservation.customers.first_name} {reservation.customers.last_name}
                               </div>
                               <div className="text-xs text-muted-foreground truncate">
                                 {reservation.customers.email}
                               </div>
                               <div className="text-xs text-muted-foreground">
                                 {reservation.customers.phone}
                               </div>
                             </div>
                             <div className="flex-shrink-0 ml-2">
                               {getStatusBadge(reservation.status, reservation.id, true)}
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-3 text-xs">
                             <div>
                               <div className="text-muted-foreground">Automobilis</div>
                               <div className="font-medium">{reservation.car_name}</div>
                             </div>
                              <div>
                                <div className="text-muted-foreground">Suma</div>
                                <div className="space-y-1">
                                  <div className="font-medium">€{reservation.total_amount}</div>
                                  {(reservation as any).custom_rental_price && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      Spec. kaina
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Datos</div>
                                <div className="font-medium space-y-1">
                                  <div>{reservation.start_date} {(reservation as any).pickup_time?.substring(0, 5)}</div>
                                  <div>{reservation.end_date} {(reservation as any).return_time?.substring(0, 5)}</div>
                                </div>
                              </div>
                             <div>
                               <div className="text-muted-foreground">Dienų / Sukurta</div>
                               <div className="font-medium">{reservation.rental_days} d. / {format(new Date(reservation.created_at), 'MM-dd')}</div>
                             </div>
                           </div>
                           
                             <div className="flex flex-wrap gap-2 pt-2 border-t">
                               <Button
                                 variant="secondary"
                                 size="sm"
                                 onClick={() => handleReviewReservation(reservation)}
                                 className="text-xs"
                               >
                                 <FileText className="h-3 w-3 mr-1" />
                                 Peržiūrėti
                               </Button>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => handlePricingOverride(reservation)}
                                 className="text-xs"
                                 title="Nustatyti specialią kainą"
                               >
                                 <DollarSign className="h-3 w-3 mr-1" />
                                 Kaina
                               </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => { setInvoiceReservation(reservation); setShowInvoice(true); }}
                                  className="text-xs"
                                  title="Sąskaita faktūra"
                                >
                                  <Receipt className="h-3 w-3 mr-1" />
                                  Sąskaita
                                </Button>
                               {reservation.status === 'requested' && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => approveReservation(reservation.id)}
                                    className="text-xs"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Patvirtinti
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => denyReservation(reservation.id)}
                                    className="text-xs"
                                  >
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Atmesti
                                  </Button>
                                </>
                              )}
                              {reservation.status === 'paid' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => cancelReservation(reservation.id)}
                                  className="text-xs"
                                >
                                  <Ban className="h-3 w-3 mr-1" />
                                  Atšaukti
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteReservation(reservation.id)}
                                className="text-xs"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Ištrinti
                              </Button>
                            </div>
                          </div>
                        </Card>
                       ))
                       )}
                     </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4 sm:space-y-6 lg:space-y-8">
                {/* History Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium">Baigtos</CardTitle>
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl font-bold">{completedReservations.length}</div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Iš viso baigtų</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium">Pajamos</CardTitle>
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl font-bold text-green-600">
                        €{completedReservations.reduce((sum, r) => sum + (r.total_rental_cost || 0), 0).toFixed(2)}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Iš baigtų nuomų</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs sm:text-sm font-medium">Populiariausias</CardTitle>
                      <Car className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg sm:text-2xl font-bold truncate">
                        {(() => {
                          const carCounts = completedReservations.reduce((acc, r) => {
                            acc[r.car_name] = (acc[r.car_name] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                          const topCar = Object.entries(carCounts).sort(([, a], [, b]) => b - a)[0];
                          return topCar ? topCar[0] : 'N/A';
                        })()}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Dažniausiai nuomojamas</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Completed Reservations */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Rezervacijų istorija
                      </CardTitle>
                      <CardDescription>Visos baigtos rezervacijos</CardDescription>
                    </div>
                    {completedReservations.length > 0 && (
                      <div className="flex gap-2">
                        {isDeleteMode ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (selectedHistoryIds.size === completedReservations.length) {
                                  setSelectedHistoryIds(new Set());
                                } else {
                                  setSelectedHistoryIds(new Set(completedReservations.map(r => r.id)));
                                }
                              }}
                            >
                              {selectedHistoryIds.size === completedReservations.length ? (
                                <><CheckSquare className="h-4 w-4 mr-1" /> Atžymėti visas</>
                              ) : (
                                <><Square className="h-4 w-4 mr-1" /> Pažymėti visas</>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={selectedHistoryIds.size === 0}
                              onClick={() => {
                                const count = selectedHistoryIds.size;
                                setConfirmDialog({
                                  isOpen: true,
                                  title: `Ar tikrai norite ištrinti ${count} rezervacij${count === 1 ? 'ą' : 'as'}?`,
                                  description: "Šio veiksmo negalima atšaukti.",
                                  variant: "destructive",
                                  onConfirm: async () => {
                                    try {
                                      const { error } = await supabase
                                        .from('reservations')
                                        .delete()
                                        .in('id', Array.from(selectedHistoryIds));
                                      if (error) throw error;
                                      toast({
                                        title: "Ištrinta",
                                        description: `${count} rezervacij${count === 1 ? 'a ištrinta' : 'os ištrintos'}.`,
                                      });
                                      setSelectedHistoryIds(new Set());
                                      setIsDeleteMode(false);
                                      fetchReservations();
                                    } catch (error: any) {
                                      toast({
                                        title: "Klaida",
                                        description: "Nepavyko ištrinti: " + error.message,
                                        variant: "destructive",
                                      });
                                    } finally {
                                      setConfirmDialog({ ...confirmDialog, isOpen: false });
                                    }
                                  }
                                });
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Ištrinti ({selectedHistoryIds.size})
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setIsDeleteMode(false); setSelectedHistoryIds(new Set()); }}
                            >
                              Atšaukti
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDeleteMode(true)}
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Ištrinti
                          </Button>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {isDeleteMode && <TableHead className="w-10"></TableHead>}
                            <TableHead>Klientas</TableHead>
                            <TableHead>Automobilis</TableHead>
                            <TableHead>Datos</TableHead>
                            <TableHead>Dienų</TableHead>
                            <TableHead>Suma</TableHead>
                            <TableHead>Baigta</TableHead>
                            <TableHead>Veiksmai</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedReservations.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={isDeleteMode ? 8 : 7} className="text-center py-8 text-muted-foreground">
                                Nėra baigtų rezervacijų
                              </TableCell>
                            </TableRow>
                          ) : (
                            completedReservations.map((reservation) => (
                              <TableRow key={reservation.id} className={selectedHistoryIds.has(reservation.id) ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                                {isDeleteMode && (
                                  <TableCell>
                                    <button
                                      onClick={() => {
                                        const next = new Set(selectedHistoryIds);
                                        if (next.has(reservation.id)) next.delete(reservation.id);
                                        else next.add(reservation.id);
                                        setSelectedHistoryIds(next);
                                      }}
                                      className="p-1"
                                    >
                                      {selectedHistoryIds.has(reservation.id) 
                                        ? <CheckSquare className="h-4 w-4 text-red-600" />
                                        : <Square className="h-4 w-4 text-muted-foreground" />
                                      }
                                    </button>
                                  </TableCell>
                                )}
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {reservation.customers.first_name} {reservation.customers.last_name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {reservation.customers.email}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{reservation.car_name}</TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div>{reservation.start_date}</div>
                                    <div>{reservation.end_date}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{reservation.rental_days}</TableCell>
                                <TableCell>
                                  <div className="font-semibold">€{reservation.total_amount}</div>
                                </TableCell>
                                <TableCell>
                                  {reservation.returned_at 
                                    ? format(new Date(reservation.returned_at), 'yyyy-MM-dd')
                                    : format(new Date(reservation.updated_at), 'yyyy-MM-dd')
                                  }
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleReviewReservation(reservation)}
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => { setInvoiceReservation(reservation); setShowInvoice(true); }}
                                      title="Sąskaita faktūra"
                                    >
                                      <Receipt className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-3">
                      {completedReservations.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Nėra baigtų rezervacijų
                        </div>
                      ) : (
                        completedReservations.map((reservation) => (
                          <Card key={reservation.id} className={`p-4 ${selectedHistoryIds.has(reservation.id) ? 'ring-2 ring-red-400 bg-red-50 dark:bg-red-950/20' : ''}`}>
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                {isDeleteMode && (
                                  <button
                                    onClick={() => {
                                      const next = new Set(selectedHistoryIds);
                                      if (next.has(reservation.id)) next.delete(reservation.id);
                                      else next.add(reservation.id);
                                      setSelectedHistoryIds(next);
                                    }}
                                    className="p-1 mr-2 mt-0.5"
                                  >
                                    {selectedHistoryIds.has(reservation.id)
                                      ? <CheckSquare className="h-4 w-4 text-red-600" />
                                      : <Square className="h-4 w-4 text-muted-foreground" />
                                    }
                                  </button>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm truncate">
                                    {reservation.customers.first_name} {reservation.customers.last_name}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {reservation.customers.email}
                                  </div>
                                </div>
                                {getStatusBadge(reservation.status)}
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Automobilis:</span>
                                  <div className="font-medium">{reservation.car_name}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Dienų:</span>
                                  <div className="font-medium">{reservation.rental_days}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Suma:</span>
                                  <div className="font-semibold">€{reservation.total_amount}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Baigta:</span>
                                  <div className="font-medium">
                                    {reservation.returned_at 
                                      ? format(new Date(reservation.returned_at), 'yyyy-MM-dd')
                                      : format(new Date(reservation.updated_at), 'yyyy-MM-dd')
                                    }
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 pt-2 border-t">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleReviewReservation(reservation)}
                                  className="text-xs flex-1"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  Peržiūrėti
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => { setInvoiceReservation(reservation); setShowInvoice(true); }}
                                  className="text-xs flex-1"
                                >
                                  <Receipt className="h-3 w-3 mr-1" />
                                  Sąskaita
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

          <TabsContent value="in-person">
            <InPersonBooking />
          </TabsContent>

              <TabsContent value="recycle">
                <RecycleBin />
              </TabsContent>

              <TabsContent value="invoices" className="space-y-4">
                <InvoiceList />
              </TabsContent>

              <TabsContent value="email-test" className="space-y-4">
                <EmailTester />
              </TabsContent>
            </Tabs>
        </div>
      </main>
      

      {/* Car Management Modal */}
      {selectedCar && (
        <CarManagementModal
          isOpen={showCarCalendar}
          onClose={() => setShowCarCalendar(false)}
          carId={selectedCar.id}
          carName={selectedCar.name}
        />
      )}
      
      {/* Reservation Review Modal */}
      <ReservationReview 
        reservation={reviewingReservation}
        isOpen={showReservationReview}
        onClose={() => setShowReservationReview(false)}
        onUpdate={fetchReservations}
      />

      {/* Pricing Override Modal */}
      <PricingOverrideModal
        reservation={pricingReservation}
        isOpen={showPricingOverride}
        onClose={() => setShowPricingOverride(false)}
        onUpdate={fetchReservations}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Taip, tęsti"
        cancelText="Ne, atšaukti"
        variant={confirmDialog.variant}
      />

      {/* Invoice Manager */}
      {invoiceReservation && (
        <InvoiceManager
          reservationId={invoiceReservation.id}
          customerName={`${invoiceReservation.customers.first_name} ${invoiceReservation.customers.last_name}`}
          carName={invoiceReservation.car_name}
          totalAmount={invoiceReservation.total_amount}
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default Admin;
