import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  ArrowRight,
  TrendingDown,
  Warehouse,
  DollarSign,
  Truck
} from 'lucide-react';

export default function ValidationCard({ validationReceipt, metricsBefore, metricsAfter }) {
  if (!validationReceipt) return null;

  const { all_passed, checks, discrepancy_detected, failure_reason, recovery_strategy, recovery_executed } = validationReceipt;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: all_passed ? 'var(--accent-emerald-dim)' : 'var(--accent-rose-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: all_passed ? 'var(--accent-emerald-light)' : 'var(--accent-rose)'
          }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
              Closed-Loop Feedback & Invariant Validation
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Two-Phase Commit Protocol: Post-execution ERP state audit & invariant verification
            </p>
          </div>
        </div>

        <span className={`badge ${all_passed ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.78rem', padding: '6px 14px' }}>
          {all_passed ? 'ALL INVARIANTS SATISFIED' : 'DISCREPANCY DETECTED'}
        </span>
      </div>

      {/* Discrepancy & Recovery Alert if any */}
      {discrepancy_detected && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '8px',
          padding: '14px 18px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', fontWeight: 700, fontSize: '0.86rem', marginBottom: '4px' }}>
            <AlertTriangle size={16} />
            Execution Discrepancy Caught in Closed Loop:
          </div>
          <p style={{ fontSize: '0.82rem', color: '#fecdd3', marginBottom: '8px' }}>
            {failure_reason}
          </p>
          {recovery_strategy && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--accent-emerald-light)',
              fontSize: '0.8rem'
            }}>
              <RotateCcw size={15} />
              <strong>Autonomous Recovery Executed:</strong> {recovery_strategy}
            </div>
          )}
        </div>
      )}

      {/* Invariants Table */}
      <div style={{
        background: 'rgba(0,0,0,0.25)',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        marginBottom: '18px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
              <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>INVARIANT RULE</th>
              <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>STATUS</th>
              <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>OBSERVED VALUE</th>
              <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>SAFE THRESHOLD</th>
              <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>VALIDATION MESSAGE</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((c, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#fff' }}>{c.name}</td>
                <td style={{ padding: '10px 14px' }}>
                  {c.passed ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald-light)', fontWeight: 700 }}>
                      <CheckCircle2 size={14} /> PASS
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-rose)', fontWeight: 700 }}>
                      <XCircle size={14} /> FAIL
                    </span>
                  )}
                </td>
                <td style={{ padding: '10px 14px', color: '#e2e8f0' }} className="font-mono">{String(c.current_value)}</td>
                <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }} className="font-mono">{String(c.limit_value)}</td>
                <td style={{ padding: '10px 14px', color: c.passed ? 'var(--text-secondary)' : '#fecdd3' }}>{c.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Before / After Telemetry Metrics */}
      {(metricsBefore || metricsAfter) && (
        <div className="grid-3" style={{ gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Days of Supply (Coverage)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              <span style={{ color: 'var(--text-muted)' }}>{metricsBefore?.days_of_supply || 'N/A'}d</span>
              <ArrowRight size={14} color="var(--accent-emerald)" />
              <span style={{ color: 'var(--accent-emerald-light)' }}>{metricsAfter?.days_of_supply || 'N/A'}d</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Stockout Risk Score
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              <span style={{ color: 'var(--accent-rose)' }}>{metricsBefore?.stockout_risk_score ?? 'N/A'}%</span>
              <ArrowRight size={14} color="var(--accent-emerald)" />
              <span style={{ color: 'var(--accent-emerald-light)' }}>{metricsAfter?.stockout_risk_score ?? '0'}%</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
              Warehouse Storage Headroom
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              <span style={{ color: 'var(--accent-amber)' }}>{metricsBefore?.storage_utilization_pct || 91}% Util</span>
              <ArrowRight size={14} color="var(--accent-emerald)" />
              <span style={{ color: 'var(--accent-emerald-light)' }}>{metricsAfter?.storage_utilization_pct || 95}% Safe</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
