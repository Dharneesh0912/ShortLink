import { useState, useEffect, useMemo, useCallback } from 'react';
import { getUrls, deleteUrl, shortenUrl, bulkUpload, checkAlias } from '../services/urlService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, BarChart2, Trash2, Plus, Search,
  ExternalLink, Calendar, Upload, X, Check,
  AlertCircle, QrCode, ChevronLeft, ChevronRight,
  MousePointerClick, TrendingUp, Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/Common/StatCard';
import EmptyState from '../components/Common/EmptyState';
import CopyButton from '../components/CopyButton';
import { QRCodeSVG } from 'qrcode.react';

const ITEMS_PER_PAGE = 8;
const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const isExpired = (url) => url.expiresAt && new Date(url.expiresAt) < new Date();

const StatusBadge = ({ url }) =>
  isExpired(url)
    ? <span className="badge badge-danger">Expired</span>
    : <span className="badge badge-success">Active</span>;

// ─── Create Link Form ───
const CreateLinkForm = ({ onSuccess, onClose }) => {
  const [newUrl, setNewUrl]             = useState('');
  const [customAlias, setCustomAlias]   = useState('');
  const [expiresAt, setExpiresAt]       = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aliasAvailable, setAliasAvailable] = useState(null);
  const [showQR, setShowQR]             = useState(false);
  const [created, setCreated]           = useState(null);

  const previewUrl = customAlias 
    ? `${BASE}/${customAlias.trim()}` 
    : newUrl 
      ? `${BASE}/xxxxxxx` 
      : '';

  const handleAliasCheck = async () => {
    if (!customAlias || customAlias.trim().length < 3) return;
    try {
      const available = await checkAlias(customAlias.trim());
      setAliasAvailable(available);
    } catch { setAliasAvailable(null); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const alias = customAlias?.trim();
    if (alias && alias.length > 0) {
      if (alias.length < 3 || alias.length > 30 || !/^[a-zA-Z0-9_-]+$/.test(alias)) {
        toast.error("Alias must be 3-30 chars, letters/numbers/hyphens/underscores only.");
        return;
      }
    }
    if (aliasAvailable === false) {
      toast.error("Alias already taken, choose another.");
      return;
    }
    setIsSubmitting(true);
    try {
      const url = await shortenUrl(newUrl, alias || null, expiresAt || null);
      toast.success('Link created!');
      setCreated(url);
      onSuccess(url);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to create link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCreated(null);
    setNewUrl('');
    setCustomAlias('');
    setExpiresAt('');
    setAliasAvailable(null);
    setShowQR(false);
  };

  if (created) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Check size={24} style={{ color: 'var(--success)' }} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>Link Created!</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: '1.5rem' }}>
          <a href={created.shortUrl} target="_blank" rel="noreferrer" style={{ color: '#a5b4fc', fontWeight: 600, fontSize: '1.1rem' }}>
            {created.shortUrl}
          </a>
          <CopyButton text={created.shortUrl} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: '2rem' }}>
          <div style={{ padding: 12, borderRadius: 12, background: '#fff' }}>
            <QRCodeSVG value={created.shortUrl} size={160} />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Scan to visit</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={resetForm} style={{ flex: 1 }}>
              Create Another
            </button>
            <button type="button" className="btn btn-primary" onClick={() => { resetForm(); onClose(); }} style={{ flex: 1 }}>
              Done
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {/* Long URL */}
      <div>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Long URL <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <div className="input-wrapper">
          <span className="input-icon-left"><ExternalLink size={15} /></span>
          <input 
            type="url" 
            required 
            value={newUrl} 
            onChange={e => setNewUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('alias-input')?.focus();
              }
            }}
            className="input-field input-with-left-icon" 
            placeholder="https://example.com/very/long/url" 
          />
        </div>
      </div>

      {/* Custom Alias */}
      <div>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Your Custom Name <span style={{ fontSize: '0.75rem', fontWeight: 400, textTransform: 'none' }}>(e.g., goo, ama)</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', padding: '0.65rem 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            {BASE}/
          </span>
          <input 
            id="alias-input"
            type="text" 
            value={customAlias}
            onChange={e => { setCustomAlias(e.target.value); setAliasAvailable(null); }}
            onBlur={handleAliasCheck}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('expiry-input')?.focus();
              }
            }}
            className="input-field" 
            placeholder="e.g. goo" 
          />
        </div>
        {aliasAvailable === true  && <p style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Alias available</p>}
        {aliasAvailable === false && <p style={{ fontSize: '0.75rem', marginTop: 4, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} /> Alias already taken</p>}
        {previewUrl && (
          <div style={{ marginTop: 8, padding: '6px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--muted)' }}>Preview: </span>
            <span style={{ color: '#a5b4fc', fontFamily: 'monospace' }}>{previewUrl}</span>
          </div>
        )}
      </div>

      {/* Expiry */}
      <div>
        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Expiry Date <span style={{ fontSize: '0.75rem', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
        </label>
        <div className="input-wrapper">
          <span className="input-icon-left"><Calendar size={15} /></span>
          <input 
            id="expiry-input"
            type="datetime-local" 
            value={expiresAt} 
            onChange={e => setExpiresAt(e.target.value)}
            className="input-field input-with-left-icon" 
            min={new Date().toISOString().slice(0, 16)} 
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" disabled={isSubmitting || aliasAvailable === false || !newUrl} className="btn btn-primary">
          {isSubmitting ? (
            <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg> Creating…</>
          ) : (<><Plus size={15} /> Create Link</>)}
        </button>
      </div>
    </form>
  );
};

// ─── URL Row with inline delete confirm ───
const UrlRow = ({ url, onDelete, onAnalytics }) => {
  const [deleting, setDeleting]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    await onDelete(url.id);
    setDeleting(false);
    setConfirmDelete(false);
  };

  const shortUrl = `${BASE}/${url.shortCode}`;

  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} layout>
      {/* Short link + original */}
      <td style={{ padding: '14px 16px', minWidth: 180 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <a href={shortUrl} target="_blank" rel="noreferrer"
            style={{ fontWeight: 600, fontSize: '0.875rem', color: '#a5b4fc', fontFamily: 'monospace', textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
            onMouseLeave={e => e.target.style.textDecoration = 'none'}>
            /{url.shortCode}
          </a>
          <CopyButton text={shortUrl} />
        </div>
        <div style={{
          fontSize: '0.75rem', marginTop: 3, color: 'var(--muted)',
          maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }} title={url.originalUrl}>
          {url.originalUrl}
        </div>
      </td>

      {/* Status */}
      <td style={{ padding: '14px 16px' }}><StatusBadge url={url} /></td>

      {/* Clicks */}
      <td style={{ padding: '14px 16px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600, fontSize: '0.875rem', color: '#a5b4fc' }}>
          <MousePointerClick size={13} />
          {(url.totalClicks || 0).toLocaleString()}
        </span>
      </td>

      {/* Created */}
      <td style={{ padding: '14px 16px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={12} />
          {new Date(url.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Analytics button */}
          <button onClick={() => onAnalytics(url.shortCode)} className="btn btn-ghost btn-icon" title="View Analytics">
            <BarChart2 size={15} />
          </button>

          {/* Delete — inline confirm */}
          <AnimatePresence mode="wait">
            {confirmDelete ? (
              <motion.div key="confirm" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={handleDeleteConfirm} disabled={deleting} className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                  {deleting ? '…' : 'Confirm'}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }}>
                  <X size={13} />
                </button>
              </motion.div>
            ) : (
              <motion.button key="delete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setConfirmDelete(true)} className="btn btn-danger btn-icon" title="Delete">
                <Trash2 size={15} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </td>
    </motion.tr>
  );
};

// ─── Main Dashboard ───
const DashboardPage = () => {
  const [urls, setUrls]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkFile, setBulkFile]         = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [page, setPage]                 = useState(1);
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const fetchUrls = useCallback(async (silent = false) => {
    try {
      const data = await getUrls();
      setUrls(data || []);
    } catch { 
      if (!silent) toast.error('Failed to load URLs'); 
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    fetchUrls(); 
    // Poll every 5 seconds for live click counts without full loading state
    const intervalId = setInterval(() => fetchUrls(true), 5000);
    return () => clearInterval(intervalId);
  }, [fetchUrls]);

  // Listen for sidebar "Create Link" button event
  useEffect(() => {
    const handler = () => { setShowCreateForm(true); setShowBulkUpload(false); };
    window.addEventListener('open-create-link', handler);
    return () => window.removeEventListener('open-create-link', handler);
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteUrl(id);
      setUrls(prev => prev.filter(u => u.id !== id));
      toast.success('Link deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) return;
    setIsSubmitting(true);
    try {
      await bulkUpload(bulkFile);
      toast.success('Bulk upload successful!');
      setShowBulkUpload(false);
      setBulkFile(null);
      fetchUrls();
    } catch { toast.error('Bulk upload failed'); }
    finally { setIsSubmitting(false); }
  };

  // Real computed stats
  const totalUrls    = urls.length;
  const totalClicks  = urls.reduce((s, u) => s + (u.totalClicks || 0), 0);
  const activeUrls   = urls.filter(u => !isExpired(u)).length;

  // Today's clicks — sum clicks from URLs that were updated today
  const today = new Date().toDateString();
  const todaysClicks = urls.reduce((s, u) => {
    if (!u.lastClickedAt) return s;
    return new Date(u.lastClickedAt).toDateString() === today ? s + 1 : s;
  }, 0);

  // Filtered + paginated
  const filtered = useMemo(() => {
    let list = urls;
    if (filter === 'active')  list = list.filter(u => !isExpired(u));
    if (filter === 'expired') list = list.filter(u => isExpired(u));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.shortCode.toLowerCase().includes(q) ||
        u.originalUrl.toLowerCase().includes(q)
      );
    }
    return list;
  }, [urls, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const emailName = user?.email?.split('@')[0] || 'there';

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '1rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card" style={{ height: 120 }}>
              <div className="skeleton" style={{ height: 16, width: 96, marginBottom: 12, borderRadius: 6 }} />
              <div className="skeleton" style={{ height: 32, width: 64, borderRadius: 6 }} />
            </div>
          ))}
        </div>
        <div className="card" style={{ height: 300 }}>
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Hero ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              {greeting()},{' '}
              <span className="gradient-text">{emailName}</span> 👋
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 4 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => { setShowBulkUpload(v => !v); setShowCreateForm(false); }}
              className="btn btn-secondary"
            >
              <Upload size={15} /> Bulk Upload
            </button>
            <button
              onClick={() => { setShowCreateForm(v => !v); setShowBulkUpload(false); }}
              className="btn btn-primary"
            >
              <Plus size={15} /> Create Link
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '1rem' }}>
        <StatCard label="Total URLs"    value={totalUrls}   icon={Link2}            color="indigo" delay={0.05} />
        <StatCard label="Total Clicks"  value={totalClicks} icon={MousePointerClick} color="cyan"   delay={0.1}  />
        <StatCard label="Today's Clicks" value={todaysClicks} icon={TrendingUp}      color="green"  delay={0.15} />
        <StatCard label="Active Links"  value={activeUrls}  icon={Activity}          color="amber"  delay={0.2}  />
      </div>

      {/* ── Create Form ── */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="card card-gradient-border">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0 }}>Create Short Link</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateForm(false)}><X size={16} /></button>
              </div>
              <CreateLinkForm
                onSuccess={(url) => setUrls(prev => [url, ...prev])}
                onClose={() => setShowCreateForm(false)}
              />
            </div>
          </motion.div>
        )}

        {/* ── Bulk Upload ── */}
        {showBulkUpload && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0 }}>Bulk Upload CSV</h2>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowBulkUpload(false)}><X size={16} /></button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                Upload a CSV with a column named <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>url</code> containing links to shorten.
              </p>
              <form onSubmit={handleBulkUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="file" accept=".csv" onChange={e => setBulkFile(e.target.files[0])} className="input-field" required />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowBulkUpload(false)}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                    {isSubmitting ? 'Uploading…' : <><Upload size={14} /> Upload CSV</>}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── URL Table ── */}
      <div className="card" style={{ padding: 0 }}>
        {/* Table toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10, padding: '1rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <h2 style={{ fontWeight: 600, color: '#fff', margin: 0, fontSize: '0.95rem' }}>
            My Links
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>
              {urls.length} total
            </span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text" value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="input-field"
                placeholder="Search links…"
                style={{ paddingLeft: '2.2rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', fontSize: '0.82rem', width: 200 }}
              />
            </div>
            <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="input-field"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem', width: 100 }}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '2.5rem' }}>
            <EmptyState
              title={search ? 'No links found' : 'No links yet'}
              description={search ? `No links match "${search}"` : 'Create your first short link to start tracking clicks and analytics.'}
              ctaLabel="Create First Link"
              onCtaClick={() => { setShowCreateForm(true); setSearch(''); }}
            />
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Short Link / Original URL</th>
                    <th>Status</th>
                    <th>Clicks</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paginated.map(url => (
                      <UrlRow
                        key={url.id}
                        url={url}
                        onDelete={handleDelete}
                        onAnalytics={(code) => navigate(`/analytics/${code}`)}
                      />
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.05)',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {filtered.length} links · Page {page} of {totalPages}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button className="btn btn-ghost btn-icon" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} className="btn btn-ghost"
                      style={{ minWidth: 32, height: 32, padding: '0 8px', fontSize: '0.8rem',
                        background: page === p ? 'rgba(99,102,241,0.2)' : undefined,
                        color: page === p ? '#a5b4fc' : undefined }}>
                      {p}
                    </button>
                  ))}
                  <button className="btn btn-ghost btn-icon" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;