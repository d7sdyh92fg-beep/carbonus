import { useSignedLicenseUrl } from "@/hooks/use-signed-url";

interface SignedLicenseImageProps {
  path?: string | null;
  alt: string;
  className?: string;
}

/**
 * Renders a driver-license image from the private storage bucket
 * through a short-lived signed URL.
 */
export function SignedLicenseImage({ path, alt, className }: SignedLicenseImageProps) {
  const url = useSignedLicenseUrl(path);

  if (!url) {
    return (
      <div className={`bg-muted animate-pulse rounded-lg border ${className ?? ""}`} />
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <img
        src={url}
        alt={alt}
        className={className}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </a>
  );
}
