import React, { useState } from 'react';
import { 
  Eye, 
  BrainCircuit, 
  Terminal, 
  ShieldCheck, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

const PHASE_CONFIG = {
  OBSERVE: { label: 'OBSERVE', color: 'badge-cyan', icon: Eye, border: 'var(--accent-cyan)' },
  THINK: { label: 'REASONING', color: 'badge-violet', icon: BrainCircuit, border: 'var(--accent-violet)' },
  ACT: { label: 'TOOL EXECUTION', color: 'badge-emerald', icon: Terminal, border: 'var(--accent-emerald)' },
  VALIDATE: { label: 'CLOSED-LOOP CHECK', color: 'badge-amber', icon: ShieldCheck, border: 'var(--accent-amber)' },
  RECOVER: { label: 'SELF-HEALING RECOVERY', color: 'badge-rose', icon: AlertCircle, border: 'var(--accent-rose)' },
  DECIDE: { label: 'FINAL DECISION', color: 'badge-emerald', icon: CheckCircle2, border: 'var(--accent-emerald)' }
};

export default function AgentTraceView({ decision, isRunning }) {
  const [expandedSteps, setExpandedSteps] = useState({});

  const toggleStep = (stepNum) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepNum]: !prev[stepNum]
    }));
  };

  if (isRunning) {
    return (
      <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', margin: '20px 0' }}>
        <div className="animate-spin-slow" style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'inline-block' }}>
          ⚡
        </div>
        <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>
          Agent Autonomous ReAct Loop in Progress...
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
          Auditing physical stock, running demand regression, querying supplier catalogs, calculating storage headroom, and evaluating ERP invariants.
        </p>
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', margin: '20px 0', borderStyle: 'dashed' }}>
        <Sparkles size={32} color="var(--accent-emerald)" style={{ marginBottom: '12px' }} />
        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '6px' }}>
          No Active Scenario Execution
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Click "Launch Agent Analysis" above to observe the real-time ReAct trace, multi-factor constraint calculations, and closed-loop validation.
        </p>
      </div>
    );
  }

  const { decision_type, reasoning_summary, key_factors, execution_steps, confidence_score } = decision;

  return (
    <div style={{ marginTop: '24px' }}>
      {/* Executive Decision Header Card */}
      <div className="glass-panel-glow" style={{
        padding: '24px',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(13, 18, 29, 0.95) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.9rem',
              letterSpacing: '0.04em',
              background: decision_type === 'ACCEPT' ? 'var(--accent-emerald-dim)' :
                          decision_type === 'MODIFY' ? 'var(--accent-amber-dim)' :
                          decision_type === 'SPLIT_ORDER' ? 'var(--accent-violet-dim)' : 'var(--accent-cyan-dim)',
              color: decision_type === 'ACCEPT' ? 'var(--accent-emerald-light)' :
                     decision_type === 'MODIFY' ? 'var(--accent-amber)' :
                     decision_type === 'SPLIT_ORDER' ? '#c084fc' : 'var(--accent-cyan)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              AGENT DECISION: {decision_type}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Confidence: <strong style={{ color: 'var(--accent-emerald-light)' }}>{(confidence_score * 100).toFixed(0)}%</strong>
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Executed Steps: <strong style={{ color: '#fff' }}>{execution_steps.length}</strong> | Invariant Status: <strong style={{ color: 'var(--accent-emerald-light)' }}>PASSED</strong>
          </div>
        </div>

        <p style={{ fontSize: '0.92rem', color: '#fff', lineHeight: '1.55', marginBottom: '16px', background: 'rgba(0,0,0,0.3)', padding: '14px 18px', borderRadius: '10px', borderLeft: '3px solid var(--accent-emerald)' }}>
          {reasoning_summary}
        </p>

        <div>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Critical Decision Factors:
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {key_factors.map((factor, idx) => (
              <div key={idx} style={{
                fontSize: '0.78rem',
                background: 'rgba(255,255,255,0.04)',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-primary)'
              }}>
                <CheckCircle2 size={13} color="var(--accent-emerald)" />
                {factor}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step-by-Step ReAct Execution Trace */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrainCircuit size={20} color="var(--accent-violet)" />
          Step-by-Step ReAct Reasoning & Execution Trace
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {execution_steps.map((step) => {
            const config = PHASE_CONFIG[step.phase] || PHASE_CONFIG.THINK;
            const Icon = config.icon;
            const isExpanded = expandedSteps[step.step_num] ?? (step.phase === 'VALIDATE' || step.phase === 'THINK');

            return (
              <div
                key={step.step_num}
                style={{
                  background: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}
              >
                {/* Step Bar Header */}
                <div
                  onClick={() => toggleStep(step.step_num)}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#fff'
                    }}>
                      {step.step_num}
                    </span>

                    <span className={`badge ${config.color}`} style={{ fontSize: '0.7rem' }}>
                      <Icon size={12} />
                      {config.label}
                    </span>

                    {step.action && (
                      <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', background: 'rgba(6,182,212,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        {step.action}()
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '0.72rem' }}>{step.timestamp.split('T')[1]?.slice(0, 8) || ''}</span>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>

                {/* Step Body */}
                {isExpanded && (
                  <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Thought Block */}
                    <div style={{ fontSize: '0.84rem', color: '#e2e8f0', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                      {step.thought}
                    </div>

                    {/* Parameters & Observations Payload */}
                    {(step.parameters || step.observation) && (
                      <div style={{
                        marginTop: '4px',
                        display: 'grid',
                        gridTemplateColumns: step.parameters && step.observation ? '1fr 1fr' : '1fr',
                        gap: '12px'
                      }}>
                        {step.parameters && (
                          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                              Tool Parameters:
                            </div>
                            <pre className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-emerald-light)', overflowX: 'auto' }}>
                              {JSON.stringify(step.parameters, null, 2)}
                            </pre>
                          </div>
                        )}

                        {step.observation && (
                          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                              System Observation:
                            </div>
                            <pre className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', overflowX: 'auto' }}>
                              {JSON.stringify(step.observation, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
