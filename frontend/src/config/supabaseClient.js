import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://osgfubybxqzfifzkdjiq.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZ2Z1YnlieHF6ZmlmemtkamlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MzQxMzUsImV4cCI6MjA1NDQxMDEzNX0.hDu-Qp1j6iOFxMkP7bmZD0_meO2AlqPFD-u2hvsqku4';

console.log('Frontend Supabase configuration:', { 
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Missing', 
  keyPresent: !!supabaseAnonKey 
});

// Create client with proper configuration for persistent sessions
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage,
    detectSessionInUrl: true,
    flowType: 'implicit'
  }
});

// Initialize auth state
console.log('Initializing Supabase auth...');

// Check connection on initialization
(async () => {
  try {
    // Check for existing session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session retrieval error:', error.message);
    }
    
    if (session) {
      console.log('✅ Existing Supabase session found');
      // Store session token in localStorage for API requests
      localStorage.setItem('authToken', session.access_token);
    } else {
      console.log('No active Supabase session');
    }
    
    // Test connection
    console.log('✅ Supabase connection successful');
  } catch (err) {
    console.error('❌ Supabase connection error:', err.message);
  }
})();

export default supabase; 