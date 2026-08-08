import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  Pencil,
  Users,
  Fuel,
  Settings,
  Star,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CalendarClock,
  Truck,
  Headphones,
  Crown,
} from "lucide-react";
import { CARS_CATALOG, HIDDEN_CAR_IDS, CatalogCar } from "@/data/carsCatalog";
import { getCarSlugFromId } from "@/utils/carSlugs";
import { useTranslations } from "@/hooks/use-translations";
import { SEOHead } from "@/components/seo/SEOHead";
import { cn } from "@/lib/utils";
import {
  CITIES,
  PickupMode,
  ReturnMode,
  RentalLocation,
  calculateLogisticsTotal,
  emptyLocation,
  locationLabel,
  readSearchParams,
} from "@/lib/rentalSearch";

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const fmtLtDateTime = (dateStr: string, time = "10:00") =>
  `${format(new Date(`${dateStr}T12:00:00`), "yyyy 'm.' MMMM d 'd.'", { locale: lt })}, ${time}`;
const daysBetween = (a: string, b: string) => {
  const ms = new Date(`${b}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime();
  return Math.max(1, Math.round(ms / 86400000));
};

// Statuses that occupy a car for a date range. Must match server-side
// conflict check in the `create_reservation` RPC + BookingCalendar.
const ACTIVE_STATUSES = ["paid", "pending", "requested", "picked_up", "awaiting_payment"];

const AvailableCars = () => {
  const navigate = useNavigate();
  const { t, language } = useTranslations();
  const [params, setParams] = useSearchParams();
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const normalizeForTranslation = (text: string): string =>
    text.toLowerCase()
      .replace(/ė/g, "e").replace(/ą/g, "a").replace(/į/g, "i")
      .replace(/ų/g, "u").replace(/ū/g, "u").replace(/č/g, "c")
      .replace(/š/g, "s").replace(/ž/g, "z");

  const getFeatureKey = (feature: string): string => {
    const map: Record<string, string> = {
      'Kondicionierius': 'car.featuresList.airConditioning',
      'Bluetooth': 'car.featuresList.bluetooth',
      'GPS navigacija': 'car.featuresList.gpsNavigation',
      '7 vietos': 'car.featuresList.sevenSeats',
      'Bagažinė': 'car.featuresList.trunk',
      'Šeimos automobilis': 'car.featuresList.familyCar',
      'Ekonomiškas': 'car.featuresList.economical',
      'Patogus': 'car.featuresList.comfortable',
      'Didelis bagažas': 'car.featuresList.largeTrunk',
      'Ekonomiškas vairavimas': 'car.featuresList.economicalDriving',
      'Erdvus universalas': 'car.featuresList.spaciousWagon',
      'Patikimas automobilis': 'car.featuresList.reliable',
      'Ekonomiškas dyzelinis variklis': 'car.featuresList.economicalDiesel',
      'Modernus LED apšvietimas': 'car.featuresList.modernLED',
      'Atidaromas stogas': 'car.featuresList.retractableRoof',
      'Automatinė pavarų dėžė': 'car.featuresList.automaticTransmission',
      'Sportinis dizainas': 'car.featuresList.sportyDesign',
      '8 keleivių vietos': 'car.featuresList.nineSeats',
      'Slankiosios durys': 'car.featuresList.slidingDoors',
      'Erdvus salonas': 'car.featuresList.spaciousInterior',
    };
    return map[feature] || feature;
  };

  const today = new Date().toISOString().slice(0, 10);
  const inTwo = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

  const pickup = params.get("pickup") || today;
  const ret = params.get("return") || inTwo;
  const pickupTime = params.get("pickupTime") || "10:00";
  const returnTime = params.get("returnTime") || "10:00";
  const rentalDays = daysBetween(pickup, ret);

  // Delivery / collection search context (persisted in the URL)
  const search = useMemo(() => readSearchParams(params), [params]);
  const { deliveryFee, collectionFee, logisticsTotal } = search.pricing;

  const updateParam = (updates: Record<string, string>) => {
    const p = new URLSearchParams(params);
    Object.entries(updates).forEach(([k, v]) => p.set(k, v));
    setParams(p);
  };

  const onPickupChange = (v: string) => {
    const oldP = new Date(`${pickup}T12:00:00`).getTime();
    const oldR = new Date(`${ret}T12:00:00`).getTime();
    const diffDays = Math.max(1, Math.round((oldR - oldP) / 86400000));
    const newP = new Date(`${v}T12:00:00`);
    const newR = new Date(newP);
    newR.setDate(newR.getDate() + diffDays);
    updateParam({ pickup: v, return: toISO(newR) });
  };

  // Edit-search state
  const [editOpen, setEditOpen] = useState(false);
  const [editPickup, setEditPickup] = useState(pickup);
  const [editReturn, setEditReturn] = useState(ret);
  const [editPickupMode, setEditPickupMode] = useState<PickupMode>(search.pickupMode);
  const [editPickupCity, setEditPickupCity] = useState(search.pickup.city);
  const [editPickupAddress, setEditPickupAddress] = useState(search.pickup.address);
  const [editReturnMode, setEditReturnMode] = useState<ReturnMode>(search.returnMode);
  const [editReturnCity, setEditReturnCity] = useState(search.returnLocation.city);
  const [editReturnAddress, setEditReturnAddress] = useState(search.returnLocation.address);
  useEffect(() => {
    setEditPickup(pickup);
    setEditReturn(ret);
    setEditPickupMode(search.pickupMode);
    setEditPickupCity(search.pickup.city);
    setEditPickupAddress(search.pickup.address);
    setEditReturnMode(search.returnMode);
    setEditReturnCity(search.returnLocation.city);
    setEditReturnAddress(search.returnLocation.address);
  }, [pickup, ret, params]);

  const applySearch = () => {
    const pickupLoc: RentalLocation =
      editPickupMode === "office"
        ? emptyLocation("office")
        : { ...emptyLocation("delivery"), city: editPickupCity, address: editPickupAddress };
    const returnLoc: RentalLocation =
      editReturnMode === "same"
        ? { ...pickupLoc }
        : editReturnMode === "office"
        ? emptyLocation("office")
        : { ...emptyLocation("delivery"), city: editReturnCity, address: editReturnAddress };
    const fees = calculateLogisticsTotal(pickupLoc, returnLoc);
    const p = new URLSearchParams(params);
    p.set("pickup", editPickup);
    p.set("return", editReturn);
    p.set("pickupMode", pickupLoc.type);
    p.set("pickupCity", pickupLoc.city);
    p.set("pickupAddress", pickupLoc.address);
    p.set("returnMode", editReturnMode);
    p.set("returnCity", returnLoc.city);
    p.set("returnAddress", returnLoc.address);
    p.set("deliveryFee", String(fees.status === "success" ? fees.deliveryFee : 0));
    p.set("collectionFee", String(fees.status === "success" ? fees.collectionFee : 0));
    setParams(p);
    setEditOpen(false);
  };



  // DB data: pricing + premium
  const {
    data: dbCars,
    isLoading: carsLoading,
    isError: carsError,
    refetch: refetchCars,
  } = useQuery({
    queryKey: ["available-cars-db"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("id, is_premium, price_tier1, price_tier2, price_tier3, deposit_amount");
      if (error) throw error;
      return data || [];
    },
  });

  // Reservations overlapping the range
  const {
    data: reservations,
    isLoading: resLoading,
    isError: resError,
    refetch: refetchRes,
  } = useQuery({
    queryKey: ["available-cars-reservations", pickup, ret],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("car_id, start_date, end_date, status, deleted_at")
        .lte("start_date", ret)
        .gte("end_date", pickup);
      if (error) throw error;
      return (data || []).filter(
        (r: any) => !r.deleted_at && ACTIVE_STATUSES.includes(r.status)
      );
    },
  });

  // Blocked dates in range
  const {
    data: blocked,
    isLoading: blockedLoading,
    isError: blockedError,
    refetch: refetchBlocked,
  } = useQuery({
    queryKey: ["available-cars-blocked", pickup, ret],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_blocked_dates")
        .select("car_id, blocked_date")
        .gte("blocked_date", pickup)
        .lte("blocked_date", ret);
      if (error) throw error;
      return data || [];
    },
  });

  const isQueryLoading = carsLoading || resLoading || blockedLoading;
  const isQueryError = carsError || resError || blockedError;
  const retryAll = () => { refetchCars(); refetchRes(); refetchBlocked(); };

  const unavailableIds = useMemo(() => {
    const s = new Set<string>();
    (reservations || []).forEach((r: any) => r.car_id && s.add(String(r.car_id)));
    (blocked || []).forEach((b: any) => b.car_id && s.add(String(b.car_id)));
    return s;
  }, [reservations, blocked]);

  const pricingFor = (carId: string) => {
    const c = (dbCars || []).find((x: any) => String(x.id) === carId);
    let daily: number | null = null;
    if (c) {
      if (rentalDays >= 7 && c.price_tier3) daily = Number(c.price_tier3);
      else if (rentalDays >= 3 && c.price_tier2) daily = Number(c.price_tier2);
      else if (c.price_tier1) daily = Number(c.price_tier1);
    }
    const deposit = c?.deposit_amount ? Number(c.deposit_amount) : 200;
    const isPremium = !!c?.is_premium;
    return { daily, deposit, isPremium };
  };

  // Filters
  const [fTransmission, setFTransmission] = useState<Set<string>>(new Set());
  const [fFuel, setFFuel] = useState<Set<string>>(new Set());
  const [fPassengers, setFPassengers] = useState<Set<string>>(new Set()); // "2-4","5","7+"
  const [fBody, setFBody] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sort, setSort] = useState<string>("recommended");

  const toggle = (setter: (s: Set<string>) => void, set: Set<string>, v: string) => {
    const next = new Set(set);
    next.has(v) ? next.delete(v) : next.add(v);
    setter(next);
  };

  const availableCars = useMemo(() => {
    return CARS_CATALOG.filter((c) => !HIDDEN_CAR_IDS.has(c.id) && !unavailableIds.has(c.id));
  }, [unavailableIds]);

  const filtered = useMemo(() => {
    const passengersMatch = (p: number) => {
      if (fPassengers.size === 0) return true;
      if (fPassengers.has("2-4") && p >= 2 && p <= 4) return true;
      if (fPassengers.has("5") && p === 5) return true;
      if (fPassengers.has("7+") && p >= 7) return true;
      return false;
    };
    return availableCars
      .map((c) => ({ car: c, ...pricingFor(c.id) }))
      .filter((row) => {
        const { car, daily } = row;
        if (fTransmission.size && !fTransmission.has(car.transmission)) return false;
        if (fFuel.size && !fFuel.has(car.fuel)) return false;
        if (!passengersMatch(car.passengers)) return false;
        if (fBody.size && !fBody.has(car.category)) return false;
        if (daily != null && (daily < priceRange[0] || daily > priceRange[1])) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "price-asc") return (a.daily ?? 9999) - (b.daily ?? 9999);
        if (sort === "price-desc") return (b.daily ?? 0) - (a.daily ?? 0);
        if (sort === "rating") return b.car.rating - a.car.rating;
        // recommended: premium first, then rating
        if (a.isPremium !== b.isPremium) return a.isPremium ? -1 : 1;
        return b.car.rating - a.car.rating;
      });
  }, [availableCars, dbCars, fTransmission, fFuel, fPassengers, fBody, priceRange, sort, rentalDays]);

  // Counts per filter facet (based on all available, ignoring same-facet filter)
  const count = (pred: (c: CatalogCar) => boolean) => availableCars.filter(pred).length;

  const { toast } = useToast();
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const openCar = async (id: string) => {
    if (checkingId) return;
    setCheckingId(id);
    try {
      const { data, error } = await supabase.rpc("check_car_availability", {
        p_car_id: id,
        p_start_date: pickup,
        p_end_date: ret,
      } as any);
      if (error) throw error;
      const res = data as { available: boolean; reason?: string } | null;
      if (!res?.available) {
        toast({
          title: "Automobilis ką tik tapo užimtas",
          description: "Prašome pasirinkti kitą automobilį arba pakeisti datas.",
          variant: "destructive",
        });
        retryAll();
        return;
      }
      const slug = getCarSlugFromId(id, language as "lt" | "en");
      const base = language === "en" ? "/cars" : "/automobiliai";
      const qs = new URLSearchParams({
        pickup,
        return: ret,
        pickupTime,
        returnTime,
        pickupMode: search.pickupMode,
        pickupCity: search.pickup.city,
        pickupAddress: search.pickup.address,
        returnMode: search.returnMode,
        returnCity: search.returnLocation.city,
        returnAddress: search.returnLocation.address,
        deliveryFee: String(deliveryFee),
        collectionFee: String(collectionFee),
      }).toString();
      navigate(slug ? `${base}/${slug}?${qs}` : base);
    } catch (e) {
      toast({
        title: "Nepavyko patikrinti užimtumo",
        description: "Bandykite dar kartą.",
        variant: "destructive",
      });
    } finally {
      setCheckingId(null);
    }
  };

  const clearFilters = () => {
    setFTransmission(new Set());
    setFFuel(new Set());
    setFPassengers(new Set());
    setFBody(new Set());
    setPriceRange([0, 200]);
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <SEOHead
        title="Laisvi automobiliai jūsų datoms | Carbonus"
        description="Peržiūrėkite laisvus automobilius pasirinktomis datomis. Skaidrios kainos, pristatymas visoje Lietuvoje."
        canonical="https://carbonus.lt/laisvi-automobiliai"
      />
      <Navigation logo="/__l5e/assets-v1/eb52b609-dc60-4b38-b63c-1e1348dc083a/logo-white.png" />

      {/* Search summary bar */}
      <section className="pt-28 md:pt-32 pb-6 bg-secondary/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-card border border-border p-4 md:p-5">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr_auto_1.3fr_1fr_auto] gap-4 md:gap-6 items-center">
              <SummaryItem
                icon={<MapPin className="h-5 w-5 text-primary" />}
                label={search.returnMode === "same" ? "Paėmimas ir grąžinimas" : "Paėmimas → grąžinimas"}
                value={
                  search.returnMode === "same"
                    ? locationLabel(search.pickup)
                    : `${locationLabel(search.pickup)} → ${locationLabel(search.returnLocation)}`
                }
              />

              <EditableDateTimeSummary
                label="Atsiėmimas"
                date={pickup}
                time={pickupTime}
                onDateChange={onPickupChange}
                onTimeChange={(v) => updateParam({ pickupTime: v })}
              />
              <ArrowRight className="hidden md:block h-5 w-5 text-muted-foreground mx-auto" />
              <EditableDateTimeSummary
                label="Grąžinimas"
                date={ret}
                time={returnTime}
                onDateChange={(v) => updateParam({ return: v })}
                onTimeChange={(v) => updateParam({ returnTime: v })}
                minDate={new Date(`${pickup}T12:00:00`)}
              />
              
              <SummaryItem icon={<Clock className="h-5 w-5 text-primary" />} label="Nuomos trukmė" value={`${rentalDays} ${rentalDays === 1 ? "diena" : rentalDays < 10 ? "dienos" : "dienų"}`} />
              <Popover open={editOpen} onOpenChange={setEditOpen}>
                <PopoverTrigger asChild>
                  <Button variant="hero" className="gap-2 h-12 rounded-xl">
                    <Pencil className="h-4 w-4" />
                    Keisti paiešką
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[340px] max-w-[92vw] p-4 z-[80] max-h-[80vh] overflow-y-auto" align="end">
                  <div className="space-y-3">
                    <LocationEditor
                      title="Kur gauti automobilį?"
                      mode={editPickupMode}
                      onMode={(m) => setEditPickupMode(m as PickupMode)}
                      options={[{ v: "office", l: "Carbonus ofisas" }, { v: "delivery", l: "Pristatymas į vietą" }]}
                      showFields={editPickupMode === "delivery"}
                      city={editPickupCity}
                      address={editPickupAddress}
                      onCity={setEditPickupCity}
                      onAddress={setEditPickupAddress}
                    />
                    <DatePickField
                      label="Atsiėmimo data"
                      value={editPickup}
                      onChange={(v) => {
                        const oldP = new Date(`${editPickup}T12:00:00`).getTime();
                        const oldR = new Date(`${editReturn}T12:00:00`).getTime();
                        const diffDays = Math.max(1, Math.round((oldR - oldP) / 86400000));
                        const newP = new Date(`${v}T12:00:00`);
                        const newR = new Date(newP);
                        newR.setDate(newR.getDate() + diffDays);
                        setEditPickup(v);
                        setEditReturn(toISO(newR));
                      }}
                    />
                    <DatePickField label="Grąžinimo data" value={editReturn} onChange={setEditReturn} minDate={new Date(`${editPickup}T12:00:00`)} />
                    <LocationEditor
                      title="Kur grąžinsite automobilį?"
                      mode={editReturnMode}
                      onMode={(m) => setEditReturnMode(m as ReturnMode)}
                      options={[
                        { v: "same", l: "Ta pati vieta" },
                        { v: "office", l: "Carbonus ofisas" },
                        { v: "delivery", l: "Kita vieta" },
                      ]}
                      showFields={editReturnMode === "delivery"}
                      city={editReturnCity}
                      address={editReturnAddress}
                      onCity={setEditReturnCity}
                      onAddress={setEditReturnAddress}
                    />
                    <Button variant="hero" className="w-full" onClick={applySearch}>Taikyti</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {logisticsTotal > 0 && (
              <div className="mt-4 border-t border-border pt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                {deliveryFee > 0 && (
                  <span className="text-muted-foreground">
                    Pristatymas <span className="font-semibold text-foreground">{deliveryFee} €</span>
                  </span>
                )}
                {collectionFee > 0 && (
                  <span className="text-muted-foreground">
                    Atsiėmimas <span className="font-semibold text-foreground">{collectionFee} €</span>
                  </span>
                )}
                <span className="text-muted-foreground">
                  Logistika iš viso <span className="font-bold text-primary">{logisticsTotal} €</span>
                </span>
              </div>
            )}
          </div>


          <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Laisvi automobiliai jūsų pasirinktomis datomis</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {fmtLtDateTime(pickup)} – {fmtLtDateTime(ret)} • {rentalDays} nuomos {rentalDays === 1 ? "diena" : rentalDays < 10 ? "dienos" : "dienų"}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">Rasta: <span className="text-foreground font-semibold">{filtered.length} automobiliai</span></div>
          </div>
        </div>
      </section>

      {/* Body: filters + grid */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Filters */}
          <aside className="bg-white rounded-2xl shadow-card border border-border p-5 h-fit sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Filtrai</h2>
              <button onClick={clearFilters} className="text-xs text-primary hover:underline">Išvalyti</button>
            </div>

            <FilterGroup title="Transmisija">
              {["Automatinė", "Mechaninė"].map((v) => (
                <FilterRow
                  key={v}
                  label={v}
                  count={count((c) => c.transmission === v)}
                  checked={fTransmission.has(v)}
                  onChange={() => toggle(setFTransmission, fTransmission, v)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Kuro tipas">
              {["Benzinas", "Dyzelinas"].map((v) => (
                <FilterRow
                  key={v}
                  label={v}
                  count={count((c) => c.fuel === v)}
                  checked={fFuel.has(v)}
                  onChange={() => toggle(setFFuel, fFuel, v)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Keleivių skaičius">
              {[
                { key: "2-4", label: "2–4", pred: (c: CatalogCar) => c.passengers >= 2 && c.passengers <= 4 },
                { key: "5", label: "5", pred: (c: CatalogCar) => c.passengers === 5 },
                { key: "7+", label: "7+", pred: (c: CatalogCar) => c.passengers >= 7 },
              ].map((o) => (
                <FilterRow
                  key={o.key}
                  label={o.label}
                  count={count(o.pred)}
                  checked={fPassengers.has(o.key)}
                  onChange={() => toggle(setFPassengers, fPassengers, o.key)}
                />
              ))}
            </FilterGroup>

            <FilterGroup title="Kėbulo tipas">
              {["Hecbekas", "Universalas", "Sedanas", "Kabrioletas", "Vienatūris", "Krosoveris", "Miniautobusas"].map((v) => {
                const cnt = count((c) => c.category === v);
                if (cnt === 0) return null;
                return (
                  <FilterRow
                    key={v}
                    label={v === "Hecbekas" ? "Hečbekas" : v}
                    count={cnt}
                    checked={fBody.has(v)}
                    onChange={() => toggle(setFBody, fBody, v)}
                  />
                );
              })}
            </FilterGroup>

            <FilterGroup title="Kainos intervalas" defaultOpen>
              <div className="pt-2 pb-1">
                <Slider
                  min={0}
                  max={200}
                  step={5}
                  value={priceRange}
                  onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{priceRange[0]} €</span>
                  <span>{priceRange[1]} €</span>
                </div>
              </div>
            </FilterGroup>
          </aside>

          {/* Grid */}
          <div>
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rūšiuoti pagal</span>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[220px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Rekomenduojami</SelectItem>
                    <SelectItem value="price-asc">Kaina: nuo mažiausios</SelectItem>
                    <SelectItem value="price-desc">Kaina: nuo didžiausios</SelectItem>
                    <SelectItem value="rating">Įvertinimas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isQueryError ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-card border border-destructive/40">
                <p className="text-lg font-medium text-destructive">Nepavyko patikrinti automobilių užimtumo</p>
                <p className="text-sm text-muted-foreground mt-2">Bandykite dar kartą arba susisiekite su mumis.</p>
                <Button variant="outline" className="mt-4" onClick={retryAll}>Bandyti dar kartą</Button>
              </div>
            ) : isQueryLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-card border border-border overflow-hidden">
                    <div className="w-full h-48 bg-secondary/60 animate-pulse" />
                    <div className="p-6 space-y-3">
                      <div className="h-5 w-2/3 bg-secondary/60 rounded animate-pulse" />
                      <div className="h-4 w-full bg-secondary/50 rounded animate-pulse" />
                      <div className="h-4 w-5/6 bg-secondary/50 rounded animate-pulse" />
                      <div className="h-8 w-full bg-secondary/50 rounded animate-pulse mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-card border border-border">
                <p className="text-lg font-medium">Šiomis datomis laisvų automobilių neradome</p>
                <p className="text-sm text-muted-foreground mt-2">Pabandykite pakeisti datas arba filtrus.</p>
                <div className="mt-4 flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => setEditOpen(true)}>Keisti datas</Button>
                  <Button variant="outline" onClick={clearFilters}>Išvalyti filtrus</Button>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filtered.map(({ car, daily, deposit, isPremium }, idx) => (
                  <Card
                    key={car.id}
                    className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-background border-0 shadow-card"
                  >
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg" style={{ background: "linear-gradient(180deg, #f3f4f6 0%, #e9eaec 100%)" }}>
                        <div className="relative">
                          <img
                            src={car.image}
                            alt={car.name}
                            loading="eager"
                            data-allow-save="true"
                            onLoad={() => setLoadedImages(prev => new Set(prev).add(car.id))}
                          className={`w-full h-48 transition-transform duration-300 object-contain object-center mix-blend-multiply ${
                              !loadedImages.has(car.id) ? "opacity-0" : "opacity-100"
                            } ${
                              car.name === "Volkswagen Passat"
                                ? "scale-[0.92] group-hover:scale-[0.97]"
                                : car.name === "Mercedes-Benz SLK"
                                ? "scale-[0.92] group-hover:scale-[0.97] translate-y-4"
                                : car.id === "7"
                                ? "scale-[1.0] group-hover:scale-[1.05] translate-y-2"
                                : car.id === "5"
                                ? "scale-[1.30] group-hover:scale-[1.35] translate-y-3"
                                : car.id === "8"
                                ? "scale-[1.35] group-hover:scale-[1.40] translate-y-0"
                                : "scale-100 group-hover:scale-105 translate-y-4"
                            }`}
                          />
                          {(car.id === "5" || car.id === "6") && loadedImages.has(car.id) && (
                            <div
                              className="absolute bottom-[16%] left-1/2 -translate-x-1/2 w-[90%] h-6 rounded-[50%]"
                              style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, transparent 70%)" }}
                            />
                          )}
                          {car.id === "8" && loadedImages.has(car.id) && (
                            <div
                              className="absolute bottom-[16%] left-1/2 -translate-x-1/2 w-[88%] h-6 rounded-[50%]"
                              style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, transparent 70%)" }}
                            />
                          )}
                          {car.id === "7" && loadedImages.has(car.id) && (
                            <div
                              className="absolute bottom-[16%] left-1/2 -translate-x-1/2 w-[96%] h-6 rounded-[50%]"
                              style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 70%)" }}
                            />
                          )}
                        </div>
                        <div className="absolute top-4 left-4 flex gap-1.5">
                          <Badge variant="secondary" className="bg-primary text-primary-foreground">
                            {t(`car.categories.${normalizeForTranslation(car.category)}`)}
                          </Badge>
                          {isPremium ? (
                            <Badge variant="secondary" className="bg-amber-500 text-white flex items-center gap-1">
                              <Crown className="w-3 h-3" /> Premium
                            </Badge>
                          ) : idx === 0 ? (
                            <Badge variant="secondary" className="bg-foreground text-background">Populiariausias</Badge>
                          ) : null}
                        </div>
                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{car.rating}</span>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                          {car.name}
                        </h3>

                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{car.passengers}</span></div>
                          <div className="flex items-center gap-1"><Fuel className="w-4 h-4" /><span>{t(`car.${normalizeForTranslation(car.fuel)}`)}</span></div>
                          <div className="flex items-center gap-1"><Settings className="w-4 h-4" /><span>{t(`car.${normalizeForTranslation(car.transmission)}`)}</span></div>
                          <div className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /><span>{car.year}</span></div>
                        </div>

                        <div className="space-y-1">
                          {car.features.map((feature, i) => (
                            <div key={i} className="text-sm text-muted-foreground">• {t(getFeatureKey(feature))}</div>
                          ))}
                        </div>

                        {logisticsTotal > 0 ? (
                          <div className="pt-3 border-t border-border space-y-1 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Nuoma · {rentalDays} {rentalDays === 1 ? "diena" : rentalDays < 10 ? "dienos" : "dienų"}
                              </span>
                              <span className="font-semibold text-foreground">
                                {daily != null ? `${daily * rentalDays} €` : "—"}
                              </span>
                            </div>
                            {deliveryFee > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Pristatymas{search.pickup.city ? ` (${search.pickup.city})` : ""}
                                </span>
                                <span className="font-semibold text-foreground">{deliveryFee} €</span>
                              </div>
                            )}
                            {collectionFee > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Atsiėmimas{search.returnLocation.city ? ` (${search.returnLocation.city})` : ""}
                                </span>
                                <span className="font-semibold text-foreground">{collectionFee} €</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="pt-3 border-t border-border text-xs text-muted-foreground">
                            Atsiėmimas Carbonus ofise · nemokamai
                          </p>
                        )}

                        <div className="flex items-end justify-between pt-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Iš viso</p>
                            <p className="text-2xl font-bold text-primary leading-tight">
                              {daily != null ? `${daily * rentalDays + logisticsTotal} €` : "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {daily != null ? `${daily} €/dieną` : "kaina pateikiama"} · Užstatas {deposit} €
                            </p>
                          </div>

                          <Button
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => openCar(car.id)}
                            disabled={checkingId === car.id}
                          >
                            {checkingId === car.id ? "Tikrinama…" : "Rinktis"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <Benefit icon={<ShieldCheck className="w-6 h-6 text-primary" />} title="Aiškios kainos" desc="Be paslėptų mokesčių" />
          <Benefit icon={<CalendarClock className="w-6 h-6 text-primary" />} title="Nemokamas atšaukimas" desc="Iki 24 val. prieš atsiėmimą" />
          <Benefit icon={<Truck className="w-6 h-6 text-primary" />} title="Pristatymas visoje Lietuvoje" desc="Tiesiai į jūsų nurodytą adresą" />
          <Benefit icon={<Headphones className="w-6 h-6 text-primary" />} title="Pagalba 24/7" desc="Esame šalia visos nuomos metu" />
        </div>
      </section>

      <Footer />
    </div>
  );
};

/* ---------- Helpers ---------- */

function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm md:text-base font-semibold text-foreground truncate">{value}</div>
      </div>
    </div>
  );
}

const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const totalMin = 7 * 60 + i * 30;
  const h = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const m = String(totalMin % 60).padStart(2, "0");
  return `${h}:${m}`;
});

function EditableDateTimeSummary({
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate,
}: {
  label: string;
  date: string;
  time: string;
  onDateChange: (v: string) => void;
  onTimeChange: (v: string) => void;
  minDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const selected = new Date(`${date}T12:00:00`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const min = minDate ?? today;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="flex items-center gap-3 min-w-0 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-muted/60 transition-colors">
          <div className="shrink-0"><CalendarIcon className="h-5 w-5 text-primary" /></div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-sm md:text-base font-semibold text-foreground truncate">
              {format(selected, "yyyy 'm.' MMMM d 'd.'", { locale: lt })}, {time}
            </div>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 z-[90] pointer-events-auto" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(d) => { if (d) onDateChange(toISO(d)); }}
          disabled={(d) => d < min}
          initialFocus
          locale={lt}
          className="p-0 pointer-events-auto"
        />
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Laikas
          </div>
          <Select value={time} onValueChange={(v) => { onTimeChange(v); }}>
            <SelectTrigger className="w-full h-10"><SelectValue /></SelectTrigger>
            <SelectContent className="z-[100] max-h-64">
              {TIME_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="hero" className="w-full mt-3 h-10" onClick={() => setOpen(false)}>Gerai</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FilterGroup({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border first:border-t-0 py-3">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between text-sm font-semibold">
        <span>{title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="mt-2 space-y-1.5">{children}</div>}
    </div>
  );
}

function FilterRow({ label, count, checked, onChange }: { label: string; count: number; checked: boolean; onChange: () => void }) {
  const disabled = count === 0;
  return (
    <label className={cn("flex items-center justify-between py-1.5 cursor-pointer", disabled && "opacity-50 cursor-not-allowed")}>
      <div className="flex items-center gap-2">
        <Checkbox checked={checked} onCheckedChange={onChange} disabled={disabled} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground">{count}</span>
    </label>
  );
}

function DatePickField({ label, value, onChange, minDate }: { label: string; value: string; onChange: (v: string) => void; minDate?: Date }) {
  const [open, setOpen] = useState(false);
  const selected = new Date(`${value}T12:00:00`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const min = minDate ?? today;
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="w-full flex items-center gap-2 rounded-xl border border-border px-3 h-11 text-left hover:bg-muted">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{format(selected, "yyyy 'm.' MMMM d 'd.'", { locale: lt })}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[90]" align="start">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(d) => { if (d) { onChange(toISO(d)); setOpen(false); } }}
            disabled={(d) => d < min}
            initialFocus
            locale={lt}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function Benefit({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">{icon}</div>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

export default AvailableCars;
