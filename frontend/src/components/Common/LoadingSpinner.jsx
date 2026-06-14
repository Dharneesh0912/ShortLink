const LoadingSpinner = ({ fullScreen = true }) => {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg
        width="36" height="36" viewBox="0 0 36 36" fill="none"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <circle cx="18" cy="18" r="15" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <path d="M18 3a15 15 0 0 1 15 15" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Loading…</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)'
      }}>
        {content}
      </div>
    );
  }
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>{content}</div>;
};

export default LoadingSpinner;