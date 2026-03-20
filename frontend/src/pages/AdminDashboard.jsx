import { useState, useEffect } from 'react';
import { Users, Activity, Bell, Map as MapIcon, ShieldAlert, CheckCircle, Shield, AlertOctagon, TrendingUp } from 'lucide-react';
import { fetchApi } from '../services/api';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const role = localStorage.getItem('role');
  const userZone = localStorage.getItem('zone'); 

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const summaryEndpoint = role === 'admin' || !userZone ? '/dashboard/summary' : `/dashboard/zone/${userZone}`;
    const [summaryRes, alertsRes] = await Promise.all([
      fetchApi(summaryEndpoint),
      fetchApi('/dashboard/alerts?acknowledged=false')
    ]);

    if (summaryRes.status === 200) setSummary(summaryRes.data.data);
    if (alertsRes.status === 200) setAlerts(alertsRes.data.data);
    setLoading(false);
  };

  const handleAcknowledge = async (id) => {
    const { status } = await fetchApi(`/dashboard/alerts/${id}/acknowledge`, { method: 'PATCH' });
    if (status === 200) loadData(); 
  };

  if (loading && !summary) {
    return (
      <div style={{ display: 'grid', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="glass-panel skeleton" style={{ height: '140px' }}></div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-panel skeleton" style={{ height: '500px' }}></div>
          <div className="glass-panel skeleton" style={{ height: '500px' }}></div>
        </div>
      </div>
    );
  }

  const stats = {
    workers: summary?.totalWorkers ?? summary?.workers?.length ?? 0,
    shifts: summary?.activeShifts ?? 0,
    sos: summary?.activeSOS ?? summary?.sosAlerts?.length ?? 0,
    hazards: summary?.hazardousReadings ?? summary?.recentSensorReadings?.filter(r=>r.isHazardous)?.length ?? 0
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <StatCard icon={<Users size={28} color="var(--primary)" />} title="Active Personnel" value={stats.workers} trend="+12% today" />
        <StatCard icon={<Activity size={28} color="var(--success)" />} title="Active Shifts" value={stats.shifts} />
        <StatCard icon={<ShieldAlert size={28} color="var(--danger)" />} title="Critical SOS" value={stats.sos} urgent={stats.sos > 0} />
        <StatCard icon={<AlertOctagon size={28} color="var(--warning)" />} title="Sensor Hazards" value={stats.hazards} urgent={stats.hazards > 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(400px, 1.2fr)', gap: '2rem', minHeight: '550px' }}>
        
        {/* Actionable Alerts Panel */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem' }}>
            <Bell size={24} color="var(--warning)" /> Action Center
            <span className="badge badge-warning" style={{ marginLeft: 'auto' }}>{alerts.length} Pending</span>
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
            {alerts.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.5 }}>
                <Shield size={64} style={{ marginBottom: '1rem' }} />
                <p>All systems nominal.<br/>No pending alerts.</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="animate-fade-in" style={{ 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius-sm)', 
                  background: alert.severity === 'critical' ? 'linear-gradient(90deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)' : 'rgba(245, 158, 11, 0.05)',
                  borderLeft: `4px solid ${alert.severity === 'critical' ? 'var(--danger)' : 'var(--warning)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <span className={`badge ${alert.severity === 'critical' ? 'badge-danger' : 'badge-warning'}`}>{alert.type.replace('_', ' ')}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.5' }}>{alert.message}</p>
                    {alert.zone && <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>📍 Zone: <strong style={{color:'#fff'}}>{alert.zone}</strong> | 🧑‍🔧 ID: {alert.workerId ? alert.workerId.substring(0,8) : 'Hardware'}</p>}
                  </div>
                  <button className="btn btn-outline" style={{ padding: '0.75rem', border: 'none', background: 'rgba(255,255,255,0.05)' }} onClick={() => handleAcknowledge(alert.id)} title="Acknowledge">
                    <CheckCircle size={28} color="var(--success)" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Map / Zone Data Placeholder */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem' }}>
            <MapIcon size={24} color="var(--primary)" /> Topographical Deployment
          </h3>
          <div style={{ 
            flex: 1, 
            background: '#070b14', 
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.5)'
          }}>
            {/* Grid overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            {/* Simulated Heatmaps */}
            <div style={{ position: 'absolute', top: '30%', left: '30%', width: '150px', height: '150px', background: 'var(--primary)', filter: 'blur(80px)', opacity: 0.3 }}></div>
            <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: '200px', height: '200px', background: 'var(--success)', filter: 'blur(100px)', opacity: 0.2 }}></div>
            
            {stats.sos > 0 && <div className="sos-pulse" style={{ position: 'absolute', top: '45%', left: '55%', width: '24px', height: '24px', background: 'var(--danger)', borderRadius: '50%', boxShadow: '0 0 20px var(--danger)' }}></div>}
            {stats.hazards > 0 && <div className="sos-pulse" style={{ position: 'absolute', bottom: '35%', left: '40%', width: '24px', height: '24px', background: 'var(--warning)', borderRadius: '50%', animationDuration: '3s' }}></div>}
            
            <div style={{ textAlign: 'center', zIndex: 1, background: 'rgba(0,0,0,0.6)', padding: '2rem', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(10px)' }}>
              <TrendingUp size={48} style={{ color: 'var(--primary)', margin: '0 auto', display: 'block', marginBottom: '1rem' }} />
              <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>System Operational</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Telemetry map waiting for Mapbox token.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Sub-component
function StatCard({ icon, title, value, urgent, trend }) {
  return (
    <div className="glass-panel" style={{ 
      padding: '1.75rem', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1.25rem',
      border: urgent ? '1px solid rgba(239, 68, 68, 0.5)' : undefined,
      boxShadow: urgent ? '0 0 25px rgba(239, 68, 68, 0.2)' : undefined,
      transition: 'var(--transition)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.6)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)'; }}
    >
      {/* Background glow per card */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: urgent ? 'var(--danger)' : 'var(--primary)', filter: 'blur(60px)', opacity: 0.15, zIndex: 0 }}></div>

      <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-md)', zIndex: 1, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)' }}>
        {icon}
      </div>
      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '2.5rem', margin: 0, color: urgent ? 'var(--danger)' : '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{value}</h3>
          {trend && <span style={{ color: 'var(--success)', fontSize: '0.8rem', fontWeight: '600' }}>{trend}</span>}
        </div>
      </div>
    </div>
  );
}
