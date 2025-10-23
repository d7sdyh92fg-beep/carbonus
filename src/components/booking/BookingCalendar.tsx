import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Calculator, Clock } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { lt, enUS } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useBooking } from "@/contexts/BookingContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/use-translations";
import { PRICING } from "@/config/pricing";

interface BookingCalendarProps {
  carId: string;
  carName: string;
  carImage?: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ carId, carName, carImage }) => {
  const navigate = useNavigate();
  const { setBookingData } = useBooking();
  const { toast } = useToast();
  const { t, language } = useTranslations();
  const [selectedRange, setSelectedRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [pickupTime, setPickupTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('10:00');

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
    setIsLoadingDates(true);
    try {
      const { data: reservations, error } = await supabase
        .from("reservations")
        .select("start_date, end_date")
        .eq("car_id", carId)
        .in("status", ["paid", "pending", "requested", "picked_up"])
        .is("deleted_at", null);

      if (error) {
        console.error("Error fetching booked dates:", error);
        toast({
          title: t('booking.errorTitle'),
          description: t('commonMessages.errorLoadingDates'),
          variant: "destructive",
        });
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
      toast({
        title: t('booking.errorTitle'),
        description: t('commonMessages.errorLoadingDates'),
        variant: "destructive",
      });
    } finally {
      setIsLoadingDates(false);
    }
  };


  const getDaysCount = (): number => {
    if (!selectedRange.from || !selectedRange.to) return 0;
    return differenceInDays(selectedRange.to, selectedRange.from) + 1;
  };

  const getTotalPrice = (): number => {
    const days = getDaysCount();
    if (days === 0) return 0;
    
    const dailyRate = PRICING.getDailyRate(days, carId);
    return dailyRate * days;
  };

  const getPriceCategory = (): string => {
    const days = getDaysCount();
    return t(PRICING.getPricingTier(days, carId).labelKey);
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
        title: t('booking.errorTitle'),
        description: t('booking.errorSelectDates'),
        variant: "destructive",
      });
      return;
    }

    // Set booking data and navigate to services
    setBookingData({
      carId,
      carName,
      carImage,
      startDate: selectedRange.from.toISOString().split('T')[0],
      endDate: selectedRange.to.toISOString().split('T')[0],
      pickupTime,
      returnTime,
      rentalDays: getDaysCount(),
      basePrice: getTotalPrice(),
      services: [],
    });

    navigate(`/rezervacija/${carId}/paslaugos`);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {t('booking.selectDates')}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {isLoadingDates && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">{t('commonMessages.loadingDates')}</p>
              </div>
            </div>
          )}
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
            locale={language === 'lt' ? lt : enUS}
          />
          
          {/* Calendar Legend */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-destructive rounded border-2 border-destructive"></div>
              <span className="text-muted-foreground">{t('booking.bookedDates')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 bg-muted border border-border rounded"></div>
              <span className="text-muted-foreground">{t('booking.availableDates')}</span>
            </div>
          </div>
          
          {/* Time Selection */}
          <div className="mt-6 p-4 border-2 border-primary/20 rounded-lg bg-card">
            <h5 className="font-semibold mb-4 text-sm">{t('booking.pickupReturnTime')}</h5>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pickupTime" className="text-xs">{t('booking.pickupTime')}</Label>
                <Select value={pickupTime} onValueChange={setPickupTime}>
                  <SelectTrigger id="pickupTime" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
                <Label htmlFor="returnTime" className="text-xs">{t('booking.returnTime')}</Label>
                <Select value={returnTime} onValueChange={setReturnTime}>
                  <SelectTrigger id="returnTime" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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

          {selectedRange.from && selectedRange.to && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">{t('booking.selectedDates')}</div>
              <div className="font-semibold">
                {format(selectedRange.from, "PPP", { locale: language === 'lt' ? lt : enUS })} - {format(selectedRange.to, "PPP", { locale: language === 'lt' ? lt : enUS })}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{getDaysCount()} {getDaysCount() === 1 ? t('booking.day') : t('booking.days')}</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className="text-muted-foreground">{t('booking.pickup')} {pickupTime}</span>
                <span className="text-muted-foreground">{t('booking.return')} {returnTime}</span>
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
            {t('booking.priceCalculator')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pricing Tiers */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{t('booking.priceCategories')}</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded border">
                <span className="text-sm">{t('booking.category1to3')}</span>
                <span className="font-semibold">€50{t('booking.perDay')}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded border">
                <span className="text-sm">{t('booking.category3to7')}</span>
                <span className="font-semibold">€40{t('booking.perDay')}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded border">
                <span className="text-sm">{t('booking.category7plus')}</span>
                <span className="font-semibold">€30{t('booking.perDay')}</span>
              </div>
            </div>
          </div>

          {getDaysCount() > 0 && (
            <>
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('booking.category')}</span>
                    <Badge variant="secondary">{getPriceCategory()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('booking.daysCount')}</span>
                    <span className="font-semibold">{getDaysCount()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('booking.dailyRate')}</span>
                    <span className="font-semibold">€{PRICING.getDailyRate(getDaysCount(), carId)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t('booking.rentalPrice')}</span>
                    <span className="font-semibold">€{getTotalPrice()}</span>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">{t('booking.total')}</span>
                    <span className="text-2xl font-bold text-primary">€{getTotalPrice()}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleBooking}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                {t('booking.bookFor')} €{getTotalPrice()}
              </Button>
            </>
          )}

          {getDaysCount() === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('booking.selectDatesToSeePrice')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;