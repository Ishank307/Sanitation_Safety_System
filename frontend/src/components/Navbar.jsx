import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!token) return null; // Don't show navbar on auth screens

  return (
    <nav className="glass-panel" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '1rem 2rem', 
      margin: '1rem auto',
      maxWidth: '1400px',
      alignItems: 'center' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--primary-glow)' }}></div>
        <h2 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '2px' }}>SAMVED</h2>
      </div>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{name}</span>
          <span className="badge badge-active">{role?.replace('_', ' ')}</span>
        </div>
        <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
