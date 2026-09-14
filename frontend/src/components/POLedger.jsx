import React from 'react';
import { 
  FileText, 
  Warehouse, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Truck,
  TrendingUp,
  PackageCheck
} from 'lucide-react';

export default function POLedger({ systemState, onApprovePO, approving }) {
  if (!systemState) return null;

  const { purchase_orders = [], inventory = [], budgets = [], nodes = [] } = systemState;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Active Purchase Orders Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={22} color="var(--accent-emerald)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Enterprise ERP Purchase Order Ledger
            </h3>
          </div>
          <span className="badge badge-cyan">{purchase_orders.length} Active Orders</span>
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>PO NUMBER</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>PRODUCT SKU</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>SUPPLIER</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>DESTINATION NODE</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>QUANTITY</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>TOTAL COST</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>LEAD TIME</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>ERP STATUS</th>
                <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {purchase_orders.map(po => {
                const isConfirmed = po.status === 'CONFIRMED';
                const isPartial = po.status === 'PARTIALLY_FULFILLED';
                const isSubmitted = po.status === 'SUBMITTED';

                return (
                  <tr key={po.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#fff' }} className="font-mono">
                      {po.id}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#f8fafc' }}>
                      <strong>{po.sku_name || po.sku_id}</strong>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                      {po.supplier_name || po.supplier_id}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                      {po.node_name || po.node_id}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#fff' }}>
                      {po.quantity.toLocaleString()} units
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--accent-emerald-light)', fontWeight: 600 }}>
                      ${po.total_cost.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                      {po.lead_time_days} days
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge ${
                        isConfirmed ? 'badge-emerald' :
                        isPartial ? 'badge-amber' :
                        isSubmitted ? 'badge-cyan' : 'badge-violet'
                      }`} style={{ fontSize: '0.68rem' }}>
                        {po.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {po.status !== 'CONFIRMED' ? (
                        <button
                          onClick={() => onApprovePO(po.id)}
                          disabled={approving === po.id}
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        >
                          <CheckCircle size={12} />
                          {approving === po.id ? 'Approving...' : 'Approve PO'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Node Inventory & Category Budgets Overview */}
      <div className="grid-2">
        {/* Fulfillment Node Inventory Matrix */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Warehouse size={18} color="var(--accent-cyan)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              Multi-Node Inventory & Demand Velocity
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {inventory.map((inv, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.02)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.84rem' }}>{inv.sku_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inv.node_name}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {inv.stock_on_hand} on-hand <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>(+{inv.in_transit_qty} in-transit)</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: inv.demand_trend === 'SURGE' ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>
                    Velocity: {inv.current_velocity} / day ({inv.demand_trend})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Working Capital Budgets */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <DollarSign size={18} color="var(--accent-emerald)" />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
              Procurement Category Budgets
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {budgets.map((b, idx) => {
              const utilPct = Math.min(100, Math.round(((b.spent_amount + b.committed_amount) / b.monthly_budget) * 100));
              return (
                <div key={idx} style={{
                  background: 'rgba(255,255,255,0.02)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem' }}>
                    <strong style={{ color: '#fff' }}>{b.category}</strong>
                    <span style={{ color: 'var(--accent-emerald-light)' }}>
                      ${b.available_budget.toFixed(2)} Available / ${b.monthly_budget.toFixed(2)}
                    </span>
                  </div>

                  <div style={{
                    height: '6px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${utilPct}%`,
                      background: utilPct > 90 ? 'var(--accent-rose)' : utilPct > 75 ? 'var(--accent-amber)' : 'var(--accent-emerald)',
                      transition: 'width 0.4s ease'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
                    {utilPct}% Utilized
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
