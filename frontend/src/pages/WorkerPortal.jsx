import { useState, useEffect } from 'react';
import { ShieldAlert, PlayCircle, StopCircle, Clock, AlertTriangle } from 'lucide-react';
import { fetchApi } from '../services/api';

export default function WorkerPortal() {
  const [activeShift, setActiveShift] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyShifts();
  }, []);

  const loadMyShifts = async () => {
    const { status, data } = await fetchApi('/shifts/my');
    if (status === 200 && data.success) {
      const active = data.data.find(s => s.status === 'active');
      setActiveShift(active || null);
    }
    setLoading(false);
  };

  const toggleShift = async () => {
    setLoading(true);
    const endpoint = activeShift ? '/shifts/end' : '/shifts/start';
    const { status } = await fetchApi(endpoint, { method: 'POST' });
    
    if (status === 201 || status === 200) {
      await loadMyShifts();
    }
    setLoading(false);
  };

  const triggerSOS = async () => {
    if (!window.confirm("CRITICAL: Deploy Emergency SOS Protocol?")) return;
    
    setSosActive(true);
    await fetchApi('/sos', {
      method: 'POST',
      body: JSON.stringify({
        location: { lat: 28.7041, lng: 77.1025, description: "Triggered from Web Portal" }
      })
    });
    
    setTimeout(() => alert("SOS Alert broadcasted successfully. Help is on the way!"), 500);
  };

  if (loading && !activeShift) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel skeleton" style={{ height: '220px' }}></div>
        <div className="glass-panel skeleton" style={{ height: '350px' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(0, 1fr)', maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Shift Control Panel */}
      <div className="glass-panel" style={{ padding: '3rem 2.5rem', textAlign: 'center', position: 'relative' }}>
        {/* Glow effect blob behind the panel */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: activeShift ? 'var(--success-glow)' : 'var(--primary-glow)', filter: 'blur(60px)', zIndex: 0, opacity: 0.5 }}></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '2.2rem' }}>
            <Clock size={32} color={activeShift ? "var(--success)" : "var(--primary)"} />
            Duty Management
          </h2>
          
          <div style={{ marginBottom: '3rem', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'inline-block', minWidth: '300px' }}>
            <span className={`badge ${activeShift ? 'badge-active' : ''}`} style={{ fontSize: '1.2rem', padding: '0.6rem 1.2rem', marginBottom: '1rem' }}>
              {activeShift ? '🟢 SHIFT ACTIVE' : '⚪ OFF DUTY'}
            </span>
            {activeShift ? (
              <p style={{ marginTop: '0.5rem', fontWeight: '500', fontSize: '1.1rem' }}>
                Started: <span style={{ color: '#fff' }}>{new Date(activeShift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </p>
            ) : (
              <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>Ready for deployment.</p>
            )}
          </div>

          <button 
            className={`btn ${activeShift ? 'btn-outline' : 'btn-primary'}`} 
            onClick={toggleShift}
            disabled={loading}
            style={{ 
              width: '100%', 
              maxWidth: '350px', 
              fontSize: '1.3rem', 
              padding: '1.2rem',
              borderRadius: '99px',
              border: activeShift ? '2px solid rgba(255,255,255,0.2)' : 'none'
            }}
          >
            {activeShift ? <><StopCircle size={26} /> End Shift</> : <><PlayCircle size={26} /> Start Shift</>}
          </button>
        </div>
      </div>

      {/* Extremely Prominent SOS Portal */}
      <div className="glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', background: 'var(--danger-glow)', filter: 'blur(100px)', zIndex: 0, opacity: sosActive ? 0.8 : 0.2 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '2.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
            <AlertTriangle size={36} /> Emergency Hub
          </h2>
          <p style={{ marginBottom: '4rem', color: 'var(--text-muted)', fontSize: '1.1rem' }}>Only deploy in case of extreme physical hazard or critical medical emergency.</p>
          
          <button 
            onClick={triggerSOS}
            disabled={sosActive}
            className={sosActive ? "sos-pulse" : ""}
            style={{
              background: sosActive ? 'var(--danger)' : 'linear-gradient(145deg, #f87171, #dc2626, #991b1b)',
              color: '#fff',
              border: '4px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              width: '280px',
              height: '280px',
              fontSize: '1.8rem',
              fontWeight: '800',
              letterSpacing: '3px',
              cursor: sosActive ? 'default' : 'pointer',
              boxShadow: '0 20px 50px rgba(239, 68, 68, 0.5), inset 0px 8px 20px rgba(255,255,255,0.3)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              margin: '0 auto',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = sosActive ? 'scale(1)' : 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <ShieldAlert size={80} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
            {sosActive ? "DEPLOYED" : "TRIGGER SOS"}
          </button>
        </div>
      </div>

    </div>
  );
}
