import { useState } from 'react';
import StatsModal from './StatsModal';

const styles = {
  card: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', overflow: 'hidden',
  },
  header: {
    padding: '18px 24px', borderBottom: '1px solid var(--border)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: '16px', fontWeight: 600 },
  count: { fontSize: '13px', color: 'var(--text-muted)', background: 'var(--bg3)', padding: '3px 10px', borderRadius: '20px' },
  row: {
    padding: '16px 24px', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: '12px',
    transition: 'background 0.15s',
  },
  shortCode: { fontSize: '14px', fontWeight: 600, color: 'var(--accent-light)', minWidth: '90px' },
  original: { fontSize: '13px', color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  clicks: { fontSize: '13px', color: 'var(--text)', minWidth: '60px', textAlign: 'right', fontWeight: 500 },
  actions: { display: 'flex', gap: '6px' },
  btn: (color) => ({
    padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--border)',
    background: 'var(--bg3)', color: color || 'var(--text)', fontSize: '12px',
    cursor: 'pointer', transition: 'background 0.15s',
  }),
  empty: { padding: '48px', textAlign: 'center', color: 'var(--text-muted)' },
  pagination: { padding: '14px 24px', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' },
  pageBtn: (active) => ({
    padding: '6px 14px', borderRadius: '6px',
    background: active ? 'var(--accent)' : 'var(--bg3)',
    border: '1px solid var(--border)', color: active ? '#fff' : 'var(--text)',
    fontSize: '13px', cursor: 'pointer',
  }),
};

export default function LinkTable({ links, pagination, loading, onDelete, onPageChange }) {
  const [statsId, setStatsId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const copy = (link) => {
    navigator.clipboard.writeText(link.shortUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return (
    <div style={styles.card}>
      <div style={styles.empty}>Loading links...</div>
    </div>
  );

  return (
    <>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.title}>Your Links</span>
          <span style={styles.count}>{pagination.total} total</span>
        </div>

        {links.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>✂️</p>
            <p>No links yet. Snip your first one above!</p>
          </div>
        ) : (
          links.map((link) => (
            <div
              key={link.id}
              style={styles.row}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={styles.shortCode}>/{link.shortCode}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {link.title && <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{link.title}</p>}
                <p style={styles.original} title={link.originalUrl}>{link.originalUrl}</p>
              </div>
              <span style={styles.clicks}>👆 {link.clicks}</span>
              <div style={styles.actions}>
                <button style={styles.btn()} onClick={() => copy(link)}>
                  {copiedId === link.id ? '✅' : '📋'}
                </button>
                <button style={styles.btn('var(--accent-light)')} onClick={() => setStatsId(link.id)}>
                  📊
                </button>
                <button style={styles.btn('var(--danger)')} onClick={() => onDelete(link.id)}>
                  🗑
                </button>
              </div>
            </div>
          ))
        )}

        {pagination.totalPages > 1 && (
          <div style={styles.pagination}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} style={styles.pageBtn(p === pagination.page)} onClick={() => onPageChange(p)}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {statsId && <StatsModal linkId={statsId} onClose={() => setStatsId(null)} />}
    </>
  );
}
