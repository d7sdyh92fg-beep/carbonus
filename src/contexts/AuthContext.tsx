import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;  
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = async (userId: string | undefined) => {
    if (!userId) {
      console.log('checkAdminRole: No userId provided');
      setIsAdmin(false);
      return;
    }

    console.log('checkAdminRole: Checking admin role for userId:', userId);

    try {
      // First, try the email-based check since we know it should work
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email === 'info@carbonus.lt') {
        console.log('checkAdminRole: User is admin by email check');
        setIsAdmin(true);
        return;
      }

      // Fallback: try the RPC function
      const { data, error } = await supabase
        .rpc('has_role', { 
          _user_id: userId, 
          _role: 'admin' 
        });

      console.log('checkAdminRole: RPC response:', { data, error });

      if (!error && data === true) {
        console.log('checkAdminRole: User is admin by RPC check');
        setIsAdmin(true);
        return;
      }

      // Final fallback: direct database query
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();

      console.log('checkAdminRole: Direct query response:', { roleData, roleError });

      if (!roleError && roleData) {
        console.log('checkAdminRole: User is admin by direct query');
        setIsAdmin(true);
        return;
      }

      console.log('checkAdminRole: User is not admin');
      setIsAdmin(false);

    } catch (error) {
      console.error('Error in checkAdminRole:', error);
      // Final fallback: check by email
      const { data: { user } } = await supabase.auth.getUser();
      const isAdminByEmail = user?.email === 'info@carbonus.lt';
      console.log('checkAdminRole: Final fallback result:', isAdminByEmail);
      setIsAdmin(isAdminByEmail);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session, session?.user?.email);
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminRole(session.user.id);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', !!session, session?.user?.email);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminRole(session.user.id);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isAdmin,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};