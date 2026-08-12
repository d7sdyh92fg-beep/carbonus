import { supabase } from "@/integrations/supabase/client";

/**
 * Driver license images live in a PRIVATE storage bucket.
 * Historical records store full public URLs, newer ones may store plain paths.
 * This helper normalises both into a short-lived signed URL.
 */
const BUCKET = "driver-licenses";

export function extractStoragePath(urlOrPath: string): string {
  if (!urlOrPath) return "";
  const marker = `/${BUCKET}/`;
  const idx = urlOrPath.indexOf(marker);
  if (idx === -1) return urlOrPath.replace(/^\/+/, "");
  return urlOrPath.slice(idx + marker.length).split("?")[0];
}

export async function getDriverLicenseSignedUrl(
  urlOrPath?: string | null,
  expiresIn = 300
): Promise<string | null> {
  if (!urlOrPath) return null;
  const path = extractStoragePath(urlOrPath);
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error("Failed to sign driver license URL:", error);
    return null;
  }
  return data?.signedUrl ?? null;
}
