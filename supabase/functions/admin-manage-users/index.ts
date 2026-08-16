import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const ALLOWED_ROLES = ['owner', 'admin', 'fleet_manager'] as const;
type Role = (typeof ALLOWED_ROLES)[number];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'UNAUTHORIZED' }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    const caller = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await caller.auth.getUser();
    if (userErr || !userData?.user) return json({ error: 'UNAUTHORIZED' }, 401);

    const { data: callerRoles } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id);
    const roles = (callerRoles ?? []).map((r: { role: string }) => r.role);
    if (!roles.includes('owner')) return json({ error: 'FORBIDDEN' }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? '');

    const setRole = async (userId: string, role: Role) => {
      await admin.from('user_roles').delete().eq('user_id', userId);
      const rows = [{ user_id: userId, role }];
      // every staff role also needs the base admin role for existing RLS policies
      if (role !== 'admin') rows.push({ user_id: userId, role: 'admin' });
      await admin.from('user_roles').insert(rows);
    };

    if (action === 'list') {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (error) throw error;
      const { data: allRoles } = await admin.from('user_roles').select('user_id, role');
      const roleFor = (id: string) => {
        const list = (allRoles ?? []).filter((r: any) => r.user_id === id).map((r: any) => r.role);
        if (list.includes('owner')) return 'owner';
        if (list.includes('fleet_manager')) return 'fleet_manager';
        if (list.includes('admin')) return 'admin';
        return 'user';
      };
      return json({
        users: data.users.map((u) => ({
          id: u.id,
          email: u.email,
          role: roleFor(u.id),
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
        })),
      });
    }

    if (action === 'create') {
      const email = String(body?.email ?? '').trim().toLowerCase();
      const password = String(body?.password ?? '');
      const role = String(body?.role ?? 'admin') as Role;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200)
        return json({ error: 'INVALID_EMAIL' }, 400);
      if (password.length < 8 || password.length > 72) return json({ error: 'INVALID_PASSWORD' }, 400);
      if (!ALLOWED_ROLES.includes(role)) return json({ error: 'INVALID_ROLE' }, 400);

      const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = existing.users.find((u) => u.email?.toLowerCase() === email);

      let userId: string;
      if (found) {
        const { error } = await admin.auth.admin.updateUserById(found.id, { password });
        if (error) throw error;
        userId = found.id;
      } else {
        const { data, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (error) throw error;
        userId = data.user!.id;
      }
      await setRole(userId, role);
      return json({ ok: true, id: userId, created: !found });
    }

    if (action === 'set_password') {
      const userId = String(body?.user_id ?? '');
      const password = String(body?.password ?? '');
      if (!userId) return json({ error: 'INVALID_USER' }, 400);
      if (password.length < 8 || password.length > 72) return json({ error: 'INVALID_PASSWORD' }, 400);
      const { error } = await admin.auth.admin.updateUserById(userId, { password });
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === 'set_role') {
      const userId = String(body?.user_id ?? '');
      const role = String(body?.role ?? '') as Role;
      if (!userId || !ALLOWED_ROLES.includes(role)) return json({ error: 'INVALID_INPUT' }, 400);
      if (userId === userData.user.id) return json({ error: 'CANNOT_CHANGE_OWN_ROLE' }, 400);
      await setRole(userId, role);
      return json({ ok: true });
    }

    return json({ error: 'UNKNOWN_ACTION' }, 400);
  } catch (e) {
    console.error('admin-manage-users error', e);
    return json({ error: 'SERVER_ERROR' }, 500);
  }
});
