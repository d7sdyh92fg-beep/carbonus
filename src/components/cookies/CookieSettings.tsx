import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Cookie, Shield, BarChart3, Target, X } from 'lucide-react';
import { useCookies, type CookiePreferences } from '@/hooks/use-cookies';

interface CookieSettingsProps {
  onClose: () => void;
}

export const CookieSettings = ({ onClose }: CookieSettingsProps) => {
  const { preferences, updatePreferences } = useCookies();
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(preferences);

  const handleSavePreferences = () => {
    updatePreferences(localPreferences);
    onClose();
  };

  const handleToggle = (type: keyof CookiePreferences) => {
    if (type === 'necessary') return; // Can't disable necessary cookies
    
    setLocalPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">Slapukų nustatymai</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="text-sm text-muted-foreground leading-relaxed">
            Čia galite valdyti savo slapukų nuostatas. Būtinieji slapukai yra reikalingi svetainės veikimui ir negali būti išjungti.
          </div>

          {/* Necessary Cookies */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-semibold text-foreground">Būtinieji slapukai</h4>
                  <Badge variant="secondary" className="mt-1">Visada įjungti</Badge>
                </div>
              </div>
              <Switch checked={true} disabled />
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Šie slapukai yra būtini svetainės veikimui. Jie užtikrina pagrindinius saugos ir funkcionalumo aspektus, 
              tokius kaip navigacija ir prieiga prie saugių sričių.
            </p>
          </div>

          {/* Analytics Cookies */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-foreground">Analitikos slapukai</h4>
                  <Badge variant="outline" className="mt-1">Neprivaloma</Badge>
                </div>
              </div>
              <Switch 
                checked={localPreferences.analytics} 
                onCheckedChange={() => handleToggle('analytics')}
              />
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Šie slapukai padeda mums suprasti, kaip lankytojai naudojasi svetaine, ir leidžia tobulinti jos veikimą. 
              Visi duomenys yra anonimizuoti ir naudojami tik statistikos tikslams.
            </p>
          </div>

          {/* Marketing Cookies */}
          <div className="space-y-4 p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-semibold text-foreground">Rinkodaros slapukai</h4>
                  <Badge variant="outline" className="mt-1">Neprivaloma</Badge>
                </div>
              </div>
              <Switch 
                checked={localPreferences.marketing} 
                onCheckedChange={() => handleToggle('marketing')}
              />
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Šie slapukai leidžia mums rodyti jums aktualų turinį ir pasiūlymus, taip pat padeda sekti reklamos kampanijų efektyvumą. 
              Jie gali būti naudojami personalizuotoms reklamos žinutėms.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button onClick={handleSavePreferences} className="flex-1">
              Išsaugoti nustatymus
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Atšaukti
            </Button>
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            <p>
              Daugiau informacijos apie slapukų naudojimą rasite{' '}
              <a href="/privatumo-politika" className="text-primary hover:underline">
                privatumo politikoje
              </a>
              . Jūs bet kada galite pakeisti savo pasirinkimus.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};