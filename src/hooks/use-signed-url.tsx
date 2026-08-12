import { useEffect, useState } from "react";
import { getDriverLicenseSignedUrl } from "@/lib/storageUrls";

/**
 * Resolves a driver-license storage path (or legacy public URL) into a
 * short-lived signed URL, because the bucket is private.
 */
export function useSignedLicenseUrl(urlOrPath?: string | null) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!urlOrPath) {
      setSignedUrl(null);
      return;
    }

    // data: URLs (local previews) need no signing
    if (urlOrPath.startsWith("data:") || urlOrPath.startsWith("blob:")) {
      setSignedUrl(urlOrPath);
      return;
    }

    getDriverLicenseSignedUrl(urlOrPath).then((url) => {
      if (active) setSignedUrl(url);
    });

    return () => {
      active = false;
    };
  }, [urlOrPath]);

  return signedUrl;
}
