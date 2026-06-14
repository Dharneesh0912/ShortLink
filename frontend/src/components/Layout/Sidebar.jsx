import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Link2, BarChart2, Settings,
  ChevronLeft, ChevronRight, Zap, LogOut, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true  },
  { to: '/dashboard', label: 'My URLs',   icon: Link2,           exact: true  },
  { to: '/analytics', label: 'Analytics', icon: BarChart2,       exact: false },
  { to: '/settings',  label: 'Settings',  icon: Settings,        exact: true  },
];

const Label = ({ children }) => (
  <motion.span
    key="label"
    initial={{ opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -6 }}
    transition={{ duration: 0.18 }}
    style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
  >
    {children}
  </motion.span>
);

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'U';
  const emailDisplay = user?.email || '';

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'hidden' }}
      >
        {/* ── Brand ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: collapsed ? '0 16px' : '0 20px',
          height: 64, borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0, overflow: 'hidden',
        }}>
          <div style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(99,102,241,0.35)',
          }}>
            <Zap size={16} strokeWidth={2.5} color="white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                key="brand-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}>ShortLink</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 1 }}>Analytics Platform</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Navigation ── */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 10px' }}>

          {/* Section: Main */}
          {!collapsed && (
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.45)', padding: '8px 8px 4px' }}>
              Main
            </div>
          )}

          {NAV_ITEMS.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => mobileOpen && setMobileOpen(false)}
                title={collapsed ? item.label : ''}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: 10, padding: collapsed ? '10px 0' : '10px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 10, marginBottom: 2, textDecoration: 'none',
                  transition: 'background 150ms, color 150ms',
                  background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: active ? '#a5b4fc' : 'var(--muted)',
                  border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                  fontSize: '0.875rem', fontWeight: active ? 600 : 500,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, borderRadius: 999,
                    background: 'linear-gradient(to bottom, #6366F1, #8B5CF6)',
                  }} />
                )}
                <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                </span>
                <AnimatePresence>
                  {!collapsed && <Label>{item.label}</Label>}
                </AnimatePresence>
              </Link>
            );
          })}

          {/* Create Link shortcut */}
          {!collapsed && (
            <Link
              to="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                mobileOpen && setMobileOpen(false);
                // Dispatch a custom event to open the create form
                window.dispatchEvent(new CustomEvent('open-create-link'));
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 10, marginTop: 6, marginBottom: 2,
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
                color: '#a5b4fc',
                background: 'rgba(99,102,241,0.07)',
                border: '1px dashed rgba(99,102,241,0.25)',
                transition: 'background 150ms, border-color 150ms',
              }}
              title="Create a new short link"
            >
              <Plus size={16} strokeWidth={2} />
              <span style={{ whiteSpace: 'nowrap' }}>Create Link</span>
            </Link>
          )}

          {/* Section: Analytics */}
          <div style={{ marginTop: 16 }}>
            {!collapsed && (
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.45)', padding: '8px 8px 4px' }}>
                Reports
              </div>
            )}
            {NAV_ITEMS.slice(2, 3).map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => mobileOpen && setMobileOpen(false)}
                  title={collapsed ? item.label : ''}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: 10, padding: collapsed ? '10px 0' : '10px 10px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 10, marginBottom: 2, textDecoration: 'none',
                    transition: 'background 150ms, color 150ms',
                    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: active ? '#a5b4fc' : 'var(--muted)',
                    border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                    fontSize: '0.875rem', fontWeight: active ? 600 : 500,
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {active && (
                    <div style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: 3, borderRadius: 999,
                      background: 'linear-gradient(to bottom, #6366F1, #8B5CF6)',
                    }} />
                  )}
                  <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  </span>
                  <AnimatePresence>
                    {!collapsed && <Label>{item.label}</Label>}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>

          {/* Section: System */}
          <div style={{ marginTop: 16 }}>
            {!collapsed && (
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.45)', padding: '8px 8px 4px' }}>
                System
              </div>
            )}
            {NAV_ITEMS.slice(3).map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => mobileOpen && setMobileOpen(false)}
                  title={collapsed ? item.label : ''}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: 10, padding: collapsed ? '10px 0' : '10px 10px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: 10, marginBottom: 2, textDecoration: 'none',
                    transition: 'background 150ms, color 150ms',
                    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                    color: active ? '#a5b4fc' : 'var(--muted)',
                    border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                    fontSize: '0.875rem', fontWeight: active ? 600 : 500,
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {active && (
                    <div style={{
                      position: 'absolute', left: 0, top: '20%', bottom: '20%',
                      width: 3, borderRadius: 999,
                      background: 'linear-gradient(to bottom, #6366F1, #8B5CF6)',
                    }} />
                  )}
                  <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  </span>
                  <AnimatePresence>
                    {!collapsed && <Label>{item.label}</Label>}
                  </AnimatePresence>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ── Footer: User + Logout ── */}
        <div style={{
          flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '12px 10px',
        }}>
          {/* User info row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 10, padding: collapsed ? '8px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 10, marginBottom: 4,
            background: 'rgba(255,255,255,0.02)',
            overflow: 'hidden',
          }}
            title={collapsed ? emailDisplay : ''}
          >
            {/* Avatar */}
            <div style={{
              flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', fontWeight: 700, color: '#fff',
            }}>
              {initials}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ overflow: 'hidden', minWidth: 0 }}
                >
                  <div style={{
                    fontSize: '0.78rem', color: 'var(--muted)',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                    textOverflow: 'ellipsis', maxWidth: 150,
                  }}>
                    {emailDisplay}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(148,163,184,0.5)', marginTop: 1 }}>
                    Free plan
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            title={collapsed ? 'Logout' : ''}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: 10, padding: collapsed ? '9px 0' : '9px 10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)',
              background: 'rgba(239,68,68,0.05)', cursor: 'pointer',
              color: '#F87171', fontSize: '0.875rem', fontWeight: 500,
              transition: 'background 150ms, border-color 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)'; }}
          >
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={17} strokeWidth={1.8} />
            </span>
            <AnimatePresence>
              {!collapsed && <Label>Logout</Label>}
            </AnimatePresence>
          </button>
        </div>

        {/* ── Collapse toggle ── */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute', right: -13, top: 80,
            width: 26, height: 26, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'var(--surface)', color: 'var(--muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10, flexShrink: 0,
            transition: 'background 150ms, color 150ms',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; e.currentTarget.style.color = '#a5b4fc'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--muted)'; }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </motion.aside>
    </>
  );
};

export default Sidebar;
