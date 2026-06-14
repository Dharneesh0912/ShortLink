import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnalytics } from '../services/analyticsService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, QrCode, Globe, Monitor, Clock, TrendingUp,
  MousePointerClick, Smartphone, MapPin, Link2, ExternalLink,
  Calendar, Globe2, Activity,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import CopyButton from '../components/CopyButton';
import StatCard from '../components/Common/StatCard';
import EmptyState from '../components/Common/EmptyState';

const COLORS = ['#6366F1', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 text-sm" style={{ minWidth: 130 }}>
      {label && <div className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.fill || p.stroke }} />
          <span style={{ color: '#fff', fontWeight: 600 }}>{p.value?.toLocaleString()}</span>
          <span style={{ color: 'var(--muted)' }}>{p.name}</span>
        </div>
      ))}
    </div>
  );
};

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 26;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="rgba(255,255,255,0.65)" textAnchor={x > cx ? 'start' : 'end'} fontSize={11}>
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
};

const ActivityItem = ({ visit, index }) => {
  if (!visit) return null;
  const device = visit.device || 'unknown';
  const DevIcon = device.toLowerCase() === 'mobile' ? Smartphone : Monitor;
  
  const timeAgo = (ts) => {
    if (!ts) return '';
    try {
      const diff = Date.now() - new Date(ts).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return 'just now';
      if (m < 60) return `${m}m ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h ago`;
      return `${Math.floor(h / 24)}d ago`;
    } catch { return ''; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="timeline-item"
    >
      <div className="timeline-dot" style={{ background: COLORS[index % COLORS.length] }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <DevIcon size={14} style={{ color: 'var(--muted)', marginTop: 2, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fff', textTransform: 'capitalize' }}>
              {visit.device || 'Unknown device'}
            </span>
            {visit.browser && (
              <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>{visit.browser}</span>
            )}
            {visit.country && (
              <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
                <MapPin size={9} /> {visit.country}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: 2, color: 'var(--muted)' }}>
            {visit.timestamp ? new Date(visit.timestamp).toLocaleString() : 'Recently'} · {timeAgo(visit.timestamp)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ChartEmpty = ({ message = 'No data yet' }) => (
  <div style={{
    height: 220, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    color: 'var(--muted)', gap: 8,
  }}>
    <TrendingUp size={28} style={{ opacity: 0.2 }} />
    <p style={{ fontSize: '0.85rem' }}>{message}</p>
  </div>
);

const AnalyticsPage = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => { fetchAnalytics(); }, [shortCode]);

  const fetchAnalytics = async () => {
    try {
      const data = await getAnalytics(shortCode);
      setAnalytics(data);
    } catch {
      toast.error('Failed to load analytics');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <div className="animate-spin" style={{ width: 40, height: 40, border: '3px solid rgba(165,180,252,0.1)', borderTopColor: '#a5b4fc', borderRadius: '50%' }} />
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) return null;

  const BACKEND_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const shortUrl = `${BACKEND_BASE}/${shortCode}`;
  
  // Strict data transformation with fallbacks
  const deviceBreakdown = analytics.deviceBreakdown || {};
  const deviceData = Object.entries(deviceBreakdown)
    .filter(([_, v]) => typeof v === 'number' && v > 0)
    .map(([name, value]) => ({ name, value }));

  const osData = Object.entries(analytics.osBreakdown || {})
    .filter(([_, v]) => typeof v === 'number' && v > 0)
    .map(([name, value]) => ({ name, value }));

  const browserData = Object.entries(analytics.browserBreakdown || {})
    .filter(([_, v]) => typeof v === 'number' && v > 0)
    .map(([name, value]) => ({ name, value }));

  const referrerData = Object.entries(analytics.referrerBreakdown || {})
    .filter(([_, v]) => typeof v === 'number' && v > 0)
    .map(([name, value]) => ({ name, value }));

  const countryEntries = Object.entries(analytics.countryBreakdown || {});
  const countryData = countryEntries
    .filter(([_, v]) => typeof v === 'number' && v > 0)
    .map(([name, value]) => ({ name: name || 'Unknown', value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
    
  const uniqueCountries = countryData.length;
  const trends = (analytics.dailyTrends || []).filter(t => t && typeof t.count === 'number');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 16,
            padding: '4px 0',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Title row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                Link Analytics
              </h1>
              {/* Short URL row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <code style={{
                  fontSize: '0.85rem', padding: '3px 10px', borderRadius: 8, fontFamily: 'monospace',
                  background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)',
                }}>
                  /{shortCode}
                </code>
                <CopyButton text={shortUrl} />
                <a href={shortUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon" title="Open link">
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                >
                  <QrCode size={13} /> {showQR ? 'Hide QR' : 'QR Code'}
                </button>
              </div>
              {/* Original URL */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Link2 size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <span style={{
                  fontSize: '0.8rem', color: 'var(--muted)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500,
                }}
                  title={analytics.originalUrl}
                >
                  {analytics.originalUrl}
                </span>
              </div>
            </div>

            {/* Big click number */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }} className="gradient-text">
                {(analytics.totalClicks || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>Total Clicks</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── QR Code ── */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', overflow: 'hidden' }}
          >
            <div style={{ padding: 16, borderRadius: 16, background: '#fff', marginBottom: 12 }}>
              <QRCodeSVG value={shortUrl} size={160} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Scan to visit</p>
            <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#a5b4fc' }}>{shortUrl}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        <StatCard label="Total Clicks"     value={analytics.totalClicks || 0}  icon={MousePointerClick} color="indigo" delay={0.05} />
        <StatCard label="Unique Countries" value={uniqueCountries}              icon={Globe}             color="cyan"   delay={0.1}  />
        <StatCard
          label="Last Visited"
          value={analytics.lastVisited ? new Date(analytics.lastVisited).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never'}
          icon={Clock} color="green" delay={0.15} animate={false}
        />
        <StatCard
          label="Device Types"
          value={deviceData.length || 0}
          icon={Monitor} color="amber" delay={0.2}
        />
      </div>

      {/* ── Daily Trend Chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
          <TrendingUp size={18} style={{ color: '#a5b4fc' }} />
          <h2 style={{ fontWeight: 600, color: '#fff', margin: 0 }}>Daily Click Trend</h2>
          <span className="badge badge-muted" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>Last 30 days</span>
        </div>
        {trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trends} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="clicks" stroke="#6366F1" strokeWidth={2.5}
                fill="url(#clickGrad)" dot={false}
                activeDot={{ r: 5, fill: '#6366F1', stroke: '#0B1120', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmpty message="No click data yet — share your link to start tracking!" />
        )}
      </motion.div>

      {/* ── Breakdown Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* Device Pie */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <Monitor size={18} style={{ color: '#67e8f9' }} />
            <h2 style={{ fontWeight: 600, color: '#fff', margin: 0 }}>Device Breakdown</h2>
          </div>
          {deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={renderCustomLabel} labelLine={{ stroke: 'rgba(255,255,255,0.08)' }}>
                  {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(val) => <span style={{ color: 'var(--muted)', fontSize: 11 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <ChartEmpty message="No device data yet" />}
        </motion.div>

        {/* OS Breakdown (New) */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <Activity size={18} style={{ color: '#8B5CF6' }} />
            <h2 style={{ fontWeight: 600, color: '#fff', margin: 0 }}>OS Breakdown</h2>
          </div>
          {osData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={osData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={renderCustomLabel} labelLine={{ stroke: 'rgba(255,255,255,0.08)' }}>
                  {osData.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(val) => <span style={{ color: 'var(--muted)', fontSize: 11 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <ChartEmpty message="No OS data yet" />}
        </motion.div>

        {/* Browser Pie */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <Globe2 size={18} style={{ color: '#a5b4fc' }} />
            <h2 style={{ fontWeight: 600, color: '#fff', margin: 0 }}>Browser Breakdown</h2>
          </div>
          {browserData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={browserData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={renderCustomLabel} labelLine={{ stroke: 'rgba(255,255,255,0.08)' }}>
                  {browserData.map((_, i) => <Cell key={i} fill={COLORS[(i + 1) % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(val) => <span style={{ color: 'var(--muted)', fontSize: 11 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <ChartEmpty message="No browser data yet" />}
        </motion.div>

        {/* Referrer breakdown (New) */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <ExternalLink size={18} style={{ color: '#10B981' }} />
            <h2 style={{ fontWeight: 600, color: '#fff', margin: 0 }}>Top Referrers</h2>
          </div>
          {referrerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={referrerData.sort((a, b) => b.value - a.value).slice(0, 5)} layout="vertical" margin={{ left: -20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : <ChartEmpty message="No referrer data yet" />}
        </motion.div>
      </div>

      {/* ── Country Bar Chart ── */}
      {countryData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <Globe size={18} style={{ color: '#6ee7b7' }} />
            <h2 style={{ fontWeight: 600, color: '#fff', margin: 0 }}>Top Countries</h2>
            <span className="badge badge-muted" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>Top {Math.min(countryData.length, 10)}</span>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(180, countryData.length * 32)}>
            <BarChart data={countryData} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} tickLine={false} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="clicks" radius={[0, 4, 4, 0]}>
                {countryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* ── Recent Activity ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
          <Clock size={18} style={{ color: '#fcd34d' }} />
          <h2 style={{ fontWeight: 600, color: '#fff', margin: 0 }}>Recent Activity</h2>
          {analytics.recentVisits?.length > 0 && (
            <span className="badge badge-muted" style={{ marginLeft: 'auto' }}>
              {analytics.recentVisits.length} visits
            </span>
          )}
        </div>
        {analytics.recentVisits?.length > 0 ? (
          <div className="timeline">
            {analytics.recentVisits.slice(0, 25).map((visit, i) => (
              <ActivityItem key={i} visit={visit} index={i} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--muted)' }}>
            <Calendar size={36} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>No visits yet</p>
            <p style={{ fontSize: '0.8rem' }}>Share your link and visits will appear here in real-time.</p>
            <button
              className="btn btn-secondary"
              style={{ marginTop: 16, fontSize: '0.8rem' }}
              onClick={() => { navigator.clipboard.writeText(shortUrl); toast.success('Link copied!'); }}
            >
              Copy Link
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;