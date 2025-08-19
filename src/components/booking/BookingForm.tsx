import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone } from "lucide-react";

interface BookingFormProps {
  carId: string;
  carName: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  rentalDays: number;
  dailyRate: number;
  onBookingSuccess: () => void;
  onCancel: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  carId,
  carName,
  startDate,
  endDate,
  totalAmount,
  rentalDays,
  dailyRate,
  onBookingSuccess,
  onCancel,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First, create or get customer
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .eq("email", formData.email)
        .maybeSingle();

      let customerId;
      
      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from("customers")
          .insert({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          })
          .select("id")
          .single();

        if (customerError) {
          throw customerError;
        }
        customerId = newCustomer.id;
      }

      // Create reservation
      const { error: reservationError } = await supabase
        .from("reservations")
        .insert({
          customer_id: customerId,
          car_id: carId,
          car_name: carName,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          rental_days: rentalDays,
          daily_rate: dailyRate,
          total_rental_cost: totalAmount,
          total_amount: totalAmount + 300, // Add deposit
          status: "confirmed",
        });

      if (reservationError) {
        throw reservationError;
      }

      toast({
        title: "Rezervacija sėkminga!",
        description: `Jūsų rezervacija ${carName} sukurta. Mes susisieksime su jumis dėl išsamesnės informacijos.`,
      });

      onBookingSuccess();
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko sukurti rezervacijos. Bandykite dar kartą.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const depositAmount = 300;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Užbaigti rezervaciją</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Booking Summary */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Rezervacijos santrauka</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Automobilis:</span>
              <span className="font-medium">{carName}</span>
            </div>
            <div className="flex justify-between">
              <span>Datos:</span>
              <span className="font-medium">
                {startDate.toLocaleDateString('lt-LT')} - {endDate.toLocaleDateString('lt-LT')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Dienų skaičius:</span>
              <span className="font-medium">{rentalDays}</span>
            </div>
            <div className="flex justify-between">
              <span>Nuomos kaina:</span>
              <span className="font-medium">€{totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Užstatas:</span>
              <span className="font-medium">€{depositAmount}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Iš viso:</span>
                <span>€{totalAmount + depositAmount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Vardas *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lastName">Pavardė *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="email">El. paštas *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Telefono numeris *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isSubmitting}
            >
              Atšaukti
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Kuriama rezervacija..." : "Patvirtinti rezervaciją"}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-xs text-muted-foreground">
          * Rezervacija bus patvirtinta po to, kai susisieksime su jumis dėl mokėjimo ir automobilio perdavimo detalių.
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingForm;