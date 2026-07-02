import { useState } from 'react';

const styles = {
  card: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '28px',
    marginBottom: '28px',
  },
  title: { fontSize: '18px', fontWeight: 600, marginBottom: '20px', color: 'var(--text)' },
  group: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 },
  input: {
    width: '100%', padding: '10px 14px', background: 'var(--bg3)',
    border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)',
    fontSize: '14px', outline: 'none', transition: 'border-color 0.2s',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  btn: {
    width: '100%', padding: '12px', background: 'var(--accent)',
    border: 'none', borderRadius: '8px', color: '#fff', fontSize: '15px',
    fontWeight: 600, marginTop: '8px', transition: 'opacity 0.2s',
  },
  success: {
    marginTop: '16px', padding: '14px 16px',
    background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74,222,128,0.25)',
    borderRadius: '8px',
  },
  successText: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' },
  shortUrl: { fontSize: '15px', fontWeight: 600, color: '#4ade80', wordBreak: 'break-all' },
  copyBtn: {
    marginTop: '8px', padding: '6px 14px', background: 'var(--bg3)',
    border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)',
    fontSize: '13px',
  },
  error: {
    marginTop: '12px', padding: '10px 14px',
    background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
    borderRadius: '8px', color: 'var(--danger)', fontSize: '13px',
  },
};

export default function CreateLink({ onCreated }) {
  const [form, setForm] = useState({ originalUrl: '', customAlias: '', title: '', expiryDays: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!form.originalUrl) return setError('Please enter a URL');

    setLoading(true);
    try {
      const created = await onCreated({
        originalUrl: form.originalUrl,
        customAlias: form.customAlias || undefined,
        title: form.title || undefined,
        expiryDays: form.expiryDays ? parseInt(form.expiryDays) : undefined,
      });
      setResult(created);
      setForm({ originalUrl: '', customAlias: '', title: '', expiryDays: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>✂️ Snip a Link</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.group}>
          <label style={styles.label}>Long URL *</label>
          <input
            style={styles.input} name="originalUrl" value={form.originalUrl}
            onChange={handleChange} placeholder="https://example.com/very/long/url"
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div style={styles.group}>
          <label style={styles.label}>Title (optional)</label>
          <input
            style={styles.input} name="title" value={form.title}
            onChange={handleChange} placeholder="My awesome link"
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div style={styles.row}>
          <div style={styles.group}>
            <label style={styles.label}>Custom Alias (optional)</label>
            <input
              style={styles.input} name="customAlias" value={form.customAlias}
              onChange={handleChange} placeholder="my-link"
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Expiry (days, optional)</label>
            <input
              style={styles.input} name="expiryDays" value={form.expiryDays}
              onChange={handleChange} placeholder="7" type="number" min="1"
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>
        <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
          {loading ? 'Snipping...' : 'Snip It →'}
        </button>
      </form>

      {error && <div style={styles.error}>⚠️ {error}</div>}

      {result && (
        <div style={styles.success}>
          <p style={styles.successText}>Your sniped link is ready:</p>
          <p style={styles.shortUrl}>{result.shortUrl}</p>
          <button style={styles.copyBtn} onClick={copyToClipboard}>
            {copied ? '✅ Copied!' : '📋 Copy Link'}
          </button>
        </div>
      )}
    </div>
  );
}
