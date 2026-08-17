import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, KeyRound } from 'lucide-react';

export interface ReturnItem {
  id: string;
  car_name: string;
  status: string;
  start_date: string;
  end_date: string;
  return_date?: string | null;
  return_time?: string | null;
  return_stage?: string | null;
  customers?: { first_name: string; last_name: string; email: string; phone?: string } | null;
  [key: string]: any;
}

const parseDue = (r: ReturnItem): Date => {
  const dateStr = r.return_date || r.end_date;
  const time = (r.return_time || '18:00:00').slice(0, 8);
  return new Date(`${dateStr}T${time}`);
};

/** Reservations that are picked up / paid and due back within the next 24h (or already overdue). */
export const getReturnsDueSoon = (reservations: ReturnItem[]): ReturnItem[] => {
  const now = new Date();
  return reservations
    .filter((r) => ['picked_up', 'paid', 'needs_resolution'].includes(String(r.status)))
    .filter((r) => {
      if (String(r.status) === 'needs_resolution') return true;
      const due = parseDue(r);
      const hours = (due.getTime() - now.getTime()) / 3600000;
      return hours <= 24;
    })
    .sort((a, b) => parseDue(a).getTime() - parseDue(b).getTime());
};

interface Props {
  reservations: ReturnItem[];
  onStartInspection: (reservation: ReturnItem) => void;
}

export const ReturnsBoard = ({ reservations, onStartInspection }: Props) => {
  const items = getReturnsDueSoon(reservations);
  if (items.length === 0) return null;

  const now = new Date();

  return (
    <Card className="overflow-hidden rounded-2xl border-carbonus-green/30 bg-carbonus-green-soft/40 shadow-[0_10px_28px_rgba(16,24,40,0.08)]">
      <CardHeader className="flex flex-col gap-1 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-carbonus-green-dark text-white">
            <KeyRound className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-lg">Šiandien grąžinami automobiliai</CardTitle>
            <CardDescription>
              {items.length} rezervacija (-os) laukia priėmimo patikros
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {items.map((r) => {
          const due = parseDue(r);
          const overdue = due.getTime() < now.getTime();
          const needsResolution = String(r.status) === 'needs_resolution';
          const isToday = due.toDateString() === now.toDateString();
          const timeLabel = due.toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' });
          const name = r.customers ? `${r.customers.first_name} ${r.customers.last_name}` : '—';


          return (
            <div
              key={r.id}
              className={`rounded-xl border-2 bg-white p-4 ${
                needsResolution
                  ? 'border-amber-400'
                  : overdue
                  ? 'border-red-400'
                  : 'border-carbonus-green'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{r.car_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{name}</p>
                </div>
                {needsResolution ? (
                  <Badge className="border-amber-300 bg-amber-100 text-amber-800">
                    <AlertTriangle className="mr-1 h-3 w-3" /> Reikia sprendimo
                  </Badge>
                ) : overdue ? (
                  <Badge className="border-red-300 bg-red-100 text-red-700">Vėluoja</Badge>
                ) : (
                  <Badge className="border-carbonus-green/40 bg-carbonus-green-soft text-carbonus-green-deep">
                    Šiandien
                  </Badge>
                )}
              </div>

              <p className="mt-3 flex items-center gap-2 text-base font-semibold">
                <Clock className="h-4 w-4 text-carbonus-green-deep" />
                Automobilis grąžinamas {timeLabel}
              </p>
              <p className="text-xs text-muted-foreground">
                {(r.return_date || r.end_date)}
              </p>

              <Button
                className="mt-3 w-full bg-carbonus-green-dark hover:bg-carbonus-green-deep"
                size="sm"
                onClick={() => onStartInspection(r)}
              >
                Pradėti grąžinimo patikrą
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ReturnsBoard;
