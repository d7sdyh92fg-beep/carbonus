import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cookie, Settings, X } from 'lucide-react';
import { useCookies, type CookiePreferences } from '@/hooks/use-cookies';
import { CookieSettings } from './CookieSettings';

export const CookieBanner = () => {
  const { showBanner, acceptAll, acceptNecessary, setShowBanner } = useCookies();
  const [showSettings, setShowSettings] = useState(false);

  if (!showBanner) return null;

  if (showSettings) {
    return <CookieSettings onClose={() => setShowSettings(false)} />;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Cookie className="w-6 h-6 text-primary mt-1" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-foreground">Slapukai ir privatumas</h3>
                <Badge variant="outline">GDPR</Badge>
              </div>
              
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Mes naudojame slapukus, kad pagerintume jūsų naršymo patirtį, analizuotume svetainės lankytojų srautus ir 
                teiktume personalizuotą turinį. Paspausdami "Sutinku su visais", jūs sutinkate su visų tipų slapukų naudojimu. 
                Galite pasirinkti tik būtiniuosius slapukus arba konfigūruoti savo nuostatas.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button onClick={acceptAll} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Sutinku su visais
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={acceptNecessary}
                  className="border-border hover:bg-muted"
                >
                  Tik būtini
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setShowSettings(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Nustatymai
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-3">
                Daugiau informacijos rasite mūsų{' '}
                <a href="/privatumo-politika" className="text-primary hover:underline">
                  privatumo politikoje
                </a>
              </p>
            </div>
            
            <button
              onClick={() => setShowBanner(false)}
              className="flex-shrink-0 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Uždaryti"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};