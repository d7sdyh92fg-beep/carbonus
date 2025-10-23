import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Package, Baby, Shield, Map, Navigation, Users, UserCircle } from 'lucide-react';
import { useBooking, AdditionalService } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { lt, enUS } from 'date-fns/locale';
import { useTranslations } from '@/hooks/use-translations';
import { getRoute } from '@/utils/routes';

export default function ReservationServices() {
  const navigate = useNavigate();
  const { bookingData, toggleService, getTotalPrice } = useBooking();
  const { t, language } = useTranslations();

  const availableServices: AdditionalService[] = [
    {
      id: 'additional-driver',
      title: t('services.items.additionalDriver.title'),
      description: t('services.items.additionalDriver.description'),
      price: 4.01,
      unit: 'perDay',
      icon: Users,
    },
    {
      id: 'abroad-zone3',
      title: t('services.items.abroadZone3.title'),
      description: t('services.items.abroadZone3.description'),
      price: 500,
      unit: 'oneTime',
      icon: Map,
    },
    {
      id: 'abroad-zone2',
      title: t('services.items.abroadZone2.title'),
      description: t('services.items.abroadZone2.description'),
      price: 300,
      unit: 'oneTime',
      icon: Map,
    },
    {
      id: 'abroad-zone1',
      title: t('services.items.abroadZone1.title'),
      description: t('services.items.abroadZone1.description'),
      price: 150,
      unit: 'oneTime',
      icon: Map,
    },
    {
      id: 'roadside-assistance',
      title: t('services.items.roadsideAssistance.title'),
      description: t('services.items.roadsideAssistance.description'),
      price: 15,
      unit: 'oneTime',
      icon: Navigation,
    },
    {
      id: 'tire-glass-protection',
      title: t('services.items.tireGlassProtection.title'),
      description: t('services.items.tireGlassProtection.description'),
      price: 5.5,
      unit: 'perDay',
      icon: Shield,
    },
    {
      id: 'baby-seat',
      title: t('services.items.babySeat.title'),
      description: t('services.items.babySeat.description'),
      price: 3,
      unit: 'perDay',
      icon: Baby,
    },
    {
      id: 'child-seat',
      title: t('services.items.childSeat.title'),
      description: t('services.items.childSeat.description'),
      price: 3,
      unit: 'perDay',
      icon: UserCircle,
    },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!bookingData) {
      navigate(getRoute('cars', language));
    }
  }, [bookingData, navigate, language]);

  if (!bookingData) return null;

  const dateLocale = language === 'en' ? enUS : lt;

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
              {t('services.back')}
            </Button>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t('services.totalPrice')}</p>
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
                <h1 className="text-3xl font-bold">{t('services.title')}</h1>
              </div>
              <p className="text-muted-foreground">
                {t('services.subtitle')}
              </p>
            </div>

            <div className="space-y-4">
              {availableServices.map((service) => {
                const isSelected = isServiceSelected(service.id);
                const totalPrice = getServicePrice(service);
                const ServiceIcon = service.icon;

                return (
                  <Card
                    key={service.id}
                    className={`p-6 transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {ServiceIcon && <ServiceIcon className="h-5 w-5 text-primary" />}
                          <h3 className="text-lg font-semibold">
                            {service.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">
                            {service.price.toFixed(2)} €
                          </span>
                          <span className="text-muted-foreground">
                            / {service.unit === 'perDay' ? t('services.perDay') : t('services.oneTime')}
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
              <h3 className="font-semibold text-lg mb-4">{t('services.summary.title')}</h3>
              
              {/* Car Image */}
              {bookingData.carImage && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={bookingData.carImage} 
                    alt={bookingData.carName}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-1 mb-4">
                <p className="font-medium text-base">{bookingData.carName}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(bookingData.startDate), 'MMM d', { locale: dateLocale })} - {format(new Date(bookingData.endDate), 'MMM d, yyyy', { locale: dateLocale })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {bookingData.rentalDays} {bookingData.rentalDays === 1 ? t('services.day') : t('services.days')}
                </p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>{t('services.summary.rentalPrice')}</span>
                  <span>{bookingData.basePrice.toFixed(2)} €</span>
                </div>
                
                {servicesTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{t('services.summary.additionalServices')}</span>
                    <span>{servicesTotal.toFixed(2)} €</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-bold text-lg mb-6">
                <span>{t('services.summary.total')}</span>
                <span className="text-primary">{getTotalPrice().toFixed(2)} €</span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  const termsPath = language === 'en' 
                    ? `/reservation/${bookingData.carId}/terms`
                    : `/rezervacija/${bookingData.carId}/salygos`;
                  navigate(termsPath);
                }}
              >
                {t('services.continueButton')}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
