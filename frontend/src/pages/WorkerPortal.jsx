import { useState, useEffect } from 'react';
import { ShieldAlert, PlayCircle, StopCircle, Clock, AlertTriangle, CheckSquare, List, ChevronRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../services/api';

const STATUS_COLORS = {
  pending: 'var(--warning)',
  in_progress: 'var(--primary)',
  completed: 'var(--success)',
  escalated: 'var(--danger)',
};

export default function WorkerPortal() {
  const navigate = useNavigate();
  const [activeShift, setActiveShift] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const workerName = localStorage.getItem('name');
  const zone = localStorage.getItem('zone') || '';
  const age = Number(localStorage.getItem('age')) || 30;

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [shiftRes, taskRes] = await Promise.all([fetchApi('/shifts/my'), fetchApi('/tasks')]);
    if (shiftRes.status === 200 && shiftRes.data.success) {
      setActiveShift(shiftRes.data.data.find(s => s.status === 'active') || null);
    }
    if (taskRes.status === 200 && taskRes.data.success) setTasks(taskRes.data.data);
    setLoading(false);
  };

  const toggleShift = async () => {
    setLoading(true);
    const endpoint = activeShift ? '/shifts/end' : '/shifts/start';
    await fetchApi(endpoint, { method: 'POST' });
    await loadAll();
    setLoading(false);
  };

  const triggerSOS = async () => {
    if (!window.confirm("CRITICAL: Deploy Emergency SOS Protocol?")) return;
    setSosActive(true);
    const msg = `Manual SOS Reported from ${zone}`;
    await fetchApi('/sos', { method: 'POST', body: JSON.stringify({ location: { lat: 17.6868, lng: 75.9099, description: msg } }) });
    setTimeout(() => alert("SOS Alert broadcasted. Help is on the way!"), 300);
  };

  const updateStatus = async (taskId, status) => {
    if (status === 'in_progress' && !activeShift) {
      alert("⚠️ You must start your shift before taking on tasks.");
      return;
    }
    await fetchApi(`/tasks/${taskId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await loadAll();
  };

  if (loading && tasks.length === 0) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {[1,2,3].map(i => <div key={i} className="glass-panel skeleton" style={{ height: '160px' }}></div>)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gap: '2rem', maxWidth: '950px', margin: '0 auto' }}>
      <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ margin: 0 }}>Welcome, {workerName} 👋</h2>
          <p style={{ margin: 0 }}>Field Portal · <span style={{ color: '#fff', fontWeight: 600 }}>{zone}</span></p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Profile Age: <strong style={{ color: '#fff' }}>{age} yrs</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Shift Panel */}
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', background: activeShift ? 'var(--success-glow)' : 'var(--primary-glow)', filter: 'blur(50px)', opacity: 0.6 }}></div>
          <Clock size={28} color={activeShift ? 'var(--success)' : 'var(--primary)'} style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '1.5rem' }}>Duty Status</h3>
          <span className={`badge ${activeShift ? 'badge-active' : 'badge-info'}`} style={{ fontSize: '1rem', padding: '0.5rem 1.25rem', marginBottom: '2rem', display: 'inline-block' }}>
            {activeShift ? '🟢 ON DUTY' : '⚪ OFF DUTY'}
          </span>
          {activeShift && <p style={{ fontWeight: '500', color: 'var(--text-muted)' }}>Since <span style={{ color: '#fff' }}>{new Date(activeShift.startTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span></p>}
          <br />
          <button className={`btn ${activeShift ? 'btn-outline' : 'btn-primary'}`} onClick={toggleShift} disabled={loading} style={{ width: '100%', borderRadius: '99px', padding: '1rem', marginTop: '1rem' }}>
            {activeShift ? <><StopCircle size={20}/> End Shift</> : <><PlayCircle size={20}/> Start Shift</>}
          </button>
        </div>

        {/* SOS Panel */}
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.25)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '200px', height: '200px', background: 'var(--danger)', filter: 'blur(90px)', opacity: sosActive ? 0.7 : 0.15 }}></div>
          <AlertTriangle size={28} color="var(--danger)" style={{ marginBottom: '1rem', position: 'relative', zIndex: 1 }} />
          <h3 style={{ marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>Emergency Hub</h3>
          <button onClick={triggerSOS} disabled={sosActive} className={sosActive ? "sos-pulse" : ""}
            style={{ background: 'linear-gradient(145deg, #f87171, #991b1b)', color: '#fff', border: '4px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '160px', height: '160px', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '2px', cursor: sosActive ? 'default' : 'pointer', boxShadow: '0 15px 40px rgba(239,68,68,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', margin: '0 auto', position: 'relative', zIndex: 1, transition: 'transform 0.15s' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <ShieldAlert size={48} />
            {sosActive ? "DEPLOYED" : "SOS"}
          </button>
        </div>
      </div>

      {/* Simulator Launch Button */}
      <button className="glass-panel btn" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1.5rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', transition: 'transform 0.2s', cursor: 'pointer' }}
        onClick={() => navigate('/worker/simulator')}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
        <Activity size={24} color="var(--success)" />
        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Launch Sensor Telemetry Simulator</span>
      </button>

      {/* Task Inbox */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <List size={22} color="var(--primary)" /> Task Inbox
          <span className="badge badge-info" style={{ marginLeft: 'auto' }}>{tasks.filter(t => t.status !== 'completed').length} Pending</span>
        </h3>
        {tasks.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.5 }}>No tasks assigned yet. Check back later!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tasks.map(task => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.25)', borderLeft: `4px solid ${STATUS_COLORS[task.status]}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{task.title}</span>
                    <span className="badge" style={{ background: `${STATUS_COLORS[task.status]}20`, color: STATUS_COLORS[task.status], border: `1px solid ${STATUS_COLORS[task.status]}40` }}>{task.status.replace('_', ' ')}</span>
                    <span className="badge badge-info">{task.type}</span>
                  </div>
                  {task.description && <p style={{ margin: 0, fontSize: '0.9rem' }}>{task.description}</p>}
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem' }}>📍 {task.zone} · {new Date(task.createdAt).toLocaleDateString()}</p>
                </div>
                {task.status !== 'completed' && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    {task.status === 'pending' && <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap', opacity: activeShift ? 1 : 0.5, cursor: activeShift ? 'pointer' : 'not-allowed' }} onClick={() => updateStatus(task.id, 'in_progress')}>Start <ChevronRight size={14}/></button>}
                    {task.status === 'in_progress' && <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }} onClick={() => updateStatus(task.id, 'completed')}><CheckSquare size={14}/> Done</button>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
