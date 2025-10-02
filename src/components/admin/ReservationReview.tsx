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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  fuel_level_pickup?: string;
  fuel_level_return?: string;
  condition_pickup?: string;
  condition_return?: string;
  return_notes?: string;
  returned_at?: string;
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
  
  const [signature, setSignature] = useState<ContractSignature | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cars, setCars] = useState<any[]>([]);
  
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    start_date: '',
    end_date: '',
    status: '',
    car_id: '',
    car_name: '',
  });

  const [returnInspection, setReturnInspection] = useState({
    fuel_level_pickup: '',
    fuel_level_return: '',
    condition_pickup: '',
    condition_return: '',
    return_notes: '',
  });

  useEffect(() => {
    if (reservation) {
      setEditForm({
        first_name: reservation.customers.first_name,
        last_name: reservation.customers.last_name,
        email: reservation.customers.email,
        phone: reservation.customers.phone,
        start_date: reservation.start_date,
        end_date: reservation.end_date,
        status: reservation.status,
        car_id: reservation.car_id,
        car_name: reservation.car_name,
      });
      setReturnInspection({
        fuel_level_pickup: reservation.fuel_level_pickup || '',
        fuel_level_return: reservation.fuel_level_return || '',
        condition_pickup: reservation.condition_pickup || '',
        condition_return: reservation.condition_return || '',
        return_notes: reservation.return_notes || '',
      });
      fetchSignature();
      fetchCars();
    }
  }, [reservation]);

  const fetchCars = async () => {
    try {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('name');

      if (error) throw error;
      setCars(data || []);
    } catch (error: any) {
      console.error('Error fetching cars:', error);
    }
  };

  const handleSaveChanges = async () => {
    if (!reservation) return;
    
    setIsLoading(true);
    try {
      // Update customer information
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          first_name: editForm.first_name.trim(),
          last_name: editForm.last_name.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim(),
        })
        .eq('id', reservation.customers.id);

      if (customerError) throw customerError;

      // Calculate rental days
      const startDate = new Date(editForm.start_date);
      const endDate = new Date(editForm.end_date);
      const rentalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Update reservation information
      const { error: reservationError } = await supabase
        .from('reservations')
        .update({
          start_date: editForm.start_date,
          end_date: editForm.end_date,
          rental_days: rentalDays,
          status: editForm.status,
          car_id: editForm.car_id,
          car_name: editForm.car_name,
        })
        .eq('id', reservation.id);

      if (reservationError) throw reservationError;

      toast({
        title: "Sėkmingai atnaujinta",
        description: "Rezervacijos informacija buvo atnaujinta.",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko atnaujinti: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleDepositAction = async (action: 'release' | 'capture-partial' | 'capture-full', amount?: number) => {
    if (!reservation) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-deposit', {
        body: {
          reservationId: reservation.id,
          action,
          amount
        }
      });

      if (error) throw error;

      toast({
        title: "Sėkmė",
        description: `Užstatas ${action === 'release' ? 'paleistas' : 'nuskaitytas'}`,
      });
      
      onUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: "Nepavyko atlikti operacijos: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  const handleSavePickupInfo = async () => {
    if (!reservation) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          fuel_level_pickup: returnInspection.fuel_level_pickup,
          condition_pickup: returnInspection.condition_pickup,
        })
        .eq('id', reservation.id);

      if (error) throw error;

      toast({
        title: "Išsaugota",
        description: "Paėmimo informacija sėkmingai išsaugota",
      });
      
      onUpdate();
    } catch (error: any) {
      console.error('Error saving pickup info:', error);
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko išsaugoti paėmimo informacijos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsReturned = async () => {
    if (!reservation) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          fuel_level_return: returnInspection.fuel_level_return,
          condition_return: returnInspection.condition_return,
          return_notes: returnInspection.return_notes,
          returned_at: new Date().toISOString(),
          status: 'completed',
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
          status: 'completed',
        },
      });

      toast({
        title: "Automobilis grąžintas",
        description: "Grąžinimo informacija išsaugota ir klientui išsiųstas patvirtinimas",
      });
      
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error marking as returned:', error);
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko pažymėti automobilio kaip grąžinto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle className="text-lg">Kliento duomenys</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vardas</Label>
                  <Input
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pavardė</Label>
                  <Input
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>El. paštas</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefonas</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
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
              <div className="space-y-2">
                <Label>Statusas</Label>
                <Select 
                  value={editForm.status} 
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested">Prašoma</SelectItem>
                    <SelectItem value="confirmed">Patvirtinta</SelectItem>
                    <SelectItem value="paid">Apmokėta</SelectItem>
                    <SelectItem value="denied">Atmesta</SelectItem>
                    <SelectItem value="cancelled">Atšaukta</SelectItem>
                    <SelectItem value="completed">Baigta</SelectItem>
                    <SelectItem value="pending">Laukiama</SelectItem>
                    <SelectItem value="awaiting_payment">Laukiama apmokėjimo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Automobilis</Label>
                <Select 
                  value={editForm.car_id} 
                  onValueChange={(value) => {
                    const selectedCar = cars.find(c => c.id === value);
                    setEditForm({ 
                      ...editForm, 
                      car_id: value,
                      car_name: selectedCar?.name || ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={editForm.car_name} />
                  </SelectTrigger>
                  <SelectContent>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pradžios data</Label>
                  <Input
                    type="date"
                    value={editForm.start_date}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pabaigos data</Label>
                  <Input
                    type="date"
                    value={editForm.end_date}
                    onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                  />
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
              <Button onClick={handleSaveChanges} disabled={isLoading} className="w-full">
                {isLoading ? "Išsaugoma..." : "Išsaugoti pakeitimus"}
              </Button>
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
        {reservation.status === 'confirmed' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle className="text-lg">Užstato valdymas</CardTitle>
              </div>
              <CardDescription>
                Valdykite užstato pre-autorizaciją po automobilio grąžinimo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => handleDepositAction('release')} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Paleisti užstatą (be žalos)
              </Button>
              <Button 
                onClick={() => {
                  const amount = prompt('Įveskite sumą (€):');
                  if (amount) handleDepositAction('capture-partial', parseFloat(amount));
                }}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                Nuskaityti dalinai (žala/valymas)
              </Button>
              <Button 
                onClick={() => handleDepositAction('capture-full')}
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                Nuskaityti visą užstatą
              </Button>
            </CardContent>
          </Card>
        )}
        
        {(reservation.status === 'pending') && (
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

        {/* Return Inspection Section */}
        {(reservation.status === 'confirmed' || reservation.status === 'completed') && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  <CardTitle className="text-lg">Grąžinimo patikrinimas</CardTitle>
                </div>
                {reservation.returned_at && (
                  <Badge variant="outline" className="bg-green-50">
                    Grąžinta {format(new Date(reservation.returned_at), 'yyyy-MM-dd HH:mm')}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pickup Information */}
                <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                  <h4 className="font-medium text-sm">Paėmimo metu</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fuel_level_pickup">Kuro lygis</Label>
                    <Select
                      value={returnInspection.fuel_level_pickup}
                      onValueChange={(value) =>
                        setReturnInspection({ ...returnInspection, fuel_level_pickup: value })
                      }
                      disabled={!!reservation.returned_at}
                    >
                      <SelectTrigger id="fuel_level_pickup">
                        <SelectValue placeholder="Pasirinkite kuro lygį" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full">Pilnas</SelectItem>
                        <SelectItem value="3/4">3/4</SelectItem>
                        <SelectItem value="1/2">1/2</SelectItem>
                        <SelectItem value="1/4">1/4</SelectItem>
                        <SelectItem value="Empty">Tuščias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition_pickup">Automobilio būklė</Label>
                    <Textarea
                      id="condition_pickup"
                      placeholder="Pastabos apie automobilio būklę paėmimo metu..."
                      value={returnInspection.condition_pickup}
                      onChange={(e) =>
                        setReturnInspection({ ...returnInspection, condition_pickup: e.target.value })
                      }
                      disabled={!!reservation.returned_at}
                      rows={3}
                    />
                  </div>

                  {!reservation.returned_at && (
                    <Button
                      onClick={handleSavePickupInfo}
                      disabled={isLoading || !returnInspection.fuel_level_pickup}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {isLoading ? "Išsaugoma..." : "Išsaugoti paėmimo informaciją"}
                    </Button>
                  )}
                </div>

                {/* Return Information */}
                <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                  <h4 className="font-medium text-sm">Grąžinimo metu</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fuel_level_return">Kuro lygis</Label>
                    <Select
                      value={returnInspection.fuel_level_return}
                      onValueChange={(value) =>
                        setReturnInspection({ ...returnInspection, fuel_level_return: value })
                      }
                      disabled={!!reservation.returned_at}
                    >
                      <SelectTrigger id="fuel_level_return">
                        <SelectValue placeholder="Pasirinkite kuro lygį" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full">Pilnas</SelectItem>
                        <SelectItem value="3/4">3/4</SelectItem>
                        <SelectItem value="1/2">1/2</SelectItem>
                        <SelectItem value="1/4">1/4</SelectItem>
                        <SelectItem value="Empty">Tuščias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition_return">Automobilio būklė</Label>
                    <Textarea
                      id="condition_return"
                      placeholder="Pastabos apie automobilio būklę grąžinimo metu..."
                      value={returnInspection.condition_return}
                      onChange={(e) =>
                        setReturnInspection({ ...returnInspection, condition_return: e.target.value })
                      }
                      disabled={!!reservation.returned_at}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* General Return Notes */}
              <div className="space-y-2">
                <Label htmlFor="return_notes">Bendros pastabos apie grąžinimą</Label>
                <Textarea
                  id="return_notes"
                  placeholder="Bendros pastabos, problemos, papildoma informacija..."
                  value={returnInspection.return_notes}
                  onChange={(e) =>
                    setReturnInspection({ ...returnInspection, return_notes: e.target.value })
                  }
                  disabled={!!reservation.returned_at}
                  rows={3}
                />
              </div>

              {/* Mark as Returned Button */}
              {!reservation.returned_at && (
                <Button
                  onClick={handleMarkAsReturned}
                  disabled={isLoading || !returnInspection.fuel_level_return}
                  className="w-full"
                >
                  {isLoading ? "Išsaugoma..." : "Pažymėti kaip grąžintą"}
                </Button>
              )}
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