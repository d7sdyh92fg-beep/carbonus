import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  Info,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { CarCard } from "@/components/CarCard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useSearchState } from "@/hooks/use-search-state";
import { CARS_CATALOG, HIDDEN_CAR_IDS, CatalogCar } from "@/data/carsCatalog";
import { getCarSlugFromId } from "@/utils/carSlugs";
import { searchCopy } from "@/components/search/searchCopy";
import { SearchSummaryCard } from "@/components/search/SearchSummaryCard";
import { DeliveryConfigurator } from "@/components/search/DeliveryConfigurator";
import { LogisticsSummary } from "@/components/search/LogisticsSummary";
import { TrustStrip } from "@/components/search/TrustStrip";
import {
  CARBONUS_OFFICE,
  buildLogisticsQuote,
  ReturnType as LogisticsReturnType,
} from "@/lib/logisticsPricing";
import { useDrivingDistance } from "@/hooks/use-driving-distance";

const ACTIVE_STATUSES = ["paid", "pending", "requested", "picked_up", "awaiting_payment"];

const daysBetween = (a: string, b: string) => {
  const ms = new Date(`${b}T12:00:00`).getTime() - new Date(`${a}T12:00:00`).getTime();
  return Math.max(1, Math.round(ms / 86400000));
};

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
  lt: {},
  en: {
    Kabrioletas: "Convertible",
    Krosoveris: "Crossover",
    Vienatūris: "Minivan",
    Hecbekas: "Hatchback",
    Sedanas: "Sedan",
    Universalas: "Wagon",
    Miniautobusas: "Minibus",
  },
  ru: {
    Kabrioletas: "Кабриолет",
    Krosoveris: "Кроссовер",
    Vienatūris: "Минивэн",
    Hecbekas: "Хэтчбек",
    Sedanas: "Седан",
    Universalas: "Универсал",
    Miniautobusas: "Микроавтобус",
  },
};

const SPEC_LABELS: Record<string, Record<string, string>> = {
  lt: {},
  en: { "Automatinė": "Automatic", "Mechaninė": "Manual", Benzinas: "Petrol", Dyzelinas: "Diesel" },
  ru: { "Automatinė": "Автомат", "Mechaninė": "Механика", Benzinas: "Бензин", Dyzelinas: "Дизель" },
};

const AvailableCars = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const c = searchCopy[language] ?? searchCopy.lt;
  const catLabel = (v: string) => CATEGORY_LABELS[language]?.[v] ?? v;
  const specLabel = (v: string) => SPEC_LABELS[language]?.[v] ?? v;

  const {
    pickupMode,
    setPickupMode,
    pickupLocation,
    setPickupLocation,
    returnMode,
    setReturnMode,
    returnLocation,
    setReturnLocation,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
    setDates,
    setPickupDateKeepingDuration,
  } = useSearchState();

  const [editOpen, setEditOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [showErrors, setShowErrors] = useState(false);

  const rentalDays = daysBetween(pickupDate, returnDate);
  const daysLabel = rentalDays === 1 ? c.day : rentalDays < 10 ? c.days : c.daysMany;

  // ---- Logistics pricing -------------------------------------------------
  const deliveryFee = calculateDeliveryFee(pickupMode, pickupLocation);
  const collectionFee = calculateCollectionFee(pickupMode, returnMode, pickupLocation, returnLocation);
  const logisticsTotal = calculateLogisticsTotal(deliveryFee, collectionFee);
  const logisticsKnown = logisticsTotal.status === "free" || logisticsTotal.status === "priced";

  const deliveryTarget =
    pickupMode === "office"
      ? CARBONUS_OFFICE.address
      : pickupLocation?.address || `— ${c.notSelected}`;
  const collectionTarget =
    pickupMode === "office" || returnMode === "office"
      ? CARBONUS_OFFICE.address
      : returnMode === "same"
      ? pickupLocation?.address || `— ${c.notSelected}`
      : returnLocation?.address || `— ${c.notSelected}`;

  const pickupError =
    showErrors && pickupMode !== "office" && !pickupLocation?.address ? c.chooseLocationError : null;
  const returnError =
    showErrors && returnMode === "different" && !returnLocation?.address ? c.chooseLocationError : null;

  // ---- Data --------------------------------------------------------------
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

  const {
    data: reservations,
    isLoading: resLoading,
    isError: resError,
    refetch: refetchRes,
  } = useQuery({
    queryKey: ["available-cars-reservations", pickupDate, returnDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("car_id, start_date, end_date, status, deleted_at")
        .lte("start_date", returnDate)
        .gte("end_date", pickupDate);
      if (error) throw error;
      return (data || []).filter((r: any) => !r.deleted_at && ACTIVE_STATUSES.includes(r.status));
    },
  });

  const {
    data: blocked,
    isLoading: blockedLoading,
    isError: blockedError,
    refetch: refetchBlocked,
  } = useQuery({
    queryKey: ["available-cars-blocked", pickupDate, returnDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_blocked_dates")
        .select("car_id, blocked_date")
        .gte("blocked_date", pickupDate)
        .lte("blocked_date", returnDate);
      if (error) throw error;
      return data || [];
    },
  });

  const isQueryLoading = carsLoading || resLoading || blockedLoading;
  const isQueryError = carsError || resError || blockedError;
  const retryAll = () => {
    refetchCars();
    refetchRes();
    refetchBlocked();
  };

  const unavailableIds = useMemo(() => {
    const s = new Set<string>();
    (reservations || []).forEach((r: any) => r.car_id && s.add(String(r.car_id)));
    (blocked || []).forEach((b: any) => b.car_id && s.add(String(b.car_id)));
    return s;
  }, [reservations, blocked]);

  const pricingFor = (carId: string) => {
    const car = (dbCars || []).find((x: any) => String(x.id) === carId);
    let daily: number | null = null;
    if (car) {
      if (rentalDays >= 7 && car.price_tier3) daily = Number(car.price_tier3);
      else if (rentalDays >= 3 && car.price_tier2) daily = Number(car.price_tier2);
      else if (car.price_tier1) daily = Number(car.price_tier1);
    }
    return { daily, isPremium: !!car?.is_premium };
  };

  // ---- Filters -----------------------------------------------------------
  const [fTransmission, setFTransmission] = useState<Set<string>>(new Set());
  const [fFuel, setFFuel] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState("recommended");

  const toggle = (setter: (s: Set<string>) => void, set: Set<string>, v: string) => {
    const next = new Set(set);
    next.has(v) ? next.delete(v) : next.add(v);
    setter(next);
  };

  const availableCars = useMemo(
    () => CARS_CATALOG.filter((car) => !HIDDEN_CAR_IDS.has(car.id) && !unavailableIds.has(car.id)),
    [unavailableIds],
  );

  const filtered = useMemo(() => {
    return availableCars
      .map((car) => ({ car, ...pricingFor(car.id) }))
      .filter(({ car }) => {
        if (fTransmission.size && !fTransmission.has(car.transmission)) return false;
        if (fFuel.size && !fFuel.has(car.fuel)) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "price-asc") return (a.daily ?? 9999) - (b.daily ?? 9999);
        if (sort === "price-desc") return (b.daily ?? 0) - (a.daily ?? 0);
        if (sort === "rating") return b.car.rating - a.car.rating;
        if (a.isPremium !== b.isPremium) return a.isPremium ? -1 : 1;
        return b.car.rating - a.car.rating;
      });
  }, [availableCars, dbCars, fTransmission, fFuel, sort, rentalDays]);

  const openCar = async (id: string) => {
    if (checkingId) return;
    if (pickupMode !== "office" && !pickupLocation?.address) {
      setShowErrors(true);
      window.scrollTo({ top: 240, behavior: "smooth" });
      return;
    }
    if (returnMode === "different" && !returnLocation?.address) {
      setShowErrors(true);
      window.scrollTo({ top: 240, behavior: "smooth" });
      return;
    }
    setCheckingId(id);
    try {
      const { data, error } = await supabase.rpc("check_car_availability", {
        p_car_id: id,
        p_start_date: pickupDate,
        p_end_date: returnDate,
      } as any);
      if (error) throw error;
      const res = data as { available: boolean } | null;
      if (!res?.available) {
        toast({
          title: "Automobilis ką tik tapo užimtas",
          description: "Prašome pasirinkti kitą automobilį arba pakeisti datas.",
          variant: "destructive",
        });
        retryAll();
        return;
      }
      const slug = getCarSlugFromId(id, language === "en" ? "en" : "lt");
      const base = language === "en" ? "/cars" : "/automobiliai";
      const qs = new URLSearchParams({
        pickup: pickupDate,
        return: returnDate,
        pickupTime,
        returnTime,
      });
      if (pickupLocation?.address) qs.set("deliveryAddress", pickupLocation.address);
      navigate(slug ? `${base}/${slug}?${qs.toString()}` : base);
    } catch {
      toast({
        title: "Nepavyko patikrinti užimtumo",
        description: "Bandykite dar kartą.",
        variant: "destructive",
      });
    } finally {
      setCheckingId(null);
    }
  };

  const feeCell = (fee: typeof deliveryFee) => {
    if (fee.status === "free") return "0 €";
    if (fee.status === "priced") return `${fee.amount} €`;
    if (fee.status === "quote") return c.quote;
    return `— ${c.notSelected}`;
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[hsl(210_20%_98%)] font-sans text-foreground">
      <SEOHead
        title="Laisvi automobiliai jūsų datoms | Carbonus"
        description="Peržiūrėkite laisvus automobilius pasirinktomis datomis. Nemokamas pristatymas Druskininkuose, skaidrios kainos."
        canonical="https://carbonus.lt/laisvi-automobiliai"
      />
      <Header />

      <main className="mx-auto max-w-[1320px] px-5 pb-16 pt-8 sm:px-6 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {c.back}
        </Link>

        <div className="mt-6">
          <SearchSummaryCard
            c={c}
            pickupMode={pickupMode}
            onPickupModeChange={setPickupMode}
            pickupDate={pickupDate}
            returnDate={returnDate}
            pickupTime={pickupTime}
            returnTime={returnTime}
            onPickupDateChange={setPickupDateKeepingDuration}
            onReturnDateChange={(v) => setDates({ returnDate: v })}
            onPickupTimeChange={(v) => setDates({ pickupTime: v })}
            onReturnTimeChange={(v) => setDates({ returnTime: v })}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
        </div>

        {pickupMode === "office" ? (
          <div className="mt-6 flex flex-col gap-3 rounded-[18px] border border-black/[0.04] bg-white p-5 shadow-[0_14px_38px_rgba(16,24,40,0.06)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--carbonus-green)/0.10)]">
                <MapPin className="h-5 w-5 text-carbonus-green-dark" />
              </span>
              <div>
                <p className="text-[15px] font-bold text-foreground">{c.officeTitle}</p>
                <p className="text-[13px] text-muted-foreground">{c.officeAddress}</p>
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-[15px] font-extrabold text-carbonus-green">
              <Check className="h-5 w-5" />
              {c.free}
            </p>
          </div>
        ) : (
          <div className="mt-10">
            <DeliveryConfigurator
              c={c}
              pickupMode={pickupMode}
              pickupLocation={pickupLocation}
              onPickupLocationChange={setPickupLocation}
              returnMode={returnMode}
              onReturnModeChange={setReturnMode}
              returnLocation={returnLocation}
              onReturnLocationChange={setReturnLocation}
              pickupError={pickupError}
              returnError={returnError}
            />

            <div className="mt-5">
              <LogisticsSummary
                c={c}
                delivery={deliveryFee}
                collection={collectionFee}
                total={logisticsTotal}
                deliveryTarget={deliveryTarget}
                collectionTarget={collectionTarget}
              />
            </div>
          </div>
        )}

        {/* Cars */}
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-foreground sm:text-[28px]">
                {c.carsHeading}
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {pickupDate} {pickupTime} – {returnDate} {returnTime} · {rentalDays} {daysLabel}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-border bg-white px-4 text-[14px] font-semibold text-foreground transition-colors hover:border-carbonus-green"
                  >
                    <SlidersHorizontal className="h-4 w-4 text-carbonus-green-dark" />
                    {c.filters}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="z-[80] w-[260px] p-4" align="end">
                  <p className="text-[13px] font-semibold text-foreground">{c.filtersTransmission}</p>
                  <div className="mt-2 space-y-2">
                    {["Automatinė", "Mechaninė"].map((v) => (
                      <label key={v} className="flex items-center gap-2 text-[14px] text-foreground">
                        <Checkbox
                          checked={fTransmission.has(v)}
                          onCheckedChange={() => toggle(setFTransmission, fTransmission, v)}
                        />
                        {specLabel(v)}
                      </label>
                    ))}
                  </div>
                  <p className="mt-4 text-[13px] font-semibold text-foreground">{c.filtersFuel}</p>
                  <div className="mt-2 space-y-2">
                    {["Benzinas", "Dyzelinas"].map((v) => (
                      <label key={v} className="flex items-center gap-2 text-[14px] text-foreground">
                        <Checkbox checked={fFuel.has(v)} onCheckedChange={() => toggle(setFFuel, fFuel, v)} />
                        {specLabel(v)}
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFTransmission(new Set());
                      setFFuel(new Set());
                    }}
                    className="mt-4 text-[13px] font-semibold text-carbonus-green-dark hover:underline"
                  >
                    {c.clearFilters}
                  </button>
                </PopoverContent>
              </Popover>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="min-h-[44px] w-[220px] rounded-xl border-border bg-white text-[14px] font-medium">
                  <span className="mr-1 text-muted-foreground">{c.sortBy}</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[80]">
                  <SelectItem value="recommended">{c.sortRecommended}</SelectItem>
                  <SelectItem value="price-asc">{c.sortPriceAsc}</SelectItem>
                  <SelectItem value="price-desc">{c.sortPriceDesc}</SelectItem>
                  <SelectItem value="rating">{c.sortRating}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {pickupMode !== "office" && !logisticsKnown && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300/70 bg-amber-50 p-3 text-[13px] text-amber-900">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              {logisticsTotal.status === "quote" ? c.quoteNote : c.warning}
            </div>
          )}

          {isQueryError ? (
            <div className="mt-6 rounded-[18px] border border-destructive/40 bg-white p-10 text-center">
              <p className="text-[16px] font-semibold text-destructive">{c.error}</p>
              <p className="mt-2 text-[13px] text-muted-foreground">{c.errorSub}</p>
              <button
                onClick={retryAll}
                className="mt-4 rounded-xl border border-border px-5 py-2.5 text-[14px] font-semibold"
              >
                {c.retry}
              </button>
            </div>
          ) : isQueryLoading ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-[20px] border border-black/[0.04] bg-white p-3">
                  <div className="aspect-[3/2] animate-pulse rounded-[15px] bg-muted" />
                  <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="mt-6 h-11 w-full animate-pulse rounded-xl bg-muted" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-6 rounded-[18px] border border-border bg-white p-10 text-center">
              <p className="text-[16px] font-semibold text-foreground">{c.noCars}</p>
              <p className="mt-2 text-[13px] text-muted-foreground">{c.noCarsSub}</p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {filtered.slice(0, visibleCount).map(({ car, daily }) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    price={daily != null ? `${daily} €` : "—"}
                    priceFrom={c.from}
                    pricePerDay={c.perDay}
                    categoryLabel={catLabel(car.category)}
                    transmissionLabel={specLabel(car.transmission)}
                    fuelLabel={specLabel(car.fuel)}
                    imageLoaded={loadedImages.has(car.id)}
                    onImageLoad={() => setLoadedImages((prev) => new Set(prev).add(car.id))}
                    cta={
                      <button
                        type="button"
                        onClick={() => openCar(car.id)}
                        disabled={checkingId === car.id}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--carbonus-green-dark))] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_10px_22px_hsl(var(--carbonus-green)/0.18)] transition-colors hover:bg-[hsl(var(--carbonus-green-deep))] disabled:opacity-60"
                      >
                        {checkingId === car.id ? c.checking : c.viewCar}
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    }
                  />
                ))}
              </div>

              {visibleCount < filtered.length && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => v + 4)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[hsl(var(--carbonus-green-dark))] bg-white px-8 py-3 text-[15px] font-bold text-[hsl(var(--carbonus-green-dark))] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[hsl(var(--carbonus-green-dark))] hover:text-white"
                  >
                    {c.showMore}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <div className="mt-12">
          <TrustStrip c={c} />
        </div>
      </main>

      <V3Footer />
    </div>
  );
};

export default AvailableCars;
