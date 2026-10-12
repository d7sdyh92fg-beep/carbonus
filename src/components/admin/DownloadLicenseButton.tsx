import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { extractStoragePath, getDriverLicenseSignedUrl } from '@/lib/storageUrls';

export function DownloadLicenseButton({ path }: { path?: string | null }) {
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    if (!path || downloading) return;
    setDownloading(true);
    let objectUrl: string | undefined;
    try {
      const url = await getDriverLicenseSignedUrl(path);
      if (!url) throw new Error('Nepavyko gauti nuotraukos atsisiuntimo nuorodos.');
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Nepavyko atsisiųsti nuotraukos (${response.status}).`);
      const blob = await response.blob();
      objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = extractStoragePath(path).split('/').pop() || 'vairuotojo-pazymejimas.jpg';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Nepavyko atsisiųsti nuotraukos.');
    } finally {
      if (objectUrl) {
        const completedUrl = objectUrl;
        window.setTimeout(() => URL.revokeObjectURL(completedUrl), 60_000);
      }
      setDownloading(false);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" disabled={!path || downloading} onClick={download}
      title="Atsisiųsti originalią pažymėjimo nuotrauką" aria-label="Atsisiųsti originalią pažymėjimo nuotrauką">
      {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {downloading ? 'Siunčiama...' : 'Atsisiųsti originalą'}
    </Button>
  );
}