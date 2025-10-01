import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ConfirmationDialog } from '@/components/ui/alert-confirmation-dialog';

interface DeletedReservation {
  id: string;
  car_id: string;
  car_name: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  deleted_at: string;
  customers: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const RecycleBin: React.FC = () => {
  const [deletedReservations, setDeletedReservations] = useState<DeletedReservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeletedReservations();
  }, []);

  const fetchDeletedReservations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email
          )
        `)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setDeletedReservations(data || []);
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: 'Nepavyko užkrauti ištrintų rezervacijų',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ 
          deleted_at: null,
          deleted_by: null 
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sėkmingai atkurta',
        description: 'Rezervacija atkurta',
      });

      fetchDeletedReservations();
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: 'Nepavyko atkurti rezervacijos: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const permanentlyDeleteReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Visam laikui ištrinta',
        description: 'Rezervacija visam laikui pašalinta',
      });

      fetchDeletedReservations();
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: 'Nepavyko ištrinti rezervacijos: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive',
      requested: 'outline',
      denied: 'destructive',
      paid: 'default',
    } as const;

    const labels = {
      pending: 'Laukiama',
      confirmed: 'Patvirtinta',
      cancelled: 'Atšaukta',
      requested: 'Prašoma',
      denied: 'Atmesta',
      paid: 'Apmokėta',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <>
      <ConfirmationDialog
        isOpen={!!confirmRestore}
        onClose={() => setConfirmRestore(null)}
        onConfirm={() => {
          if (confirmRestore) {
            restoreReservation(confirmRestore);
            setConfirmRestore(null);
          }
        }}
        title="Atkurti rezervaciją?"
        description="Ar tikrai norite atkurti šią rezervaciją? Ji vėl atsiras rezervacijų sąraše."
        confirmText="Atkurti"
        cancelText="Atšaukti"
      />

      <ConfirmationDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            permanentlyDeleteReservation(confirmDelete);
            setConfirmDelete(null);
          }
        }}
        title="Visam laikui ištrinti?"
        description="DĖMESIO: Ši operacija negrįžtama! Rezervacija bus visam laikui pašalinta iš duomenų bazės."
        confirmText="Ištrinti visam laikui"
        cancelText="Atšaukti"
        variant="destructive"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Šiukšlinė
            <Badge variant="secondary">{deletedReservations.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Kraunama...</div>
          ) : deletedReservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Šiukšlinė tuščia</p>
            </div>
          ) : (
            <>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-semibold mb-1">Ištrinti įrašai</p>
                  <p>Čia rodomi ištrinti rezervacijų įrašai. Galite juos atkurti arba visam laikui pašalinti.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Klientas</TableHead>
                      <TableHead>Automobilis</TableHead>
                      <TableHead>Datos</TableHead>
                      <TableHead>Statusas</TableHead>
                      <TableHead>Suma</TableHead>
                      <TableHead>Ištrinta</TableHead>
                      <TableHead className="text-right">Veiksmai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deletedReservations.map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell className="font-mono text-xs">
                          {reservation.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {reservation.customers.first_name} {reservation.customers.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {reservation.customers.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{reservation.car_name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(reservation.start_date), 'yyyy-MM-dd')}</div>
                            <div className="text-muted-foreground">
                              {format(new Date(reservation.end_date), 'yyyy-MM-dd')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                        <TableCell className="font-semibold">
                          €{reservation.total_amount}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(reservation.deleted_at), 'yyyy-MM-dd HH:mm')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setConfirmRestore(reservation.id)}
                              className="flex items-center gap-1"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Atkurti
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setConfirmDelete(reservation.id)}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Ištrinti visam laikui
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};
