// pages/login.js
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Login Error: ' + error.message);
    } else {
      // Supabase's onAuthStateChange listener in index.js will handle redirect
      // You might want to explicitly redirect here if not relying solely on onAuthStateChange
      // router.push('/');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      alert('Google Login Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0', // Light gray background
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2em',
          marginBottom: '20px',
          color: '#333'
        }}>MemoryDeck Login</h1>

        <form style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', textAlign: 'left', color: '#555' }}>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: 'calc(100% - 16px)', // Account for padding
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', textAlign: 'left', color: '#555' }}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: 'calc(100% - 16px)',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            type="submit"
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontSize: '1em'
            }}
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <div style={{ margin: '20px 0', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#db4437', // Google red
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontSize: '1em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {/* Simple Google Icon SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.24 10.23c-.22-.65-.43-1.3-.43-1.95 0-1.74 1.15-3.03 3.01-3.03 1.05 0 1.93.42 2.59 1.22l2.12-2.12C17.43 2.87 14.93 2 12 2 7.03 2 3 6.03 3 11c0 4.97 4.03 9 9 9s9-4.03 9-9c0-.65-.08-1.28-.24-1.92H12.24zM12 18c-3.87 0-7-3.13-7-7 0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7z" fill="#4285F4"/>
              <path d="M12 18c-3.87 0-7-3.13-7-7 0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7z" fill="#FBBC05"/>
              <path d="M12 18c-3.87 0-7-3.13-7-7 0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7z" fill="#EA4335"/>
              <path d="M12 18c-3.87 0-7-3.13-7-7 0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7z" fill="#34A853"/>
            </svg>
            <span>{loading ? 'Logging In...' : 'Continue with Google'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}