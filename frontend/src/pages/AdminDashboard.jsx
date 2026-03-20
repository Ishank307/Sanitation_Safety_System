import { useState, useEffect } from 'react';
import { Users, Activity, Bell, Map as MapIcon, ShieldAlert, CheckCircle, Shield, AlertOctagon, Plus, X, ChevronDown } from 'lucide-react';
import { fetchApi } from '../services/api';

const ZONES = ["Zone A (North)", "Zone B (Central)", "Zone C (East)", "Zone D (South)", "Zone E (West)", "Zone F (Industrial)"];
const TASK_TYPES = ["Routine", "Inspection", "Blockage", "Overflow", "Waste", "SOS Follow-up"];
const STATUS_COLORS = { pending: 'var(--warning)', in_progress: 'var(--primary)', completed: 'var(--success)', escalated: 'var(--danger)' };

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', type: 'Routine', zone: '', workerId: '' });
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState('');

  const role = localStorage.getItem('role');
  const userZone = localStorage.getItem('zone');
  const name = localStorage.getItem('name');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  // When task zone changes, reload workers for that zone
  useEffect(() => {
    if (newTask.zone) loadWorkersForZone(newTask.zone);
  }, [newTask.zone]);

  const loadWorkersForZone = async (zone) => {
    const { status, data } = await fetchApi(`/users?zone=${encodeURIComponent(zone)}`);
    if (status === 200) setWorkers(data.data.filter(u => u.role === 'worker'));
  };

  const loadData = async () => {
    const summaryEndpoint = role === 'admin' ? '/dashboard/summary' : `/dashboard/zone/${encodeURIComponent(userZone)}`;
    const [summaryRes, alertsRes, tasksRes] = await Promise.all([
      fetchApi(summaryEndpoint),
      fetchApi('/dashboard/alerts?acknowledged=false'),
      fetchApi('/tasks')
    ]);
    if (summaryRes.status === 200) setSummary(summaryRes.data.data);
    if (alertsRes.status === 200) setAlerts(alertsRes.data.data);
    if (tasksRes.status === 200) setTasks(tasksRes.data.data);
    setLoading(false);
  };

  const handleAcknowledge = async (id) => {
    await fetchApi(`/dashboard/alerts/${id}/acknowledge`, { method: 'PATCH' });
    loadData();
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskLoading(true);
    setTaskError('');
    const { status, data } = await fetchApi('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: newTask.title, description: newTask.description, type: newTask.type, zone: newTask.zone || userZone, workerId: newTask.workerId || undefined })
    });
    setTaskLoading(false);
    if (status === 201) {
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', type: 'Routine', zone: userZone || '', workerId: '' });
      loadData();
    } else {
      setTaskError(data.message || 'Failed to create task');
    }
  };

  if (loading && !summary) {
    return (
      <div style={{ display: 'grid', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="glass-panel skeleton" style={{ height: '130px' }}></div>)}
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

  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>{role === 'admin' ? '🌐 System Dashboard' : `📍 ${userZone} Dashboard`}</h2>
          <p style={{ margin: 0 }}>Logged in as {name}</p>
        </div>
        <button id="create-task-btn" className="btn btn-primary" onClick={() => { setShowTaskModal(true); setNewTask(t => ({ ...t, zone: userZone || '' })); }}>
          <Plus size={18}/> Assign Task
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard icon={<Users size={26} color="var(--primary)" />} title="Personnel" value={stats.workers} />
        <StatCard icon={<Activity size={26} color="var(--success)" />} title="Active Shifts" value={stats.shifts} />
        <StatCard icon={<ShieldAlert size={26} color="var(--danger)" />} title="Active SOS" value={stats.sos} urgent={stats.sos > 0} />
        <StatCard icon={<AlertOctagon size={26} color="var(--warning)" />} title="Hazard Alerts" value={stats.hazards} urgent={stats.hazards > 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Action Center */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '450px' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={22} color="var(--warning)" /> Action Center
            <span className="badge badge-warning" style={{ marginLeft: 'auto' }}>{alerts.length} Pending</span>
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {alerts.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.4 }}>
                <Shield size={60} style={{ marginBottom: '1.5rem' }} />
                <p>All systems nominal.</p>
              </div>
            ) : alerts.map(alert => (
              <div key={alert.id} style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm)', background: alert.severity === 'critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.05)', borderLeft: `4px solid ${alert.severity === 'critical' ? 'var(--danger)' : 'var(--warning)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span className={`badge ${alert.severity === 'critical' ? 'badge-danger' : 'badge-warning'}`}>{alert.type.replace('_', ' ')}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(alert.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>{alert.message}</p>
                  {alert.zone && <p style={{ fontSize: '0.8rem', marginTop: '0.35rem', color: 'var(--text-muted)' }}>📍 {alert.zone}</p>}
                </div>
                <button className="btn btn-outline" style={{ padding: '0.6rem', border: 'none', background: 'rgba(16,185,129,0.1)' }} onClick={() => handleAcknowledge(alert.id)}>
                  <CheckCircle size={24} color="var(--success)" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Overview */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '450px' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle size={22} color="var(--primary)" /> Task Overview
            <span className="badge badge-info" style={{ marginLeft: 'auto' }}>{pendingTasks.length} Pending</span>
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {tasks.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.4 }}>
                <p>No tasks created yet.</p>
                <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => setShowTaskModal(true)}>Create First Task</button>
              </div>
            ) : tasks.map(task => (
              <div key={task.id} style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.25)', borderLeft: `3px solid ${STATUS_COLORS[task.status]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{task.title}</span>
                    <span className="badge" style={{ background: `${STATUS_COLORS[task.status]}20`, color: STATUS_COLORS[task.status], border: `1px solid ${STATUS_COLORS[task.status]}40` }}>{task.status.replace('_', ' ')}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem' }}>📍 {task.zone} · {task.type} · {new Date(task.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{task.workerId ? '👤 Assigned' : 'Unassigned'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '2.5rem', position: 'relative' }}>
            <button onClick={() => { setShowTaskModal(false); setTaskError(''); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={22} /></button>
            <h3 style={{ marginBottom: '2rem' }}><Plus size={20} style={{ marginRight: '0.5rem' }} />Assign New Task</h3>

            {taskError && <div className="badge badge-danger" style={{ display: 'block', textAlign: 'center', marginBottom: '1rem', padding: '0.75rem' }}>{taskError}</div>}

            <form onSubmit={handleCreateTask}>
              <div className="input-group">
                <label>Task Title</label>
                <input type="text" className="input-field" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required placeholder="e.g., Clear blockage at Sector 4" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Type</label>
                  <select className="input-field" value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})}>
                    {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {role === 'admin' && (
                  <div className="input-group">
                    <label>Zone</label>
                    <select className="input-field" value={newTask.zone} onChange={e => setNewTask({...newTask, zone: e.target.value, workerId: ''})} required>
                      <option value="">Select Zone</option>
                      {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="input-group">
                <label>Description (optional)</label>
                <input type="text" className="input-field" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Additional details..." />
              </div>
              <div className="input-group">
                <label>Assign to Worker (optional)</label>
                <select className="input-field" value={newTask.workerId} onChange={e => setNewTask({...newTask, workerId: e.target.value})} disabled={!newTask.zone && role === 'admin'}>
                  <option value="">Unassigned</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.name} — {w.phone}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={taskLoading}>
                {taskLoading ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, urgent }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: urgent ? '1px solid rgba(239,68,68,0.4)' : undefined, boxShadow: urgent ? '0 0 20px rgba(239,68,68,0.15)' : undefined, transition: 'var(--transition)' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ padding: '1.1rem', background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-sm)' }}>{icon}</div>
      <div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</p>
        <h3 style={{ fontSize: '2.25rem', margin: 0, color: urgent ? 'var(--danger)' : '#fff' }}>{value}</h3>
      </div>
    </div>
  );
}
