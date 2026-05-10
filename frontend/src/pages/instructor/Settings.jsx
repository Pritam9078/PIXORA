import React from 'react';
import { Settings, User, Bell, Shield, CreditCard, Save, ChevronRight } from 'lucide-react';

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

const settingsGroups = [
  {
    icon: User, label: 'Profile Config', items: [
      { label: 'Display Name', value: 'Instructor Name' },
      { label: 'Bio / Tagline', value: 'Your instructor bio here...' },
      { label: 'Website URL', value: '' },
    ]
  },
  {
    icon: Bell, label: 'Notification Matrix', items: [
      { label: 'New Enrollment Alerts', value: 'Enabled', toggle: true },
      { label: 'Submission Notifications', value: 'Enabled', toggle: true },
      { label: 'Review Alerts', value: 'Disabled', toggle: false },
    ]
  },
  {
    icon: Shield, label: 'Security Node', items: [
      { label: 'Two-Factor Authentication', value: 'Active', toggle: true },
      { label: 'Session Management', value: 'View Sessions', link: true },
    ]
  },
];

const InstructorSettings = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div>
        <div className="code-label" style={{ color: 'rgba(195,244,0,0.5)', marginBottom: 10 }}>// System Configuration Panel</div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
          Account <span style={{ color: '#c3f400' }}>Settings</span>
        </h1>
        <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Instructor Profile & System Configuration</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {settingsGroups.map((group) => (
          <div key={group.label} style={{ ...cardStyle, overflow: 'hidden' }}>
            <CornerAccents />
            <div style={{ padding: '18px 26px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.01)' }}>
              <group.icon size={15} style={{ color: '#c3f400' }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{group.label}</span>
            </div>
            {group.items.map((item, j) => (
              <div
                key={item.label}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 26px', borderBottom: j < group.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              >
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.03em' }}>{item.label}</span>
                {item.toggle !== undefined ? (
                  <div style={{
                    width: 42, height: 22, background: item.toggle ? 'rgba(195,244,0,0.2)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${item.toggle ? 'rgba(195,244,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 2, position: 'relative', cursor: 'pointer',
                  }}>
                    <div style={{ position: 'absolute', top: 3, left: item.toggle ? 'calc(100% - 18px)' : 3, width: 14, height: 14, background: item.toggle ? '#c3f400' : 'rgba(255,255,255,0.3)', transition: 'left 0.2s ease' }} />
                  </div>
                ) : item.link ? (
                  <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Space Grotesk', monospace", fontSize: 11, color: '#c3f400', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {item.value} <ChevronRight size={13} />
                  </button>
                ) : (
                  <input
                    className="input-field"
                    defaultValue={item.value}
                    placeholder={item.label}
                    style={{ width: 280, borderRadius: 0, fontSize: 11 }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        <button className="submit-btn" style={{ padding: '18px', gap: 10 }}>
          <Save size={16} />
          Save Configuration
        </button>
      </div>
    </div>
  );
};

export default InstructorSettings;
