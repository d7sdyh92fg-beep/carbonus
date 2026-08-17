import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle2, Camera, Loader2, X } from 'lucide-react';

export interface InspectionReservation {
  id: string;
  car_id: string;
  car_name: string;
  start_date: string;
  end_date: string;
  return_date?: string | null;
  return_time?: string | null;
  deposit_amount?: number | null;
  language?: string | null;
  customers?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

const CHECKLIST_ITEMS = [
  { key: 'returned', label: 'Automobilis grąžintas' },
  { key: 'fuel', label: 'Kuro lygis tinkamas' },
  { key: 'mileage', label: 'Rida užfiksuota' },
  { key: 'interior', label: 'Salonas švarus' },
  { key: 'body', label: 'Kėbulas patikrintas' },
  { key: 'tyres', label: 'Padangos ir stiklai patikrinti' },
  { key: 'keys', label: 'Raktai bei dokumentai grąžinti' },
] as const;

const ISSUE_OPTIONS = [
  { key: 'damage', label: 'Naujas pažeidimas' },
  { key: 'fuel', label: 'Trūksta kuro' },
  { key: 'cleaning', label: 'Reikalingas valymas' },
  { key: 'mileage', label: 'Viršyta rida' },
  { key: 'late', label: 'Pavėluotas grąžinimas' },
  { key: 'documents', label: 'Trūksta dokumentų ar raktų' },
] as const;

interface Props {
  reservation: InspectionReservation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted: () => void;
}

export const ReturnInspectionModal = ({ reservation, open, onOpenChange, onCompleted }: Props) => {
  const { toast } = useToast();
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [mileage, setMileage] = useState('');
  const [fuelLevel, setFuelLevel] = useState('');
  const [notes, setNotes] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [extraCharge, setExtraCharge] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const allChecked = CHECKLIST_ITEMS.every((item) => checklist[item.key]);
  const hasIssues = issues.length > 0;

  const reset = () => {
    setChecklist({});
    setMileage('');
    setFuelLevel('');
    setNotes('');
    setIssues([]);
    setExtraCharge('');
    setPhotos([]);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !reservation) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${reservation.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from('inspections').upload(path, file, { upsert: false });
        if (error) throw error;
        uploaded.push(path);
      }
      setPhotos((prev) => [...prev, ...uploaded]);
      toast({ title: 'Nuotraukos įkeltos', description: `${uploaded.length} failas (-ai)` });
    } catch (e: any) {
      toast({ title: 'Nepavyko įkelti', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const saveInspection = async () => {
    if (!reservation) return null;
    const { data: userData } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('reservation_inspections')
      .insert({
        reservation_id: reservation.id,
        checklist,
        mileage_end: mileage ? Number(mileage) : null,
        fuel_level: fuelLevel || null,
        notes: notes || null,
        issues,
        extra_charge: extraCharge ? Number(extraCharge) : 0,
        photos,
        admin_id: userData?.user?.id ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const handleComplete = async () => {
    if (!reservation) return;
    setSaving(true);
    try {
      await saveInspection();

      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'completed',
          return_stage: 'resolved',
          deposit_status: 'to_refund',
          returned_at: nowIso,
          completed_at: nowIso,
          fuel_level_return: fuelLevel || null,
          return_notes: notes || null,
        })
        .eq('id', reservation.id);
      if (error) throw error;

      if (mileage) {
        await supabase.from('cars').update({ current_mileage: Number(mileage) }).eq('id', reservation.car_id);
      }

      const customerName = reservation.customers
        ? `${reservation.customers.first_name} ${reservation.customers.last_name}`
        : '';

      if (reservation.customers?.email) {
        await supabase.functions.invoke('send-completion-email', {
          body: {
            reservationId: reservation.id,
            customerEmail: reservation.customers.email,
            customerName,
            carName: reservation.car_name,
            startDate: reservation.start_date,
            endDate: reservation.end_date,
            depositAmount: reservation.deposit_amount ?? undefined,
            language: reservation.language ?? 'lt',
          },
        });
      }

      await supabase.functions.invoke('send-return-summary', {
        body: {
          type: 'completed_summary',
          reservationId: reservation.id,
          carName: reservation.car_name,
          customerName,
          mileageEnd: mileage ? Number(mileage) : null,
          fuelLevel: fuelLevel || null,
          notes: notes || null,
          issues: [],
        },
      });

      toast({ title: 'Rezervacija užbaigta', description: 'Klientui išsiųstas laiškas su prašymu palikti atsiliepimą.' });
      reset();
      onOpenChange(false);
      onCompleted();
    } catch (e: any) {
      toast({ title: 'Klaida', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleReportIssue = async () => {
    if (!reservation) return;
    setSaving(true);
    try {
      await saveInspection();

      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'needs_resolution',
          return_stage: 'inspecting',
          returned_at: new Date().toISOString(),
          fuel_level_return: fuelLevel || null,
          return_notes: notes || null,
        })
        .eq('id', reservation.id);
      if (error) throw error;

      await supabase.functions.invoke('send-return-summary', {
        body: {
          type: 'issue_summary',
          reservationId: reservation.id,
          carName: reservation.car_name,
          customerName: reservation.customers
            ? `${reservation.customers.first_name} ${reservation.customers.last_name}`
            : '',
          mileageEnd: mileage ? Number(mileage) : null,
          fuelLevel: fuelLevel || null,
          notes: notes || null,
          issues,
          extraCharge: extraCharge ? Number(extraCharge) : 0,
        },
      });

      toast({
        title: 'Pažymėta „Reikia sprendimo“',
        description: 'Automobilis lieka neprieinamas, klientui laiškas nesiųstas.',
      });
      reset();
      onOpenChange(false);
      onCompleted();
    } catch (e: any) {
      toast({ title: 'Klaida', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!reservation) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grąžinimo patikra – {reservation.car_name}</DialogTitle>
          <DialogDescription>
            {reservation.customers
              ? `${reservation.customers.first_name} ${reservation.customers.last_name} · `
              : ''}
            grąžinimas {reservation.return_date ?? reservation.end_date} {reservation.return_time?.slice(0, 5) ?? ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-xl border p-4">
            <p className="mb-3 text-sm font-semibold">Patikros sąrašas</p>
            <div className="space-y-2.5">
              {CHECKLIST_ITEMS.map((item) => (
                <label key={item.key} className="flex items-center gap-3 text-sm">
                  <Checkbox
                    checked={!!checklist[item.key]}
                    onCheckedChange={(v) => setChecklist((prev) => ({ ...prev, [item.key]: !!v }))}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="mileage">Rida (km)</Label>
              <Input id="mileage" type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="pvz. 128400" />
            </div>
            <div>
              <Label htmlFor="fuel">Kuro lygis</Label>
              <Input id="fuel" value={fuelLevel} onChange={(e) => setFuelLevel(e.target.value)} placeholder="pvz. Pilnas / 3/4" />
            </div>
          </div>

          <div>
            <Label>Nuotraukos</Label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                <label className="cursor-pointer">
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                  Pridėti nuotraukų
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                </label>
              </Button>
              {photos.map((p) => (
                <Badge key={p} variant="secondary" className="gap-1">
                  {p.split('/').pop()?.slice(0, 12)}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setPhotos((prev) => prev.filter((x) => x !== p))} />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Pastabos</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800">
              <AlertTriangle className="h-4 w-4" /> Aptiktos problemos (nebūtina)
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ISSUE_OPTIONS.map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={issues.includes(opt.key)}
                    onCheckedChange={(v) =>
                      setIssues((prev) => (v ? [...prev, opt.key] : prev.filter((i) => i !== opt.key)))
                    }
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {hasIssues && (
              <div className="mt-3">
                <Label htmlFor="charge">Papildomas mokestis (€)</Label>
                <Input id="charge" type="number" value={extraCharge} onChange={(e) => setExtraCharge(e.target.value)} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1 bg-carbonus-green-dark hover:bg-carbonus-green-deep"
              disabled={!allChecked || hasIssues || saving}
              onClick={handleComplete}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Užbaigti rezervaciją
            </Button>
            <Button variant="destructive" className="flex-1" disabled={!hasIssues || saving} onClick={handleReportIssue}>
              <AlertTriangle className="mr-2 h-4 w-4" /> Fiksuoti problemą
            </Button>
          </div>
          {!allChecked && !hasIssues && (
            <p className="text-xs text-muted-foreground">
              Pažymėkite visus patikros punktus, kad galėtumėte užbaigti rezervaciją.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReturnInspectionModal;
