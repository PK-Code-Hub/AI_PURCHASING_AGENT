import React from 'react';
import { ShieldCheck, Cpu, RefreshCw, Sliders, Activity, CheckCircle, Database } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onResetDb, 
  resetting, 
  systemStatus,
  pendingApprovalsCount = 0 
}) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(13, 18, 29, 0.85)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '14px 28px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1480px',
        margin: '0 auto',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <ShieldCheck size={26} color="#07090e" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                AEGIS<span style={{ color: '#10b981' }}>PROCURE</span> AI
              </h1>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>ENTERPRISE AGENT</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Autonomous Multi-Echelon Retail & Quick-Commerce Purchasing Core
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'operations', label: 'Agent Operations', icon: Cpu },
            { id: 'evaluations', label: 'Evaluation Benchmarks', icon: CheckCircle },
            { id: 'sandbox', label: 'Buyer Sandbox', icon: Sliders },
            { id: 'ledger', label: 'PO Ledger & ERP State', icon: Database }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isActive ? 'var(--accent-emerald)' : 'transparent',
                  color: isActive ? '#07090e' : 'var(--text-secondary)'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* System Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(16, 185, 129, 0.08)',
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.78rem',
            color: 'var(--accent-emerald-light)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }}></span>
            <span>ERP Sync: Active (3 Nodes)</span>
          </div>

          <button
            onClick={onResetDb}
            disabled={resetting}
            title="Reset ERP Database to baseline scenario state"
            className="btn btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} className={resetting ? 'animate-spin-slow' : ''} />
            Reset State
          </button>
        </div>
      </div>
    </header>
  );
}
