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
      console.log("Starting reservation creation:", {
        carId,
        carName,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        formData
      });

      // Use secure RPC to create or get customer without exposing PII
      const { data: customerId, error: customerError } = await supabase
        .rpc('create_or_get_customer', {
          p_email: formData.email,
          p_first_name: formData.firstName,
          p_last_name: formData.lastName,
          p_phone: formData.phone
        });

      if (customerError) {
        console.error("Customer creation error:", customerError);
        throw customerError;
      }

      console.log("Customer ID obtained:", customerId);

      // Ensure carId is in correct format
      const normalizedCarId = carId || carName.toLowerCase().replace(/\s+/g, '-');
      console.log("Using carId:", normalizedCarId);

      // Create reservation with "requested" status
      const reservationData = {
        customer_id: customerId,
        car_name: carName,
        car_id: normalizedCarId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        rental_days: rentalDays,
        daily_rate: dailyRate,
        total_rental_cost: totalAmount,
        deposit_amount: depositAmount,
        total_amount: totalAmount + depositAmount,
        status: 'requested'
      };

      console.log("Creating reservation with data:", reservationData);

      const { error: reservationError } = await supabase
        .from('reservations')
        .insert([reservationData]);

      if (reservationError) {
        console.error("Reservation creation error:", reservationError);
        throw reservationError;
      }

      console.log("Reservation created successfully");

      // Also send notification email
      try {
        await supabase.functions.invoke('send-booking-email', {
          body: {
            customerName: `${formData.firstName} ${formData.lastName}`,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            carName: carName,
            startDate: startDate.toLocaleDateString('lt-LT'),
            endDate: endDate.toLocaleDateString('lt-LT'),
            rentalDays: rentalDays,
            totalAmount: totalAmount,
            depositAmount: depositAmount,
          }
        });
        console.log("Email sent successfully");
      } catch (emailError) {
        console.warn("Email sending failed, but reservation was created:", emailError);
      }

      toast({
        title: "Rezervacija sukurta!",
        description: "Jūsų rezervacija sėkmingai išsaugota. Susisieksime su jumis dėl mokėjimo detalių.",
      });

      onBookingSuccess();
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Klaida",
        description: `Nepavyko sukurti rezervacijos: ${error.message}. Bandykite dar kartą arba susisiekite telefonu.`,
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

        {/* Important Notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-semibold text-amber-800 mb-2">Svarbi informacija</h4>
          <div className="text-sm text-amber-700 space-y-1">
            <p>• Prieš rezervuojant ir apmokant automobilį, reikės sumokėti ir užstatą (€300)</p>
            <p>• Užstatas grąžinamas po automobilio grąžinimo</p>
            <p>• Atšaukimai galimi tik el. paštu: <strong>info@carbonus.lt</strong></p>
            <p>• Atšaukti galima ne vėliau kaip likus 3 dienoms iki paėmimo datos</p>
            <p>• Vėliau atšaukus, vienos dienos nuomos mokestis negrąžinamas kaip kompensacija</p>
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

        <div className="mt-4 text-xs text-muted-foreground space-y-1">
          <p>* Rezervacija bus patvirtinta po to, kai susisieksime su jumis dėl mokėjimo ir automobilio perdavimo detalių.</p>
          <p>* Atšaukimams kreipkitės: <strong>info@carbonus.lt</strong></p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingForm;