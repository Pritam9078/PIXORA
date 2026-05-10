import React from 'react';
import { Monitor, Radio, Plus, Calendar, Clock } from 'lucide-react';

const cardStyle = {
  background: 'rgba(13, 14, 18, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.06)',
  position: 'relative',
};

const LiveClasses = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div>
        <div className="code-label" style={{ color: 'rgba(195,244,0,0.5)', marginBottom: 10 }}>// Broadcast Command Node</div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
          Live <span style={{ color: '#c3f400' }}>Broadcast</span>
        </h1>
        <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Real-time Interactive Class Sessions</p>
      </div>

      <div style={{ ...cardStyle, padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 420, gap: 24 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 18, height: 18, borderTop: '1px solid rgba(195,244,0,0.4)', borderLeft: '1px solid rgba(195,244,0,0.4)' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderBottom: '1px solid rgba(195,244,0,0.15)', borderRight: '1px solid rgba(195,244,0,0.15)' }} />
        
        <div style={{ width: 72, height: 72, border: '1px solid rgba(195,244,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(195,244,0,0.04)', position: 'relative' }}>
          <Monitor size={32} style={{ color: '#c3f400' }} />
          <div style={{ position: 'absolute', top: -4, right: -4, width: 12, height: 12, borderRadius: '50%', background: '#fb923c', border: '2px solid #0D0E12' }} />
        </div>
        <div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Live Class Studio</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.3)', maxWidth: 380, lineHeight: 1.7 }}>
            WebRTC-powered live sessions with screen sharing, interactive whiteboards, and real-time Q&A. Coming soon.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="submit-btn" style={{ width: 'auto', padding: '14px 28px', gap: 10 }}>
            <Radio size={16} />
            Schedule Session
          </button>
          <button className="register-btn" style={{ width: 'auto', padding: '14px 28px', fontSize: 11 }}>
            View Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveClasses;
