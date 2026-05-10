import React from 'react';
import { Bell, CheckCheck, AlertCircle, Info, Zap } from 'lucide-react';

const cardStyle = {
  background: 'rgba(13, 14, 18, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.06)',
  position: 'relative',
};

const notifications = [
  { id: 1, type: 'alert', title: '48 Submissions Awaiting Review', body: 'Students from Advanced Game Physics have submitted final projects.', time: '5m ago', read: false },
  { id: 2, type: 'info', title: 'New Enrollment', body: 'Alex Rivera enrolled in Smart Contract Security.', time: '12m ago', read: false },
  { id: 3, type: 'success', title: 'Payout Processed', body: '$4,250.00 has been successfully transferred to your bank account.', time: '1h ago', read: true },
  { id: 4, type: 'info', title: 'New Review Posted', body: 'Mike Ross left a 5-star review for Unreal Engine 5 Masterclass.', time: '3h ago', read: true },
];

const typeConfig = {
  alert: { color: '#fb923c', icon: AlertCircle },
  info: { color: '#60a5fa', icon: Info },
  success: { color: '#4ade80', icon: CheckCheck },
};

const Notifications = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div className="code-label" style={{ color: 'rgba(195,244,0,0.5)', marginBottom: 10 }}>// Signal Intelligence Feed</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Notification <span style={{ color: '#c3f400' }}>Feed</span>
          </h1>
          <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>System Alerts & Activity Signals</p>
        </div>
        <button className="register-btn" style={{ width: 'auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
          <CheckCheck size={15} />
          Mark All Read
        </button>
      </div>

      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 18, height: 18, borderTop: '1px solid rgba(195,244,0,0.4)', borderLeft: '1px solid rgba(195,244,0,0.4)' }} />
        {notifications.map((n, i) => {
          const conf = typeConfig[n.type];
          return (
            <div
              key={n.id}
              style={{
                display: 'flex', gap: 18, padding: '22px 28px',
                borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: !n.read ? `rgba(${n.type === 'alert' ? '251,146,60' : n.type === 'success' ? '74,222,128' : '96,165,250'},0.03)` : 'transparent',
                borderLeft: !n.read ? `3px solid ${conf.color}` : '3px solid transparent',
                cursor: 'pointer', transition: 'background 0.15s ease',
              }}
            >
              <div style={{ width: 40, height: 40, flexShrink: 0, border: `1px solid ${conf.color}30`, background: `${conf.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: conf.color }}>
                <conf.icon size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: n.read ? 'rgba(255,255,255,0.5)' : '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{n.title}</span>
                  <span className="code-label" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, whiteSpace: 'nowrap', marginLeft: 16 }}>{n.time}</span>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{n.body}</p>
              </div>
              {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#c3f400', flexShrink: 0, marginTop: 6, boxShadow: '0 0 6px #c3f400' }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
