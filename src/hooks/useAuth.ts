import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/auth';
import { supabase, performGoogleOAuth } from '../lib/supabase';
import { LoginFormData, RegisterFormData } from '../types/forms';
import { Alert } from 'react-native';

export const useAuth = () => {
  const {
    session,
    user,
    isLoading,
    setSession,
    setUser,
    setLoading,
    signOut: zustandSignOut,
  } = useAuthStore();

  // Fetch user profile from Supabase
  const fetchUserProfile = useCallback(
    async (currentSession: any) => {
      console.log('[useAuth] Fetching user profile. Current session:', !!currentSession);

      if (!currentSession?.user) {
        console.log('[useAuth] No session user found. Setting user to null.');
        setUser(null);
        return null;
      }

      try {
        const { data, error } = await supabase.auth.getUser();

        console.log('[useAuth] getUser() result:', {
          user: !!data?.user,
          error: error ? error.message : 'No error',
        });

        if (error || !data?.user) {
          console.error('[useAuth] Failed to fetch user profile:', error);
          setUser(currentSession.user);
          return currentSession.user;
        } else {
          setUser(data.user);
          return data.user;
        }
      } catch (error) {
        console.error('[useAuth] Unexpected error in fetchUserProfile:', error);
        setUser(null);
        return null;
      }
    },
    [setUser]
  );

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (isMounted) {
          setSession(initialSession);
          await fetchUserProfile(initialSession);
        }
      } catch (error) {
        console.error('Failed to fetch initial session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        console.log('[useAuth] Auth state changed:', event, !!session);
        setSession(session);
        await fetchUserProfile(session);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [setSession, setLoading, fetchUserProfile]);

  // Sign up with email and password
  const signUp = useCallback(
    async (formData: RegisterFormData) => {
      try {
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (!data.session) {
          Alert.alert(
            'Confirmation Required',
            'Please check your email for a confirmation link before signing in.'
          );
        }

        return { data, error: null };
      } catch (error: any) {
        console.error('Sign up error:', error);
        return { data: null, error };
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  // Sign in with email and password
  const signIn = useCallback(
    async (formData: LoginFormData) => {
      try {
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          throw error;
        }

        return { data, error: null };
      } catch (error: any) {
        console.error('Sign in error:', error);
        return { data: null, error };
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      await performGoogleOAuth();
      return { error: null };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      zustandSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, zustandSignOut]);

  // Reset password
  const resetPassword = useCallback(
    async (email: string) => {
      try {
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'tixle-mobile://auth/reset-password',
        });

        if (error) {
          throw error;
        }

        Alert.alert('Reset Email Sent', 'Please check your email for password reset instructions.');

        return { error: null };
      } catch (error: any) {
        console.error('Reset password error:', error);
        return { error };
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  return {
    session,
    user,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
};
