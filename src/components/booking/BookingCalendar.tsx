import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Calculator, Clock } from "lucide-react";
import { addDays, differenceInDays, format } from "date-fns";
import { lt } from "date-fns/locale";

interface BookingCalendarProps {
  carId: string;
  carName: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ carId, carName }) => {
  const [selectedRange, setSelectedRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  const calculatePrice = (days: number, isSecondVehicle: boolean): number => {
    if (days <= 3) {
      return isSecondVehicle ? 60 : 50;
    } else if (days <= 7) {
      return isSecondVehicle ? 50 : 40;
    } else if (days <= 14) {
      return isSecondVehicle ? 40 : 30;
    }
    return isSecondVehicle ? 40 : 30; // For 14+ days, use the same as 7-14 days
  };

  const getDaysCount = (): number => {
    if (!selectedRange.from || !selectedRange.to) return 0;
    return differenceInDays(selectedRange.to, selectedRange.from) + 1;
  };

  const getTotalPrice = (): number => {
    const days = getDaysCount();
    if (days === 0) return 0;
    
    const isSecondVehicle = carId === "2"; // Chrysler is the second vehicle
    const dailyRate = calculatePrice(days, isSecondVehicle);
    return dailyRate * days;
  };

  const getPriceCategory = (): string => {
    const days = getDaysCount();
    if (days <= 3) return "1-3 dienos";
    if (days <= 7) return "3-7 dienos";
    if (days <= 14) return "7-14 dienų";
    return "14+ dienų";
  };

  const handleSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range) {
      setSelectedRange(range);
    }
  };

  const handleBooking = () => {
    if (selectedRange.from && selectedRange.to) {
      // Here you would typically integrate with your booking system
      alert(`Užsakymas sukurtas ${carName} nuo ${format(selectedRange.from, "yyyy-MM-dd")} iki ${format(selectedRange.to, "yyyy-MM-dd")}. Bendra suma: €${getTotalPrice()}`);
    }
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
            disabled={(date) => date < new Date()}
            className="rounded-md border pointer-events-auto"
            locale={lt}
          />
          
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
                <span className="font-semibold">€{carId === "2" ? "60" : "50"}/dieną</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded border">
                <span className="text-sm">3-7 dienos</span>
                <span className="font-semibold">€{carId === "2" ? "50" : "40"}/dieną</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded border">
                <span className="text-sm">7-14 dienų</span>
                <span className="font-semibold">€{carId === "2" ? "40" : "30"}/dieną</span>
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
                    <span className="font-semibold">€{calculatePrice(getDaysCount(), carId === "2")}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Bendra suma:</span>
                  <span className="text-2xl font-bold text-primary">€{getTotalPrice()}</span>
                </div>
              </div>

              <Button 
                onClick={handleBooking}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                Užsakyti už €{getTotalPrice()}
              </Button>
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