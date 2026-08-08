import { Check, Loader2 } from "lucide-react";
import { FeeResult } from "@/lib/logisticsPricing";
import { SearchCopy } from "./searchCopy";

interface Props {
  c: SearchCopy;
  delivery: FeeResult;
  collection: FeeResult;
  total: FeeResult;
  deliveryTarget: string;
  collectionTarget: string;
  loading?: boolean;
}

const feeText = (fee: FeeResult, c: SearchCopy) => {
  if (fee.status === "free") return "0 €";
  if (fee.status === "priced") return `${fee.amount} €`;
  if (fee.status === "quote") return c.quote;
  return "—";
};

export function LogisticsSummary({
  c,
  delivery,
  collection,
  total,
  deliveryTarget,
  collectionTarget,
  loading,
}: Props) {
  return (
    <div className="grid grid-cols-1 divide-y divide-border rounded-[18px] border border-black/[0.04] bg-white p-5 shadow-[0_14px_38px_rgba(16,24,40,0.08)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <Column
        label={c.logisticsDelivery}
        sub={deliveryTarget}
        value={loading ? c.calculating : feeText(delivery, c)}
        loading={loading}
      />
      <Column
        label={c.logisticsCollection}
        sub={collectionTarget}
        value={loading ? c.calculating : feeText(collection, c)}
        loading={loading}
        inset
      />
      <div className="pt-4 sm:pl-6 sm:pt-0">
        <p className="text-[13px] font-semibold text-foreground">{c.logisticsTotal}</p>
        {total.status === "free" ? (
          <p className="mt-1 flex items-center gap-1.5 text-[20px] font-extrabold text-carbonus-green">
            <Check className="h-5 w-5" />
            {c.freeUpper}
          </p>
        ) : (
          <p className="mt-1 text-[20px] font-extrabold text-foreground">{feeText(total, c)}</p>
        )}
        <p className="mt-0.5 text-[12px] text-muted-foreground">
          {total.status === "quote" ? c.quoteNote : total.status === "unknown" ? c.warning : "0 €".replace("0 €", feeText(total, c))}
        </p>
      </div>
    </div>
  );
}

function Column({
  label,
  sub,
  value,
  loading,
  inset,
}: {
  label: string;
  sub: string;
  value: string;
  loading?: boolean;
  inset?: boolean;
}) {
  return (
    <div className={inset ? "py-4 sm:px-6 sm:py-0" : "pb-4 sm:pb-0 sm:pr-6"}>
      <p className="text-[13px] font-semibold text-foreground">{label}</p>
      <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{sub}</p>
      <p className="mt-1 flex items-center gap-2 text-[20px] font-extrabold text-carbonus-green">
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <span className={loading ? "text-[13px] font-medium text-muted-foreground" : ""}>{value}</span>
      </p>
    </div>
  );
}
