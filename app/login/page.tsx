'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInUser } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      const result = await signInUser(email, password) as { success: boolean; error?: string };
      
      if (!result.success) {
        setError(result.error || 'Login failed');
        return;
      }

      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        width: "100%",
        maxWidth: "420px",
        padding: "40px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 15px",
            fontSize: "36px",
            color: "white"
          }}>🏥</div>
          <h1 style={{ color: "#333", fontSize: "28px", marginBottom: "8px" }}>Welcome Back</h1>
          <p style={{ color: "#666", fontSize: "14px" }}>Clinical Management System</p>
        </div>

        {error && (
          <div style={{
            background: "#fee",
            border: "2px solid #f99",
            borderRadius: "10px",
            padding: "12px",
            marginBottom: "20px",
            color: "#c33",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#333", fontWeight: 500, marginBottom: "8px", fontSize: "14px" }}>
              Email
            </label>
            <input 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required 
              style={{ width: "100%", padding: "12px 15px", border: "2px solid #e0e0e0", borderRadius: "10px", fontSize: "15px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#333", fontWeight: 500, marginBottom: "8px", fontSize: "14px" }}>
              Password
            </label>
            <input 
              type="password" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required 
              style={{ width: "100%", padding: "12px 15px", border: "2px solid #e0e0e0", borderRadius: "10px", fontSize: "15px" }}
            />
          </div>

          <div style={{ textAlign: "right", marginTop: "-10px", marginBottom: "25px" }}>
            <a href="#" style={{ color: "#667eea", textDecoration: "none", fontSize: "13px" }}>Forgot Password?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "#999" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              marginBottom: "15px",
              opacity: loading ? 0.7 : 1
            }}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: "center", margin: "25px 0", position: "relative" }}>
          <span style={{ background: "white", padding: "0 15px", color: "#999", fontSize: "13px", position: "relative", zIndex: 1 }}>OR</span>
          <hr style={{ position: "absolute", top: "50%", width: "100%", border: "0", borderTop: "1px solid #e0e0e0", margin: "0" }} />
        </div>

        <button type="button" style={{
          width: "100%",
          padding: "14px",
          borderRadius: "10px",
          fontSize: "16px",
          background: "white",
          border: "2px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          cursor: "pointer"
        }}>
          <svg style={{ width: "20px", height: "20px" }} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <div style={{ textAlign: "center", marginTop: "25px", color: "#666", fontSize: "13px" }}>
          Don&apos;t have an account? <a href="#" style={{ color: "#667eea", fontWeight: 600, textDecoration: "none" }}>Sign Up</a>
        </div>
      </div>
    </div>
  );
}
