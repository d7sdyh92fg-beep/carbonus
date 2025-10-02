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
import { CalendarIcon, Plus, Trash2, Ban, Car, Users, BarChart3, Settings, Edit, CheckCircle, XCircle, TrendingUp, FileText, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/sections/footer';
import CarManagementModal from '@/components/admin/CarManagementModal';
import { GoogleAnalytics } from '@/components/admin/GoogleAnalytics';
import { ConfirmationDialog } from '@/components/ui/alert-confirmation-dialog';
import bmw3Clean from "@/assets/bmw-3-clean.png";
import chryslerTownCountrySide from "@/assets/chrysler-town-country-side.png";
import vwPassatSideClean from "@/assets/vw-passat-side-clean.png";
import kiaCeedSideClean from "@/assets/kia-ceed-side-clean.png";
import kiaCeedSideDarkGray from "@/assets/kia-ceed-side-dark-gray.png";
import kiaCeedWagonSide from "@/assets/kia-ceed-wagon-side.png";
import kiaCeedHatchbackSide from "@/assets/kia-ceed-hatchback-side.png";
import kiaCeedHatchbackSideFlipped from "@/assets/kia-ceed-hatchback-side-flipped.png";
import kiaCeedHatchbackSideBrown from "@/assets/kia-ceed-hatchback-side-brown.png";
import kiaCeedHatchbackSideGrayBrown from "@/assets/kia-ceed-hatchback-side-gray-brown.png";

// Image mapping object for car images
const imageMap: { [key: string]: string } = {
  bmw3Clean,
  chryslerTownCountrySide,
  vwPassatSideClean,
  kiaCeedSideClean,
  kiaCeedSideDarkGray,
  kiaCeedWagonSide,
  kiaCeedHatchbackSide,
  kiaCeedHatchbackSideFlipped,
  kiaCeedHatchbackSideBrown,
  kiaCeedHatchbackSideGrayBrown,
};

// Function to get the correct image for a car
const getCarImage = (car: any) => {
  // Map car names to image keys
  const nameToImageMap: { [key: string]: string } = {
    'BMW 3 series': 'bmw3Clean',
    'Chrysler Town & Country': 'chryslerTownCountrySide',
    'Volkswagen Passat': 'vwPassatSideClean',
    'KIA CEED': car.category === 'Universalas' ? 'kiaCeedSideDarkGray' : 
               car.category === 'Hečbekas' && car.year >= 2018 ? 'kiaCeedHatchbackSideGrayBrown' :
               'kiaCeedHatchbackSide',
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
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [showCarCalendar, setShowCarCalendar] = useState(false);
  const [selectedCar, setSelectedCar] = useState<{id: string, name: string} | null>(null);
  const [showReservationReview, setShowReservationReview] = useState(false);
  const [reviewingReservation, setReviewingReservation] = useState<Reservation | null>(null);
  const [showPricingOverride, setShowPricingOverride] = useState(false);
  const [pricingReservation, setPricingReservation] = useState<Reservation | null>(null);
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

  const fetchCars = async () => {
    try {
      setIsLoadingCars(true);
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('name');

      if (error) throw error;
      setCars(data || []);
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
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email,
            phone
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
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
    setConfirmDialog({
      isOpen: true,
      title: "Ar tikrai norite ištrinti šią rezervaciją?",
      description: "Rezervacija bus perkelta į šiukšlinę. Galėsite ją atkurti.",
      variant: "destructive",
      onConfirm: async () => {
        try {
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

          // Send cancellation email
          if (reservation) {
            await supabase.functions.invoke('send-status-email', {
              body: {
                reservationId: reservation.id,
                customerEmail: reservation.customers.email,
                customerName: `${reservation.customers.first_name} ${reservation.customers.last_name}`,
                carName: reservation.car_name,
                startDate: format(new Date(reservation.start_date), 'yyyy-MM-dd'),
                endDate: format(new Date(reservation.end_date), 'yyyy-MM-dd'),
                totalAmount: reservation.total_amount,
                status: 'cancelled'
              }
            });
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

  const updateReservation = async () => {
    if (!editingReservation) return;

    try {
      // Get current reservation to check if status changed
      const { data: currentReservation } = await supabase
        .from('reservations')
        .select('status, *, customers(*)')
        .eq('id', editingReservation.id)
        .single();

      const { error } = await supabase
        .from('reservations')
        .update({
          start_date: editingReservation.start_date,
          end_date: editingReservation.end_date,
          status: editingReservation.status,
        })
        .eq('id', editingReservation.id);

      if (error) throw error;

      // Send email if status changed
      if (currentReservation && currentReservation.status !== editingReservation.status) {
        await supabase.functions.invoke('send-status-email', {
          body: {
            reservationId: editingReservation.id,
            customerEmail: currentReservation.customers.email,
            customerName: `${currentReservation.customers.first_name} ${currentReservation.customers.last_name}`,
            carName: editingReservation.car_name,
            startDate: format(new Date(editingReservation.start_date), 'yyyy-MM-dd'),
            endDate: format(new Date(editingReservation.end_date), 'yyyy-MM-dd'),
            totalAmount: editingReservation.total_amount,
            status: editingReservation.status
          }
        });
      }

      toast({
        title: "Sėkmingai atnaujinta",
        description: "Rezervacija buvo atnaujinta.",
      });

      setShowEditDialog(false);
      setEditingReservation(null);
      fetchReservations();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko atnaujinti rezervacijos: " + error.message,
        variant: "destructive",
      });
    }
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
        .update({ status: 'confirmed' })
        .eq('id', id);

      if (error) throw error;

      // Send confirmation email
      if (reservation) {
        await supabase.functions.invoke('send-status-email', {
          body: {
            reservationId: reservation.id,
            customerEmail: reservation.customers.email,
            customerName: `${reservation.customers.first_name} ${reservation.customers.last_name}`,
            carName: reservation.car_name,
            startDate: format(new Date(reservation.start_date), 'yyyy-MM-dd'),
            endDate: format(new Date(reservation.end_date), 'yyyy-MM-dd'),
            totalAmount: reservation.total_amount,
            status: 'confirmed'
          }
        });
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

      // Send denial email
      if (reservation) {
        await supabase.functions.invoke('send-status-email', {
          body: {
            reservationId: reservation.id,
            customerEmail: reservation.customers.email,
            customerName: `${reservation.customers.first_name} ${reservation.customers.last_name}`,
            carName: reservation.car_name,
            startDate: format(new Date(reservation.start_date), 'yyyy-MM-dd'),
            endDate: format(new Date(reservation.end_date), 'yyyy-MM-dd'),
            totalAmount: reservation.total_amount,
            status: 'cancelled' // Using cancelled template for denied status
          }
        });
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

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setShowEditDialog(true);
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

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      completed: 'outline',
      requested: 'outline',
      paid: 'default',
      denied: 'destructive',
    } as const;

    const labels = {
      pending: 'Laukiama',
      confirmed: 'Patvirtinta',
      cancelled: 'Atšaukta',
      completed: 'Baigta',
      requested: 'Prašoma',
      paid: 'Apmokėta',
      denied: 'Atmesta',
    } as const;

    const colors = {
      requested: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      denied: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      pending: 'bg-gray-100 text-gray-800 border-gray-300',
    } as const;

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
                src="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" 
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
            <TabsList className="grid grid-cols-4 gap-1 h-auto p-1 bg-muted rounded-lg">
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
              <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm data-[state=active]:bg-card">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Google Analytics</span>
                <span className="sm:hidden text-[10px]">Analitika</span>
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
                    <div className="text-lg sm:text-2xl font-bold">{reservations.length}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Visos rezervacijos</p>
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
                      {reservations.filter(r => r.status === 'confirmed').length}
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
                          <div className="aspect-video relative overflow-hidden">
                            <img 
                              src={getCarImage(car)} 
                              alt={car.name}
                              className="w-full h-full object-cover"
                            />
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
                               <span className="font-semibold text-primary">{car.price}/d.</span>
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
                      Rezervacijų valdymas
                    </CardTitle>
                    <CardDescription>Visos automobilių rezervacijos sistemoje</CardDescription>
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
                         {reservations.map((reservation) => (
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
                               <div className="text-sm">
                                 <div>{reservation.start_date}</div>
                                 <div>{reservation.end_date}</div>
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
                              <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                             <TableCell>{format(new Date(reservation.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                               <TableCell>
                                 <div className="flex gap-2 flex-wrap">
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
                                     onClick={() => handleEditReservation(reservation)}
                                   >
                                     <Edit className="h-4 w-4" />
                                   </Button>
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
                                  {reservation.status === 'confirmed' && (
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
                         ))}
                       </TableBody>
                     </Table>
                   </div>

                   {/* Mobile Card View */}
                   <div className="lg:hidden space-y-3">
                     {reservations.map((reservation) => (
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
                               {getStatusBadge(reservation.status)}
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
                               <div className="font-medium">
                                 {reservation.start_date} - {reservation.end_date}
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
                                 onClick={() => handleEditReservation(reservation)}
                                 className="text-xs"
                               >
                                 <Edit className="h-3 w-3 mr-1" />
                                 Redaguoti
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
                              {reservation.status === 'confirmed' && (
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
                      ))}
                    </div>
                   {reservations.length === 0 && (
                     <div className="text-center py-8 text-muted-foreground">
                       Rezervacijų nėra
                     </div>
                   )}
                 </CardContent>
               </Card>
             </TabsContent>

          <TabsContent value="in-person">
            <InPersonBooking />
          </TabsContent>

              <TabsContent value="recycle">
                <RecycleBin />
              </TabsContent>

              <TabsContent value="analytics">
                <GoogleAnalytics />
              </TabsContent>
            </Tabs>
        </div>
      </main>
      
      {/* Edit Reservation Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md mx-3 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Redaguoti rezervaciją</DialogTitle>
            <DialogDescription className="text-sm">
              Atnaujinkite rezervacijos informaciją.
            </DialogDescription>
          </DialogHeader>
          
          {editingReservation && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Statusas</Label>
                <Select 
                  value={editingReservation.status} 
                  onValueChange={(value) => setEditingReservation({ ...editingReservation, status: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested">Prašoma</SelectItem>
                    <SelectItem value="confirmed">Patvirtinta</SelectItem>
                    <SelectItem value="denied">Atmesta</SelectItem>
                    <SelectItem value="pending">Laukiama</SelectItem>
                    <SelectItem value="cancelled">Atšaukta</SelectItem>
                    <SelectItem value="completed">Baigta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Pradžios data</Label>
                <Input
                  type="date"
                  value={editingReservation.start_date}
                  onChange={(e) => setEditingReservation({ ...editingReservation, start_date: e.target.value })}
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Pabaigos data</Label>
                <Input
                  type="date"
                  value={editingReservation.end_date}
                  onChange={(e) => setEditingReservation({ ...editingReservation, end_date: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="h-10">
              Atšaukti
            </Button>
            <Button onClick={updateReservation} className="h-10">
              Atnaujinti rezervaciją
            </Button>
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

      <Footer />
    </div>
  );
};

export default Admin;
