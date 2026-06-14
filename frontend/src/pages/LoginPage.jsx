import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap, TrendingUp, Shield, Globe, ArrowRight, AlertCircle } from 'lucide-react';

const FEATURES = [
  { icon: TrendingUp, label: 'Real-time click analytics', color: '#a5b4fc' },
  { icon: Shield,    label: '99.9% uptime guaranteed',   color: '#6ee7b7' },
  { icon: Globe,     label: 'Global CDN performance',    color: '#67e8f9' },
];

const LoginPage = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result !== true) {
      setError(typeof result === 'string' ? result : 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>

      {/* ── LEFT: Branding Panel ── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '45%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem',
          background: 'linear-gradient(145deg, #0f1729 0%, #111827 50%, #0d1b3e 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '5%',  width: 260, height: 260, borderRadius: '50%', background: 'rgba(6,182,212,0.1)',    filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
            <Zap size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>ShortLink</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Analytics Platform</div>
          </div>
        </div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <h1 style={{ fontSize: '2.6rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '1rem' }}>
            Smarter links,<br />
            <span className="gradient-text">better results</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Shorten, brand and track every link with real-time analytics and global insights.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FEATURES.map(({ icon: Icon, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{ display: 'flex', gap: 24, position: 'relative', zIndex: 1 }}
        >
          {[['10M+', 'Clicks tracked'], ['99.9%', 'Uptime'], ['50K+', 'Users']].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{val}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{lbl}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── RIGHT: Form Panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 700, color: '#fff' }}>ShortLink</span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>Welcome back</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Sign in to your account to continue</p>
          </div>

          {/* Form Card */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Email address
                </label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Mail size={15} /></span>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="input-field input-with-left-icon"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Password
                </label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Lock size={15} /></span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    className="input-field input-with-left-icon input-with-right-icon"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                      padding: '10px 14px', borderRadius: 10,
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      color: 'var(--danger)', fontSize: '0.85rem',
                    }}
                  >
                    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="btn btn-primary"
                style={{ width: '100%', height: 46, fontSize: '0.95rem', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>Sign In <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          </div>

          {/* Sign up link */}
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)', marginTop: '1.25rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>
              Create one free →
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;