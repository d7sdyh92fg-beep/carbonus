import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, Upload, X, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DriverLicenseUploadProps {
  onUpload: (url: string) => void;
  uploadedUrl?: string;
}

export function DriverLicenseUpload({ onUpload, uploadedUrl }: DriverLicenseUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Nepavyko pasiekti kameros. Naudokite failų įkėlimą.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            await uploadFile(blob);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file: Blob) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Failo dydis turi būti mažesnis nei 10MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
      const fileName = `driver_license_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('driver-licenses')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('driver-licenses')
        .getPublicUrl(data.path);

      setPreview(publicUrl);
      onUpload(publicUrl);
      toast.success('Vairuotojo pažymėjimas sėkmingai įkeltas!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Nepavyko įkelti vairuotojo pažymėjimo. Bandykite dar kartą.');
    } finally {
      setUploading(false);
    }
  };

  const removeUpload = () => {
    setPreview(null);
    onUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentImageUrl = uploadedUrl || preview;

  return (
    <div className="space-y-6">
      {/* Camera Section */}
      {cameraActive && (
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded-lg"
                autoPlay
                playsInline
              />
              <div className="flex justify-center gap-4 mt-6">
                <Button onClick={capturePhoto} disabled={uploading} size="lg">
                  {uploading ? 'Įkeliama...' : 'Fotografuoti'}
                </Button>
                <Button variant="outline" onClick={stopCamera} size="lg">
                  Atšaukti
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Options */}
      {!cameraActive && !currentImageUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button
            variant="outline"
            onClick={startCamera}
            className="h-32 flex flex-col gap-3 text-base"
            disabled={uploading}
          >
            <Camera className="h-8 w-8" />
            Fotografuoti
          </Button>
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-32 flex flex-col gap-3 text-base"
            disabled={uploading}
          >
            <Upload className="h-8 w-8" />
            {uploading ? 'Įkeliama...' : 'Įkelti failą'}
          </Button>
        </div>
      )}

      {/* Preview Section */}
      {currentImageUrl && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-medium">Vairuotojo pažymėjimas įkeltas</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={removeUpload}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center border-2">
              <img
                src={currentImageUrl}
                alt="Vairuotojo pažymėjimas"
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl bg-background border">
          <DialogHeader>
            <DialogTitle>Vairuotojo pažymėjimo peržiūra</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={currentImageUrl}
              alt="Vairuotojo pažymėjimo peržiūra"
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}