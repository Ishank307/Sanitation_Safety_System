import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../services/api';

export default function Simulator() {
  const navigate = useNavigate();
  // Simulator State — Default VERY SAFE ranges
  const [gasH2S, setGasH2S] = useState(0.0);
  const [gasCO, setGasCO] = useState(0.0);
  const [gasCH4, setGasCH4] = useState(0.0);
  const [o2Level, setO2Level] = useState(21.0); // Completely safe baseline

  const [sosActive, setSosActive] = useState(false);
  const [autoSosFired, setAutoSosFired] = useState(false);

  const workerName = localStorage.getItem('name');
  const zone = localStorage.getItem('zone') || '';
  const age = Number(localStorage.getItem('age')) || 30;

  // Calculate dynamic thresholds based on Zone + Age
  const thresholds = (() => {
    let modifier = 1.0;
    if (age >= 50) modifier -= 0.20; // 20% less tolerance for older workers
    else if (age >= 40) modifier -= 0.10; // 10% less tolerance

    if (zone.includes("Industrial") || zone.includes("East") || zone.includes("West")) {
      modifier -= 0.10; // Baseline is toxic, SOS triggers earlier
    }
    return {
      h2s: +(10 * modifier).toFixed(1),
      co: +(35 * modifier).toFixed(1),
      ch4: +(1.0 * modifier).toFixed(2),
      o2: +(19.5 + ((1 - modifier) * 2.5)).toFixed(1) // O2 danger floor rises to ~20.2 max
    };
  })();

  const triggerSOS = async () => {
    setSosActive(true);
    const msg = `AUTO-SOS: Critical toxicity threshold breached for ${workerName} (Age: ${age}) in ${zone}`;
    
    await fetchApi('/sos', { method: 'POST', body: JSON.stringify({ location: { lat: 17.6868, lng: 75.9099, description: msg } }) });
  };

  // Monitor Simulator for Auto-SOS
  useEffect(() => {
    if (autoSosFired || sosActive) return;
    if (gasH2S >= thresholds.h2s || gasCO >= thresholds.co || gasCH4 >= thresholds.ch4 || o2Level <= thresholds.o2) {
      setAutoSosFired(true);
      triggerSOS();
      
      // Also broadcast the sensor reading to the backend so it shows up in Hazard Alerts
      fetchApi('/sensors/reading', {
        method: 'POST',
        body: JSON.stringify({ manholeId: 'SIM-001Auto', zone, gasH2S, gasCO, gasCH4, o2Level })
      });
    }
  }, [gasH2S, gasCO, gasCH4, o2Level, autoSosFired, sosActive, thresholds]);

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/worker')} className="btn btn-outline" style={{ justifySelf: 'start', padding: '0.4rem 1rem' }}>
        <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Portal
      </button>

      {/* Simulator Panel (Prototype) */}
      <div className="glass-panel" style={{ padding: '3rem', border: '1px solid var(--accent)', position: 'relative', overflow: 'hidden' }}>
        {sosActive && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.1)', border: '4px solid var(--danger)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(4px)' }}>
            <ShieldAlert size={64} color="var(--danger)" className="sos-pulse" style={{ marginBottom: '1rem' }} />
            <h2 style={{ color: 'var(--danger)', margin: 0, textShadow: '0 0 20px var(--danger)' }}>CRITICAL TOXICITY TRIGGERED</h2>
            <p style={{ fontWeight: 'bold' }}>AUTO-SOS Deployed to Zonal Coordinator</p>
          </div>
        )}

        <h2 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent)' }}>
          <Activity size={28} /> Biosensor Telemetry Simulator
        </h2>
        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', marginBottom: '2rem' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <strong>Profile Matrix</strong>: {workerName} | Age: {age} | Location: {zone} <br/>
            Threshold strictly tailored. Modifying these sliders simulates real IoT hardware readings. Exceeding your safe personal threshold will instantly force an SOS escalation. Let's see how fast the system reacts.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <SimulatorSlider label="H2S (Hydrogen Sulfide)" unit="ppm" value={gasH2S} setVal={setGasH2S} max={25} step={0.5} threshold={thresholds.h2s} />
          <SimulatorSlider label="CO (Carbon Monoxide)" unit="ppm" value={gasCO} setVal={setGasCO} max={60} step={1} threshold={thresholds.co} />
          <SimulatorSlider label="CH4 (Methane)" unit="%" value={gasCH4} setVal={setGasCH4} max={5} step={0.1} threshold={thresholds.ch4} />
          <SimulatorSlider label="O2 (Oxygen)" unit="%" value={o2Level} setVal={setO2Level} max={25} step={0.1} threshold={thresholds.o2} invertAlert />
        </div>
      </div>
    </div>
  );
}

function SimulatorSlider({ label, unit, value, setVal, max, step, threshold, invertAlert }) {
  const isDangerous = invertAlert ? value <= threshold : value >= threshold;
  
  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', border: isDangerous ? '1px solid var(--danger)' : '1px solid rgba(255,255,255,0.05)', transition: 'var(--transition)', boxShadow: isDangerous ? '0 0 20px rgba(239,68,68,0.2)' : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: isDangerous ? 'var(--danger)' : 'var(--text-muted)' }}>{label}</label>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 'bold' }}>{value}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>{unit}</span>
        </div>
      </div>
      <input 
        type="range" 
        min={0} max={max} step={step} 
        value={value} 
        onChange={(e) => setVal(Number(e.target.value))} 
        style={{ width: '100%', cursor: 'pointer', accentColor: isDangerous ? 'var(--danger)' : 'var(--primary)', height: '8px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Safe Limit: {invertAlert ? '>' : '<'} {threshold}</span>
        {isDangerous && <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>CRITICAL</span>}
      </div>
    </div>
  );
}
