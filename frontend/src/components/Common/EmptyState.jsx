import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  title = 'Nothing here yet',
  description = 'Get started by creating something new.',
  ctaLabel = 'Get Started',
  ctaTo = '/dashboard',
  onCtaClick,
  icon,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card text-center py-16 px-8"
      style={{ background: 'rgba(30,41,59,0.5)', border: '1px dashed rgba(255,255,255,0.08)' }}
    >
      {/* Illustration */}
      <div className="flex justify-center mb-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))' }}
        >
          {icon || (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="8" y="8" width="9" height="9" rx="2" fill="rgba(99,102,241,0.5)" />
              <rect x="23" y="8" width="9" height="9" rx="2" fill="rgba(139,92,246,0.3)" />
              <rect x="8" y="23" width="9" height="9" rx="2" fill="rgba(139,92,246,0.3)" />
              <rect x="23" y="23" width="9" height="9" rx="2" fill="rgba(6,182,212,0.3)" />
            </svg>
          )}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: 'var(--muted)' }}>{description}</p>
      {onCtaClick ? (
        <button onClick={onCtaClick} className="btn btn-primary" style={{ display: 'inline-flex' }}>
          <PlusCircle size={16} />
          {ctaLabel}
        </button>
      ) : (
        <Link to={ctaTo} className="btn btn-primary" style={{ display: 'inline-flex' }}>
          <PlusCircle size={16} />
          {ctaLabel}
        </Link>
      )}
    </motion.div>
  );
};

export default EmptyState;
