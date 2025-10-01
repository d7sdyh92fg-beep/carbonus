import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PricingOverrideModalProps {
  reservation: {
    id: string;
    car_name: string;
    rental_days: number;
    daily_rate: number;
    total_rental_cost: number;
    deposit_amount: number;
    total_amount: number;
    custom_rental_price?: number;
    custom_deposit_amount?: number;
    pricing_notes?: string;
    customers: {
      first_name: string;
      last_name: string;
      email: string;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const PricingOverrideModal: React.FC<PricingOverrideModalProps> = ({
  reservation,
  isOpen,
  onClose,
  onUpdate
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customRentalPrice, setCustomRentalPrice] = useState<string>('');
  const [customDeposit, setCustomDeposit] = useState<string>('');
  const [pricingNotes, setPricingNotes] = useState('');

  useEffect(() => {
    if (reservation) {
      setCustomRentalPrice(
        reservation.custom_rental_price?.toString() || 
        reservation.total_rental_cost?.toString() || 
        ''
      );
      setCustomDeposit(
        reservation.custom_deposit_amount?.toString() || 
        reservation.deposit_amount?.toString() || 
        '200'
      );
      setPricingNotes(reservation.pricing_notes || '');
    }
  }, [reservation]);

  if (!reservation) return null;

  const originalRentalCost = reservation.total_rental_cost;
  const originalDeposit = reservation.deposit_amount;
  const newRentalPrice = parseFloat(customRentalPrice) || 0;
  const newDeposit = parseFloat(customDeposit) || 0;
  const newTotalAmount = newRentalPrice + newDeposit;

  const handleSave = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('reservations')
        .update({
          custom_rental_price: newRentalPrice,
          custom_deposit_amount: newDeposit,
          total_amount: newTotalAmount,
          pricing_notes: pricingNotes.trim() || null
        })
        .eq('id', reservation.id);

      if (error) throw error;

      toast({
        title: "Kainos atnaujintos",
        description: "Specialios rezervacijos kainos sėkmingai išsaugotos.",
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko atnaujinti kainų: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCustomRentalPrice(originalRentalCost.toString());
    setCustomDeposit(originalDeposit.toString());
    setPricingNotes('');
  };

  const isPriceChanged = 
    newRentalPrice !== originalRentalCost || 
    newDeposit !== originalDeposit;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Specialios kainos nustatymas
          </DialogTitle>
          <DialogDescription>
            Rezervacija: {reservation.car_name} • {reservation.customers.first_name} {reservation.customers.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Pricing Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Pradinės kainos</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Nuomos kaina:</span>
                <div className="font-semibold">
                  €{originalRentalCost.toFixed(2)} ({reservation.rental_days} d. × €{reservation.daily_rate})
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Užstatas:</span>
                <div className="font-semibold">€{originalDeposit.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Custom Pricing Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customRental">Individuali nuomos kaina (€)</Label>
              <Input
                id="customRental"
                type="number"
                step="0.01"
                value={customRentalPrice}
                onChange={(e) => setCustomRentalPrice(e.target.value)}
                placeholder={originalRentalCost.toString()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customDeposit">Individualus užstatas (€)</Label>
              <Input
                id="customDeposit"
                type="number"
                step="0.01"
                value={customDeposit}
                onChange={(e) => setCustomDeposit(e.target.value)}
                placeholder={originalDeposit.toString()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricingNotes">Kainos pastabos (pasirinktinai)</Label>
            <Textarea
              id="pricingNotes"
              value={pricingNotes}
              onChange={(e) => setPricingNotes(e.target.value)}
              placeholder="Pvz., 'Ilgalaikė nuoma -20%', 'Korporatyvinė kaina', 'Nuolaida reguliariam klientui'"
              rows={3}
            />
          </div>

          {/* Price Summary */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Nuomos kaina:</span>
                <span className="font-semibold">€{newRentalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Užstatas:</span>
                <span className="font-semibold">€{newDeposit.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Bendra suma:</span>
                <span className="text-primary">€{newTotalAmount.toFixed(2)}</span>
              </div>
              {isPriceChanged && (
                <div className="text-xs text-muted-foreground pt-1">
                  Skirtumas: {newTotalAmount > (originalRentalCost + originalDeposit) ? '+' : ''}
                  €{(newTotalAmount - (originalRentalCost + originalDeposit)).toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {isPriceChanged && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Specialios kainos bus pritaikytos šiai rezervacijai. Klientas matys naują sumą.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              Atstatyti
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Atšaukti
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Išsaugoma...' : 'Išsaugoti kainas'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
