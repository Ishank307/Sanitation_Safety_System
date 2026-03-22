import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../services/api';
import { ShieldCheck, User, MapPin, MessageSquare } from 'lucide-react';

const PORTALS = [
  { key: 'admin', label: 'Central coordinator', icon: <ShieldCheck size={40} />, color: 'var(--primary)', description: 'System-wide access and oversight' },
  { key: 'zonal_coordinator', label: 'Zonal coordinator', icon: <MapPin size={40} />, color: 'var(--success)', description: 'Zone-level management and tasking' },
  { key: 'civilian', label: 'Civilian portal', icon: <MessageSquare size={40} />, color: '#38bdf8', description: 'Report issues, rate your zone, share ideas' },
  { key: 'worker', label: 'Worker Portal', icon: <User size={40} />, color: 'var(--warning)', description: 'Field operations and task updates' },
];

export default function Login() {
  const [selectedPortal, setSelectedPortal] = useState(null);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { status, data } = await fetchApi('/users/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password, expectedRole: selectedPortal })
    });

    setLoading(false);
    if (status === 200 && data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      localStorage.setItem('zone', data.zone || '');
      localStorage.setItem('age', data.age || '');
      if (data.role === 'worker') navigate('/worker');
      else if (data.role === 'civilian') navigate('/civilian');
      else navigate('/admin');
    } else {
      setError(data.message || 'Login failed');
    }
  };

  const portalMeta = PORTALS.find(p => p.key === selectedPortal);

  if (!selectedPortal) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '2.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', letterSpacing: '6px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SAMVED</h1>
          <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>Sanitation Safety System — Solapur Municipal Corporation</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '1000px' }}>
          {PORTALS.map(portal => (
            <button key={portal.key} onClick={() => setSelectedPortal(portal.key)}
              className="glass-panel" id={`portal-${portal.key}`}
              style={{ padding: '3rem 2rem', textAlign: 'center', border: `1px solid ${portal.color}30`, cursor: 'pointer', background: 'none', color: 'inherit', transition: 'var(--transition)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${portal.color}10`; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 20px 40px ${portal.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ color: portal.color, filter: `drop-shadow(0 0 12px ${portal.color})` }}>{portal.icon}</div>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>{portal.label}</h3>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{portal.description}</p>
              </div>
            </button>
          ))}
        </div>
        <p style={{ fontSize: '0.9rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span>New worker? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Worker registration</Link></span>
          <span>Civilian? <Link to="/register/civilian" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign up with your zone</Link></span>
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', border: `1px solid ${portalMeta.color}40` }}>
        <button onClick={() => { setSelectedPortal(null); setError(''); }} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', marginBottom: '2rem' }}>← Back</button>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ color: portalMeta.color, marginBottom: '1rem', filter: `drop-shadow(0 0 10px ${portalMeta.color})` }}>{portalMeta.icon}</div>
          <h2 style={{ margin: 0 }}>{portalMeta.label}</h2>
        </div>

        {error && <div className="badge badge-danger" style={{ display: 'block', textAlign: 'center', marginBottom: '1.5rem', padding: '0.75rem' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Phone Number</label>
            <input id="phone" type="text" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="Enter your phone" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input id="password" type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button id="login-btn" type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem', background: `linear-gradient(135deg, ${portalMeta.color}, ${portalMeta.color}aa)` }} disabled={loading}>
            {loading ? 'Authenticating...' : `Sign In as ${portalMeta.label.replace(' Portal', '')}`}
          </button>
        </form>
      </div>
    </div>
  );
}
