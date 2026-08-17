import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole, tabsForRole, ROLE_LABELS } from '@/hooks/use-admin-role';
import UsersPanel from '@/components/admin/UsersPanel';
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
import { CalendarIcon, Plus, Trash2, Ban, Car, Users, BarChart3, Settings, Edit, CheckCircle, XCircle, FileText, DollarSign, History, Mail, CheckSquare, Square, Receipt, Gift, Search, ExternalLink, Sparkles, CalendarDays, ContactRound, ChevronRight, Phone, CircleDollarSign, ShieldCheck, Star, ScrollText } from 'lucide-react';
import { InvoiceManager } from '@/components/admin/InvoiceManager';
import { InvoiceList } from '@/components/admin/InvoiceList';
import { PromoClaimsPanel } from '@/components/admin/PromoClaimsPanel';
import { ReviewsPanel } from '@/components/admin/ReviewsPanel';

import { useToast } from '@/hooks/use-toast';
import { V3Footer } from "@/components/homev3/V3Footer";
import CarManagementModal from '@/components/admin/CarManagementModal';
import '@/components/admin/admin-crm.css';

import { ConfirmationDialog } from '@/components/ui/alert-confirmation-dialog';
import { AdminCarCard } from '@/components/admin/AdminCarCard';
import { CARS_CATALOG } from '@/data/carsCatalog';
import bmw3Clean from "@/assets/bmw-3-clean.png";
import chryslerTownCountrySide from "@/assets/chrysler-town-country-side.png";

// Function to get the correct image for a car (same assets as public fleet cards)
const getCarImage = (car: any) => {
  const byId = CARS_CATALOG.find((c) => String(c.id) === String(car.id));
  if (byId) return byId.image;
  const byName = CARS_CATALOG.find(
    (c) => c.name.toLowerCase() === String(car.name || '').toLowerCase()
  );
  if (byName) return byName.image;
  if (String(car.name).includes('BMW')) return bmw3Clean;
  if (String(car.name).includes('Chrysler')) return chryslerTownCountrySide;
  return car.image_url || '';
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

const CHANGELOG: { date: string; items: string[] }[] = [
  {
    date: '2026-08-16',
    items: [
      'Admino meniu juosta planšetėje – dvi eilutės be slankiklio.',
      'Sistemos būsena kortelė įjungta planšetės/mobiliajoje versijoje.',
    ],
  },
  {
    date: '2026-08-17',
    items: [
      'Sutvarkytas admino šoninės juostos sticky elgesys – meniu daugiau neužslenkia ant sistemos būsenos kortelės.',
      'Pakeitimų žurnalas padarytas išplečiamu.',
    ],
  },
];

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
  const { role, isOwner } = useAdminRole();
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
  const [carSearchQuery, setCarSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set());
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showChangelog, setShowChangelog] = useState(false);
  const allowedTabs = useMemo(
    () =>
      tabsForRole(role, [
        'dashboard', 'calendar', 'customers', 'in-person', 'history',
        'invoices', 'promos', 'reviews', 'recycle', 'email-test', 'users',
      ]),
    [role]
  );
  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) setActiveTab(allowedTabs[0] ?? 'dashboard');
  }, [allowedTabs, activeTab]);
  const [manualBlockedDates, setManualBlockedDates] = useState<any[]>([]);


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

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const availableCarsToday = React.useMemo(() => {
    const unavailableCarIds = new Set<string>();

    reservations.forEach((r) => {
      if (
        r.car_id &&
        r.start_date <= todayKey &&
        r.end_date >= todayKey &&
        !['completed', 'cancelled', 'denied'].includes(r.status)
      ) {
        unavailableCarIds.add(r.car_id);
      }
    });

    manualBlockedDates.forEach((b) => {
      if (b.car_id && b.blocked_date === todayKey) {
        unavailableCarIds.add(b.car_id);
      }
    });

    return Math.max(0, cars.length - unavailableCarIds.size);
  }, [reservations, manualBlockedDates, cars, todayKey]);

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
      const [resResult, phoneResult, carsResult, manualBlocksResult] = await Promise.all([
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
          .is('deleted_at', null)
          .eq('reservation_type', 'phone_reservation')
          .order('blocked_date', { ascending: true }),
        supabase.from('cars').select('id, name'),
        supabase
          .from('car_blocked_dates')
          .select('*')
          .is('deleted_at', null)
          .neq('reservation_type', 'phone_reservation')
          .order('blocked_date', { ascending: true }),
      ]);

      setManualBlockedDates(manualBlocksResult.data || []);

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
                .update({ deleted_at: new Date().toISOString() } as any)
                .is('deleted_at', null)
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
  const matchesReservationSearch = (r: Reservation, q: string) => {
    const query = q.trim().toLowerCase();
    if (!query) return true;
    const haystack = [
      r.customers?.first_name,
      r.customers?.last_name,
      r.customers?.email,
      r.customers?.phone,
      r.car_name,
      r.start_date,
      r.end_date,
      r.status,
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(query);
  };

  const activeReservations = reservations.filter(r => 
    ['pending', 'paid', 'awaiting_payment', 'requested', 'picked_up', 'phone_reservation'].includes(r.status)
    && matchesReservationSearch(r, activeSearchQuery)
  );
  
  const completedReservations = reservations.filter(r => 
    r.status === 'completed' && matchesReservationSearch(r, historySearchQuery)
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

  const filteredCars = cars.filter((car) => {
    const query = carSearchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      String(car.name || '').toLowerCase().includes(query) ||
      String(car.category || '').toLowerCase().includes(query) ||
      String(car.transmission || '').toLowerCase().includes(query) ||
      String(car.fuel || '').toLowerCase().includes(query) ||
      String(car.year || '').includes(query)
    );
  });

  const todayLabel = new Date().toLocaleDateString('lt-LT', { month: 'long', day: 'numeric', weekday: 'long' });
  const pendingCount = reservations.filter((r) => r.status === 'requested').length;
  const paidCount = reservations.filter((r) => r.status === 'paid').length;
  const historyCount = reservations.filter((r) => ['completed', 'cancelled', 'returned'].includes(String(r.status))).length;

  const heroContent: Record<string, { kicker: string; title: string; subtitle: string; stats: { label: string; value: string }[] }> = {
    dashboard: {
      kicker: 'Carbonus administravimas',
      title: 'Administratoriaus skydelis',
      subtitle: 'Rezervacijos, autoparkas, klientai ir finansai vienoje aiškioje darbo erdvėje.',
      stats: [
        { label: 'Šiandien', value: todayLabel },
        { label: 'Reikia dėmesio', value: `${pendingCount} laukia patvirtinimo` },
      ],
    },
    calendar: {
      kicker: 'Autoparko planas',
      title: 'Kalendorius',
      subtitle: 'Artimiausių 8 dienų automobilių užimtumo laiko juosta – iškart matomi laisvi ir užimti automobiliai.',
      stats: [
        { label: 'Automobiliai', value: `${cars.length} autoparke` },
        { label: 'Aktyvios nuomos', value: `${activeReservations.length} šiuo metu` },
      ],
    },
    customers: {
      kicker: 'Klientų duomenys',
      title: 'Klientai',
      subtitle: 'Kontaktai, nuomos istorija ir bendra kliento vertė vienoje vietoje.',
      stats: [
        { label: 'Unikalūs klientai', value: `${new Set(reservations.map((r) => r.customers?.id || r.customers?.email)).size} kontaktai` },
        { label: 'Rezervacijos', value: `${reservations.length} iš viso` },
      ],
    },
    'in-person': {
      kicker: 'Vietinė rezervacija',
      title: 'Nauja rezervacija',
      subtitle: 'Suveskite kliento duomenis, pasirinkite automobilį ir užbaikite užsakymą vietoje.',
      stats: [
        { label: 'Laisvi automobiliai', value: `${cars.length} autoparke` },
        { label: 'Aktyvios nuomos', value: `${activeReservations.length} šiuo metu` },
      ],
    },
    history: {
      kicker: 'Archyvas',
      title: 'Rezervacijų istorija',
      subtitle: 'Peržiūrėkite užbaigtas ir atšauktas rezervacijas, valykite įrašus saugiu režimu.',
      stats: [
        { label: 'Įrašai istorijoje', value: `${historyCount} rezervacijos` },
        { label: 'Trynimo režimas', value: isDeleteMode ? 'Įjungtas' : 'Išjungtas' },
      ],
    },
    invoices: {
      kicker: 'Finansai',
      title: 'Sąskaitos faktūros',
      subtitle: 'Generuokite, koreguokite ir siųskite sąskaitas klientams.',
      stats: [
        { label: 'Apmokėtos', value: `${paidCount} rezervacijos` },
        { label: 'Pajamos', value: `€${reservations.reduce((sum, r) => sum + (r.total_rental_cost || 0), 0).toFixed(2)}` },
      ],
    },
    promos: {
      kicker: 'Rinkodara',
      title: 'Nuolaidų kodai',
      subtitle: 'Sekite ACIU10 kodų išdavimą ir konversijas iš atsiliepimų puslapio.',
      stats: [
        { label: 'Aktyvus kodas', value: 'ACIU10 · -10%' },
        { label: 'Šaltinis', value: '/atsiliepimas' },
      ],
    },
    reviews: {
      kicker: 'Reputacija',
      title: 'Atsiliepimai',
      subtitle: 'Nuoroda klientams, Google puslapis ir įvertinimų suvestinė vienoje vietoje.',
      stats: [
        { label: 'Puslapis', value: 'carbonus.lt/atsiliepimas' },
        { label: 'Paskata', value: 'ACIU10 · -10%' },
      ],
    },
    recycle: {
      kicker: 'Duomenų valymas',
      title: 'Šiukšlinė',
      subtitle: 'Atkurkite arba galutinai pašalinkite ištrintus įrašus.',
      stats: [
        { label: 'Atkūrimas', value: 'Galimas bet kada' },
        { label: 'Dėmesio', value: 'Trynimas negrįžtamas' },
      ],
    },
    'email-test': {
      kicker: 'Komunikacija',
      title: 'El. laiškų testavimas',
      subtitle: 'Peržiūrėkite ir išsiųskite bandomuosius laiškus prieš siunčiant klientams.',
      stats: [
        { label: 'Siuntėjas', value: 'info@carbonus.lt' },
        { label: 'Kalbos', value: 'LT / EN' },
      ],
    },
    users: {
      kicker: 'Prieigos valdymas',
      title: 'Sistemos naudotojai',
      subtitle: 'Kurkite paskyras, keiskite roles ir nustatykite naujus slaptažodžius.',
      stats: [
        { label: 'Jūsų rolė', value: ROLE_LABELS[role] },
        { label: 'Saugumas', value: 'Slaptažodžiai užšifruoti' },
      ],
    },
  };


  const hero = heroContent[activeTab] ?? heroContent.dashboard;


  return (
    <div className="admin-shell admin-crm min-h-screen bg-[#f3f7f5] text-[#11231c]">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#082c22] text-white shadow-[0_8px_30px_rgba(3,42,31,0.14)]">
        <div className="mx-auto flex h-[76px] w-full max-w-[1680px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <img
              src="/__l5e/assets-v1/eb52b609-dc60-4b38-b63c-1e1348dc083a/logo-white.png"
              alt="Carbonus"
              className="h-11 w-auto shrink-0 object-contain sm:h-12"
            />
            <span className="hidden h-7 w-px bg-white/15 sm:block" />
            <div className="hidden min-w-0 sm:block">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300/80">
                Administravimas
              </p>
              <p className="mt-0.5 text-[13px] font-semibold text-white/75">Valdymo centras</p>
            </div>
          </div>
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] py-1.5 pl-2 pr-4 lg:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-300 text-[12px] font-extrabold text-[#073126]">
                {(user?.email?.[0] || 'A').toUpperCase()}
              </span>
              <span className="max-w-[190px] truncate text-[12px] font-medium text-white/80">{user?.email}</span>
            </div>
            <button
              type="button"
              onClick={() => (window.location.href = '/')}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 text-[12px] font-semibold text-white transition hover:bg-white/20 sm:px-4"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Atidaryti svetainę</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Hero banner */}
        <section className="relative mb-6 flex h-[210px] items-center overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0a3f30_0%,#076c45_62%,#16a566_100%)] px-6 py-7 text-white shadow-[0_22px_60px_rgba(5,91,58,0.16)] sm:px-8 sm:py-9 lg:px-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border-[38px] border-white/[0.045]" />
          <div className="pointer-events-none absolute bottom-0 right-[24%] h-28 w-40 rounded-t-full bg-white/[0.035]" />
          <div className="relative flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-7">

            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200/85">
                <Sparkles className="h-4 w-4" />
                {hero.kicker}
              </p>
              <h1 className="mt-4 text-[32px] font-bold leading-tight tracking-tight text-white sm:text-[38px]">
                {hero.title}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-white/75">
                {hero.subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {hero.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">{stat.label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="admin-workspace-tabs space-y-5">
            <div className="admin-sidebar-sticky lg:sticky lg:top-[96px] lg:max-h-[calc(100vh-112px)] lg:overflow-y-auto lg:overflow-x-hidden">
              <TabsList className="admin-sidebar-nav flex h-auto w-full flex-row justify-start gap-1 overflow-x-auto rounded-[22px] border border-[#dce7e1] bg-white p-2 shadow-[0_14px_42px_rgba(14,47,35,0.07)] md:grid md:grid-cols-6 md:overflow-visible md:place-items-stretch lg:flex lg:flex-col lg:overflow-visible">
                {[
                  { value: 'dashboard', icon: BarChart3, label: 'Suvestinė' },
                  { value: 'calendar', icon: CalendarDays, label: 'Kalendorius' },
                  { value: 'customers', icon: ContactRound, label: 'Klientai' },
                  { value: 'in-person', icon: Users, label: 'Nauja rezervacija' },
                  { value: 'history', icon: History, label: 'Istorija' },
                  { value: 'invoices', icon: Receipt, label: 'Sąskaitos' },
                  { value: 'promos', icon: Gift, label: 'Nuolaidos' },
                  { value: 'reviews', icon: Star, label: 'Atsiliepimai' },
                  { value: 'recycle', icon: Trash2, label: 'Šiukšlinė' },
                  { value: 'email-test', icon: Mail, label: 'El. paštas' },
                  { value: 'users', icon: ShieldCheck, label: 'Naudotojai' },
                ].filter(({ value }) => allowedTabs.includes(value)).map(({ value, icon: Icon, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="admin-sidebar-trigger h-auto min-h-11 shrink-0 justify-start gap-3 rounded-[13px] px-3 py-2.5 text-[12px] font-bold text-[#65776f] data-[state=active]:bg-[#0b5d43] data-[state=active]:text-white data-[state=active]:shadow-[0_8px_24px_rgba(8,93,66,0.18)] lg:w-full"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap md:whitespace-normal lg:whitespace-nowrap">{label}</span>
                  </TabsTrigger>
                ))}
                <div className="flex shrink-0 flex-col justify-center gap-1 rounded-[13px] border border-[#dce7e1] bg-[#f7faf8] px-3 py-2 lg:hidden" aria-hidden="true">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0b5d43]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Sistemos būsena
                  </div>
                  <p className="text-[11px] text-[#65776f]">Visi procesai tvarkingi.</p>
                  <p className="text-[10px] font-semibold text-[#0b5d43]">{ROLE_LABELS[role]}</p>
                </div>
              </TabsList>

              <div className="admin-sidebar-status hidden rounded-[22px] border border-[#dce7e1] bg-white p-4 shadow-[0_14px_42px_rgba(14,47,35,0.07)] lg:block">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b5d43]">
                  <ShieldCheck className="h-4 w-4" />
                  Sistemos būsena
                </div>
                <p className="mt-2 text-[12px] text-[#65776f]">Visi procesai tvarkingi.</p>
                <p className="mt-1 text-[11px] font-semibold text-[#0b5d43]">{ROLE_LABELS[role]}</p>
              </div>
              {isOwner && (
                <div className="admin-sidebar-changelog hidden rounded-[22px] border border-[#dce7e1] bg-white p-4 shadow-[0_14px_42px_rgba(14,47,35,0.07)] lg:block">
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b5d43]">
                    <ScrollText className="h-4 w-4" />
                    Pakeitimų žurnalas
                  </div>
                  <ul className="mt-3 space-y-2.5">
                    <li className="text-[12px] leading-relaxed text-[#65776f]">
                      <span className="block text-[10px] font-semibold text-[#0b5d43]">2026-08-16</span>
                      Admino meniu juosta planšetėje – dvi eilutės be slankiklio.
                    </li>
                    <li className="text-[12px] leading-relaxed text-[#65776f]">
                      <span className="block text-[10px] font-semibold text-[#0b5d43]">2026-08-16</span>
                      Sistemos būsena kortelė įjungta planšetės/mobiliajoje versijoje.
                    </li>
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full rounded-xl border-[#dce7e1] bg-transparent text-[11px] font-semibold text-[#0b5d43] hover:bg-[#f0f7f3]"
                    onClick={() => setShowChangelog(true)}
                  >
                    Rodyti visą žurnalą
                  </Button>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-5">
            <TabsContent value="dashboard" className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
                {[
                  {
                    label: 'Aktyvios',
                    sub: 'rezervacijos',
                    value: String(activeReservations.length),
                    icon: BarChart3,
                    tint: 'bg-carbonus-green-soft text-carbonus-green-deep',
                  },
                  {
                    label: 'Laukia',
                    sub: 'patvirtinimo',
                    value: String(reservations.filter((r) => r.status === 'requested').length),
                    icon: History,
                    tint: 'bg-amber-50 text-amber-600',
                  },
                  {
                    label: 'Apmokėtos',
                    sub: 'rezervacijos',
                    value: String(reservations.filter((r) => r.status === 'paid').length),
                    icon: CheckCircle,
                    tint: 'bg-blue-50 text-blue-600',
                  },
                  {
                    label: 'Laisvi',
                    sub: 'šiandien',
                    value: String(availableCarsToday),
                    icon: Car,
                    tint: 'bg-carbonus-green-soft text-carbonus-green-deep',
                  },
                  {
                    label: 'Pajamos',
                    sub: 'be užstatų',
                    value: `€${reservations.reduce((sum, r) => sum + (r.total_rental_cost || 0), 0).toFixed(2)}`,
                    icon: Receipt,
                    tint: 'bg-violet-50 text-violet-600',
                    wide: true,
                  },
                ].map(({ label, sub, value, icon: Icon, tint, wide }) => (
                  <div
                    key={label}
                    className={`group relative overflow-hidden rounded-2xl border border-black/[0.04] bg-white p-4 shadow-[0_4px_14px_rgba(16,24,40,0.05)] transition-shadow hover:shadow-[0_14px_30px_rgba(16,24,40,0.1)] ${wide ? 'col-span-2 sm:col-span-1' : ''}`}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tint}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-1 text-2xl font-bold leading-none tracking-tight text-foreground">
                      {value}
                    </p>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">{sub}</p>
                  </div>
                ))}
              </div>


              {/* Cars Management Section */}
              <Card className="rounded-2xl border-black/[0.04] shadow-[0_4px_14px_rgba(16,24,40,0.05)]">
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-carbonus-green-soft text-carbonus-green-deep">
                      <Car className="h-4 w-4" />
                    </span>
                    <div>
                      <CardTitle className="text-lg">Automobilių parkas</CardTitle>
                      <CardDescription>
                        Pasirinkite automobilį, kad valdytumėte jo užimtumą ir nustatymus
                      </CardDescription>
                    </div>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Ieškoti automobilio..."
                      value={carSearchQuery}
                      onChange={(e) => setCarSearchQuery(e.target.value)}
                      className="rounded-xl pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6">
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

                    {filteredCars.length === 0 ? (
                      <div className="col-span-full text-center py-8 text-muted-foreground">
                        Pagal paiešką automobilių nerasta
                      </div>
                    ) : (
                      filteredCars.map((car) => (
                        <AdminCarCard
                          key={car.id}
                          car={{
                            id: String(car.id),
                            name: car.name,
                            image: getCarImage(car),
                            year: car.year,
                            category: car.category,
                            passengers: car.passengers,
                            fuel: car.fuel,
                            transmission: car.transmission,
                            priceHigh: car.price_tier1 ?? car.price_per_day,
                            priceLow: car.price_tier3 ?? null,
                          }}
                          onManage={() => handleCarClick({ id: car.id, name: car.name })}
                        />
                      ))
                    )}
                  </div>
                  {filteredCars.length > 0 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Rodoma {filteredCars.length} iš {cars.length} automobilių
                    </p>
                  )}
                </CardContent>
              </Card>


              {/* Reservations Management */}
              <Card className="rounded-2xl border-black/[0.04] shadow-[0_4px_14px_rgba(16,24,40,0.05)]">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-carbonus-green-soft text-carbonus-green-deep">
                      <BarChart3 className="h-4 w-4" />
                    </span>
                    <div>
                      <CardTitle className="text-lg">Aktyvios rezervacijos</CardTitle>
                      <CardDescription>Laukiančios, patvirtintos ir apmokėtos rezervacijos</CardDescription>
                    </div>
                  </div>
                  <div className="relative w-full max-w-[240px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Ieškoti rezervacijų..."
                      value={activeSearchQuery}
                      onChange={(e) => setActiveSearchQuery(e.target.value)}
                      className="pl-8"
                    />
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
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Rezervacijų istorija
                      </CardTitle>
                      <CardDescription>Visos baigtos rezervacijos</CardDescription>
                    </div>
                    <div className="relative w-full sm:max-w-[240px]">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Ieškoti istorijoje..."
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        className="pl-8"
                      />
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

              <TabsContent value="calendar" className="space-y-4 sm:space-y-6">
                <AdminFleetTimeline
                  cars={cars}
                  reservations={reservations}
                  onOpenCar={handleCarClick}
                  onOpenReservation={handleReviewReservation}
                />
              </TabsContent>

              <TabsContent value="customers" className="space-y-4 sm:space-y-6">
                <AdminCustomersView reservations={reservations} onOpenReservation={handleReviewReservation} />
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

              <TabsContent value="promos" className="space-y-4">
                <PromoClaimsPanel />
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <ReviewsPanel />
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <UsersPanel />
              </TabsContent>

              <TabsContent value="email-test" className="space-y-4">

                <EmailTester />
              </TabsContent>
            </div>
            </Tabs>
        </div>
      </main>
      
      {/* Changelog Dialog */}
      <Dialog open={showChangelog} onOpenChange={setShowChangelog}>
        <DialogContent className="max-w-2xl rounded-[24px] border-[#dce7e1] bg-white p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center gap-2 text-[16px] font-bold text-[#0b5d43]">
              <ScrollText className="h-5 w-5" />
              Pakeitimų žurnalas
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#65776f]">
              Visų atliktų sistemos atnaujinimų istorija.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto px-6 pb-6">
            <div className="relative pl-4">
              <div className="absolute bottom-2 left-[7px] top-2 w-px bg-[#dce7e1]" />
              <ul className="space-y-6">
                {CHANGELOG.map((entry, i) => (
                  <li key={i} className="relative pl-6">
                    <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#0b5d43] shadow-[0_0_0_2px_#0b5d43]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b5d43]">{entry.date}</span>
                    <ul className="mt-2 space-y-2">
                      {entry.items.map((item, j) => (
                        <li key={j} className="text-[13px] leading-relaxed text-[#65776f]">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      <V3Footer />
    </div>
  );
};


function AdminFleetTimeline({
  cars,
  reservations,
  onOpenCar,
  onOpenReservation,
}: {
  cars: any[];
  reservations: Reservation[];
  onOpenCar: (car: { id: string; name: string }) => void;
  onOpenReservation: (reservation: Reservation) => void;
}) {
  const [offset, setOffset] = useState(0);
  const dates = Array.from({ length: 8 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset + index);
    return { date, key: format(date, 'yyyy-MM-dd'), label: format(date, 'MM-dd') };
  });

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden rounded-[24px] border-[#dfe8e3]">
        <CardHeader className="flex flex-col gap-3 border-b border-[#e5ece8] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-[17px]">
              {format(dates[0].date, 'yyyy-MM-dd')} – {format(dates[dates.length - 1].date, 'yyyy-MM-dd')}
            </CardTitle>
            <CardDescription>Automobilių rezervacijų kalendorius</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden items-center gap-3 text-[10px] font-bold text-muted-foreground sm:flex">
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Laisva</span>
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Rezervuota</span>
              <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Laukia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={() => setOffset((v) => v - 8)}>‹ Atgal</Button>
              <Button variant="outline" size="sm" onClick={() => setOffset(0)} disabled={offset === 0}>Šiandien</Button>
              <Button variant="outline" size="sm" onClick={() => setOffset((v) => v + 8)}>Pirmyn ›</Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[220px_repeat(8,minmax(86px,1fr))] border-b border-[#e4ebe7] bg-[#f5f8f6]">
                <div className="px-5 py-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#6f8077]">Automobilis</div>
                {dates.map(({ key, date, label }) => (
                  <div key={key} className="border-l border-[#e2eae6] px-2 py-3 text-center">
                    <p className="text-[9px] font-extrabold uppercase text-[#809087]">{date.toLocaleDateString('lt-LT', { weekday: 'short' })}</p>
                    <p className="mt-1 text-xs font-bold">{label}</p>
                  </div>
                ))}
              </div>
              {cars.map((car) => (
                <div key={car.id} className="grid grid-cols-[220px_repeat(8,minmax(86px,1fr))] border-b border-[#ebf0ed] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => onOpenCar({ id: car.id, name: car.name })}
                    className="flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f2f8f5]"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eaf5ef] text-[#0b7952]"><Car className="h-4 w-4" /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-bold">{car.name}</span>
                      <span className="block truncate text-[10px] text-muted-foreground">{car.license_plate || car.category}</span>
                    </span>
                  </button>
                  {dates.map(({ key }) => {
                    const reservation = reservations.find(
                      (r) => r.car_id === car.id && r.start_date <= key && r.end_date >= key && !['completed', 'cancelled', 'denied'].includes(r.status)
                    );
                    const waiting = reservation && ['requested', 'awaiting_payment', 'pending'].includes(reservation.status);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => (reservation ? onOpenReservation(reservation) : onOpenCar({ id: car.id, name: car.name }))}
                        className={`relative min-h-[62px] border-l border-[#e7eeea] p-1.5 transition hover:brightness-[0.98] ${reservation ? (waiting ? 'bg-amber-50' : 'bg-blue-50') : 'bg-white hover:bg-emerald-50/60'}`}
                        title={reservation ? `${reservation.customers?.first_name || ''} ${reservation.customers?.last_name || ''}` : 'Laisva'}
                      >
                        {reservation ? (
                          <span className={`block h-full min-h-[48px] rounded-[10px] px-2 py-2 text-left ${waiting ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'}`}>
                            <span className="block truncate text-[9px] font-extrabold">{reservation.customers?.first_name || 'Blokas'}</span>
                            <span className="mt-1 block truncate text-[8px] opacity-70">€{reservation.total_amount}</span>
                          </span>
                        ) : (
                          <span className="mx-auto block h-2 w-2 rounded-full bg-emerald-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminCustomersView({
  reservations,
  onOpenReservation,
}: {
  reservations: Reservation[];
  onOpenReservation: (reservation: Reservation) => void;
}) {
  const [query, setQuery] = useState('');
  const { toast } = useToast();
  const [deletedCustomerIds, setDeletedCustomerIds] = useState<Set<string>>(new Set());

  const loadDeletedCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('id')
      .not('deleted_at', 'is', null);
    setDeletedCustomerIds(new Set((data || []).map((c: any) => c.id)));
  };

  useEffect(() => {
    loadDeletedCustomers();
  }, []);

  const moveCustomerToTrash = async (customerId: string, name: string) => {
    if (!customerId) return;
    if (!window.confirm(`Perkelti klientą „${name}“ į šiukšlinę? Vėliau galėsite jį atkurti.`)) return;
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString(), deleted_by: userData?.user?.id ?? null })
      .eq('id', customerId);
    if (error) {
      toast({ title: 'Klaida', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Perkelta į šiukšlinę', description: 'Klientą galite atkurti skiltyje „Šiukšlinė“.' });
    setDeletedCustomerIds((prev) => new Set(prev).add(customerId));
  };

  const customerMap = new Map<string, { customer: Reservation['customers']; reservations: Reservation[]; spent: number; latest: Reservation }>();
  reservations.forEach((reservation) => {
    if (!reservation.customers) return;
    const key = reservation.customers.id || reservation.customers.email;
    if (!key) return;
    const current = customerMap.get(key);
    if (current) {
      current.reservations.push(reservation);
      current.spent += Number(reservation.total_rental_cost || 0);
      if (new Date(reservation.created_at) > new Date(current.latest.created_at)) current.latest = reservation;
    } else {
      customerMap.set(key, {
        customer: reservation.customers,
        reservations: [reservation],
        spent: Number(reservation.total_rental_cost || 0),
        latest: reservation,
      });
    }
  });
  const customers = Array.from(customerMap.values())
    .filter((entry) => !entry.customer.id || !deletedCustomerIds.has(entry.customer.id))
    .filter((entry) =>
      `${entry.customer.first_name} ${entry.customer.last_name} ${entry.customer.email} ${entry.customer.phone}`
        .toLowerCase()
        .includes(query.toLowerCase())
    )
    .sort((a, b) => b.reservations.length - a.reservations.length);
  const repeatCustomers = customers.filter((entry) => entry.reservations.length > 1).length;

  const metrics = [
    { icon: Users, label: 'Klientai', value: customers.length.toString(), detail: 'unikalūs kontaktai', tint: 'bg-carbonus-green-soft text-carbonus-green-deep' },
    { icon: ContactRound, label: 'Sugrįžtantys', value: repeatCustomers.toString(), detail: 'daugiau nei 1 nuoma', tint: 'bg-blue-50 text-blue-600' },
    { icon: CircleDollarSign, label: 'Vertė', value: `€${customers.reduce((sum, c) => sum + c.spent, 0).toFixed(2)}`, detail: 'nuomos pajamos', tint: 'bg-purple-50 text-purple-600' },
    { icon: Sparkles, label: 'VIP', value: customers.filter((c) => c.reservations.length >= 3 || c.spent >= 1000).length.toString(), detail: 'vertingi klientai', tint: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(({ icon: Icon, label, value, detail, tint }) => (
          <div key={label} className="rounded-[20px] border border-[#dfe8e3] bg-white p-4 shadow-[0_10px_30px_rgba(14,47,35,0.05)]">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${tint}`}><Icon className="h-[18px] w-[18px]" /></span>
            <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
            <p className="mt-1 text-[22px] font-black leading-none">{value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
          </div>
        ))}
      </div>
      <Card className="overflow-hidden rounded-[24px] border-[#dfe8e3]">
        <CardHeader className="flex flex-col gap-4 border-b border-[#e5ece8] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-[17px]">Klientų sąrašas</CardTitle>
            <CardDescription>{customers.length} kontaktai pagal pasirinktą paiešką</CardDescription>
          </div>
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Vardas, el. paštas arba telefonas" className="pl-10" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <div className="m-5 rounded-[18px] border border-dashed border-[#cfe0d7] p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-[#78a28e]" />
              <p className="mt-2 text-sm font-bold">Klientų nerasta</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e8eeeb]">
              {customers.map((entry) => {
                const vip = entry.reservations.length >= 3 || entry.spent >= 1000;
                return (
                  <div
                    key={entry.customer.id || entry.customer.email}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenReservation(entry.latest)}
                    onKeyDown={(event) => { if (event.key === 'Enter') onOpenReservation(entry.latest); }}
                    className="grid w-full cursor-pointer gap-3 px-5 py-4 text-left transition hover:bg-[#f7faf8] md:grid-cols-[minmax(220px,1.4fr)_minmax(160px,1fr)_120px_120px_72px] md:items-center"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9f6ef] text-[12px] font-black text-[#0b7750]">
                        {entry.customer.first_name?.charAt(0)}{entry.customer.last_name?.charAt(0)}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-bold">{entry.customer.first_name} {entry.customer.last_name}</span>
                          {vip && <Badge className="border-0 bg-amber-100 text-[9px] text-amber-800">VIP</Badge>}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{entry.customer.email}</span>
                      </span>
                    </span>
                    <span className="hidden min-w-0 md:block">
                      <span className="block truncate text-[11px] font-semibold"><Phone className="mr-1 inline h-3 w-3" />{entry.customer.phone || 'Nenurodyta'}</span>
                      <span className="mt-1 block truncate text-[10px] text-muted-foreground">Paskutinė: {entry.latest.created_at.slice(0, 10)}</span>
                    </span>
                    <span className="text-[12px]">
                      <span className="block text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Nuomos</span>
                      <span className="mt-1 block font-extrabold">{entry.reservations.length}</span>
                    </span>
                    <span className="text-[12px]">
                      <span className="block text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Vertė</span>
                      <span className="mt-1 block font-extrabold text-[#0b7a50]">€{entry.spent.toFixed(2)}</span>
                    </span>
                    <span className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Perkelti į šiukšlinę"
                        onClick={(event) => {
                          event.stopPropagation();
                          moveCustomerToTrash(entry.customer.id, `${entry.customer.first_name} ${entry.customer.last_name}`);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="hidden h-4 w-4 text-[#98a79f] md:block" />
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Admin;
