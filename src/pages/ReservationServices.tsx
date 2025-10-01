import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Package } from 'lucide-react';
import { useBooking, AdditionalService } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { lt } from 'date-fns/locale';

const availableServices: AdditionalService[] = [
  {
    id: 'additional-driver',
    title: 'Papildomas vairuotojas',
    description: 'Galimybė nuomoti automobilį su papildomu vairuotoju',
    price: 4.01,
    unit: 'perDay',
  },
  {
    id: 'carplay',
    title: 'Apple CarPlay / Android Auto',
    description: 'Įrenginys telefono prijungimui prie automobilio sistemos',
    price: 4.84,
    unit: 'perDay',
  },
  {
    id: 'abroad-zone3',
    title: 'Naudojimas užsienyje - Zona 3',
    description: 'Rusija, Baltarusija, Ukraina, Moldavija',
    price: 500,
    unit: 'oneTime',
  },
  {
    id: 'abroad-zone2',
    title: 'Naudojimas užsienyje - Zona 2',
    description: 'Lenkija, Čekija, Slovakija, Vengrija, Rumunija',
    price: 300,
    unit: 'oneTime',
  },
  {
    id: 'abroad-zone1',
    title: 'Naudojimas užsienyje - Zona 1',
    description: 'Latvija, Estija',
    price: 150,
    unit: 'oneTime',
  },
  {
    id: 'roadside-assistance',
    title: 'Pagalba kelyje 24/7',
    description: 'Visą parą veikianti pagalba kelyje Lietuvoje',
    price: 15,
    unit: 'oneTime',
  },
  {
    id: 'tire-glass-protection',
    title: 'Padangų ir stiklų apsauga',
    description: 'Papildoma apsauga padangoms ir stiklams',
    price: 5.5,
    unit: 'perDay',
  },
  {
    id: 'baby-seat',
    title: 'Kūdikio kėdutė (0-13kg)',
    description: 'Kūdikio kėdutė iki 13 kg svorio',
    price: 3,
    unit: 'perDay',
  },
  {
    id: 'child-seat',
    title: 'Vaikiška kėdutė (9-36kg)',
    description: 'Vaikiška kėdutė nuo 9 iki 36 kg svorio',
    price: 3,
    unit: 'perDay',
  },
];

export default function ReservationServices() {
  const navigate = useNavigate();
  const { bookingData, toggleService, getTotalPrice } = useBooking();

  useEffect(() => {
    if (!bookingData) {
      navigate('/automobiliai');
    }
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  const isServiceSelected = (serviceId: string) => {
    return bookingData.services.some(s => s.id === serviceId);
  };

  const getServicePrice = (service: AdditionalService) => {
    if (service.unit === 'perDay') {
      return service.price * bookingData.rentalDays;
    }
    return service.price;
  };

  const servicesTotal = bookingData.services.reduce((sum, service) => {
    return sum + getServicePrice(service);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4">
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
              <p className="text-sm text-muted-foreground">Viso</p>
              <p className="text-2xl font-bold text-primary">
                {getTotalPrice().toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Services List */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Papildomos paslaugos</h1>
              </div>
              <p className="text-muted-foreground">
                Pasirinkite papildomas paslaugas, kurios pagerintų jūsų kelionę
              </p>
            </div>

            <div className="space-y-4">
              {availableServices.map((service) => {
                const isSelected = isServiceSelected(service.id);
                const totalPrice = getServicePrice(service);

                return (
                  <Card
                    key={service.id}
                    className={`p-6 transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {service.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">
                            {service.price.toFixed(2)} €
                          </span>
                          <span className="text-muted-foreground">
                            / {service.unit === 'perDay' ? 'diena' : 'vienkartinis'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <p className="text-xl font-bold text-primary">
                          +{totalPrice.toFixed(2)} €
                        </p>
                        <Switch
                          checked={isSelected}
                          onCheckedChange={() => toggleService(service)}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Jūsų užsakymas</h3>
              
              <div className="space-y-3 mb-4">
                <div>
                  <p className="font-medium">{bookingData.carName}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(bookingData.startDate), 'MMM d', { locale: lt })} - {format(new Date(bookingData.endDate), 'MMM d, yyyy', { locale: lt })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {bookingData.rentalDays} {bookingData.rentalDays === 1 ? 'diena' : 'dienos'}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Nuomos kaina</span>
                  <span>{bookingData.basePrice.toFixed(2)} €</span>
                </div>
                
                {bookingData.insurance && bookingData.insurance.pricePerDay > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Draudimas</span>
                    <span>
                      {(bookingData.insurance.pricePerDay * bookingData.rentalDays).toFixed(2)} €
                    </span>
                  </div>
                )}

                {servicesTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Papildomos paslaugos</span>
                    <span>{servicesTotal.toFixed(2)} €</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Viso</span>
                <span className="text-primary">{getTotalPrice().toFixed(2)} €</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate(`/rezervacija/${bookingData.carId}/uzsakymas`)}
              >
                Tęsti užsakymą
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
