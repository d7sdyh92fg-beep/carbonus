import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Pen } from 'lucide-react';
import { toast } from 'sonner';
interface DigitalSignatureProps {
  onSign: (signatureData: string) => void;
  customerName: string;
}

export function DigitalSignature({ onSign, customerName }: DigitalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setContext(ctx);
        
        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2; // High DPI
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);
        
        // Set drawing style
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!context) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    
    event.preventDefault();
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    context.lineTo(x, y);
    context.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!context) return;
    
    const canvas = canvasRef.current!;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setTypedSignature('');
  };

  const saveSignature = () => {
    if (mode === 'type') {
      const text = typedSignature.trim();
      if (!text) {
        toast.error('Įveskite parašą (tekstu) arba pasirašykite piešimo laukelyje');
        return;
      }
      const tmp = document.createElement('canvas');
      const width = 600, height = 180;
      tmp.width = width; tmp.height = height;
      const ctx = tmp.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#000000';
      ctx.font = '36px cursive';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(text, width / 2, height / 2);
      const signatureData = tmp.toDataURL('image/png');
      onSign(signatureData);
      return;
    }
    if (!hasSignature) {
      toast.error('Prašome pasirašyti');
      return;
    }
    const canvas = canvasRef.current!;
    const signatureData = canvas.toDataURL('image/png');
    onSign(signatureData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Pen className="h-5 w-5" />
          Reikalingas skaitmeninis parašas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-base text-muted-foreground">
          Pasirašydamas(-a) žemiau, {customerName} sutinka su nuomos taisyklėmis ir sąlygomis.
        </div>
        
        <Separator />
        
        <div className="flex items-center gap-2">
          <Button variant={mode === 'draw' ? 'default' : 'outline'} size="sm" onClick={() => setMode('draw')}>Piešti</Button>
          <Button variant={mode === 'type' ? 'default' : 'outline'} size="sm" onClick={() => setMode('type')}>Įvesti</Button>
        </div>
        
        {mode === 'draw' ? (
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-48 border-2 border-dashed border-muted-foreground rounded-lg cursor-crosshair bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-muted-foreground text-base">
                  Pasirašykite čia pirštu ar rašikliu
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <Label>Įveskite parašą (tekstu)</Label>
            <Input
              value={typedSignature}
              onChange={(e) => setTypedSignature(e.target.value)}
              placeholder="Vardas Pavardė"
              className="h-12 text-base"
            />
            <div className="p-4 border rounded bg-white">
              <div className="text-2xl italic">{typedSignature || 'Parašo peržiūra'}</div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Klientas: {customerName}
          </div>
          <div className="text-sm text-muted-foreground">
            Data: {new Date().toLocaleDateString('lt-LT')}
          </div>
        </div>
        
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature}
            className="flex-1"
            size="lg"
          >
            <X className="h-4 w-4 mr-2" />
            Išvalyti
          </Button>
          <Button
            onClick={saveSignature}
            disabled={mode === 'draw' ? !hasSignature : typedSignature.trim().length === 0}
            className="flex-1"
            size="lg"
          >
            Patvirtinti parašą
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}