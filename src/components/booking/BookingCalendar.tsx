import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Calculator, Clock } from "lucide-react";
import { format } from "date-fns";
import { calculateRentalDays } from "@/utils/rentalDuration";
import { lt, enUS } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useBooking } from "@/contexts/BookingContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/use-translations";


interface BookingCalendarProps {
  carId: string;
  carName: string;
  carImage?: string;
  selectedPackage?: { type: 'romantic' | 'wedding'; name: string; price: number; priceDisplay: string } | null;
  onClearPackage?: () => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ carId, carName, carImage, selectedPackage, onClearPackage }) => {
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

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const minBookingDate = today;

  // Fetch car pricing from database
  const { data: dbCarPricing } = useQuery({
    queryKey: ['car-pricing-booking', carId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('price_tier1, price_tier2, price_tier3')
        .eq('id', carId)
        .single();
      if (error) return null;
      return data;
    },
  });

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
      // Fetch reservations
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

      // Fetch blocked dates
      const { data: blockedDates } = await supabase
        .from("car_blocked_dates")
        .select("blocked_date")
        .eq("car_id", carId);

      blockedDates?.forEach((bd) => {
        dates.push(new Date(bd.blocked_date + 'T12:00:00'));
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
    return calculateRentalDays(selectedRange.from, pickupTime, selectedRange.to, returnTime);
  };

  const getDbDailyRate = (days: number): number => {
    if (dbCarPricing?.price_tier1 != null) {
      if (days >= 7 && dbCarPricing.price_tier3 != null) return Number(dbCarPricing.price_tier3);
      if (days >= 3 && dbCarPricing.price_tier2 != null) return Number(dbCarPricing.price_tier2);
      return Number(dbCarPricing.price_tier1);
    }
    // Fallback if DB has no data yet
    if (days >= 7) return 30;
    if (days >= 3) return 40;
    return 50;
  };

  const getTotalPrice = (): number => {
    const days = getDaysCount();
    if (days === 0) return 0;
    return getDbDailyRate(days) * days;
  };

  const getPriceCategory = (): string => {
    const days = getDaysCount();
    if (days >= 7) return t('pricing.tier3');
    if (days >= 3) return t('pricing.tier2');
    return t('pricing.tier1');
  };

  const hasBookedDateInRange = (from: Date, to: Date): boolean => {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(0, 0, 0, 0);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (isDateBooked(d)) return true;
    }
    return false;
  };

  const handleSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (!range || !range.from) {
      setSelectedRange({ from: undefined, to: undefined });
      return;
    }
    // Romantic package: force single day
    if (selectedPackage?.type === 'romantic') {
      // If clicking same date, deselect
      if (selectedRange.from && range.from.toDateString() === selectedRange.from.toDateString() && !range.to) {
        setSelectedRange({ from: undefined, to: undefined });
      } else {
        setSelectedRange({ from: range.from, to: range.from });
      }
    } else {
      // Check if range contains any booked/blocked dates
      if (range.from && range.to && hasBookedDateInRange(range.from, range.to)) {
        toast({
          title: language === 'lt' ? 'Negalima rezervuoti' : 'Cannot book',
          description: language === 'lt' 
            ? 'Pasirinktas laikotarpis apima užimtas datas. Pasirinkite kitą laikotarpį.' 
            : 'Selected period includes unavailable dates. Please choose a different period.',
          variant: "destructive",
        });
        setSelectedRange({ from: range.from, to: undefined });
        return;
      }
      setSelectedRange(range);
    }
  };

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
    );
  };

  const getPackageTotal = (): number => {
    if (!selectedPackage) return 0;
    if (selectedPackage.type === 'romantic') return selectedPackage.price;
    // Wedding: price per day × days
    const days = getDaysCount();
    return days > 0 ? selectedPackage.price * days : selectedPackage.price;
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

    const finalPrice = selectedPackage ? getPackageTotal() : getTotalPrice();

    setBookingData({
      carId,
      carName,
      carImage,
      startDate: format(selectedRange.from, 'yyyy-MM-dd'),
      endDate: format(selectedRange.to, 'yyyy-MM-dd'),
      pickupTime,
      returnTime,
      rentalDays: getDaysCount(),
      basePrice: finalPrice,
      services: [],
      selectedPackage: selectedPackage ? { ...selectedPackage, price: finalPrice, priceDisplay: String(finalPrice) } : undefined,
    });

    const servicesRoute = language === 'en' 
      ? `/reservation/${carId}/services` 
      : `/rezervacija/${carId}/paslaugos`;
    navigate(servicesRoute);
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
            disabled={(date) => date < minBookingDate || isDateBooked(date)}
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
            defaultMonth={undefined}
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
          {/* Package selected mode */}
          {selectedPackage ? (
            <>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-4 space-y-3 border border-amber-200/50 dark:border-amber-800/30">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                    ✨ {selectedPackage.name}
                  </h4>
                  {onClearPackage && (
                    <button
                      onClick={onClearPackage}
                      className="text-xs text-muted-foreground hover:text-foreground underline"
                    >
                      {language === 'lt' ? 'Atšaukti paketą' : 'Cancel package'}
                    </button>
                  )}
                </div>
                
                {selectedPackage.type === 'romantic' ? (
                  <div className="text-xs text-muted-foreground">
                    {language === 'lt' ? 'Pasirinkite vieną dieną' : 'Select one day'}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {language === 'lt' 
                      ? `${selectedPackage.price} € / para × ${getDaysCount() || '...'} d.` 
                      : `${selectedPackage.price} € / day × ${getDaysCount() || '...'} days`}
                  </div>
                )}

                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">{t('booking.total')}</span>
                  <span className="text-2xl font-bold text-primary">{getDaysCount() > 0 ? getPackageTotal() : selectedPackage.price} €</span>
                </div>
              </div>

              {getDaysCount() > 0 && (
                <Button 
                  onClick={handleBooking}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  {t('booking.bookFor')} {getPackageTotal()} €
                </Button>
              )}

              {getDaysCount() === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>{t('booking.selectDatesToSeePrice')}</p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Standard pricing tiers */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{t('booking.priceCategories')}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded border">
                    <span className="text-sm">{t('booking.category1to3')}</span>
                    <span className="font-semibold">€{dbCarPricing?.price_tier1 ?? 50}{t('booking.perDay')}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded border">
                    <span className="text-sm">{t('booking.category3to7')}</span>
                    <span className="font-semibold">€{dbCarPricing?.price_tier2 ?? 40}{t('booking.perDay')}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded border">
                    <span className="text-sm">{t('booking.category7plus')}</span>
                    <span className="font-semibold">€{dbCarPricing?.price_tier3 ?? 30}{t('booking.perDay')}</span>
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
                        <span className="font-semibold">€{getDbDailyRate(getDaysCount())}</span>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;