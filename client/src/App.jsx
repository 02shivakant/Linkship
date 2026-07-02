import { useEffect, useState } from 'react';
import CreateLink from './components/CreateLink';
import LinkTable from './components/LinkTable';
import { useLinks } from './hooks/useLinks';

const styles = {
  wrapper: { minHeight: '100vh', background: 'var(--bg)' },
  nav: {
    borderBottom: '1px solid var(--border)',
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--bg2)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logo: { fontSize: '20px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' },
  badge: { fontSize: '11px', background: 'var(--accent-dim)', color: 'var(--accent-light)', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 },
  hero: {
    textAlign: 'center',
    padding: '64px 24px 48px',
    maxWidth: '640px',
    margin: '0 auto',
  },
  h1: { fontSize: '40px', fontWeight: 800, lineHeight: 1.2, marginBottom: '12px' },
  accent: { color: 'var(--accent-light)' },
  sub: { fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6 },
  main: { maxWidth: '760px', margin: '0 auto', padding: '0 24px 60px' },
  statBar: {
    display: 'flex', gap: '16px', marginBottom: '28px',
    flexWrap: 'wrap',
  },
  statBox: {
    flex: 1, minWidth: '120px',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '16px 20px',
  },
  statLabel: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' },
  statVal: { fontSize: '22px', fontWeight: 700, color: 'var(--accent-light)' },
};

export default function App() {
  const { links, pagination, loading, fetchLinks, addLink, removeLink } = useLinks();
  const [page, setPage] = useState(1);

  useEffect(() => { fetchLinks(page); }, [page]);

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  const handleCreate = async (data) => {
    const result = await addLink(data);
    setPage(1);
    return result;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this link?')) return;
    await removeLink(id);
  };

  const handlePageChange = (p) => {
    setPage(p);
    fetchLinks(p);
  };

  return (
    <div style={styles.wrapper}>
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <span>✂️ LinkSnip</span>
          <span style={styles.badge}>v1.0</span>
        </div>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Smart Link Management</span>
      </nav>

      <div style={styles.hero}>
        <h1 style={styles.h1}>
          Snip. Share. <span style={styles.accent}>Track.</span>
        </h1>
        <p style={styles.sub}>
          Turn long, messy URLs into clean, trackable short links with click analytics.
        </p>
      </div>

      <main style={styles.main}>
        <div style={styles.statBar}>
          <div style={styles.statBox}>
            <p style={styles.statLabel}>Total Links</p>
            <p style={styles.statVal}>{pagination.total}</p>
          </div>
          <div style={styles.statBox}>
            <p style={styles.statLabel}>Clicks (this page)</p>
            <p style={styles.statVal}>{totalClicks}</p>
          </div>
          <div style={styles.statBox}>
            <p style={styles.statLabel}>Active Links</p>
            <p style={styles.statVal}>{links.filter(l => l.isActive !== false).length}</p>
          </div>
        </div>

        <CreateLink onCreated={handleCreate} />
        <LinkTable
          links={links}
          pagination={pagination}
          loading={loading}
          onDelete={handleDelete}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
}
