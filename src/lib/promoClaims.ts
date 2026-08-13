import { supabase } from "@/integrations/supabase/client";

export const REVIEW_PROMO_CODE = "ACIU10";

export type PromoClaimAction = "revealed" | "google_click" | "feedback_sent";

interface LogPromoClaimInput {
  action: PromoClaimAction;
  rating?: number | null;
  name?: string;
  email?: string;
  phone?: string;
  language?: string;
}

/**
 * Logs a discount-code interaction from the /atsiliepimas page.
 * Fire-and-forget: never blocks or breaks the UI.
 */
export const logPromoClaim = async ({
  action,
  rating,
  name,
  email,
  phone,
  language = "lt",
}: LogPromoClaimInput): Promise<void> => {
  try {
    const { error } = await supabase.from("promo_code_claims").insert({
      code: REVIEW_PROMO_CODE,
      source: "review_page",
      action,
      rating: rating && rating >= 1 && rating <= 5 ? rating : null,
      name: name?.trim().slice(0, 120) || null,
      email: email?.trim().slice(0, 200) || null,
      phone: phone?.trim().slice(0, 40) || null,
      language,
    });
    if (error) console.warn("promo claim log failed", error.message);
  } catch (err) {
    console.warn("promo claim log failed", err);
  }
};
