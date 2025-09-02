import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Car, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { lt } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface CarCalendarModalProps {
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

const CarCalendarModal: React.FC<CarCalendarModalProps> = ({ isOpen, onClose, carId, carName }) => {
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateReservations, setDateReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCarReservations();
    }
  }, [isOpen, carId]);

  const fetchCarReservations = async () => {
    try {
      // Admin users can still access full reservation data via RLS
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
        .order('start_date', { ascending: true });

      if (error) throw error;

      setReservations(data || []);

      // Generate booked dates from the same data
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
      // Fallback to public availability view if admin access fails
      try {
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('reservation_availability')
          .select('start_date, end_date')
          .eq('car_id', carId);

        if (availabilityError) throw availabilityError;

        const dates: Date[] = [];
        availabilityData?.forEach((reservation) => {
          const start = new Date(reservation.start_date);
          const end = new Date(reservation.end_date);
          
          for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            dates.push(new Date(date));
          }
        });

        setBookedDates(dates);
        setReservations([]); // Clear reservations since we don't have access
      } catch (fallbackError) {
        console.error('Error fetching availability data:', fallbackError);
      }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {carName} - Rezervacijų kalendorius
          </DialogTitle>
          <DialogDescription>
            Peržiūrėkite automobilio rezervacijas ir pasirinkite datą, kad pamatytumėte išsamią informaciją.
          </DialogDescription>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Kalendorius
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
      </DialogContent>
    </Dialog>
  );
};

export default CarCalendarModal;