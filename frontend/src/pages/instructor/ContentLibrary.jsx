import React from 'react';
import { Library, Upload, Film, FileText, Image, Search, Plus } from 'lucide-react';

const cardStyle = {
  background: 'rgba(13, 14, 18, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.06)',
  position: 'relative',
};

const CornerAccents = () => (
  <>
    <div style={{ position: 'absolute', top: 0, left: 0, width: 18, height: 18, borderTop: '1px solid rgba(195,244,0,0.4)', borderLeft: '1px solid rgba(195,244,0,0.4)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderBottom: '1px solid rgba(195,244,0,0.15)', borderRight: '1px solid rgba(195,244,0,0.15)', pointerEvents: 'none' }} />
  </>
);

const mockAssets = [
  { id: 1, name: 'UE5 Lighting Tutorial.mp4', type: 'video', size: '2.4 GB', date: 'May 08' },
  { id: 2, name: 'Smart Contracts PDF Guide.pdf', type: 'doc', size: '3.2 MB', date: 'May 07' },
  { id: 3, name: 'Course Thumbnail.png', type: 'image', size: '1.1 MB', date: 'May 06' },
  { id: 4, name: 'Physics Simulation Demo.mp4', type: 'video', size: '1.8 GB', date: 'May 05' },
  { id: 5, name: 'Student Handbook.pdf', type: 'doc', size: '780 KB', date: 'May 03' },
];

const typeIcon = { video: Film, doc: FileText, image: Image };
const typeColor = { video: '#c3f400', doc: '#60a5fa', image: '#fb923c' };

const ContentLibrary = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div className="code-label" style={{ color: 'rgba(195,244,0,0.5)', marginBottom: 10 }}>// Asset Repository Node</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Content <span style={{ color: '#c3f400' }}>Library</span>
          </h1>
          <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Media, Documents & Course Assets</p>
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '14px 24px', gap: 10 }}>
          <Upload size={16} />
          Upload Asset
        </button>
      </div>

      {/* Search bar */}
      <div style={{ ...cardStyle, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
        <CornerAccents />
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.2)' }} />
          <input
            type="text"
            placeholder="SEARCH ASSETS..."
            className="input-field"
            style={{ paddingLeft: 42, borderRadius: 0, fontSize: 11 }}
          />
        </div>
        {['All', 'Videos', 'Docs', 'Images'].map(f => (
          <button key={f} className="register-btn" style={{ width: 'auto', padding: '10px 16px', fontSize: 10, borderColor: f === 'All' ? 'rgba(195,244,0,0.4)' : undefined, color: f === 'All' ? '#c3f400' : undefined }}>{f}</button>
        ))}
      </div>

      {/* Asset list */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <CornerAccents />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 80px 80px', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          {['Asset Name', 'Type', 'Size', 'Date', 'Action'].map(h => (
            <span key={h} className="code-label" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9 }}>{h}</span>
          ))}
        </div>
        {mockAssets.map((asset, i) => {
          const Icon = typeIcon[asset.type];
          const color = typeColor[asset.type];
          return (
            <div
              key={asset.id}
              style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 80px 80px', padding: '16px 24px', borderBottom: i < mockAssets.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center', transition: 'background 0.15s ease', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, background: `${color}10`, border: `1px solid ${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                  <Icon size={16} />
                </div>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 12, color: '#fff', letterSpacing: '0.02em' }}>{asset.name}</span>
              </div>
              <span className="code-label" style={{ color, fontSize: 9, textTransform: 'uppercase' }}>{asset.type}</span>
              <span className="code-label" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{asset.size}</span>
              <span className="code-label" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>{asset.date}</span>
              <button className="register-btn" style={{ padding: '6px 12px', fontSize: 9, width: 'auto' }}>Use</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContentLibrary;
