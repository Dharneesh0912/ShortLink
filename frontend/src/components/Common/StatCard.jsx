import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

const GRADIENTS = {
  indigo: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))',
  cyan: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.08))',
  green: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.08))',
  amber: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.08))',
};

const BORDER_COLORS = {
  indigo: 'rgba(99,102,241,0.25)',
  cyan: 'rgba(6,182,212,0.25)',
  green: 'rgba(16,185,129,0.25)',
  amber: 'rgba(245,158,11,0.25)',
};

const ICON_COLORS = {
  indigo: '#a5b4fc',
  cyan: '#67e8f9',
  green: '#6ee7b7',
  amber: '#fcd34d',
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  color = 'indigo',
  trend,
  trendLabel,
  prefix = '',
  suffix = '',
  animate = true,
  delay = 0,
}) => {
  const isPositive = trend > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card card-hover"
      style={{
        background: GRADIENTS[color],
        border: `1px solid ${BORDER_COLORS[color]}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow blob */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: ICON_COLORS[color],
          opacity: 0.06,
          filter: 'blur(20px)',
        }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center"
          style={{ background: `${ICON_COLORS[color]}18`, color: ICON_COLORS[color] }}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>
        {trend !== undefined && (
          <span
            className="badge"
            style={{
              background: isPositive ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
              color: isPositive ? '#10B981' : '#EF4444',
              border: `1px solid ${isPositive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              fontSize: '0.7rem',
            }}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="text-3xl font-bold text-white mb-1">
        {animate ? (
          <AnimatedCounter target={typeof value === 'number' ? value : 0} prefix={prefix} suffix={suffix} />
        ) : (
          <span>{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</span>
        )}
      </div>
      <div className="text-sm" style={{ color: 'var(--muted)' }}>{label}</div>
      {trendLabel && (
        <div className="text-xs mt-1" style={{ color: 'var(--muted)', opacity: 0.7 }}>{trendLabel}</div>
      )}
    </motion.div>
  );
};

export default StatCard;
