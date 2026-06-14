import { useLocation } from 'react-router-dom';
import { Menu, Bell, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const getPageTitle = (pathname) => {
  if (pathname === '/dashboard')          return 'Dashboard';
  if (pathname.startsWith('/analytics')) return 'Analytics';
  if (pathname === '/settings')           return 'Settings';
  return 'Dashboard';
};

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (location.pathname === '/login' || location.pathname === '/signup') return null;

  const title = getPageTitle(location.pathname);
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'U';
  const emailName = user?.email?.split('@')[0] || '';

  return (
    <header className="app-navbar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 1.5rem' }}>

        {/* Left: Hamburger (mobile) + Page title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="md:hidden btn btn-ghost btn-icon"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Mobile: show logo */}
            <div className="md:hidden" style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={14} color="white" strokeWidth={2.5} />
            </div>
            <h1 style={{
              fontWeight: 600, fontSize: '0.95rem', color: '#fff',
              margin: 0, letterSpacing: '-0.01em',
            }}>
              {title}
            </h1>
          </div>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Notifications */}
          <button
            className="btn btn-ghost btn-icon"
            title="Notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={16} />
            <span style={{
              position: 'absolute', top: 8, right: 8,
              width: 6, height: 6, borderRadius: '50%',
              background: '#6366F1',
              border: '1.5px solid var(--color-bg)',
            }} />
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />

          {/* User avatar + name */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '5px 10px 5px 6px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'default',
          }}
            title={user?.email}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {initials}
            </div>
            {emailName && (
              <span style={{
                fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.75)',
                whiteSpace: 'nowrap',
              }}
                className="hidden sm:block"
              >
                {emailName}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;