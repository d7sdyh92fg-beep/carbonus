import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TermsAcceptanceModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function TermsAcceptanceModal({ isOpen, onAccept, onDecline }: TermsAcceptanceModalProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);

  const handleAccept = () => {
    if (!hasReadTerms) {
      return;
    }
    onAccept();
  };

  const openPDF = () => {
    window.open('/carbonus-nuomos-sutartis.pdf', '_blank');
  };

  const openFullTermsPage = () => {
    window.open('/nuomos-sutartis', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nuomos sąlygos ir sutartis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Important Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Privaloma susipažinti</h3>
                  <p className="text-amber-700 text-sm">
                    Prieš rezervuojant automobilį, privaloma susipažinti su nuomos sąlygomis ir jas patvirtinti. 
                    Galite skaityti žemiau arba atsidaryti pilną sutartį naujame lange.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
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

          {/* Terms content */}
          {showFullTerms && (
            <ScrollArea className="h-96 w-full border rounded-lg p-4">
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
                      <p><strong>Užstato dydis – 300 €.</strong> Užstatas grąžinamas per 7 d. d. po automobilio grąžinimo, jei nėra pažeidimų.</p>
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

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Pilną sutartį</strong> galite perskaityti PDF faile arba mūsų svetainėje. 
                      Paspaudę "Sutinku", patvirtinate, kad susipažinote su visomis sąlygomis.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}

          {/* Acceptance checkbox */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/30">
            <Checkbox
              id="terms-acceptance"
              checked={hasReadTerms}
              onCheckedChange={(checked) => setHasReadTerms(checked as boolean)}
              className="mt-1"
            />
            <div className="space-y-1">
              <label 
                htmlFor="terms-acceptance" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Patvirtinu, kad susipažinau su nuomos sąlygomis ir sutartimi
              </label>
              <p className="text-xs text-muted-foreground">
                Pažymėkite šį laukelį, kad galėtumėte tęsti rezervaciją
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onDecline}>
            Atšaukti
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={!hasReadTerms}
            className={hasReadTerms ? '' : 'opacity-50 cursor-not-allowed'}
          >
            Sutinku ir tęsiu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}