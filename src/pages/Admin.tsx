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
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2, Ban, Car, Users, BarChart3, Settings, Edit, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/components/sections/footer';
import CarCalendarModal from '@/components/admin/CarCalendarModal';
import { PhotoEnhancer } from '@/components/admin/PhotoEnhancer';
import bmw3Clean from "@/assets/bmw-3-clean.png";
import chryslerTownCountrySide from "@/assets/chrysler-town-country-side.png";
import vwPassatSideClean from "@/assets/vw-passat-side-clean.png";
import kiaCeedSideClean from "@/assets/kia-ceed-side-clean.png";
import kiaCeedFrontEnhanced from "@/assets/kia-ceed-front-enhanced.png";

interface Reservation {
  id: string;
  car_name: string;
  start_date: string;
  end_date: string;
  rental_days: number;
  total_amount: number;
  status: string;
  created_at: string;
  customers: {
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
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [showCarCalendar, setShowCarCalendar] = useState(false);
  const [selectedCar, setSelectedCar] = useState<{id: string, name: string} | null>(null);

  // Form state for adding new reservation
  const [newReservation, setNewReservation] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    carName: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    dailyRate: 50,
  });

  const cars = [
    {
      id: "1",
      name: "BMW 3 series",
      price: "30 EUR",
      image: bmw3Clean,
      category: "Sedanas",
      passengers: 5,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 4.8,
      features: ["Kondicionierius", "Bluetooth", "GPS navigacija"]
    },
    {
      id: "2", 
      name: "Chrysler Town & Country",
      price: "30 EUR",
      image: chryslerTownCountrySide,
      category: "Miniautobusas",
      passengers: 7,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 4.6,
      features: ["7 vietos", "Bagažinė", "Šeimos automobilis"]
    },
    {
      id: "3",
      name: "Volkswagen Passat", 
      price: "30 EUR",
      image: vwPassatSideClean,
      category: "Sedanas",
      passengers: 5,
      fuel: "Dyzelinas",
      transmission: "Mechaninė",
      rating: 4.7,
      features: ["Ekonomiškas", "Patogus", "Didelis bagažas"]
    },
    {
      id: "4",
      name: "KIA CEED",
      price: "30 EUR", 
      image: kiaCeedFrontEnhanced,
      category: "Universalas",
      passengers: 5,
      fuel: "Benzinas",
      transmission: "Mechaninė",
      rating: 4.5,
      features: ["Ekonomiškas vairavimas", "Erdvus universalas", "Patikimas automobilis"]
    }
  ];

  const carOptions = cars.map(car => car.name);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      fetchReservations();
    }
  }, [user, isAdmin, loading]);

  // Redirect non-admin users to auth page
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/auth" replace />;
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
            first_name,
            last_name,
            email,
            phone
          )
        `)
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
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sėkmingai ištrinta",
        description: "Rezervacija buvo ištrinta.",
      });

      fetchReservations();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko ištrinti rezervacijos: " + error.message,
        variant: "destructive",
      });
    }
  };

  const cancelReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sėkmingai atšaukta",
        description: "Rezervacija buvo atšaukta.",
      });

      fetchReservations();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko atšaukti rezervacijos: " + error.message,
        variant: "destructive",
      });
    }
  };

  const addReservation = async () => {
    if (!newReservation.startDate || !newReservation.endDate) {
      toast({
        title: "Klaida",
        description: "Prašome pasirinkti pradžios ir pabaigos datas.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate rental days
      const start = new Date(newReservation.startDate);
      const end = new Date(newReservation.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const totalAmount = diffDays * newReservation.dailyRate;

      // First, create or get customer
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', newReservation.email)
        .single();

      let customerId;

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert([{
            first_name: newReservation.firstName,
            last_name: newReservation.lastName,
            email: newReservation.email,
            phone: newReservation.phone,
          }])
          .select('id')
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // Find the correct car ID based on car name
      const selectedCar = cars.find(car => car.name === newReservation.carName);
      const carId = selectedCar ? selectedCar.id : newReservation.carName.toLowerCase().replace(/ /g, '-');

      // Create reservation
      const { error: reservationError } = await supabase
        .from('reservations')
        .insert([{
          customer_id: customerId,
          car_name: newReservation.carName,
          car_id: carId,
          start_date: format(start, 'yyyy-MM-dd'),
          end_date: format(end, 'yyyy-MM-dd'),
          rental_days: diffDays,
          daily_rate: newReservation.dailyRate,
          total_rental_cost: totalAmount,
          deposit_amount: 300,
          total_amount: totalAmount,
          status: 'confirmed'
        }]);

      if (reservationError) throw reservationError;

      toast({
        title: "Sėkmingai pridėta",
        description: "Nauja rezervacija buvo sukurta.",
      });

      setShowAddDialog(false);
      setNewReservation({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        carName: '',
        startDate: null,
        endDate: null,
        dailyRate: 50,
      });
      fetchReservations();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko sukurti rezervacijos: " + error.message,
        variant: "destructive",
      });
    }
  };

  const updateReservation = async () => {
    if (!editingReservation) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          start_date: editingReservation.start_date,
          end_date: editingReservation.end_date,
          status: editingReservation.status,
        })
        .eq('id', editingReservation.id);

      if (error) throw error;

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
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Rezervacija patvirtinta",
        description: "Rezervacija buvo sėkmingai patvirtinta.",
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
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'denied' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Rezervacija atmesta",
        description: "Rezervacija buvo atmesta.",
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
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/f307c05e-658c-4866-b3eb-8b9d71719579.png" 
                alt="Logo" 
                className="h-8 w-auto"
              />
              <Badge variant="secondary" className="text-xs">Admin</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Prisijungęs: {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
                Grįžti į svetainę
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Administratoriaus skydelis</h1>
          <p className="text-muted-foreground mb-6">Valdykite automobilių nuomą ir klientų duomenis</p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bendra rezervacijų</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reservations.length}</div>
                <p className="text-xs text-muted-foreground">Visos rezervacijos sistemoje</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Prašomos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {reservations.filter(r => r.status === 'requested').length}
                </div>
                <p className="text-xs text-muted-foreground">Laukia patvirtinimo</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patvirtintos</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {reservations.filter(r => r.status === 'confirmed').length}
                </div>
                <p className="text-xs text-muted-foreground">Apmokėtos rezervacijos</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Automobilių</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cars.length}</div>
                <p className="text-xs text-muted-foreground">Galimų automobilių</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pajamos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{reservations.reduce((sum, r) => sum + (r.total_amount || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">Bendra suma</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cars Management Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Automobilių parkas
            </CardTitle>
            <CardDescription>Mūsų turimų automobilių sąrašas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cars.map((car) => (
                <Card 
                  key={car.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleCarClick({ id: car.id, name: car.name })}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={car.image} 
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2">{car.category}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{car.name}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        {car.passengers} vietos
                      </div>
                      <div>{car.fuel} • {car.transmission}</div>
                      <div className="font-semibold text-primary">{car.price}/dienai</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Photo Enhancement Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Foto redagavimas
            </CardTitle>
            <CardDescription>Pagerinkite automobilių nuotraukas pašalinant foną</CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoEnhancer />
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
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Pridėti rezervaciją
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nauja rezervacija</DialogTitle>
                  <DialogDescription>
                    Sukurkite naują rezervaciją klientui, kuris kreipėsi telefonu arba atėjo į biurą.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Vardas</Label>
                    <Input
                      id="firstName"
                      value={newReservation.firstName}
                      onChange={(e) => setNewReservation({ ...newReservation, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Pavardė</Label>
                    <Input
                      id="lastName"
                      value={newReservation.lastName}
                      onChange={(e) => setNewReservation({ ...newReservation, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">El. paštas</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newReservation.email}
                      onChange={(e) => setNewReservation({ ...newReservation, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefonas</Label>
                    <Input
                      id="phone"
                      value={newReservation.phone}
                      onChange={(e) => setNewReservation({ ...newReservation, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carName">Automobilis</Label>
                    <Select value={newReservation.carName} onValueChange={(value) => setNewReservation({ ...newReservation, carName: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pasirinkite automobilį" />
                      </SelectTrigger>
                      <SelectContent>
                        {carOptions.map((car) => (
                          <SelectItem key={car} value={car}>{car}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dailyRate">Dienos kaina (€)</Label>
                    <Input
                      id="dailyRate"
                      type="number"
                      value={newReservation.dailyRate}
                      onChange={(e) => setNewReservation({ ...newReservation, dailyRate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pradžios data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newReservation.startDate ? format(newReservation.startDate, 'yyyy-MM-dd') : 'Pasirinkite datą'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newReservation.startDate || undefined}
                          onSelect={(date) => setNewReservation({ ...newReservation, startDate: date || null })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Pabaigos data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newReservation.endDate ? format(newReservation.endDate, 'yyyy-MM-dd') : 'Pasirinkite datą'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newReservation.endDate || undefined}
                          onSelect={(date) => setNewReservation({ ...newReservation, endDate: date || null })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Atšaukti
                  </Button>
                  <Button onClick={addReservation}>
                    Sukurti rezervaciją
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Klientas</TableHead>
                  <TableHead>Automobilis</TableHead>
                  <TableHead>Datos</TableHead>
                  <TableHead>Dienų</TableHead>
                  <TableHead>Suma</TableHead>
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
                    <TableCell>€{reservation.total_amount}</TableCell>
                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                    <TableCell>{format(new Date(reservation.created_at), 'yyyy-MM-dd HH:mm')}</TableCell>
                     <TableCell>
                       <div className="flex gap-2">
                         {reservation.status === 'requested' && (
                           <>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => approveReservation(reservation.id)}
                               className="text-green-600 border-green-300 hover:bg-green-50"
                             >
                               <CheckCircle className="h-4 w-4" />
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => denyReservation(reservation.id)}
                               className="text-red-600 border-red-300 hover:bg-red-50"
                             >
                               <XCircle className="h-4 w-4" />
                             </Button>
                           </>
                         )}
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleEditReservation(reservation)}
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                         {reservation.status !== 'cancelled' && reservation.status !== 'denied' && (
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
            
            {reservations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Rezervacijų nėra
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Edit Reservation Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Redaguoti rezervaciją</DialogTitle>
            <DialogDescription>
              Atnaujinkite rezervacijos informaciją.
            </DialogDescription>
          </DialogHeader>
          
          {editingReservation && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Statusas</Label>
                <Select 
                  value={editingReservation.status} 
                  onValueChange={(value) => setEditingReservation({ ...editingReservation, status: value })}
                >
                  <SelectTrigger>
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
                <Label>Pradžios data</Label>
                <Input
                  type="date"
                  value={editingReservation.start_date}
                  onChange={(e) => setEditingReservation({ ...editingReservation, start_date: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Pabaigos data</Label>
                <Input
                  type="date"
                  value={editingReservation.end_date}
                  onChange={(e) => setEditingReservation({ ...editingReservation, end_date: e.target.value })}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Atšaukti
            </Button>
            <Button onClick={updateReservation}>
              Atnaujinti rezervaciją
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Car Calendar Modal */}
      {selectedCar && (
        <CarCalendarModal
          isOpen={showCarCalendar}
          onClose={() => setShowCarCalendar(false)}
          carId={selectedCar.id}
          carName={selectedCar.name}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default Admin;