import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { signIn, handleGoogleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call handleGoogleLogin from AuthContext to trigger OAuth flow
      await handleGoogleLogin();
      // No need to check result as it redirects to Google
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default Login; 