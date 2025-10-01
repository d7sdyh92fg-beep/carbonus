import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Shield } from 'lucide-react';
import { useBooking, InsuranceOption } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const insuranceOptions: InsuranceOption[] = [
  {
    id: 'max-liability',
    title: 'Maksimali atsakomybė',
    description: 'Standartinė draudimo apsauga. Atsakomybė iki 1500 €',
    pricePerDay: 0,
    excess: 1500,
  },
  {
    id: 'ldw-with-liability',
    title: 'LDW apsauga su atsakomybe',
    description: 'Sumažinta atsakomybė iki 500 €. Rekomenduojama.',
    pricePerDay: 10,
    excess: 500,
  },
  {
    id: 'ldw-no-liability',
    title: 'LDW apsauga be atsakomybės',
    description: 'Maksimali apsauga. Jokios atsakomybės įvykus avarijai.',
    pricePerDay: 20,
    excess: 0,
  },
];

export default function ReservationInsurance() {
  const navigate = useNavigate();
  const { bookingData, updateInsurance } = useBooking();

  useEffect(() => {
    if (!bookingData) {
      navigate('/automobiliai');
    }
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  const handleSelectInsurance = (insurance: InsuranceOption) => {
    updateInsurance(insurance);
    navigate(`/rezervacija/${bookingData.carId}/paslaugos`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Grįžti
            </Button>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Nuo</p>
              <p className="text-2xl font-bold text-primary">
                {bookingData.basePrice.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Pasirinkite atsakomybę</h1>
          </div>
          <p className="text-muted-foreground">
            Pasirinkite jums tinkančią draudimo apsaugą kelionės metu
          </p>
        </div>

        <div className="space-y-4">
          {insuranceOptions.map((option) => {
            const isSelected = bookingData.insurance?.id === option.id;
            const dailyPrice = option.pricePerDay;
            const totalPrice = dailyPrice * bookingData.rentalDays;

            return (
              <Card
                key={option.id}
                className={`p-6 cursor-pointer transition-all hover:border-primary ${
                  isSelected ? 'border-primary border-2 bg-primary/5' : ''
                }`}
                onClick={() => handleSelectInsurance(option)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{option.title}</h3>
                      {option.id === 'ldw-with-liability' && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          Rekomenduojama
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {option.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Atsakomybė:</span>
                      <span className="text-muted-foreground">
                        {option.excess === 0 ? 'Nėra' : `${option.excess} €`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {dailyPrice === 0 ? (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">Įskaičiuota</p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          +{dailyPrice.toFixed(2)} € / diena
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          +{totalPrice.toFixed(2)} €
                        </p>
                      </div>
                    )}
                    {isSelected && (
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Important Info */}
        <Card className="mt-8 p-6 bg-muted/50">
          <h3 className="font-semibold mb-3">Svarbu žinoti:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Draudimas galioja tik Lietuvos teritorijoje, nebent pasirinkta papildoma paslauga "Naudojimas užsienyje"</li>
            <li>• Atsakomybė taikoma kiekvienu žalos atveju atskirai</li>
            <li>• Pilna kasko draudimo apsauga taikoma tik laikantis nuomos sąlygų</li>
            <li>• Už važiavimą neblaiviam, padangų, ratlankių ir apatinės dalies pažeidimus draudimas netaikomas</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
