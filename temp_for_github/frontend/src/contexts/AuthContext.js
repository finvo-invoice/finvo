import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabaseClient';
import axios from 'axios';

// Create a custom axios instance for API requests
export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  timeout: 10000,
});

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Set up axios interceptor to include the token in all requests
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.request.use(
      (config) => {
        // Try to get the token from the session first, then fallback to localStorage
        const token = session?.access_token || localStorage.getItem('authToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Clean up the interceptor when the component unmounts
    return () => {
      axiosInstance.interceptors.request.eject(interceptor);
    };
  }, [session]);

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      try {
        console.log("Checking for existing session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session retrieval error:", error);
          setError(error.message);
        }
        
        if (session) {
          console.log("Existing session found, user:", session.user.email);
          // Store token for API requests
          localStorage.setItem('authToken', session.access_token);
          
          // Set up axios interceptor with the token
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
          
          setSession(session);
          setUser(session.user);
        } else {
          console.log("No active session found");
          // Clear any stale tokens if no session exists
          localStorage.removeItem('authToken');
          delete axiosInstance.defaults.headers.common['Authorization'];
        }
        
        setLoading(false);
        setInitialized(true);
      } catch (err) {
        console.error("Session check error:", err);
        setLoading(false);
        setInitialized(true);
      }
    };
    
    getSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      console.log('Auth state changed:', _event, 'Session:', newSession ? `User: ${newSession.user.email}` : 'No session');
      
      if (_event === 'SIGNED_IN') {
        console.log('User signed in successfully');
        // Store token for API requests
        if (newSession?.access_token) {
          localStorage.setItem('authToken', newSession.access_token);
          // Set up axios interceptor with the new token
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newSession.access_token}`;
        }
        // Update user and session state
        setUser(newSession.user);
        setSession(newSession);
      } else if (_event === 'SIGNED_OUT') {
        console.log('User signed out');
        localStorage.removeItem('authToken');
        // Remove auth header
        delete axiosInstance.defaults.headers.common['Authorization'];
        setUser(null);
        setSession(null);
      } else if (_event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
        if (newSession?.access_token) {
          localStorage.setItem('authToken', newSession.access_token);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newSession.access_token}`;
        }
        setUser(newSession.user);
        setSession(newSession);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Strong session check on app startup
  useEffect(() => {
    if (initialized && !user && !loading) {
      // If we're not loading and there's no user after initialization,
      // check if there's a stale token that needs to be cleared
      console.log('No user after initialization, clearing any stored tokens');
      localStorage.removeItem('authToken');
      localStorage.removeItem('supabase.auth.token');
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  }, [initialized, user, loading]);

  // Sign up function
  const signUp = async (email, password, fullName) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      
      // Create initial profile record
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName,
            created_at: new Date(),
            updated_at: new Date(),
          });
          
        if (profileError) console.error('Error creating profile:', profileError);
      }
      
      return data;
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Attempting to sign in with email: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        throw error;
      }
      
      console.log("Login successful:", data.user.id);
      
      // Store user and session in state
      setUser(data.user);
      setSession(data.session);
      
      // Store the token in localStorage for API requests
      if (data.session?.access_token) {
        localStorage.setItem('authToken', data.session.access_token);
        console.log("Auth token saved to localStorage");
      }
      
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      setError(error.message);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      console.log("AuthContext: Attempting to sign out");
      
      // Clear tokens first to prevent auto-login attempts
      localStorage.removeItem('authToken');
      localStorage.removeItem('supabase.auth.token');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("AuthContext: Sign out error:", error);
        throw error;
      }
      
      console.log("AuthContext: Sign out successful");
      setUser(null);
      setSession(null);
      
      return { success: true };
    } catch (error) {
      console.error("AuthContext: Sign out failed:", error.message);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update password function
  const updatePassword = async (newPassword) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      
      if (!user) throw new Error('No user logged in');
      
      // Update user metadata in Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          avatar_url: profileData.avatarUrl,
        },
      });
      
      if (authError) throw authError;
      
      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.fullName,
          avatar_url: profileData.avatarUrl,
          phone: profileData.phone,
          company: profileData.company,
          location: profileData.location,
          bio: profileData.bio,
          updated_at: new Date(),
        });
        
      if (profileError) throw profileError;
      
      // Refresh user data
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      setUser(userData.user);
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Upload avatar function
  const uploadAvatar = async (file) => {
    try {
      setLoading(true);
      
      if (!user) throw new Error('No user logged in');
      
      // Validate file type
      const fileExt = file.name.split('.').pop();
      const allowedExts = ['jpg', 'jpeg', 'png', 'gif'];
      const isValidFileType = allowedExts.includes(fileExt.toLowerCase());
      
      if (!isValidFileType) {
        throw new Error('Invalid file type. Please upload an image (jpg, jpeg, png, gif).');
      }
      
      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        throw new Error('File is too large. Maximum size is 2MB.');
      }
      
      // Create a unique file name
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });
        
      if (error) throw error;
      
      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      return { 
        success: true, 
        avatarUrl: urlData.publicUrl 
      };
    } catch (error) {
      setError(error.message);
      return { 
        success: false, 
        error: error.message 
      };
    } finally {
      setLoading(false);
    }
  };

  // Fallback method without googleapis package
  const handleGoogleLogin = async () => {
    try {
      const googleOAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=246122435031-p28qvt4c5kju6br8j10biv9b8hv4kpq9.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(
        window.location.origin + '/oauth/callback'
      )}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent`;
      window.location.href = googleOAuthURL;
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed: ' + error.message);
    }
  };

  // Proper Supabase OAuth method
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Initiating Supabase Google OAuth flow');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/oauth/callback`
        }
      });
      
      if (error) {
        console.error('Google auth error:', error);
        throw error;
      }
      
      console.log('Google auth initiated, redirecting to:', data?.url);
      // Supabase will handle the redirect
      
      return { success: true };
    } catch (error) {
      console.error('Google auth error:', error);
      setError('Google authentication failed: ' + error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    uploadAvatar,
    handleGoogleLogin,
    signInWithGoogle,
    logout: signOut // Alias for signOut for backward compatibility
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 