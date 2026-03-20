import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../services/api';

const ZONES = [
  "Zone A (North)",
  "Zone B (Central)",
  "Zone C (East)",
  "Zone D (South)",
  "Zone E (West)",
  "Zone F (Industrial)",
];

export default function Register() {
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', zone: '', age: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { status, data } = await fetchApi('/users/register', {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    setLoading(false);
    if (status === 201 && data.success) {
      navigate('/login');
    } else {
      setError(data.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Worker Registration</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>Register as a field worker for SAMVED</p>

        {error && <div className="badge badge-danger" style={{ display: 'block', textAlign: 'center', marginBottom: '1.5rem', padding: '0.75rem' }}>{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full Name</label>
            <input id="name" type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Enter your name" />
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <input id="phone" type="text" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required placeholder="10 digit mobile number" maxLength={10} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input id="password" type="password" className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder="Create a password" />
          </div>
          <div className="input-group">
            <label>Age</label>
            <input id="age" type="number" className="input-field" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required min="18" max="75" placeholder="Worker Age (for safety threshold computing)" />
          </div>
          <div className="input-group">
            <label>Assigned Zone</label>
            <select id="zone" className="input-field" style={{ cursor: 'pointer' }} value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} required>
              <option value="">Select your zone</option>
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          <button id="register-btn" type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register as Worker'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Go to Login</Link>
        </p>
      </div>
    </div>
  );
}
