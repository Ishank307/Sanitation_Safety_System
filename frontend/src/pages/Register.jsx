import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchApi } from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', role: 'worker', zone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = { ...formData };
    if (payload.role === 'admin') delete payload.zone;

    const { status, data } = await fetchApi('/users/register', {
      method: 'POST',
      body: JSON.stringify(payload)
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
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
        {error && <div className="badge badge-danger" style={{ display: 'block', textAlign: 'center', marginBottom: '1.5rem', padding: '0.75rem' }}>{error}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="John Doe" />
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <input type="text" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required placeholder="10 digit number" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" className="input-field" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder="••••••••" />
          </div>
          <div className="input-group">
            <label>Role</label>
            <select className="input-field" style={{ cursor: 'pointer' }} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="worker">Worker</option>
              <option value="zonal_coordinator">Zonal Coordinator</option>
              <option value="admin">System Admin</option>
            </select>
          </div>
          
          {formData.role !== 'admin' && (
            <div className="input-group">
              <label>Zone Assignment</label>
              <select className="input-field" style={{ cursor: 'pointer' }} value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} required>
                <option value="">Select a Zone</option>
                <option value="Zone-A">Zone-A</option>
                <option value="Zone-B">Zone-B</option>
                <option value="Zone-C">Zone-C</option>
                <option value="North">North</option>
                <option value="South">South</option>
              </select>
            </div>
          )}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
