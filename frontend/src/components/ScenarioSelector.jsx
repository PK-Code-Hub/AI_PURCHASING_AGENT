import React from 'react';
import { 
  FileSpreadsheet, 
  Truck, 
  TrendingUp, 
  Boxes, 
  Play, 
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Layers
} from 'lucide-react';

const SCENARIOS = [
  {
    id: 'scenario_1',
    title: 'Scenario 1: Purchase Recommendation Review',
    tag: 'Multi-Constraint Optimization',
    tagColor: 'badge-emerald',
    icon: FileSpreadsheet,
    sku: 'Organic Oat Milk 1L',
    node: 'North Metro Dark Store (FC-01)',
    summary: 'ERP automated heuristic recommends procuring 800 units. Agent must investigate physical storage headroom, category budget, MOQ, and pipeline POs before making a decision.',
    highlight: '800 units exceeds storage (450 cap) and budget ($1,600 cap)',
    expectedOutcome: 'MODIFY recommendation to 400 units, preserving budget & capacity.'
  },
  {
    id: 'scenario_2',
    title: 'Scenario 2: Supplier Cannot Fulfil the Purchase',
    tag: 'Shortfall Recovery & Split Order',
    tagColor: 'badge-amber',
    icon: Truck,
    sku: 'Artisan Sourdough Loaf 500g',
    node: 'South Regional FC (FC-02)',
    summary: 'PO-5021 created for 500 units. Primary supplier Alpha Bakery reports equipment failure and can only provide 250 units. SKU has strict 5-day shelf life.',
    highlight: '250 units creates Day 5 stockout gap; perishable shelf-life',
    expectedOutcome: 'SPLIT PROCUREMENT: Accept 250 from Alpha, issue backup PO for 200 to Beta Bakery.'
  },
  {
    id: 'scenario_3',
    title: 'Scenario 3: Demand / Forecast Surge Anomaly',
    tag: 'Expedited Replenishment',
    tagColor: 'badge-cyan',
    icon: TrendingUp,
    sku: 'Electrolyte Hydration Surge 500ml',
    node: 'North Metro Dark Store (FC-01)',
    summary: 'Sudden 3.55x sales velocity spike (160 units/day vs 45 normal). Stockout projected in under 24 hours. Standard 5-day pipeline replenishment arrives 4 days too late.',
    highlight: 'Stockout in 22.5 hours; standard pipeline lead time is 5 days',
    expectedOutcome: 'SURGE REORDER: Dispatch 350 units via 1-day express freight.'
  },
  {
    id: 'scenario_4',
    title: 'Scenario 4: Complex Multi-Constraint Deadlock',
    tag: 'Cross-Docking & Distribution',
    tagColor: 'badge-violet',
    icon: Boxes,
    sku: 'Natural Artesian Mineral Water 24pk',
    node: 'North Metro Dark Store (FC-01)',
    summary: 'Bulky item reorder recommendation for 1,000 units. Node North only has 200 units storage headroom, but Supplier MOQ is 500 units (conflict deadlock).',
    highlight: 'Storage cap is 200 units vs strict Supplier MOQ of 500 units',
    expectedOutcome: 'MULTI-NODE SPLIT: Order 600 units (200 to North, 400 to sister Node West).'
  }
];

export default function ScenarioSelector({ selectedScenario, onSelectScenario, onRunScenario, isRunning }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
            Purchasing Decision Scenarios
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Select an operational situation to test how the autonomous agent investigates, decides, executes, and validates.
          </p>
        </div>

        <button
          onClick={() => onRunScenario(selectedScenario)}
          disabled={isRunning}
          className="btn btn-primary"
          style={{ padding: '10px 24px', fontSize: '0.95rem' }}
        >
          {isRunning ? (
            <>
              <span className="animate-spin-slow" style={{ display: 'inline-block' }}>⟳</span>
              Agent Investigating & Validating...
            </>
          ) : (
            <>
              <Play size={18} fill="#07090e" />
              Launch Agent Analysis ({selectedScenario.replace('_', ' ').toUpperCase()})
            </>
          )}
        </button>
      </div>

      <div className="grid-2" style={{ gap: '16px' }}>
        {SCENARIOS.map(sc => {
          const Icon = sc.icon;
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={isSelected ? 'glass-panel-glow' : 'glass-panel'}
              style={{
                padding: '20px',
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-card)',
                transform: isSelected ? 'scale(1.008)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? '#07090e' : 'var(--text-primary)'
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>{sc.title}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      SKU: <span style={{ color: 'var(--text-primary)' }}>{sc.sku}</span> | Node: <span style={{ color: 'var(--text-primary)' }}>{sc.node}</span>
                    </div>
                  </div>
                </div>
                <span className={`badge ${sc.tagColor}`}>{sc.tag}</span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.45' }}>
                {sc.summary}
              </p>

              <div style={{
                background: 'rgba(0,0,0,0.25)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '0.78rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber)' }}>
                  <AlertTriangle size={13} />
                  <strong>Key Friction:</strong> {sc.highlight}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald-light)' }}>
                  <CheckCircle2 size={13} />
                  <strong>Target Resolution:</strong> {sc.expectedOutcome}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
