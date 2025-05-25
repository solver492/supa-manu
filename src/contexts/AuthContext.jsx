import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);

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


  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      setSessionData(session);
      if (session?.user) {
        const fullUser = await fetchUserProfile(session.user);
        setUser(fullUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true);
        setSessionData(session);
        if (session?.user) {
          const fullUser = await fetchUserProfile(session.user);
          setUser(fullUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = async (identifier, password) => {
    let emailToLogin = identifier;
    if (identifier.toLowerCase() === 'genesis') {
      emailToLogin = 'genesis@example.com';
    } else if (identifier.toLowerCase() === 'user') {
      emailToLogin = 'user@example.com';
    }

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: emailToLogin,
      password,
    });

    if (error) {
      console.error('Error logging in:', error.message);
      return { success: false, error: error.message };
    }

    if (signInData.user) {
      const fullUser = await fetchUserProfile(signInData.user);
      setUser(fullUser);
      setIsAuthenticated(true);
      return { success: true, error: null, user: fullUser };
    }
    
    return { success: false, error: 'Login failed, user data not found after sign in.' };
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
    login,
    logout,
    updatePassword,
    loading,
    sessionData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};