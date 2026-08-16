import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, UserCheck, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface PickedCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  isCorporate: boolean;
  companyName: string;
  companyCode: string;
  vatCode: string;
  representativeName: string;
  representativePhone: string;
  representativeEmail: string;
  refundAccount: string;
}

interface CustomerPickerProps {
  onSelect: (customer: PickedCustomer) => void;
  triggerLabel?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function CustomerPicker({
  onSelect,
  triggerLabel = 'Pasirinkti esamą klientą',
  variant = 'outline',
  size = 'default',
  className,
}: CustomerPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers-picker', search],
    enabled: open,
    queryFn: async () => {
      let query = supabase
        .from('customers')
        .select('*')
        .is('deleted_at', null)
        .order('first_name', { ascending: true })
        .limit(100);

      const term = search.trim();
      if (term.length > 0) {
        const safe = term.replace(/[%,]/g, ' ');
        query = query.or(
          `first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%,company_name.ilike.%${safe}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleSelect = (c: any) => {
    onSelect({
      id: c.id,
      firstName: c.first_name ?? '',
      lastName: c.last_name ?? '',
      email: c.email ?? '',
      phone: c.phone ?? '',
      address: c.address ?? '',
      isCorporate: !!c.is_corporate,
      companyName: c.company_name ?? '',
      companyCode: c.company_code ?? '',
      vatCode: c.vat_code ?? '',
      representativeName: c.representative_name ?? '',
      representativePhone: c.representative_phone ?? '',
      representativeEmail: c.representative_email ?? '',
      refundAccount: c.refund_account_number ?? '',
    });
    setOpen(false);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant={variant} size={size} className={className}>
          <UserCheck className="h-4 w-4 mr-2" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Pasirinkti esamą klientą</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Ieškoti pagal vardą, el. paštą, telefoną, įmonę..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <ScrollArea className="flex-1 min-h-0 h-[55vh] -mx-2 px-2">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8 text-sm">
              Kraunama...
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">
              {search ? 'Klientų nerasta' : 'Nėra klientų duomenų bazėje'}
            </div>
          ) : (
            <div className="space-y-2 py-2">
              {customers.map((c: any) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {c.email}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {c.phone}
                      </div>
                      {c.address && (
                        <div className="text-xs text-muted-foreground truncate mt-1">
                          {c.address}
                        </div>
                      )}
                    </div>
                    {c.is_corporate && (
                      <Badge variant="secondary" className="shrink-0">
                        {c.company_name || 'Įmonė'}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Pasirinkus klientą, visi laukai bus užpildyti automatiškai
        </div>
      </DialogContent>
    </Dialog>
  );
}
