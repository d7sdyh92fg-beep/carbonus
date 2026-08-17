import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, AlertTriangle, XCircle, Loader2, RefreshCw } from 'lucide-react';

export type CheckState = 'ok' | 'warn' | 'fail' | 'running';

export interface SystemCheck {
  id: string;
  label: string;
  group: string;
  state: CheckState;
  detail: string;
  ms?: number;
}

const SUPABASE_URL = 'https://yuvugrgoadxbmfvebsiu.supabase.co';

const EDGE_FUNCTIONS = [
  'send-booking-email',
  'send-status-email',
  'generate-contract-pdf',
  'generate-invoice-pdf',
  'create-stripe-payment',
  'driving-distance',
  'admin-manage-users',
];

async function timed<T>(fn: () => Promise<T>): Promise<{ result?: T; error?: unknown; ms: number }> {
  const t0 = performance.now();
  try {
    const result = await fn();
    return { result, ms: Math.round(performance.now() - t0) };
  } catch (error) {
    return { error, ms: Math.round(performance.now() - t0) };
  }
}

export async function runSystemChecks(): Promise<SystemCheck[]> {
  const checks: SystemCheck[] = [];
  const todayIso = new Date().toISOString().slice(0, 10);

  // 1. Duomenų bazės ryšys
  {
    const { result, error, ms } = await timed(async () => {
      const { data, error: e } = await supabase.from('cars').select('id', { count: 'exact', head: false }).limit(1);
      if (e) throw e;
      return data;
    });
    checks.push({
      id: 'db',
      group: 'Infrastruktūra',
      label: 'Duomenų bazės ryšys',
      state: error ? 'fail' : ms > 1500 ? 'warn' : 'ok',
      detail: error ? String((error as Error).message ?? error) : `Atsakas per ${ms} ms`,
      ms,
    });
    void result;
  }

  // 2. Autentifikacija ir rolė
  {
    const { result, error, ms } = await timed(async () => {
      const { data, error: e } = await supabase.rpc('get_my_admin_role');
      if (e) throw e;
      return data;
    });
    checks.push({
      id: 'auth',
      group: 'Infrastruktūra',
      label: 'Autentifikacija ir rolės (RLS)',
      state: error ? 'fail' : result ? 'ok' : 'warn',
      detail: error ? String((error as Error).message ?? error) : `Rolė: ${result ?? 'nenustatyta'}`,
      ms,
    });
  }

  // 3. Rezervacijų lentelė
  {
    const { result, error, ms } = await timed(async () => {
      const { count, error: e } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null);
      if (e) throw e;
      return count ?? 0;
    });
    checks.push({
      id: 'reservations',
      group: 'Duomenys',
      label: 'Rezervacijų duomenys',
      state: error ? 'fail' : 'ok',
      detail: error ? String((error as Error).message ?? error) : `${result} aktyvių įrašų`,
      ms,
    });
  }

  // 4. Užimtumo RPC
  {
    const { error, ms } = await timed(async () => {
      const end = new Date();
      end.setDate(end.getDate() + 30);
      const { error: e } = await supabase.rpc('get_booked_ranges', {
        p_start: todayIso,
        p_end: end.toISOString().slice(0, 10),
      });
      if (e) throw e;
      return true;
    });
    checks.push({
      id: 'availability-rpc',
      group: 'Rezervacijų logika',
      label: 'Užimtumo funkcija (get_booked_ranges)',
      state: error ? 'fail' : 'ok',
      detail: error ? String((error as Error).message ?? error) : 'Veikia, grąžina užimtus intervalus',
      ms,
    });
  }

  // 5. Nuolaidų kodų validacija
  {
    const { result, error, ms } = await timed(async () => {
      const { data, error: e } = await supabase.rpc('validate_promo_code', { p_code: 'ACIU10', p_rental_days: 3 });
      if (e) throw e;
      return data as { valid?: boolean } | null;
    });
    checks.push({
      id: 'promo',
      group: 'Rezervacijų logika',
      label: 'Nuolaidų kodų tikrinimas',
      state: error ? 'fail' : result?.valid ? 'ok' : 'warn',
      detail: error
        ? String((error as Error).message ?? error)
        : result?.valid
          ? 'ACIU10 aktyvus ir galiojantis'
          : 'ACIU10 šiuo metu negalioja',
      ms,
    });
  }

  // 6. Persidengiančios rezervacijos
  {
    const { result, error, ms } = await timed(async () => {
      const { data, error: e } = await supabase
        .from('reservations')
        .select('id, car_id, start_date, end_date, status')
        .is('deleted_at', null)
        .not('status', 'in', '("cancelled","rejected","awaiting_payment")')
        .gte('end_date', todayIso);
      if (e) throw e;
      const rows = data ?? [];
      const byCar: Record<string, typeof rows> = {};
      rows.forEach((r) => {
        (byCar[r.car_id] ||= []).push(r);
      });
      let overlaps = 0;
      Object.values(byCar).forEach((list) => {
        const sorted = [...list].sort((a, b) => a.start_date.localeCompare(b.start_date));
        for (let i = 1; i < sorted.length; i += 1) {
          if (sorted[i].start_date < sorted[i - 1].end_date) overlaps += 1;
        }
      });
      return overlaps;
    });
    checks.push({
      id: 'overlaps',
      group: 'Duomenys',
      label: 'Persidengiančios rezervacijos',
      state: error ? 'fail' : (result ?? 0) > 0 ? 'fail' : 'ok',
      detail: error
        ? String((error as Error).message ?? error)
        : (result ?? 0) > 0
          ? `Rasta ${result} persidengimų – patikrinkite kalendorių`
          : 'Konfliktų nerasta',
      ms,
    });
  }

  // 7. Trūkstami parašai artimiausioms rezervacijoms
  {
    const { result, error, ms } = await timed(async () => {
      const { data, error: e } = await supabase
        .from('reservations')
        .select('id, contract_signed_at, status, start_date')
        .is('deleted_at', null)
        .in('status', ['paid', 'confirmed'])
        .gte('start_date', todayIso);
      if (e) throw e;
      return (data ?? []).filter((r) => !r.contract_signed_at).length;
    });
    checks.push({
      id: 'signatures',
      group: 'Dokumentai',
      label: 'Sutarčių parašai',
      state: error ? 'fail' : (result ?? 0) > 0 ? 'warn' : 'ok',
      detail: error
        ? String((error as Error).message ?? error)
        : (result ?? 0) > 0
          ? `${result} būsimų rezervacijų be kliento parašo`
          : 'Visos būsimos rezervacijos pasirašytos',
      ms,
    });
  }

  // 8. Sąskaitų numeracija
  {
    const { result, error, ms } = await timed(async () => {
      const { data, error: e } = await supabase
        .from('invoices')
        .select('invoice_number, created_at')
        .order('created_at', { ascending: false })
        .limit(1);
      if (e) throw e;
      return data?.[0]?.invoice_number ?? null;
    });
    checks.push({
      id: 'invoices',
      group: 'Dokumentai',
      label: 'Sąskaitų registras',
      state: error ? 'fail' : 'ok',
      detail: error
        ? String((error as Error).message ?? error)
        : result
          ? `Paskutinė sąskaita: ${result}`
          : 'Sąskaitų dar nėra',
      ms,
    });
  }

  // 9. Failų saugykla (vairuotojo pažymėjimai)
  {
    const { error, ms } = await timed(async () => {
      const { error: e } = await supabase.storage.from('driver-licenses').list('', { limit: 1 });
      if (e) throw e;
      return true;
    });
    checks.push({
      id: 'storage',
      group: 'Infrastruktūra',
      label: 'Failų saugykla (driver-licenses)',
      state: error ? 'warn' : 'ok',
      detail: error
        ? `Prieiga ribota: ${String((error as Error).message ?? error)}`
        : 'Saugykla pasiekiama',
      ms,
    });
  }

  // 10. Edge funkcijos
  await Promise.all(
    EDGE_FUNCTIONS.map(async (name) => {
      const { result, error, ms } = await timed(async () => {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
          method: 'OPTIONS',
          headers: { 'Access-Control-Request-Method': 'POST' },
        });
        return res.status;
      });
      const status = result ?? 0;
      checks.push({
        id: `fn-${name}`,
        group: 'Edge funkcijos',
        label: name,
        state: error ? 'fail' : status >= 200 && status < 500 ? 'ok' : 'fail',
        detail: error ? 'Nepasiekiama' : `HTTP ${status} · ${ms} ms`,
        ms,
      });
    }),
  );

  return checks;
}

const STATE_META: Record<CheckState, { icon: React.ElementType; cls: string; label: string }> = {
  ok: { icon: CheckCircle, cls: 'text-carbonus-green-dark', label: 'Gerai' },
  warn: { icon: AlertTriangle, cls: 'text-amber-500', label: 'Dėmesio' },
  fail: { icon: XCircle, cls: 'text-red-500', label: 'Klaida' },
  running: { icon: Loader2, cls: 'text-[#65776f] animate-spin', label: 'Tikrinama' },
};

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const SystemStatusDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    const res = await runSystemChecks();
    setChecks(res);
    setLastRun(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) void run();
  }, [open, run]);

  const groups = Array.from(new Set(checks.map((c) => c.group)));
  const failed = checks.filter((c) => c.state === 'fail').length;
  const warned = checks.filter((c) => c.state === 'warn').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sistemos būsena</DialogTitle>
          <DialogDescription>
            {loading
              ? 'Vykdomi patikrinimai...'
              : `${checks.length} patikrų · ${failed} klaidos · ${warned} įspėjimai${lastRun ? ` · ${lastRun.toLocaleTimeString('lt-LT')}` : ''}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {loading && checks.length === 0 && (
            <div className="flex items-center gap-2 py-8 text-sm text-[#65776f]">
              <Loader2 className="h-4 w-4 animate-spin" /> Tikrinama...
            </div>
          )}

          {groups.map((group) => (
            <div key={group}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b5d43]">{group}</p>
              <div className="space-y-1.5">
                {checks
                  .filter((c) => c.group === group)
                  .map((c) => {
                    const meta = STATE_META[c.state];
                    const Icon = meta.icon;
                    return (
                      <div
                        key={c.id}
                        className="flex items-start gap-3 rounded-xl border border-[#e5eeea] bg-white px-3 py-2.5"
                      >
                        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${meta.cls}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-[#12281f]">{c.label}</p>
                          <p className="text-[12px] text-[#65776f]">{c.detail}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={() => void run()} disabled={loading} className="rounded-xl">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Tikrinti iš naujo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SystemStatusDialog;
