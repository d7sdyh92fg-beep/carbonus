import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, FileText, Download, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

export default function ReservationTerms() {
  const navigate = useNavigate();
  const { carId } = useParams();
  const { bookingData, getTotalPrice } = useBooking();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!bookingData) {
      navigate('/automobiliai');
    }
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // Allow 50px tolerance
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setHasScrolledToBottom(true);
    }
  };

  const handleContinue = () => {
    if (hasAccepted && hasScrolledToBottom) {
      navigate(`/rezervacija/${carId}/uzsakymas`);
    }
  };

  const openPDF = () => {
    window.open('/carbonus-nuomos-sutartis.pdf', '_blank');
  };

  const openFullTermsPage = () => {
    window.open('/nuomos-sutartis', '_blank');
  };

  const totalPrice = getTotalPrice();

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
              <p className="text-sm text-muted-foreground">Viso mokėti</p>
              <p className="text-2xl font-bold text-primary">
                {totalPrice.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Žingsnis 3 iš 4</span>
            <span className="text-sm font-medium">75%</span>
          </div>
          <Progress value={75} className="h-2" />
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Nuomos sąlygos ir sutartis
          </h1>
          <p className="text-muted-foreground">
            Prieš tęsiant rezervaciją, prašome susipažinti su nuomos sąlygomis
          </p>
        </div>

        {/* Important Notice */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Privaloma susipažinti</h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  Prieš rezervuojant automobilį, privaloma susipažinti su nuomos sąlygomis ir jas patvirtinti. 
                  Galite skaityti žemiau arba atsidaryti pilną sutartį naujame lange.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={openPDF}>
            <Download className="w-4 h-4 mr-2" />
            Atsisiųsti PDF
          </Button>
          <Button variant="outline" size="sm" onClick={openFullTermsPage}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Atidaryti pilną sutartį
          </Button>
          <Button 
            variant={showFullTerms ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowFullTerms(!showFullTerms)}
          >
            <FileText className="w-4 h-4 mr-2" />
            {showFullTerms ? 'Slėpti sąlygas' : 'Skaityti čia'}
          </Button>
        </div>

        {/* Terms content with scroll tracking */}
        {showFullTerms && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <ScrollArea 
                className="h-96 w-full border rounded-lg p-4"
                onScrollCapture={handleScroll}
              >
                <div className="space-y-6 text-sm">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">1. Rezervacija ir užsakymas</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">1.1 Rezervacijos būdai</h4>
                        <p>Automobilį galite rezervuoti:</p>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          <li>Mūsų internetinėje svetainėje www.carbonus.lt (veikia 24/7)</li>
                          <li>Paskambinę telefonu +370 698 18 781</li>
                          <li>El. paštu info@carbonus.lt</li>
                          <li>Atvykę į automobilio atsiėmimo vietą</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">1.2 Rezervacijos atšaukimas</h4>
                        <p>Rezervaciją galite atšaukti nemokamai, jei liko daugiau nei 24 val. iki automobilio atsiėmimo. Jei atšaukiate vėliau, taikomas mokestis. Jei neatvykstate neatšaukę rezervacijos („no-show"), imamas mokestis už pirmąją nuomos dieną.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">2. Dokumentai ir reikalavimai</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">2.1 Reikalingi dokumentai</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>ES šalyje išduotas vairuotojo pažymėjimas (ne mažiau kaip 2 metų stažas)</li>
                          <li>Asmens dokumentas (pasas arba ID kortelė)</li>
                          <li>Kreditinė kortelė užstato rezervavimui</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">2.2 Amžiaus reikalavimai</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Ekonominės ir kompaktinės klasės automobiliams – nuo 21 m.</li>
                          <li>Premium ir Luxury klasės automobiliams – nuo 25 m.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">3. Apmokėjimas ir kainos</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">3.1 Kainų sudėtis</h4>
                        <p>Visos nurodytos kainos apima pagrindinius mokesčius. Papildomi mokesčiai taikomi už:</p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                          <li>Vėlavimą grąžinti automobilį</li>
                          <li>Kuro papildymą (jei grąžinama ne pilnu baku)</li>
                          <li>Rūkymą automobilyje (50 € bauda)</li>
                          <li>KET pažeidimus</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">3.2 Užstatas</h4>
                        <p><strong>Užstato dydis – 200 €.</strong> Užstatas grąžinamas per 7 d. d. po automobilio grąžinimo, jei nėra pažeidimų.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">4. Draudimas ir saugumas</h3>
                    <p>Visi automobiliai apdrausti KASKO ir OCTA draudimu. Avarijos atveju nedelsiant skambinkite mums +370 698 18 781 ir policijai 112.</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">5. Svarbiausios taisyklės</h3>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Rūkymas automobilyje draudžiamas (50 € bauda)</li>
                      <li>Kilometražas neribojamas</li>
                      <li>Kelionės už Lietuvos ribų reikalauja išankstinio sutikimo</li>
                      <li>Automobilis turi būti grąžintas švariu ir su pilnu kuro baku</li>
                    </ul>
                  </div>

                  <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <CardContent className="p-4">
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        <strong>Pilną sutartį</strong> galite perskaityti PDF faile arba mūsų svetainėje. 
                        Paspaudę "Sutinku", patvirtinate, kad susipažinote su visomis sąlygomis.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>

              {/* Scroll indicator */}
              {showFullTerms && !hasScrolledToBottom && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-bounce">
                  <span>Prašome paskroluoti iki apačios</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}

              {hasScrolledToBottom && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Perskaitytas visas tekstas</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Acceptance checkbox */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms-acceptance"
                checked={hasAccepted}
                onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
                disabled={!hasScrolledToBottom && showFullTerms}
                className="mt-1"
              />
              <div className="space-y-1 flex-1">
                <Label 
                  htmlFor="terms-acceptance" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Patvirtinu, kad susipažinau su nuomos sąlygomis ir sutartimi
                </Label>
                <p className="text-xs text-muted-foreground">
                  {showFullTerms && !hasScrolledToBottom 
                    ? 'Paskroluokite iki apačios, kad galėtumėte pažymėti šį laukelį'
                    : 'Pažymėkite šį laukelį, kad galėtumėte tęsti rezervaciją'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Rezervacijos santrauka</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Automobilis:</span>
                <span className="font-medium">{bookingData.carName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nuomos trukmė:</span>
                <span className="font-medium">{bookingData.rentalDays} d.</span>
              </div>
              {bookingData.insurance && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Draudimas:</span>
                  <span className="font-medium">{bookingData.insurance.title}</span>
                </div>
              )}
              {bookingData.services.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Papildomos paslaugos:</span>
                  <span className="font-medium">{bookingData.services.length}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Grįžti
          </Button>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!hasAccepted || (showFullTerms && !hasScrolledToBottom)}
            className="flex-1"
          >
            Sutinku ir tęsiu
          </Button>
        </div>
      </div>
    </div>
  );
}
