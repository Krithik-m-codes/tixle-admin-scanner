import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { Platform, AppState } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

// Complete auth session for web browsers
WebBrowser.maybeCompleteAuthSession();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

// OAuth Configuration
export const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'tixle-mobile',
  path: 'auth/callback',
});

console.log('OAuth Redirect URI:', redirectUri);

// Google OAuth Helper
export const performGoogleOAuth = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;

    const authUrl = data?.url;
    if (!authUrl) throw new Error('No auth URL returned');

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success') {
      const url = result.url;
      await handleAuthCallback(url);
    }
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw error;
  }
};

// Handle OAuth callback
export const handleAuthCallback = async (url: string) => {
  try {
    const parsedUrl = Linking.parse(url);
    const queryParams = parsedUrl.queryParams;

    if (queryParams?.error) {
      throw new Error(queryParams.error as string);
    }

    const accessToken = queryParams?.access_token as string;
    const refreshToken = queryParams?.refresh_token as string;

    if (accessToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (error) throw error;
      return data.session;
    }
  } catch (error) {
    console.error('Auth callback error:', error);
    throw error;
  }
};

// Auto-refresh session when app becomes active (mobile only)
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
