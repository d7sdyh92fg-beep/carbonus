import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ExternalLink, Eye, Users, Globe, TrendingUp, Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GoogleAnalytics = () => {
  const { toast } = useToast();
  const [measurementId, setMeasurementId] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if Google Analytics is already installed
    const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (existingScript) {
      setIsInstalled(true);
      // Try to extract measurement ID from existing script
      const nextScript = existingScript.nextElementSibling as HTMLScriptElement;
      if (nextScript && nextScript.innerHTML) {
        const match = nextScript.innerHTML.match(/GA_MEASUREMENT_ID\s*=\s*['"`]([^'"`]+)['"`]/);
        if (match) {
          setMeasurementId(match[1]);
        }
      }
    }
    
    // Load saved measurement ID from localStorage
    const savedId = localStorage.getItem('ga_measurement_id');
    if (savedId) {
      setMeasurementId(savedId);
    }
  }, []);

  const installGoogleAnalytics = () => {
    if (!measurementId) {
      toast({
        title: "Klaida",
        description: "Prašome įvesti Google Analytics Measurement ID",
        variant: "destructive",
      });
      return;
    }

    // Remove existing scripts if any
    const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Add gtag configuration
    const configScript = document.createElement('script');
    configScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
      window.GA_MEASUREMENT_ID = '${measurementId}';
    `;
    document.head.appendChild(configScript);

    // Save to localStorage
    localStorage.setItem('ga_measurement_id', measurementId);
    setIsInstalled(true);

    toast({
      title: "Sėkmingai įdiegta",
      description: "Google Analytics buvo sėkmingai įdiegtas į svetainę",
    });
  };

  const removeGoogleAnalytics = () => {
    // Remove scripts
    const scripts = document.querySelectorAll('script[src*="googletagmanager.com"], script:contains("gtag")');
    scripts.forEach(script => script.remove());

    // Clear localStorage
    localStorage.removeItem('ga_measurement_id');
    setIsInstalled(false);
    setMeasurementId('');

    toast({
      title: "Pašalinta",
      description: "Google Analytics buvo pašalintas iš svetainės",
    });
  };

  const copyTrackingCode = () => {
    const trackingCode = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>`;

    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Nukopijuota",
      description: "Sekimo kodas nukopijuotas į iškarpinę",
    });
  };

  const openGoogleAnalytics = () => {
    window.open('https://analytics.google.com/', '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Google Analytics
              </CardTitle>
              <CardDescription>
                Stebėkite savo svetainės lankytojus ir jų elgesį
              </CardDescription>
            </div>
            <Button onClick={openGoogleAnalytics} variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Atidaryti Analytics
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="setup" className="space-y-6">
        <TabsList>
          <TabsTrigger value="setup">Nustatymai</TabsTrigger>
          <TabsTrigger value="overview">Apžvalga</TabsTrigger>
          <TabsTrigger value="instructions">Instrukcijos</TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics konfigūracija</CardTitle>
              <CardDescription>
                Įdiekite Google Analytics į savo svetainę
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={isInstalled ? "default" : "secondary"}>
                  {isInstalled ? "Įdiegta" : "Neįdiegta"}
                </Badge>
                {isInstalled && (
                  <Badge variant="outline">ID: {measurementId}</Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="measurement-id">Google Analytics Measurement ID</Label>
                <Input
                  id="measurement-id"
                  placeholder="G-XXXXXXXXXX"
                  value={measurementId}
                  onChange={(e) => setMeasurementId(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Rasite savo Measurement ID Google Analytics nustatymuose
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={installGoogleAnalytics} disabled={!measurementId}>
                  {isInstalled ? "Atnaujinti" : "Įdiegti"} Analytics
                </Button>
                {isInstalled && (
                  <Button onClick={removeGoogleAnalytics} variant="destructive">
                    Pašalinti
                  </Button>
                )}
              </div>

              {measurementId && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Sekimo kodas</Label>
                    <Button
                      onClick={copyTrackingCode}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Nukopijuota" : "Kopijuoti"}
                    </Button>
                  </div>
                  <pre className="text-xs bg-background border rounded p-2 overflow-x-auto">
{`<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>`}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {!isInstalled ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">Google Analytics neįdiegtas</h3>
                    <p className="text-muted-foreground">
                      Įdiekite Google Analytics, kad galėtumėte stebėti svetainės statistiką
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lankytojai šiandien</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">Duomenys rodomi Google Analytics</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Peržiūros</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">Puslapių peržiūros šiandien</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sesijos</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">Aktyvios sesijos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Konversijos</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">Rezervacijų forma</p>
                </CardContent>
              </Card>
            </div>
          )}

          {isInstalled && (
            <Card>
              <CardHeader>
                <CardTitle>Išsami statistika</CardTitle>
                <CardDescription>
                  Daugiau informacijos rasite Google Analytics svetainėje
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={openGoogleAnalytics} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Peržiūrėti Google Analytics
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Instructions Tab */}
        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kaip sukurti Google Analytics paskyrą</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <div>
                    <strong>Eikite į Google Analytics:</strong> Atidarykite 
                    <Button variant="link" className="p-0 h-auto ml-1" onClick={() => window.open('https://analytics.google.com/', '_blank')}>
                      https://analytics.google.com/
                    </Button>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <div><strong>Prisijunkite</strong> su savo Google paskyra</div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <div><strong>Spauskite "Pradėti"</strong> ir sukurkite naują paskyrą</div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <div><strong>Įveskite</strong> savo svetainės informaciją</div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">5</span>
                  <div><strong>Pasirinkite "Web"</strong> platformą</div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">6</span>
                  <div><strong>Nukopijuokite Measurement ID</strong> (prasideda "G-") ir įklijuokite aukščiau</div>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Svarbūs patarimai</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-2">
                  <p><strong>Duomenų apdorojimas:</strong> Google Analytics duomenys pradės rodytis po 24-48 valandų nuo įdiegimo.</p>
                  <p><strong>GDPR atitiktis:</strong> Įsitikinkite, kad turite lankytojų sutikimą duomenų rinkimui (mūsų cookie banner padeda tai padaryti).</p>
                  <p><strong>Tikslumas:</strong> Analytics gali blokuoti kai kurie naršyklių plėtiniai, todėl tikslūs skaičiai gali skirtis.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};