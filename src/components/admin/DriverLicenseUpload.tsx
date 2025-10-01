import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Upload, X, Eye, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { detectDevice, getCameraConstraints, getDeviceSpecificErrorMessage } from '@/lib/deviceDetection';
import { compressImage, convertHEICtoJPEG, shouldCompress } from '@/lib/imageProcessing';

interface DriverLicenseUploadProps {
  onUpload: (urls: { front?: string; back?: string }) => void;
  uploadedUrls?: { front?: string; back?: string };
}

export function DriverLicenseUpload({ onUpload, uploadedUrls }: DriverLicenseUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewSide, setPreviewSide] = useState<'front' | 'back'>('front');
  const [uploadingSide, setUploadingSide] = useState<'front' | 'back'>('front');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const isImage = file.type.startsWith('image/') || 
                    file.name.toLowerCase().endsWith('.heic') || 
                    file.name.toLowerCase().endsWith('.heif');
    
    if (!isImage) {
      toast.error('Prašome pasirinkti nuotrauką (JPG, PNG, HEIC)');
      return;
    }
    
    setProcessing(true);
    
    try {
      let processedFile: Blob = file;
      
      // Handle HEIC conversion
      if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        toast.info('Konvertuojama HEIC nuotrauka...');
        processedFile = await convertHEICtoJPEG(file);
      }
      
      // Compress if needed
      if (shouldCompress(processedFile, 3)) {
        toast.info('Optimizuojama nuotrauka...');
        processedFile = await compressImage(file, 3);
      }
      
      await uploadFile(processedFile, side);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Nepavyko apdoroti nuotraukos. Bandykite dar kartą.');
    } finally {
      setProcessing(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const uploadFile = async (file: Blob, side: 'front' | 'back') => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Failo dydis turi būti mažesnis nei 10MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
      const fileName = `driver_license_${side}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('driver-licenses')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('driver-licenses')
        .getPublicUrl(data.path);

      if (side === 'front') {
        setFrontPreview(publicUrl);
      } else {
        setBackPreview(publicUrl);
      }

      const currentUrls = uploadedUrls || {};
      const newUrls = { ...currentUrls, [side]: publicUrl };
      onUpload(newUrls);
      
      toast.success(`Vairuotojo pažymėjimo ${side === 'front' ? 'priekis' : 'galas'} sėkmingai įkeltas!`);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Nepavyko įkelti vairuotojo pažymėjimo. Bandykite dar kartą.');
    } finally {
      setUploading(false);
    }
  };

  const removeUpload = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontPreview(null);
    } else {
      setBackPreview(null);
    }
    
    const currentUrls = uploadedUrls || {};
    const newUrls = { ...currentUrls };
    delete newUrls[side];
    onUpload(newUrls);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const frontImageUrl = uploadedUrls?.front || frontPreview;
  const backImageUrl = uploadedUrls?.back || backPreview;

  return (
    <div className="space-y-6">
      {/* Upload Options - Front Side */}
      <div>
        <h3 className="text-lg font-medium mb-4">Pažymėjimo priekis</h3>
            {!frontImageUrl ? (
              <Button
                variant="outline"
                onClick={() => {
                  setUploadingSide('front');
                  fileInputRef.current?.click();
                }}
                className="h-32 flex flex-col gap-3 text-base w-full max-w-md"
                disabled={uploading || processing}
              >
                {(uploading || processing) && uploadingSide === 'front' ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin" />
                    {processing ? 'Apdorojama...' : 'Įkeliama...'}
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8" />
                    Įkelti priekio failą
                  </>
                )}
              </Button>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-medium">Priekis įkeltas</h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPreviewSide('front');
                          setShowPreview(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeUpload('front')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center border-2">
                    <img
                      src={frontImageUrl}
                      alt="Vairuotojo pažymėjimo priekis"
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Pažymėjimo galas</h3>
            {!backImageUrl ? (
              <Button
                variant="outline"
                onClick={() => {
                  setUploadingSide('back');
                  fileInputRef.current?.click();
                }}
                className="h-32 flex flex-col gap-3 text-base w-full max-w-md"
                disabled={uploading || processing}
              >
                {(uploading || processing) && uploadingSide === 'back' ? (
                  <>
                    <Loader2 className="h-8 w-8 animate-spin" />
                    {processing ? 'Apdorojama...' : 'Įkeliama...'}
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8" />
                    Įkelti galo failą
                  </>
                )}
              </Button>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-medium">Galas įkeltas</h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPreviewSide('back');
                          setShowPreview(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeUpload('back')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center border-2">
                    <img
                      src={backImageUrl}
                      alt="Vairuotojo pažymėjimo galas"
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,image/heic,image/heif"
        onChange={(e) => handleFileSelect(e, uploadingSide)}
        className="hidden"
      />

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl bg-background border">
          <DialogHeader>
            <DialogTitle>
              Vairuotojo pažymėjimo peržiūra - {previewSide === 'front' ? 'Priekis' : 'Galas'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={previewSide === 'front' ? frontImageUrl : backImageUrl}
              alt={`Vairuotojo pažymėjimo ${previewSide === 'front' ? 'priekis' : 'galas'}`}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}