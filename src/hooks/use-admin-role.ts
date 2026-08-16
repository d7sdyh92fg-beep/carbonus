import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AdminRole = 'owner' | 'admin' | 'fleet_manager' | 'user';

export const ROLE_LABELS: Record<AdminRole, string> = {
  owner: 'Savininkas',
  admin: 'Administratorius',
  fleet_manager: 'Autoparko vadybininkas',
  user: 'Naudotojas',
};

const FLEET_MANAGER_TABS = ['dashboard', 'calendar', 'in-person'];

export function tabsForRole(role: AdminRole, allTabs: string[]) {
  if (role === 'owner') return allTabs;
  if (role === 'fleet_manager') return allTabs.filter((t) => FLEET_MANAGER_TABS.includes(t));
  // admin: everything except e-mail tools and user management
  return allTabs.filter((t) => t !== 'email-test' && t !== 'users');
}

export function useAdminRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AdminRole>('user');
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setRole('user');
      setLoadingRole(false);
      return;
    }
    setLoadingRole(true);
    supabase
      .rpc('get_my_admin_role' as any)
      .then(({ data, error }) => {
        if (cancelled) return;
        setRole(!error && data ? (data as AdminRole) : 'admin');
        setLoadingRole(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return { role, loadingRole, isOwner: role === 'owner' };
}
