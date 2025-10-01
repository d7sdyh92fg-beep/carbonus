import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Calendar as CalendarIcon, Car, Clock, Gauge, Settings, Wrench, CheckCircle, XCircle, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { lt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CarManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  carName: string;
}

interface Reservation {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  rental_days: number;
  customers: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface CarDetails {
  id: string;
  name: string;
  category: string;
  price_per_day: number;
  year: number;
  passengers: number;
  fuel: string;
  transmission: string;
  current_mileage: number;
  health_status: string;
  last_service_date: string | null;
  next_service_date: string | null;
  service_interval_km: number;
  notes: string | null;
  is_available: boolean;
}

interface ServiceRecord {
  id: string;
  service_date: string;
  mileage_at_service: number;
  service_type: string;
  description: string;
  cost: number | null;
  performed_by: string | null;
  notes: string | null;
}

interface BlockedDate {
  id: string;
  car_id: string;
  blocked_date: string;
  reason: string | null;
  created_at: string;
  created_by: string | null;
}

const CarManagementModal: React.FC<CarManagementModalProps> = ({ isOpen, onClose, carId, carName }) => {
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateReservations, setDateReservations] = useState<Reservation[]>([]);
  const [carDetails, setCarDetails] = useState<CarDetails | null>(null);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CarDetails>>({});
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({
    service_date: '',
    mileage_at_service: 0,
    service_type: '',
    description: '',
    cost: '',
    performed_by: '',
    notes: ''
  });
  
  // Blocked dates state
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [blockedDatesData, setBlockedDatesData] = useState<BlockedDate[]>([]);
  const [selectedBlockDates, setSelectedBlockDates] = useState<Date[] | undefined>();
  const [blockReason, setBlockReason] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCarData();
      fetchCarReservations();
      fetchServiceRecords();
      fetchBlockedDates();
    }
  }, [isOpen, carId]);

  const fetchCarData = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .single();

      if (error) throw error;
      setCarDetails(data);
      setEditForm(data);
    } catch (error) {
      console.error('Error fetching car details:', error);
    }
  };

  const fetchCarReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email
          )
        `)
        .eq('car_id', carId)
        .in('status', ['confirmed', 'pending', 'requested'])
        .is('deleted_at', null)
        .order('start_date', { ascending: true });

      if (error) throw error;

      setReservations(data || []);

      // Generate booked dates
      const dates: Date[] = [];
      data?.forEach((reservation) => {
        const start = new Date(reservation.start_date);
        const end = new Date(reservation.end_date);
        
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          dates.push(new Date(date));
        }
      });

      setBookedDates(dates);
    } catch (error) {
      console.error('Error fetching car reservations:', error);
    }
  };

  const fetchServiceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('car_service_records')
        .select('*')
        .eq('car_id', carId)
        .order('service_date', { ascending: false });

      if (error) throw error;
      setServiceRecords(data || []);
    } catch (error) {
      console.error('Error fetching service records:', error);
    }
  };

  const updateCarDetails = async () => {
    try {
      const { error } = await supabase
        .from('cars')
        .update(editForm)
        .eq('id', carId);

      if (error) throw error;

      toast({
        title: "Sėkmingai atnaujinta",
        description: "Automobilio informacija atnaujinta.",
      });

      setCarDetails({ ...carDetails, ...editForm } as CarDetails);
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko atnaujinti automobilio informacijos: " + error.message,
        variant: "destructive",
      });
    }
  };

  const addServiceRecord = async () => {
    try {
      const { error } = await supabase
        .from('car_service_records')
        .insert({
          car_id: carId,
          service_date: newService.service_date,
          mileage_at_service: newService.mileage_at_service,
          service_type: newService.service_type,
          description: newService.description,
          cost: newService.cost ? parseFloat(newService.cost) : null,
          performed_by: newService.performed_by || null,
          notes: newService.notes || null
        });

      if (error) throw error;

      toast({
        title: "Sėkmingai pridėta",
        description: "Aptarnavimo įrašas pridėtas.",
      });

      setShowAddService(false);
      setNewService({
        service_date: '',
        mileage_at_service: 0,
        service_type: '',
        description: '',
        cost: '',
        performed_by: '',
        notes: ''
      });
      
      fetchServiceRecords();
      fetchCarData(); // Refresh car details
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko pridėti aptarnavimo įrašo: " + error.message,
        variant: "destructive",
      });
    }
  };

  const fetchBlockedDates = async () => {
    try {
      const { data, error } = await supabase
        .from('car_blocked_dates')
        .select('*')
        .eq('car_id', carId)
        .order('blocked_date', { ascending: true });

      if (error) throw error;
      
      const blockedDatesArray = (data || []).map(item => new Date(item.blocked_date));
      setBlockedDates(blockedDatesArray);
      setBlockedDatesData(data || []);
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    }
  };

  const blockSelectedDates = async () => {
    if (!selectedBlockDates || selectedBlockDates.length === 0) return;

    try {
      const blockedDateEntries = selectedBlockDates.map(date => ({
        car_id: carId,
        blocked_date: date.toISOString().split('T')[0],
        reason: blockReason || null,
        created_by: null // Will be set by RLS if authenticated
      }));

      const { error } = await supabase
        .from('car_blocked_dates')
        .insert(blockedDateEntries);

      if (error) throw error;

      toast({
        title: "Datos blokuotos",
        description: `Sėkmingai blokuota ${selectedBlockDates.length} datos.`,
      });

      setSelectedBlockDates(undefined);
      setBlockReason('');
      fetchBlockedDates();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko blokuoti datų: " + error.message,
        variant: "destructive",
      });
    }
  };

  const unblockSelectedDates = async () => {
    if (!selectedBlockDates || selectedBlockDates.length === 0) return;

    try {
      const datesToUnblock = selectedBlockDates.map(date => date.toISOString().split('T')[0]);
      
      const { error } = await supabase
        .from('car_blocked_dates')
        .delete()
        .eq('car_id', carId)
        .in('blocked_date', datesToUnblock);

      if (error) throw error;

      toast({
        title: "Datos atblokuotos",
        description: `Sėkmingai atblokuota ${selectedBlockDates.length} datos.`,
      });

      setSelectedBlockDates(undefined);
      fetchBlockedDates();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko atblokuoti datų: " + error.message,
        variant: "destructive",
      });
    }
  };

  const removeBlockedDate = async (blockedDateId: string) => {
    try {
      const { error } = await supabase
        .from('car_blocked_dates')
        .delete()
        .eq('id', blockedDateId);

      if (error) throw error;

      toast({
        title: "Data atblokuota",
        description: "Data sėkmingai atblokuota.",
      });

      fetchBlockedDates();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko atblokuoti datos: " + error.message,
        variant: "destructive",
      });
    }
  };

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const dateStr = date.toDateString();
      const reservationsForDate = reservations.filter(reservation => {
        const start = new Date(reservation.start_date);
        const end = new Date(reservation.end_date);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (d.toDateString() === dateStr) {
            return true;
          }
        }
        return false;
      });
      setDateReservations(reservationsForDate);
    } else {
      setDateReservations([]);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      requested: 'outline',
      denied: 'destructive',
    } as const;

    const labels = {
      pending: 'Laukiama',
      confirmed: 'Patvirtinta',
      cancelled: 'Atšaukta',
      requested: 'Prašoma',
      denied: 'Atmesta',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getHealthStatusBadge = (status: string) => {
    const config = {
      excellent: { variant: 'default' as const, label: 'Puikiai', icon: CheckCircle },
      good: { variant: 'secondary' as const, label: 'Gerai', icon: CheckCircle },
      fair: { variant: 'outline' as const, label: 'Vidutiniškai', icon: AlertTriangle },
      needs_attention: { variant: 'destructive' as const, label: 'Reikia dėmesio', icon: AlertTriangle },
      maintenance_required: { variant: 'destructive' as const, label: 'Reikalingas aptarnavimas', icon: XCircle },
    };

    const { variant, label, icon: Icon } = config[status as keyof typeof config] || config.good;

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const getAvailabilityBadge = (isAvailable: boolean) => {
    return (
      <Badge variant={isAvailable ? 'default' : 'destructive'}>
        {isAvailable ? 'Prieinamas' : 'Neprieinamas'}
      </Badge>
    );
  };

  if (!carDetails) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Car className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">{carName} - Automobilio valdymas</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Išsami automobilio informacija, rezervacijos ir aptarnavimo valdymas.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
            <TabsTrigger value="calendar" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
              <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Kalendorius</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
              <Car className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Automobilis</span>
            </TabsTrigger>
            <TabsTrigger value="service" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
              <Wrench className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Aptarnavimas</span>
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">Prieinamumas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Rezervacijų kalendorius
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    modifiers={{
                      booked: bookedDates,
                    }}
                    modifiersStyles={{
                      booked: {
                        backgroundColor: 'hsl(var(--destructive))',
                        color: 'hsl(var(--destructive-foreground))',
                      },
                    }}
                    className="rounded-md border"
                    locale={lt}
                  />
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-destructive rounded"></div>
                      <span>Užimtos datos</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 bg-muted border border-border rounded"></div>
                      <span>Laisvos datos</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reservation Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {selectedDate ? `Rezervacijos - ${format(selectedDate, 'PPP', { locale: lt })}` : 'Pasirinkite datą'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate && dateReservations.length > 0 ? (
                    <div className="space-y-4">
                      {dateReservations.map((reservation) => (
                        <Card key={reservation.id} className="border-l-4 border-l-primary">
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">
                                  {reservation.customers.first_name} {reservation.customers.last_name}
                                </span>
                                {getStatusBadge(reservation.status)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {reservation.customers.email}
                              </div>
                              <div className="text-sm">
                                <div><strong>Pradžia:</strong> {format(new Date(reservation.start_date), 'PPP', { locale: lt })}</div>
                                <div><strong>Pabaiga:</strong> {format(new Date(reservation.end_date), 'PPP', { locale: lt })}</div>
                                <div><strong>Dienų:</strong> {reservation.rental_days}</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : selectedDate && dateReservations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Šioje datoje rezervacijų nėra</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Pasirinkite datą kalendoriuje, kad pamatytumėte rezervacijas</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Rezervacijų suvestinė</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{reservations.length}</div>
                    <div className="text-sm text-muted-foreground">Visos rezervacijos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {reservations.filter(r => r.status === 'requested').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Prašomos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {reservations.filter(r => r.status === 'confirmed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Patvirtintos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {reservations.filter(r => r.status === 'pending').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Laukiančios</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Car className="w-5 h-5" />
                    Automobilio informacija
                  </span>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      Redaguoti
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        Atšaukti
                      </Button>
                      <Button size="sm" onClick={updateCarDetails}>
                        Išsaugoti
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Pavadinimas</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium">{carDetails.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Kategorija</Label>
                    {isEditing ? (
                      <Select
                        value={editForm.category || ''}
                        onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sedanas">Sedanas</SelectItem>
                          <SelectItem value="Hečbekas">Hečbekas</SelectItem>
                          <SelectItem value="Universalas">Universalas</SelectItem>
                          <SelectItem value="Minivenas">Minivenas</SelectItem>
                          <SelectItem value="Visureigis">Visureigis</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm">{carDetails.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Dienos kaina</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editForm.price_per_day || ''}
                        onChange={(e) => setEditForm({ ...editForm, price_per_day: Number(e.target.value) })}
                      />
                    ) : (
                      <p className="text-sm">€{carDetails.price_per_day}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Metai</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editForm.year || ''}
                        onChange={(e) => setEditForm({ ...editForm, year: Number(e.target.value) })}
                      />
                    ) : (
                      <p className="text-sm">{carDetails.year}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Keleivių skaičius</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editForm.passengers || ''}
                        onChange={(e) => setEditForm({ ...editForm, passengers: Number(e.target.value) })}
                      />
                    ) : (
                      <p className="text-sm">{carDetails.passengers}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Kuras</Label>
                    {isEditing ? (
                      <Select
                        value={editForm.fuel || ''}
                        onValueChange={(value) => setEditForm({ ...editForm, fuel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Benzinas">Benzinas</SelectItem>
                          <SelectItem value="Dyzelinas">Dyzelinas</SelectItem>
                          <SelectItem value="Hibridas">Hibridas</SelectItem>
                          <SelectItem value="Elektrinis">Elektrinis</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm">{carDetails.fuel}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Mileage & Health Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="w-5 h-5" />
                    Rida ir būklė
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Dabartinė rida (km)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editForm.current_mileage || ''}
                        onChange={(e) => setEditForm({ ...editForm, current_mileage: Number(e.target.value) })}
                      />
                    ) : (
                      <p className="text-2xl font-bold">{carDetails.current_mileage?.toLocaleString()}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Automobilio būklė</Label>
                    {isEditing ? (
                      <Select
                        value={editForm.health_status || ''}
                        onValueChange={(value) => setEditForm({ ...editForm, health_status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Puikiai</SelectItem>
                          <SelectItem value="good">Gerai</SelectItem>
                          <SelectItem value="fair">Vidutiniškai</SelectItem>
                          <SelectItem value="needs_attention">Reikia dėmesio</SelectItem>
                          <SelectItem value="maintenance_required">Reikalingas aptarnavimas</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div>{getHealthStatusBadge(carDetails.health_status)}</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Service Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Aptarnavimo informacija
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Paskutinis aptarnavimas</Label>
                    <p className="text-sm">
                      {carDetails.last_service_date 
                        ? format(new Date(carDetails.last_service_date), 'PPP', { locale: lt })
                        : 'Nėra duomenų'
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Kitas aptarnavimas</Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editForm.next_service_date || ''}
                        onChange={(e) => setEditForm({ ...editForm, next_service_date: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm">
                        {carDetails.next_service_date 
                          ? format(new Date(carDetails.next_service_date), 'PPP', { locale: lt })
                          : 'Nenustatyta'
                        }
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Aptarnavimo intervalas (km)</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editForm.service_interval_km || ''}
                        onChange={(e) => setEditForm({ ...editForm, service_interval_km: Number(e.target.value) })}
                      />
                    ) : (
                      <p className="text-sm">{carDetails.service_interval_km?.toLocaleString()}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pastabos</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    placeholder="Papildomos pastabos apie automobilį..."
                    rows={3}
                  />
                ) : (
                  <p className="text-sm">{carDetails.notes || 'Nėra pastabų'}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="service" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Aptarnavimo įrašai
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddService(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Pridėti įrašą
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {serviceRecords.length > 0 ? (
                  <div className="space-y-4">
                    {serviceRecords.map((record) => (
                      <Card key={record.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold">{record.service_type}</h4>
                              <p className="text-sm text-muted-foreground">{record.description}</p>
                              <div className="mt-2 text-sm">
                                <div><strong>Data:</strong> {format(new Date(record.service_date), 'PPP', { locale: lt })}</div>
                                <div><strong>Rida:</strong> {record.mileage_at_service.toLocaleString()} km</div>
                                {record.cost && <div><strong>Kaina:</strong> €{record.cost}</div>}
                              </div>
                            </div>
                            <div>
                              {record.performed_by && (
                                <div className="text-sm">
                                  <strong>Atliko:</strong> {record.performed_by}
                                </div>
                              )}
                              {record.notes && (
                                <div className="text-sm mt-2">
                                  <strong>Pastabos:</strong> {record.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aptarnavimo įrašų nėra</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Service Dialog */}
            <Dialog open={showAddService} onOpenChange={setShowAddService}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Pridėti aptarnavimo įrašą</DialogTitle>
                  <DialogDescription>
                    Užregistruokite naują automobilio aptarnavimo įrašą.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="service_date">Aptarnavimo data</Label>
                    <Input
                      id="service_date"
                      type="date"
                      value={newService.service_date}
                      onChange={(e) => setNewService({ ...newService, service_date: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Rida (km)</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={newService.mileage_at_service || ''}
                      onChange={(e) => setNewService({ ...newService, mileage_at_service: Number(e.target.value) })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="service_type">Aptarnavimo tipas</Label>
                    <Select
                      value={newService.service_type}
                      onValueChange={(value) => setNewService({ ...newService, service_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pasirinkite tipą" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Reguliarus aptarnavimas">Reguliarus aptarnavimas</SelectItem>
                        <SelectItem value="Variklio alyvos keitimas">Variklio alyvos keitimas</SelectItem>
                        <SelectItem value="Stabdžių patikra">Stabdžių patikra</SelectItem>
                        <SelectItem value="Padangų keitimas">Padangų keitimas</SelectItem>
                        <SelectItem value="Remontas">Remontas</SelectItem>
                        <SelectItem value="Kita">Kita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Aprašymas</Label>
                    <Textarea
                      id="description"
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cost">Kaina (€)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={newService.cost}
                      onChange={(e) => setNewService({ ...newService, cost: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="performed_by">Atliko</Label>
                    <Input
                      id="performed_by"
                      value={newService.performed_by}
                      onChange={(e) => setNewService({ ...newService, performed_by: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowAddService(false)}>
                    Atšaukti
                  </Button>
                  <Button onClick={addServiceRecord}>
                    Pridėti
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Prieinamumo valdymas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Automobilio prieinamumas</h4>
                    <p className="text-sm text-muted-foreground">
                      Kontroliuokite, ar automobilis prieinamas rezervacijoms
                    </p>
                  </div>
                  {getAvailabilityBadge(carDetails.is_available)}
                </div>

                {/* Date Blocking Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      Blokuoti datos
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Pasirinkite ir blokuokite datas, kai automobilis nebus prieinamas
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                      <div className="w-full">
                        <div className="border rounded-lg p-2 w-full">
                          <div className="w-full max-w-full overflow-hidden [&_.rdp-caption]:text-xs [&_.rdp-nav_button]:h-6 [&_.rdp-nav_button]:w-6">
                            <Calendar
                              mode="multiple"
                              selected={selectedBlockDates}
                              onSelect={setSelectedBlockDates}
                              className="rounded-md border-0 pointer-events-auto w-full max-w-full"
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                              modifiers={{
                                blocked: blockedDates,
                                booked: bookedDates.map(d => new Date(d))
                              }}
                              modifiersStyles={{
                                blocked: { backgroundColor: '#ef4444', color: 'white' },
                                booked: { backgroundColor: '#f59e0b', color: 'white' }
                              }}
                            />
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-red-500 rounded shrink-0"></div>
                              <span>Blokuota</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 bg-amber-500 rounded shrink-0"></div>
                              <span>Rezervuota</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {selectedBlockDates && selectedBlockDates.length > 0 && (
                          <div>
                            <Label htmlFor="block-reason" className="text-sm">Blokavimo priežastis</Label>
                            <Textarea
                              id="block-reason"
                              placeholder="Pvz., Remontas, Aptarnavimas, Kita..."
                              value={blockReason}
                              onChange={(e) => setBlockReason(e.target.value)}
                              rows={3}
                              className="text-sm"
                            />
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button 
                            onClick={blockSelectedDates}
                            disabled={!selectedBlockDates || selectedBlockDates.length === 0}
                            size="sm"
                            className="w-full sm:w-auto text-xs sm:text-sm"
                          >
                            Blokuoti pasirinktas datas
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={unblockSelectedDates}
                            disabled={!selectedBlockDates || selectedBlockDates.length === 0}
                            size="sm"
                            className="w-full sm:w-auto text-xs sm:text-sm"
                          >
                            Atblokuoti
                          </Button>
                        </div>

                        {blockedDates.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2 text-sm">Blokuotos datos:</h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {blockedDatesData.map((blocked) => (
                                <div key={blocked.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs sm:text-sm">
                                  <div className="flex-1 min-w-0">
                                    <span className="font-medium block truncate">{format(new Date(blocked.blocked_date), 'PPP', { locale: lt })}</span>
                                    {blocked.reason && <p className="text-xs text-muted-foreground truncate">{blocked.reason}</p>}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeBlockedDate(blocked.id)}
                                    className="shrink-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Realaus laiko statistikos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Visos rezervacijos:</span>
                        <Badge variant="outline">{reservations.length}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Aktyvios rezervacijos:</span>
                        <Badge variant="default">
                          {reservations.filter(r => r.status === 'confirmed').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Laukiančios patvirtinimo:</span>
                        <Badge variant="secondary">
                          {reservations.filter(r => r.status === 'requested').length}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Užimtų dienų:</span>
                        <Badge variant="outline">{bookedDates.length}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Blokuotų dienų:</span>
                        <Badge variant="destructive">{blockedDates.length}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Aptarnavimo priminimas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      {carDetails.next_service_date && (
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="font-medium text-sm">Artėja aptarnavimas</span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Planuojama: {format(new Date(carDetails.next_service_date), 'PPP', { locale: lt })}
                          </p>
                        </div>
                      )}
                      
                      {carDetails.current_mileage && carDetails.service_interval_km && (
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Gauge className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="font-medium text-sm">Ridos kontrolė</span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Iki kito aptarnavimo: {Math.max(0, (Math.ceil(carDetails.current_mileage / carDetails.service_interval_km) * carDetails.service_interval_km) - carDetails.current_mileage).toLocaleString()} km
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CarManagementModal;