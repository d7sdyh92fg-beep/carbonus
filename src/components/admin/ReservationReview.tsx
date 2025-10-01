import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Save, X, FileText, Image, User, Calendar, Car, CreditCard, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface Reservation {
  id: string;
  car_name: string;
  car_id: string;
  start_date: string;
  end_date: string;
  rental_days: number;
  total_amount: number;
  status: string;
  created_at: string;
  driver_license_url?: string;
  customers: Customer;
}

interface ContractSignature {
  id: string;
  signature_data: string;
  signed_by: string;
  signed_at: string;
}

interface ReservationReviewProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const ReservationReview: React.FC<ReservationReviewProps> = ({
  reservation,
  isOpen,
  onClose,
  onUpdate
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [signature, setSignature] = useState<ContractSignature | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (reservation) {
      setEditForm({
        first_name: reservation.customers.first_name,
        last_name: reservation.customers.last_name,
        email: reservation.customers.email,
        phone: reservation.customers.phone
      });
      fetchSignature();
    }
  }, [reservation]);

  const fetchSignature = async () => {
    if (!reservation) return;
    
    try {
      const { data, error } = await supabase
        .from('contract_signatures')
        .select('*')
        .eq('reservation_id', reservation.id)
        .maybeSingle();

      if (error) throw error;
      setSignature(data);
    } catch (error: any) {
      console.error('Error fetching signature:', error);
    }
  };

  const handleSaveChanges = async () => {
    if (!reservation) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          email: editForm.email,
          phone: editForm.phone
        })
        .eq('id', reservation.customers.id);

      if (error) throw error;

      toast({
        title: "Sėkmingai atnaujinta",
        description: "Kliento duomenys buvo atnaujinti."
      });

      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko atnaujinti kliento duomenų: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (reservation) {
      setEditForm({
        first_name: reservation.customers.first_name,
        last_name: reservation.customers.last_name,
        email: reservation.customers.email,
        phone: reservation.customers.phone
      });
    }
    setIsEditing(false);
  };

  const handleMarkAsPaid = async () => {
    if (!reservation) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'paid',
          payment_completed_at: new Date().toISOString(),
          payment_method: 'manual',
          payment_transaction_id: `MANUAL-${Date.now()}`
        })
        .eq('id', reservation.id);

      if (error) throw error;

      // Send status email
      await supabase.functions.invoke('send-status-email', {
        body: {
          reservationId: reservation.id,
          customerEmail: reservation.customers.email,
          customerName: `${reservation.customers.first_name} ${reservation.customers.last_name}`,
          carName: reservation.car_name,
          startDate: format(new Date(reservation.start_date), 'yyyy-MM-dd'),
          endDate: format(new Date(reservation.end_date), 'yyyy-MM-dd'),
          totalAmount: reservation.total_amount,
          status: 'paid'
        }
      });

      toast({
        title: "Sėkmingai pažymėta",
        description: "Rezervacija pažymėta kaip apmokėta. Klientui išsiųstas patvirtinimo laiškas."
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko pažymėti kaip apmokėta: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePaymentLink = async () => {
    if (!reservation) return;
    
    try {
      const paymentLink = `${window.location.origin}/payment/${reservation.id}`;
      await navigator.clipboard.writeText(paymentLink);
      
      toast({
        title: "Nuoroda nukopijuota",
        description: "Mokėjimo nuoroda nukopijuota į iškarpinę. Galite ją išsiųsti klientui."
      });
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko nukopijuoti nuorodos: " + error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      requested: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      denied: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      pending: 'bg-gray-100 text-gray-800 border-gray-300',
    } as const;

    const labels = {
      pending: 'Laukiama',
      confirmed: 'Patvirtinta',
      cancelled: 'Atšaukta',
      completed: 'Baigta',
      requested: 'Prašoma',
      paid: 'Apmokėta',
      denied: 'Atmesta',
    } as const;

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  if (!reservation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rezervacijos peržiūra
          </DialogTitle>
          <DialogDescription>
            Detali rezervacijos ir kliento informacija
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle className="text-lg">Kliento duomenys</CardTitle>
              </div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vardas</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{reservation.customers.first_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Pavardė</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium">{reservation.customers.last_name}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>El. paštas</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                ) : (
                  <p className="text-sm font-medium">{reservation.customers.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Telefonas</Label>
                {isEditing ? (
                  <Input
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                ) : (
                  <p className="text-sm font-medium">{reservation.customers.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reservation Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                <CardTitle className="text-lg">Rezervacijos duomenys</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Statusas</Label>
                {getStatusBadge(reservation.status)}
              </div>
              <div>
                <Label>Automobilis</Label>
                <p className="text-sm font-medium">{reservation.car_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pradžios data</Label>
                  <p className="text-sm font-medium">{format(new Date(reservation.start_date), 'yyyy-MM-dd')}</p>
                </div>
                <div>
                  <Label>Pabaigos data</Label>
                  <p className="text-sm font-medium">{format(new Date(reservation.end_date), 'yyyy-MM-dd')}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dienų skaičius</Label>
                  <p className="text-sm font-medium">{reservation.rental_days}</p>
                </div>
                <div>
                  <Label>Bendra suma</Label>
                  <p className="text-sm font-medium">€{reservation.total_amount}</p>
                </div>
              </div>
              <div>
                <Label>Sukurta</Label>
                <p className="text-sm font-medium">{format(new Date(reservation.created_at), 'yyyy-MM-dd HH:mm')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Driver License */}
          {reservation.driver_license_url && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  <CardTitle className="text-lg">Vairuotojo pažymėjimas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <img
                    src={reservation.driver_license_url}
                    alt="Vairuotojo pažymėjimas"
                    className="w-full max-w-md mx-auto rounded-lg border shadow-sm"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Digital Signature */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle className="text-lg">Skaitmeninis parašas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {signature ? (
                <div className="space-y-4">
                  <div className="w-full border rounded-lg p-4 bg-white">
                    <img
                      src={signature.signature_data}
                      alt="Skaitmeninis parašas"
                      className="max-w-full h-auto mx-auto"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Pasirašė:</strong> {signature.signed_by}</p>
                    <p><strong>Data:</strong> {format(new Date(signature.signed_at), 'yyyy-MM-dd HH:mm')}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Parašas nerastas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Actions */}
        {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle className="text-lg">Mokėjimo valdymas</CardTitle>
              </div>
              <CardDescription>
                Pažymėkite rezervaciją kaip apmokėtą arba sugeneruokite mokėjimo nuorodą
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleMarkAsPaid} 
                disabled={isLoading}
                className="w-full"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Pažymėti kaip apmokėtą
              </Button>
              <Button 
                onClick={handleGeneratePaymentLink} 
                variant="outline"
                className="w-full"
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Nukopijuoti mokėjimo nuorodą
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Uždaryti
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};