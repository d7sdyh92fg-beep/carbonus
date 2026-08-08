import { LocationSearchInput } from "./LocationSearchInput";
import { DeliveryMap } from "./DeliveryMap";
import { SearchCopy } from "./searchCopy";
import { CARBONUS_OFFICE, PlaceLocation } from "@/lib/logisticsPricing";
import { PickupMode, ReturnMode } from "@/hooks/use-search-state";
import { cn } from "@/lib/utils";

interface Props {
  c: SearchCopy;
  pickupMode: Exclude<PickupMode, "office">;
  pickupLocation: PlaceLocation | null;
  onPickupLocationChange: (l: PlaceLocation | null) => void;
  returnMode: ReturnMode;
  onReturnModeChange: (m: ReturnMode) => void;
  returnLocation: PlaceLocation | null;
  onReturnLocationChange: (l: PlaceLocation | null) => void;
  pickupError: string | null;
  returnError: string | null;
}

export function DeliveryConfigurator({
  c,
  pickupMode,
  pickupLocation,
  onPickupLocationChange,
  returnMode,
  onReturnModeChange,
  returnLocation,
  onReturnLocationChange,
  pickupError,
  returnError,
}: Props) {
  const isDruskininkai = pickupMode === "druskininkai";

  const markers = [
    { location: CARBONUS_OFFICE as PlaceLocation, label: c.markerOffice, variant: "office" as const },
    ...(pickupLocation?.lat != null
      ? [{ location: pickupLocation, label: c.markerDelivery, variant: "delivery" as const }]
      : []),
    ...(returnMode === "different" && returnLocation?.lat != null
      ? [{ location: returnLocation, label: c.markerCollection, variant: "collection" as const }]
      : []),
  ];

  const options: { value: ReturnMode; title: string; desc: string }[] = [
    { value: "same", title: c.returnSame, desc: c.returnSameDesc },
    { value: "office", title: c.returnOffice, desc: c.returnOfficeDesc },
    { value: "different", title: c.returnOther, desc: c.returnOtherDesc },
  ];

  return (
    <section>
      <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-foreground sm:text-[28px]">
        {c.deliveryHeading}
      </h2>
      <p className="mt-2 max-w-[720px] text-[14px] leading-relaxed text-muted-foreground">
        {isDruskininkai ? c.deliverySubDruskininkai : c.deliverySubOther}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-5 rounded-[18px] border border-black/[0.04] bg-white p-5 shadow-[0_14px_38px_rgba(16,24,40,0.08)] lg:grid-cols-[45fr_55fr] lg:gap-6">
        <div>
          <LocationSearchInput
            label={c.deliveryLocation}
            placeholder={isDruskininkai ? c.placeholderDruskininkai : c.placeholderOther}
            value={pickupLocation}
            onChange={onPickupLocationChange}
            restrictToDruskininkai={isDruskininkai}
            error={pickupError}
            freeDeliveryLabel={isDruskininkai ? c.freeDelivery : undefined}
            noResultsLabel={c.noResults}
            clearLabel={c.clear}
          />

          <div className="mt-6">
            <p className="text-[15px] font-bold text-foreground">{c.returnHeading}</p>
            <div className="mt-3 space-y-2">
              {options.map((o) => (
                <label
                  key={o.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                    returnMode === o.value
                      ? "border-carbonus-green bg-[hsl(var(--carbonus-green)/0.06)]"
                      : "border-border hover:border-carbonus-green/50",
                  )}
                >
                  <input
                    type="radio"
                    name="return-mode"
                    checked={returnMode === o.value}
                    onChange={() => onReturnModeChange(o.value)}
                    className="mt-1 h-4 w-4 accent-[hsl(var(--carbonus-green-dark))]"
                  />
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-foreground">{o.title}</span>
                    <span className="block text-[13px] text-muted-foreground">{o.desc}</span>
                  </span>
                </label>
              ))}
            </div>

            {returnMode === "different" && (
              <div className="mt-4">
                <LocationSearchInput
                  label={c.collectionLocation}
                  placeholder={isDruskininkai ? c.placeholderDruskininkai : c.placeholderOther}
                  value={returnLocation}
                  onChange={onReturnLocationChange}
                  restrictToDruskininkai={isDruskininkai}
                  error={returnError}
                  freeDeliveryLabel={isDruskininkai ? c.freeDelivery : undefined}
                  noResultsLabel={c.noResults}
                  clearLabel={c.clear}
                />
              </div>
            )}
          </div>
        </div>

        <DeliveryMap markers={markers} hint={c.mapHint} unavailableLabel={c.mapUnavailable} />
      </div>
    </section>
  );
}
