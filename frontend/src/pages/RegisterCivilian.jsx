import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../services/api';

const ZONES = [
  'Zone A (North)',
  'Zone B (Central)',
  'Zone C (East)',
  'Zone D (South)',
  'Zone E (West)',
  'Zone F (Industrial)',
];

export default function RegisterCivilian() {
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', zone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { status, data } = await fetchApi('/users/register/civilian', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    setLoading(false);
    if (status === 201 && data.success) {
      navigate('/login', { replace: true, state: { selectPortal: 'civilian' } });
    } else {
      setError(data.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Civilian registration</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Create an account with your phone and residential zone. You can report sanitation issues and rate cleanliness in your zone.
        </p>

        {error && (
          <div className="badge badge-danger" style={{ display: 'block', textAlign: 'center', marginBottom: '1.5rem', padding: '0.75rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full name</label>
            <input
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Your name"
            />
          </div>
          <div className="input-group">
            <label>Phone number</label>
            <input
              type="text"
              className="input-field"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="10-digit mobile"
              maxLength={10}
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Create a password"
            />
          </div>
          <div className="input-group">
            <label>Your zone</label>
            <select
              className="input-field"
              style={{ cursor: 'pointer' }}
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              required
            >
              <option value="">Select zone</option>
              {ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '1rem' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Register as civilian'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Login</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.85rem' }}>
          Field worker? <Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Worker registration</Link>
        </p>
      </div>
    </div>
  );
}
