import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useCookies } from "@/hooks/use-cookies";
import {
  trackPurchase,
  trackBeginCheckout,
  trackViewCar,
  trackGenerateLead,
  trackContact,
} from "@/lib/analytics";

/**
 * Meta Pixel / GA4 Event Tester
 * Allows firing events manually without going through the full booking flow.
 * Use to verify GTM tags + Meta Events Manager Test Events.
 *
 * Access: /pixel-tester
 */
const PixelTester = () => {
  const { preferences, acceptAll, resetConsent } = useCookies();
  const [value, setValue] = useState("150");
  const [currency] = useState("EUR");
  const [transactionId, setTransactionId] = useState(`TEST-${Date.now()}`);
  const [carName, setCarName] = useState("Mercedes-Benz SLK");
  const [carId, setCarId] = useState("test-slk");
  const [days, setDays] = useState("3");
  const [pixelLoaded, setPixelLoaded] = useState(false);

  useEffect(() => {
    const check = () => setPixelLoaded(typeof (window as any).fbq === "function");
    check();
    const t = setInterval(check, 1000);
    return () => clearInterval(t);
  }, []);

  const fireFbq = (eventName: string, params?: Record<string, unknown>, opts?: Record<string, unknown>) => {
    const fbq = (window as any).fbq;
    if (typeof fbq !== "function") {
      toast.error("Meta Pixel (fbq) nerastas. Ar marketing slapukai priimti?");
      return false;
    }
    fbq("track", eventName, params || {}, opts || {});
    return true;
  };

  const handlePurchase = () => {
    const numValue = parseFloat(value) || 0;
    const numDays = parseInt(days) || 1;
    const txId = transactionId || `TEST-${Date.now()}`;

    // 1) Push to dataLayer (GA4 + GTM Meta Pixel tag listening for "purchase")
    trackPurchase({
      transactionId: txId,
      carId,
      carName,
      rentalDays: numDays,
      totalAmount: numValue,
      paymentMethod: "test",
    });

    // 2) Direct fbq fallback (in case GTM tag not yet published)
    const direct = fireFbq(
      "Purchase",
      { value: numValue, currency, content_type: "product" },
      { eventID: txId }
    );

    toast.success(
      `Purchase fired: ${numValue} ${currency} (txId: ${txId})${direct ? " + direct fbq" : ""}`
    );
    setTransactionId(`TEST-${Date.now()}`);
  };

  const handleInitiateCheckout = () => {
    const numValue = parseFloat(value) || 0;
    const numDays = parseInt(days) || 1;

    trackBeginCheckout({
      carId,
      carName,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + numDays * 86400000).toISOString().slice(0, 10),
      rentalDays: numDays,
      totalAmount: numValue,
    });

    fireFbq("InitiateCheckout", { value: numValue, currency, content_type: "product" });
    toast.success(`InitiateCheckout fired: ${numValue} ${currency}`);
  };

  const handleViewContent = () => {
    trackViewCar({
      id: carId,
      name: carName,
      category: "premium",
      price: value,
      year: "2023",
    });
    fireFbq("ViewContent", { value: parseFloat(value) || 0, currency, content_type: "product" });
    toast.success("ViewContent fired");
  };

  const handleLead = () => {
    trackGenerateLead("pixel_tester", parseFloat(value) || 50);
    fireFbq("Lead", { value: parseFloat(value) || 50, currency });
    toast.success("Lead fired");
  };

  const handleContact = () => {
    trackContact("phone", "+37060000000");
    fireFbq("Contact");
    toast.success("Contact fired");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meta Pixel / GA4 Event Tester</h1>
          <p className="text-muted-foreground mt-2">
            Šaudo eventus į <code>dataLayer</code> (GTM) + tiesiogiai į <code>fbq</code>. Naudok kartu su{" "}
            <strong>Meta Events Manager → Test Events</strong> ir <strong>GTM Preview</strong>.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test parametrai</CardTitle>
            <CardDescription>Šios reikšmės bus siunčiamos su eventais.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value">Value (EUR)</Label>
              <Input id="value" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="days">Rental days</Label>
              <Input id="days" value={days} onChange={(e) => setDays(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="carName">Car name</Label>
              <Input id="carName" value={carName} onChange={(e) => setCarName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="carId">Car ID</Label>
              <Input id="carId" value={carId} onChange={(e) => setCarId(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="txId">Transaction ID (auto-regen po Purchase)</Label>
              <Input
                id="txId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Šaudyti eventus</CardTitle>
            <CardDescription>
              Kiekvienas mygtukas paleidžia GA4 dataLayer event'ą + tiesioginį fbq() iškvietimą.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={handlePurchase} size="lg" className="w-full">
              💰 Purchase
            </Button>
            <Button onClick={handleInitiateCheckout} size="lg" variant="secondary" className="w-full">
              🛒 InitiateCheckout
            </Button>
            <Button onClick={handleViewContent} size="lg" variant="secondary" className="w-full">
              👁️ ViewContent
            </Button>
            <Button onClick={handleLead} size="lg" variant="secondary" className="w-full">
              📝 Lead
            </Button>
            <Button onClick={handleContact} size="lg" variant="secondary" className="w-full">
              📞 Contact
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kaip patikrinti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>1. GTM Preview:</strong> spausk Preview GTM'e → įvesk šio puslapio URL → tikrinkim ar
              tag'ai šaunasi.
            </p>
            <p>
              <strong>2. Meta Events Manager → Test Events:</strong> įvesk šio puslapio URL → spausk eventus
              čia → matysi juos realiu laiku Meta pusėje.
            </p>
            <p>
              <strong>3. Browser DevTools → Network:</strong> filtruok pagal <code>facebook.com/tr</code> –
              kiekvienas event'as turėtų sukurti tokią užklausą.
            </p>
            <p className="text-muted-foreground pt-2">
              ⚠️ Pixel veikia tik jei priimtas <strong>marketing</strong> slapukų sutikimas.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PixelTester;
