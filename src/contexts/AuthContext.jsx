import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);

  // Gérer les changements de session
  useEffect(() => {
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionData(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionData(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser) return null;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, phone, is_super_admin, username')
      .eq('id', authUser.id)
      .single();

    if (error && error.code !== 'PGRST116') { 
      console.error('Error fetching profile for user:', authUser.id, error.message);
      return { 
        ...authUser,
        username: authUser.email?.split('@')[0],
        isSuperAdmin: authUser.email === 'genesis@example.com',
        full_name: authUser.email?.split('@')[0],
        avatar_url: `https://avatar.vercel.sh/${authUser.email || 'user'}.png?size=128`,
        phone: '',
      };
    }
    
    const baseProfile = {
      ...authUser,
      id: authUser.id,
      email: authUser.email,
      username: authUser.email?.split('@')[0],
      isSuperAdmin: authUser.email === 'genesis@example.com',
      full_name: authUser.email?.split('@')[0],
      avatar_url: `https://avatar.vercel.sh/${authUser.email || 'user'}.png?size=128`,
      phone: '',
    };

    if (profile) {
      return {
        ...baseProfile,
        ...profile, 
        username: profile.username || baseProfile.username,
        isSuperAdmin: profile.is_super_admin !== null ? profile.is_super_admin : baseProfile.isSuperAdmin,
        full_name: profile.full_name || baseProfile.full_name,
        avatar_url: profile.avatar_url || baseProfile.avatar_url,
        phone: profile.phone || baseProfile.phone,
      };
    }
    
    return baseProfile;
  }, []);

  const login = async (identifier, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password,
      });

      if (error) throw error;

      const user = await fetchUserProfile(data.user);
      setUser(user);
      setIsAuthenticated(true);
      setSessionData(data.session);

      return { success: true, user };
    } catch (error) {
      console.error('Error logging in:', error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    }
    setUser(null);
    setIsAuthenticated(false);
    setLoading(false);
  };

  const updatePassword = async (newPassword) => {
    if (!user) return { success: false, error: 'Utilisateur non authentifié' };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.error('Error updating password:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  };
  
  const value = {
    user, 
    isAuthenticated, 
    loading, 
    sessionData,
    login,
    logout,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};