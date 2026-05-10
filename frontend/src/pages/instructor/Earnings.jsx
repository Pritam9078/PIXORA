import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, Download, 
  ArrowUpRight, ArrowDownRight, CreditCard,
  Building, CheckCircle2, AlertCircle, Plus, Clock, Loader2
} from 'lucide-react';
import { InstructorService } from '../../services/InstructorService';

const CornerAccents = () => (
  <>
    <div style={{ position: 'absolute', top: 0, left: 0, width: 18, height: 18, borderTop: '1px solid rgba(195,244,0,0.4)', borderLeft: '1px solid rgba(195,244,0,0.4)', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderBottom: '1px solid rgba(195,244,0,0.15)', borderRight: '1px solid rgba(195,244,0,0.15)', pointerEvents: 'none' }} />
  </>
);

const cardStyle = {
  background: 'rgba(13, 14, 18, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.06)',
  position: 'relative',
};

const Earnings = () => {
  const [earningsData, setEarningsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEarnings = async () => {
      try {
        const data = await InstructorService.getEarningsMetrics();
        setEarningsData(data);
      } catch (error) {
        console.error("Failed to load earnings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEarnings();
  }, []);

  const statusColor = { Completed: '#4ade80', Processing: '#60a5fa', Pending: '#fb923c' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div className="code-label" style={{ color: 'rgba(195,244,0,0.5)', marginBottom: 10 }}>// Financial Operations Node</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Revenue <span style={{ color: '#c3f400' }}>Command</span>
          </h1>
          <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>Financial Analytics & Payout Operations</p>
        </div>
        <button className="register-btn" style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
          <Download size={16} />
          Export Statement
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: 100, textAlign: 'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#c3f400' }} />
        </div>
      ) : (
        <>
          {/* Financial Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {/* Available Payout */}
            <div style={{ ...cardStyle, padding: 28 }}>
              <CornerAccents />
              <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Available for Payout</p>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 34, color: '#c3f400', letterSpacing: '-0.02em', marginBottom: 20 }}>{earningsData?.available || '$0.00'}</h2>
              <button className="submit-btn" style={{ padding: '14px 20px', fontSize: 12 }}>
                Withdraw Funds
              </button>
            </div>

            {/* Total Earnings */}
            <div style={{ ...cardStyle, padding: 28 }}>
              <CornerAccents />
              <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Total Earnings (30d)</p>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 34, color: '#fff', letterSpacing: '-0.02em', marginBottom: 12 }}>{earningsData?.total || '$0.00'}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Space Grotesk', monospace", fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.05em' }}>
                <ArrowUpRight size={14} />
                +15.4% vs last month
              </div>
            </div>

            {/* Pending */}
            <div style={{ ...cardStyle, padding: 28 }}>
              <CornerAccents />
              <p className="code-label" style={{ color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Pending Clearance</p>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 34, color: '#fff', letterSpacing: '-0.02em', marginBottom: 12 }}>{earningsData?.pending || '$0.00'}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={12} style={{ color: '#fb923c' }} />
                <span className="code-label" style={{ color: '#fb923c', fontSize: 10 }}>Clearing in 3-5 business days</span>
              </div>
            </div>
          </div>

          {/* Ledger + Payout Methods */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
            {/* Ledger */}
            <div style={{ ...cardStyle, overflow: 'hidden' }}>
              <CornerAccents />
              <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 3, height: 18, background: '#c3f400' }} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Transaction Ledger</span>
                </div>
                <button style={{ background: 'none', border: 'none', fontFamily: "'Space Grotesk', monospace", fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>View All</button>
              </div>

              {/* Table Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', padding: '12px 28px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['Transaction', 'Method / Course', 'Amount'].map(h => (
                  <span key={h} className="code-label" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9 }}>{h}</span>
                ))}
              </div>

              {(earningsData?.transactions || []).map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 120px',
                    padding: '18px 28px', alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    transition: 'background 0.15s ease', cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 36, height: 36, flexShrink: 0, background: tx.type === 'Payout' ? 'rgba(251,146,60,0.08)' : 'rgba(195,244,0,0.08)', border: `1px solid ${tx.type === 'Payout' ? 'rgba(251,146,60,0.2)' : 'rgba(195,244,0,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tx.type === 'Payout' ? '#fb923c' : '#c3f400' }}>
                      {tx.type === 'Payout' ? <Building size={16} /> : <DollarSign size={16} />}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tx.type}</div>
                      <div className="code-label" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 9, marginTop: 3 }}>{tx.date}</div>
                    </div>
                  </div>
                  <span className="code-label" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{tx.method}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: tx.type === 'Payout' ? '#fff' : '#c3f400', letterSpacing: '-0.01em' }}>
                      {tx.type === 'Payout' ? '-' : '+'}{tx.amount}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                      {tx.status === 'Completed' ? <CheckCircle2 size={10} style={{ color: statusColor[tx.status] }} /> : <AlertCircle size={10} style={{ color: statusColor[tx.status] }} />}
                      <span className="code-label" style={{ color: statusColor[tx.status], fontSize: 9 }}>{tx.status}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Payout Accounts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ ...cardStyle, padding: 24 }}>
                <CornerAccents />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Payout Accounts</span>
                  <button style={{ background: 'none', border: 'none', color: '#c3f400', cursor: 'pointer' }}>
                    <Plus size={18} />
                  </button>
                </div>
                {/* Bank card */}
                <div style={{ padding: 20, background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(79,70,229,0.15))', border: '1px solid rgba(96,165,250,0.2)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: -12, bottom: -12, width: 80, height: 80, borderRadius: '50%', border: '1px solid rgba(96,165,250,0.1)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <Building size={22} style={{ color: '#fff' }} />
                    <span className="code-label" style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 8 }}>Default</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Chase Bank</div>
                    <div style={{ fontFamily: "'Space Grotesk', monospace", fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em' }}>•••• •••• •••• 4242</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Earnings;
