import React from 'react';
import { MessageSquare, Users, Hash, Plus } from 'lucide-react';

const cardStyle = {
  background: 'rgba(13, 14, 18, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.06)',
  position: 'relative',
};

const Community = () => {
  const channels = [
    { name: 'general', members: 1248, unread: 12 },
    { name: 'q-and-a', members: 856, unread: 5 },
    { name: 'resources', members: 1024, unread: 0 },
    { name: 'announcements', members: 1248, unread: 1 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div className="code-label" style={{ color: 'rgba(195,244,0,0.5)', marginBottom: 10 }}>// Student Interaction Network</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Community <span style={{ color: '#c3f400' }}>Hub</span>
          </h1>
          <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Direct Student Communication Channels</p>
        </div>
        <button className="submit-btn" style={{ width: 'auto', padding: '14px 24px', gap: 10 }}>
          <Plus size={16} />
          New Channel
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, minHeight: 500 }}>
        {/* Channel list */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 18, height: 18, borderTop: '1px solid rgba(195,244,0,0.4)', borderLeft: '1px solid rgba(195,244,0,0.4)' }} />
          <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="code-label" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9 }}>Channels</span>
          </div>
          {channels.map((ch, i) => (
            <div
              key={ch.name}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: i === 0 ? 'rgba(195,244,0,0.05)' : 'transparent', borderLeft: i === 0 ? '2px solid #c3f400' : '2px solid transparent', transition: 'all 0.15s ease' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Hash size={13} style={{ color: i === 0 ? '#c3f400' : 'rgba(255,255,255,0.25)' }} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 12, color: i === 0 ? '#c3f400' : 'rgba(255,255,255,0.5)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{ch.name}</span>
              </div>
              {ch.unread > 0 && (
                <span style={{ background: '#c3f400', color: '#283500', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 9, padding: '2px 7px', borderRadius: 2 }}>{ch.unread}</span>
              )}
            </div>
          ))}
        </div>

        {/* Message area */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20, minHeight: 400 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 18, height: 18, borderTop: '1px solid rgba(195,244,0,0.4)', borderLeft: '1px solid rgba(195,244,0,0.4)' }} />
          <div style={{ width: 60, height: 60, border: '1px solid rgba(195,244,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(195,244,0,0.04)' }}>
            <MessageSquare size={28} style={{ color: '#c3f400' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Select a Channel</h3>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.3)', maxWidth: 300, lineHeight: 1.6 }}>
              Choose a channel from the left to view and participate in conversations with your students.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
