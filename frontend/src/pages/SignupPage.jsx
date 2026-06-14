import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap, Link2, BarChart3, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

const BENEFITS = [
  { icon: Link2,     title: 'Smart URL Shortening',    desc: 'Create branded, memorable short links instantly', color: '#a5b4fc' },
  { icon: BarChart3, title: 'Deep Click Analytics',    desc: 'Track every click with location and device data',  color: '#67e8f9' },
  { icon: CheckCircle2, title: 'Custom Aliases',       desc: 'Your domain, your brand, your audience',          color: '#6ee7b7' },
];

const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: 'transparent', pct: 0 };
  let s = 0;
  if (pw.length >= 6)            s++;
  if (pw.length >= 10)           s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw))  s++;
  if (s <= 1) return { score: s, label: 'Weak',   color: '#EF4444', pct: 25  };
  if (s <= 3) return { score: s, label: 'Fair',   color: '#F59E0B', pct: 55  };
  if (s <= 4) return { score: s, label: 'Good',   color: '#06B6D4', pct: 80  };
  return       { score: s, label: 'Strong', color: '#10B981', pct: 100 };
};

const SignupPage = () => {
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [fieldError, setFieldError]         = useState('');
  const { signup } = useAuth();

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');

    if (password.length < 6) {
      setFieldError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setFieldError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await signup(email, password);
    if (result !== true) {
      setError(typeof result === 'string' ? result : 'Signup failed. Please try again.');
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
          background: 'linear-gradient(145deg, #0f0c28 0%, #10142b 50%, #091522 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(139,92,246,0.14)', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '5%',  width: 250, height: 250, borderRadius: '50%', background: 'rgba(6,182,212,0.1)',   filter: 'blur(80px)', pointerEvents: 'none' }} />

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
            Start building<br />
            <span className="gradient-text">smarter links</span>
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.55)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Everything you need to manage, shorten and grow your audience with data-driven insights.
          </p>

          {/* Benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {BENEFITS.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, position: 'relative', zIndex: 1 }}
        >
          {['Free forever', 'No credit card', 'Cancel anytime'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>
              <CheckCircle2 size={11} style={{ color: '#6ee7b7' }} />
              {t}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── RIGHT: Form Panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
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
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>Create your account</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>Start optimizing your links for free — no card required</p>
          </div>

          {/* Form Card */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Email address
                </label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Mail size={15} /></span>
                  <input
                    id="signup-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldError(''); }}
                    className="input-field input-with-left-icon input-with-right-icon"
                    placeholder="At least 6 characters"
                  />
                  <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {/* Strength indicator */}
                {password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <motion.div
                        animate={{ width: `${strength.pct}%`, background: strength.color }}
                        transition={{ duration: 0.3 }}
                        style={{ height: '100%', borderRadius: 999 }}
                      />
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: 4, color: strength.color, fontWeight: 500 }}>
                      {strength.label}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 6, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                  Confirm Password
                </label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Lock size={15} /></span>
                  <input
                    id="signup-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setFieldError(''); }}
                    className="input-field input-with-left-icon input-with-right-icon"
                    placeholder="Re-enter your password"
                    style={{ borderColor: fieldError && confirmPassword ? 'rgba(239,68,68,0.5)' : '' }}
                  />
                  <button type="button" className="input-icon-right" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Validation / server errors */}
              <AnimatePresence>
                {(fieldError || error) && (
                  <motion.div
                    key="form-error"
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
                    {fieldError || error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email || !password || !confirmPassword}
                className="btn btn-primary"
                style={{ width: '100%', height: 46, fontSize: '0.95rem', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Creating account…
                  </>
                ) : (
                  <>Create Free Account <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          </div>

          {/* Login link */}
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted)', marginTop: '1.25rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>
              Sign in →
            </Link>
          </p>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(148,163,184,0.5)', marginTop: 10 }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;