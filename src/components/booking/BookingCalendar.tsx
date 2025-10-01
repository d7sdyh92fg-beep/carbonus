import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Calculator, Clock } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { lt } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useBooking } from "@/contexts/BookingContext";
import { useToast } from "@/hooks/use-toast";

interface BookingCalendarProps {
  carId: string;
  carName: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ carId, carName }) => {
  const navigate = useNavigate();
  const { setBookingData } = useBooking();
  const { toast } = useToast();
  const [selectedRange, setSelectedRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  // Fetch booked dates on component mount and set up real-time updates
  useEffect(() => {
    fetchBookedDates();

    // Set up real-time subscription for reservations
    const channel = supabase
      .channel('reservation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `car_id=eq.${carId}`
        },
        () => {
          // Refresh booked dates when reservations change
          fetchBookedDates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [carId]);

  const fetchBookedDates = async () => {
    try {
      const { data: reservations, error } = await supabase
        .from("reservations")
        .select("start_date, end_date")
        .eq("car_id", carId)
        .in("status", ["confirmed", "pending", "requested"])
        .is("deleted_at", null);

      if (error) {
        console.error("Error fetching booked dates:", error);
        return;
      }

      const dates: Date[] = [];
      reservations?.forEach((reservation) => {
        const start = new Date(reservation.start_date);
        const end = new Date(reservation.end_date);
        
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          dates.push(new Date(date));
        }
      });

      setBookedDates(dates);
    } catch (error) {
      console.error("Error fetching booked dates:", error);
    }
  };

  const calculatePrice = (days: number, isSecondVehicle: boolean): number => {
    if (days <= 3) {
      return 50;
    } else if (days <= 7) {
      return 40;
    } else {
      return 30;
    }
  };

  const getDaysCount = (): number => {
    if (!selectedRange.from || !selectedRange.to) return 0;
    return differenceInDays(selectedRange.to, selectedRange.from) + 1;
  };

  const getTotalPrice = (): number => {
    const days = getDaysCount();
    if (days === 0) return 0;
    
    const dailyRate = calculatePrice(days, false);
    return dailyRate * days;
  };

  const getPriceCategory = (): string => {
    const days = getDaysCount();
    if (days <= 3) return "1-3 dienos";
    if (days <= 7) return "3-7 dienos";
    return "7+ dienų";
  };

  const handleSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range) {
      setSelectedRange(range);
    }
  };

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
    );
  };

  const handleBooking = () => {
    if (!selectedRange.from || !selectedRange.to) {
      toast({
        title: "Klaida",
        description: "Prašome pasirinkti nuomos datas",
        variant: "destructive",
      });
      return;
    }

    // Set booking data and navigate to insurance selection
    setBookingData({
      carId,
      carName,
      startDate: selectedRange.from.toISOString().split('T')[0],
      endDate: selectedRange.to.toISOString().split('T')[0],
      rentalDays: getDaysCount(),
      basePrice: getTotalPrice(),
      services: [],
    });

    navigate(`/rezervacija/${carId}/atsakomybe`);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Pasirinkite datas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={handleSelect}
            disabled={(date) => date < new Date() || isDateBooked(date)}
            modifiers={{
              booked: bookedDates,
            }}
            modifiersStyles={{
              booked: {
                backgroundColor: 'hsl(var(--destructive))',
                color: 'hsl(var(--destructive-foreground))',
                fontWeight: 'bold',
                border: '2px solid hsl(var(--destructive))',
                borderRadius: '4px',
              },
            }}
            className="rounded-lg border bg-card shadow-sm w-full max-w-full"
            locale={lt}
          />
          
          {/* Calendar Legend */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-destructive rounded border-2 border-destructive"></div>
              <span className="text-muted-foreground">Užimtos datos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-muted border border-border rounded"></div>
              <span className="text-muted-foreground">Laisvos datos</span>
            </div>
          </div>
          
          {selectedRange.from && selectedRange.to && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Pasirinktos datos:</div>
              <div className="font-semibold">
                {format(selectedRange.from, "PPP", { locale: lt })} - {format(selectedRange.to, "PPP", { locale: lt })}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{getDaysCount()} {getDaysCount() === 1 ? "diena" : "dienos"}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Kainų skaičiuoklė
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pricing Tiers */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Kainų kategorijos</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded border">
                <span className="text-sm">1-3 dienos</span>
                <span className="font-semibold">€50/dieną</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded border">
                <span className="text-sm">3-7 dienos</span>
                <span className="font-semibold">€40/dieną</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded border">
                <span className="text-sm">7+ dienų</span>
                <span className="font-semibold">€30/dieną</span>
              </div>
            </div>
          </div>

          {getDaysCount() > 0 && (
            <>
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Kategorija:</span>
                    <Badge variant="secondary">{getPriceCategory()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Dienų skaičius:</span>
                    <span className="font-semibold">{getDaysCount()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Dienos kaina:</span>
                    <span className="font-semibold">€{calculatePrice(getDaysCount(), false)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Nuomos kaina:</span>
                  <span className="font-semibold">€{getTotalPrice()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Užstatas (grąžinamas):</span>
                  <span className="font-semibold">€300</span>
                </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Bendra suma:</span>
                    <span className="text-2xl font-bold text-primary">€{getTotalPrice() + 300}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleBooking}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                Užsakyti už €{getTotalPrice() + 300}
              </Button>
              
              <div className="text-xs text-muted-foreground text-center">
                <p>* Užstatas €300 grąžinamas po automobilio grąžinimo</p>
                <p>* Bendra mokėtina suma: €{getTotalPrice() + 300}</p>
              </div>
            </>
          )}

          {getDaysCount() === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Pasirinkite datas, kad pamatytumėte kainą</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;