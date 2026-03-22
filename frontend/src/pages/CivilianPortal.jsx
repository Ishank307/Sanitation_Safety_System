import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Camera, Star, Lightbulb, ListOrdered } from 'lucide-react';
import { fetchApi, fetchApiMultipart, API_ORIGIN } from '../services/api';

const TABS = [
  { id: 'complaint', label: 'Report unclean area', icon: <Camera size={18} /> },
  { id: 'rate', label: 'Rate your zone', icon: <Star size={18} /> },
  { id: 'suggest', label: 'Suggestions', icon: <Lightbulb size={18} /> },
  { id: 'mine', label: 'My submissions', icon: <ListOrdered size={18} /> },
];

export default function CivilianPortal() {
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('name');
  const zone = localStorage.getItem('zone');
  const [tab, setTab] = useState('complaint');
  const [complaintText, setComplaintText] = useState('');
  const [complaintFile, setComplaintFile] = useState(null);
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionFile, setSuggestionFile] = useState(null);
  const [rating, setRating] = useState(4);
  const [ratingNote, setRatingNote] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [mine, setMine] = useState([]);

  useEffect(() => {
    if (tab === 'mine') loadMine();
  }, [tab]);

  const loadMine = async () => {
    const { status, data } = await fetchApi('/grievances');
    if (status === 200 && data.success) setMine(data.data || []);
  };

  if (role !== 'civilian') {
    return <Navigate to="/login" replace />;
  }

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 6000);
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintFile) {
      flash('err', 'Please attach a photo of the area.');
      return;
    }
    setLoading(true);
    const fd = new FormData();
    fd.append('text', complaintText);
    fd.append('image', complaintFile);
    const { status, data } = await fetchApiMultipart('/grievances/complaint', fd);
    setLoading(false);
    if (status === 201 && data.success) {
      flash('ok', data.message || 'Complaint submitted.');
      setComplaintText('');
      setComplaintFile(null);
    } else {
      flash('err', data.message || 'Could not submit complaint');
    }
  };

  const submitSuggestion = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append('text', suggestionText);
    if (suggestionFile) fd.append('image', suggestionFile);
    const { status, data } = await fetchApiMultipart('/grievances/suggestion', fd);
    setLoading(false);
    if (status === 201 && data.success) {
      flash('ok', data.message || 'Suggestion sent.');
      setSuggestionText('');
      setSuggestionFile(null);
    } else {
      flash('err', data.message || 'Could not submit suggestion');
    }
  };

  const submitRating = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { status, data } = await fetchApi('/grievances/zone-rating', {
      method: 'POST',
      body: JSON.stringify({ rating, note: ratingNote }),
    });
    setLoading(false);
    if (status === 201 && data.success) {
      flash('ok', data.message || 'Thanks for your rating.');
      setRatingNote('');
    } else {
      flash('err', data.message || 'Could not save rating');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px', margin: '0 auto' }}>
      <div>
        <h2 style={{ margin: 0 }}>Civilian portal</h2>
        <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {name} · {zone}
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="btn btn-outline"
            onClick={() => setTab(t.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderColor: tab === t.id ? '#38bdf8' : undefined,
              background: tab === t.id ? 'rgba(56,189,248,0.12)' : undefined,
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {msg.text && (
        <div className={msg.type === 'ok' ? 'badge badge-success' : 'badge badge-danger'} style={{ padding: '0.75rem', display: 'block' }}>
          {msg.text}
        </div>
      )}

      {tab === 'complaint' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginTop: 0 }}>Sanitation / cleanliness complaint</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Upload a clear photo and describe the problem. Your <strong>zonal coordinator</strong> and the <strong>central coordinator</strong> will see this in their grievances inbox.
          </p>
          <form onSubmit={submitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Grievance details</label>
              <textarea
                className="input-field"
                rows={4}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                required
                placeholder="Location, type of waste or issue, how long it has been there…"
              />
            </div>
            <div className="input-group">
              <label>Photo (required)</label>
              <input type="file" accept="image/*" onChange={(e) => setComplaintFile(e.target.files?.[0] || null)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit complaint'}
            </button>
          </form>
        </div>
      )}

      {tab === 'rate' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginTop: 0 }}>Rate cleanliness in your zone</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>1 = very poor · 5 = excellent</p>
          <form onSubmit={submitRating} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div className="input-group">
              <label>Rating ({rating})</label>
              <input type="range" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div className="input-group">
              <label>Optional comment</label>
              <textarea className="input-field" rows={3} value={ratingNote} onChange={(e) => setRatingNote(e.target.value)} placeholder="What could be improved?" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Submit rating'}
            </button>
          </form>
        </div>
      )}

      {tab === 'suggest' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginTop: 0 }}>Additional suggestions</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Ideas for bins, timings, awareness, or infrastructure. Image is optional.
          </p>
          <form onSubmit={submitSuggestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Your suggestion</label>
              <textarea className="input-field" rows={4} value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Photo (optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setSuggestionFile(e.target.files?.[0] || null)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send suggestion'}
            </button>
          </form>
        </div>
      )}

      {tab === 'mine' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginTop: 0 }}>My complaints &amp; suggestions</h3>
          {mine.length === 0 ? (
            <p style={{ opacity: 0.6 }}>Nothing yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {mine.map((g) => (
                <div key={g.id} style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.25)', borderLeft: '3px solid #38bdf8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-info">{g.kind}</span>
                    <span className="badge">{g.status}</span>
                  </div>
                  <p style={{ margin: '0.75rem 0', fontSize: '0.95rem' }}>{g.text}</p>
                  {g.imageUrl && (
                    <img src={`${API_ORIGIN}${g.imageUrl}`} alt="" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} />
                  )}
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>{new Date(g.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
