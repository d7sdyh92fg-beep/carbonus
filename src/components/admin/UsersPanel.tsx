import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ROLE_LABELS, type AdminRole } from '@/hooks/use-admin-role';
import { Loader2, ShieldCheck, UserPlus, KeyRound } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
  last_sign_in_at: string | null;
}

const ROLE_OPTIONS: AdminRole[] = ['owner', 'admin', 'fleet_manager'];

export default function UsersPanel() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('admin');
  const [passwords, setPasswords] = useState<Record<string, string>>({});

  const call = async (payload: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('admin-manage-users', { body: payload });
    if (error) throw error;
    if ((data as any)?.error) throw new Error((data as any).error);
    return data as any;
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await call({ action: 'list' });
      setUsers(data.users ?? []);
    } catch (e: any) {
      toast({ title: 'Nepavyko įkelti naudotojų', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async () => {
    setBusy(true);
    try {
      await call({ action: 'create', email: newEmail, password: newPassword, role: newRole });
      toast({ title: 'Naudotojas išsaugotas', description: newEmail });
      setNewEmail('');
      setNewPassword('');
      await load();
    } catch (e: any) {
      toast({ title: 'Klaida', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const setPassword = async (id: string) => {
    const password = passwords[id] ?? '';
    setBusy(true);
    try {
      await call({ action: 'set_password', user_id: id, password });
      setPasswords((p) => ({ ...p, [id]: '' }));
      toast({ title: 'Slaptažodis pakeistas', description: 'Perduokite jį darbuotojui saugiu kanalu.' });
    } catch (e: any) {
      toast({ title: 'Klaida', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const changeRole = async (id: string, role: AdminRole) => {
    setBusy(true);
    try {
      await call({ action: 'set_role', user_id: id, role });
      await load();
    } catch (e: any) {
      toast({ title: 'Klaida', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="rounded-[24px] border-[#dfe8e3]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[17px]">
            <UserPlus className="h-4 w-4" /> Naujas naudotojas
          </CardTitle>
          <CardDescription>
            Sukūrus paskyrą, slaptažodis nustatomas iškart. Jei el. paštas jau egzistuoja – slaptažodis atnaujinamas.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <Input placeholder="el. paštas" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <Input placeholder="slaptažodis (min. 8 simboliai)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Select value={newRole} onValueChange={(v) => setNewRole(v as AdminRole)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={createUser} disabled={busy || !newEmail || newPassword.length < 8}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Išsaugoti'}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-[#dfe8e3]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[17px]">
            <ShieldCheck className="h-4 w-4" /> Sistemos naudotojai
          </CardTitle>
          <CardDescription>
            Slaptažodžiai saugomi užšifruoti ir jų parodyti neįmanoma – galima nustatyti naują ir jį perduoti darbuotojui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Kraunama…</div>
          ) : (
            users.map((u) => (
              <div key={u.id} className="rounded-2xl border border-[#e6ece9] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{u.email}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Sukurta {new Date(u.created_at).toLocaleDateString('lt-LT')} ·{' '}
                      {u.last_sign_in_at ? `paskutinis prisijungimas ${new Date(u.last_sign_in_at).toLocaleString('lt-LT')}` : 'dar neprisijungė'}
                    </p>
                  </div>
                  <Badge variant="secondary">{ROLE_LABELS[u.role] ?? u.role}</Badge>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_200px]">
                  <Input
                    placeholder="naujas slaptažodis"
                    value={passwords[u.id] ?? ''}
                    onChange={(e) => setPasswords((p) => ({ ...p, [u.id]: e.target.value }))}
                  />
                  <Button
                    variant="outline"
                    onClick={() => setPassword(u.id)}
                    disabled={busy || (passwords[u.id] ?? '').length < 8}
                  >
                    <KeyRound className="mr-2 h-4 w-4" /> Nustatyti
                  </Button>
                  <Select value={u.role} onValueChange={(v) => changeRole(u.id, v as AdminRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
