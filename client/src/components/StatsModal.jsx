import { useState, useEffect } from 'react';
import { getLinkStats } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 999, padding: '20px',
};
const modal = {
  background: 'var(--bg2)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', padding: '28px',
  width: '100%', maxWidth: '560px', maxHeight: '80vh', overflowY: 'auto',
};
const stat = {
  box: {
    background: 'var(--bg3)', borderRadius: '8px', padding: '14px 18px',
    textAlign: 'center', flex: 1,
  },
  label: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' },
  value: { fontSize: '24px', fontWeight: 700, color: 'var(--accent-light)' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</p>
        <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-light)' }}>{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
};

export default function StatsModal({ linkId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLinkStats(linkId)
      .then((r) => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [linkId]);

  const chartData = data
    ? Object.entries(data.clicksByDay).map(([date, clicks]) => ({ date, clicks }))
    : [];

  const created = data ? new Date(data.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 600 }}>📊 Link Analytics</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>×</button>
        </div>

        {loading && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading stats...</p>}

        {data && (
          <>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {data.title || 'Untitled link'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--accent-light)', marginBottom: '20px', wordBreak: 'break-all' }}>
              {data.shortUrl}
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <div style={stat.box}>
                <p style={stat.label}>Total Clicks</p>
                <p style={stat.value}>{data.totalClicks}</p>
              </div>
              <div style={stat.box}>
                <p style={stat.label}>Created On</p>
                <p style={{ ...stat.value, fontSize: '15px' }}>{created}</p>
              </div>
              <div style={stat.box}>
                <p style={stat.label}>Status</p>
                <p style={{ ...stat.value, fontSize: '15px', color: data.isActive ? 'var(--success)' : 'var(--danger)' }}>
                  {data.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: 500 }}>Clicks — last 7 days</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,106,247,0.08)' }} />
                <Bar dataKey="clicks" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 500 }}>Original URL</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', wordBreak: 'break-all', background: 'var(--bg3)', padding: '10px 12px', borderRadius: '8px' }}>
                {data.originalUrl}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
