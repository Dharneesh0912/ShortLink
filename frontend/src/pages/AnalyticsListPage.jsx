import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUrls } from '../services/urlService';
import { motion } from 'framer-motion';
import {
  BarChart2, Link2, ExternalLink, Clock, MousePointerClick,
  Search, TrendingUp, ArrowRight, Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import CopyButton from '../components/CopyButton';
import EmptyState from '../components/Common/EmptyState';

const isExpired = (url) => url.expiresAt && new Date(url.expiresAt) < new Date();

const AnalyticsListPage = () => {
  const [urls, setUrls]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getUrls()
      .then(data => setUrls(data || []))
      .catch(() => toast.error('Failed to load URLs'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = urls.filter(u =>
    u.shortCode.toLowerCase().includes(search.toLowerCase()) ||
    u.originalUrl.toLowerCase().includes(search.toLowerCase())
  );

  const totalClicks = urls.reduce((s, u) => s + (u.totalClicks || 0), 0);
  const topUrl = [...urls].sort((a, b) => (b.totalClicks || 0) - (a.totalClicks || 0))[0];

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card" style={{ height: 80 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 8, borderRadius: 4 }} />
                <div className="skeleton" style={{ height: 12, width: '70%', borderRadius: 4 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>Analytics</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
          Click any link to view detailed analytics, charts, and visitor history.
        </p>
      </motion.div>

      {/* ── Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Links',   value: urls.length,   icon: Link2,           color: '#a5b4fc' },
          { label: 'Total Clicks',  value: totalClicks,   icon: MousePointerClick, color: '#67e8f9' },
          { label: 'Top Performer', value: topUrl ? `/${topUrl.shortCode}` : '—', icon: TrendingUp, color: '#6ee7b7', text: true },
          { label: 'Active Links',  value: urls.filter(u => !isExpired(u)).length, icon: BarChart2, color: '#fcd34d' },
        ].map(({ label, value, icon: Icon, color, text }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card"
            style={{ background: `${color}0f`, border: `1px solid ${color}22` }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <div style={{ fontSize: text ? '1rem' : '1.75rem', fontWeight: 700, color: '#fff', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {text ? value : Number(value).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Search + Table ── */}
      <div className="card" style={{ padding: 0 }}>
        {/* Table header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexWrap: 'wrap', gap: 10,
        }}>
          <h2 style={{ fontWeight: 600, color: '#fff', margin: 0, fontSize: '0.95rem' }}>
            All Links
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400, marginLeft: 8 }}>
              {urls.length} total
            </span>
          </h2>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search links…"
              className="input-field"
              style={{ paddingLeft: '2.2rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', fontSize: '0.82rem', width: 220 }}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '3rem' }}>
            <EmptyState
              title={search ? 'No links found' : 'No links yet'}
              description={search ? `No links match "${search}"` : 'Create your first link from the Dashboard to start seeing analytics.'}
              ctaLabel="Go to Dashboard"
              ctaTo="/dashboard"
            />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Short Link</th>
                  <th>Original URL</th>
                  <th>Clicks</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Analytics</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((url, i) => {
                  const expired = isExpired(url);
                  const BACKEND_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                  const shortUrl = `${BACKEND_BASE}/${url.shortCode}`;
                  return (
                    <motion.tr
                      key={url.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/analytics/${url.shortCode}`)}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#a5b4fc', fontFamily: 'monospace' }}>
                            /{url.shortCode}
                          </span>
                          <span onClick={e => e.stopPropagation()}>
                            <CopyButton text={shortUrl} />
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', maxWidth: 260 }}>
                        <span style={{
                          display: 'block', fontSize: '0.8rem', color: 'var(--muted)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }} title={url.originalUrl}>
                          {url.originalUrl}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: '0.82rem', fontWeight: 600, color: '#a5b4fc',
                        }}>
                          <MousePointerClick size={13} />
                          {(url.totalClicks || 0).toLocaleString()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--muted)' }}>
                          <Calendar size={12} />
                          {new Date(url.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${expired ? 'badge-danger' : 'badge-success'}`}>
                          {expired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={e => { e.stopPropagation(); navigate(`/analytics/${url.shortCode}`); }}
                          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                        >
                          View Details <ArrowRight size={13} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsListPage;
