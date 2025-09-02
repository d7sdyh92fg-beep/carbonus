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
import { CalendarIcon, Plus, Trash2, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/ui/navigation';
import { Footer } from '@/components/sections/footer';

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

  const carOptions = [
    'BMW 3 series',
    'Audi RS5',
    'Mercedes C-Class',
    'Toyota Camry',
    'Tesla Model 3',
    'Ford Mustang',
  ];

  useEffect(() => {
    if (user && isAdmin) {
      fetchReservations();
    }
  }, [user, isAdmin]);

  // Redirect non-admin users
  if (!loading && (!user || !isAdmin)) {
    return <Navigate to="/auth" replace />;
  }

  if (loading || isLoading) {
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

      // Create reservation
      const { error: reservationError } = await supabase
        .from('reservations')
        .insert([{
          customer_id: customerId,
          car_name: newReservation.carName,
          car_id: newReservation.carName.toLowerCase().replace(/ /g, '-'),
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

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      completed: 'outline',
    } as const;

    const labels = {
      pending: 'Laukiama',
      confirmed: 'Patvirtinta',
      cancelled: 'Atšaukta',
      completed: 'Baigta',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Administratoriaus skydelis</h1>
          <p className="text-muted-foreground">Valdykite rezervacijas ir klientų duomenis</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Rezervacijos</CardTitle>
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
                        {reservation.status !== 'cancelled' && (
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
      
      <Footer />
    </div>
  );
};

export default Admin;