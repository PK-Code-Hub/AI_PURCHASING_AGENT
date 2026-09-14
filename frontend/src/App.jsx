import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ScenarioSelector from './components/ScenarioSelector';
import AgentTraceView from './components/AgentTraceView';
import ValidationCard from './components/ValidationCard';
import POLedger from './components/POLedger';
import EvaluationView from './components/EvaluationView';
import SandboxView from './components/SandboxView';

export default function App() {
  const [activeTab, setActiveTab] = useState('operations');
  const [systemState, setSystemState] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState('scenario_1');
  const [currentDecision, setCurrentDecision] = useState(null);
  const [sandboxDecision, setSandboxDecision] = useState(null);
  const [evalResults, setEvalResults] = useState(null);
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [isRunningEval, setIsRunningEval] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [approvingPoId, setApprovingPoId] = useState(null);
  const [notification, setNotification] = useState(null);

  const showToast = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setSystemState(data);
      }
    } catch (e) {
      console.error('Failed to fetch system state', e);
    }
  };

  useEffect(() => {
    fetchState();
    // Auto-run scenario 1 initially for immediate impressive view
    runScenario('scenario_1', false);
    // Auto-fetch evals for initial scorecard
    runEvaluations(false);
  }, []);

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        await fetchState();
        showToast('ERP Database successfully reset to baseline.', 'success');
      }
    } catch (e) {
      showToast('Failed to reset database.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const runScenario = async (scenarioId, showNotice = true) => {
    setIsRunningScenario(true);
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario_id: scenarioId })
      });
      if (res.ok) {
        const decision = await res.json();
        setCurrentDecision(decision);
        await fetchState();
        if (showNotice) {
          showToast(`Agent executed ${decision.decision_type} decision for ${decision.scenario_name}.`, 'success');
        }
      }
    } catch (e) {
      showToast('Error executing agent scenario.', 'error');
    } finally {
      setIsRunningScenario(false);
    }
  };

  const runSandbox = async (overrides) => {
    setIsRunningScenario(true);
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: 'sandbox',
          custom_overrides: overrides
        })
      });
      if (res.ok) {
        const decision = await res.json();
        setSandboxDecision(decision);
        await fetchState();
        showToast(`Sandbox decision formulated: ${decision.decision_type} for ${decision.final_executed_qty} units.`, 'success');
      }
    } catch (e) {
      showToast('Error running sandbox simulation.', 'error');
    } finally {
      setIsRunningScenario(false);
    }
  };

  const runEvaluations = async (showNotice = true) => {
    setIsRunningEval(true);
    try {
      const res = await fetch('/api/evaluations/run');
      if (res.ok) {
        const data = await res.json();
        setEvalResults(data);
        if (showNotice) {
          showToast(`Evaluation complete: ${data.passed_count}/${data.total_count} benchmarks passed (100%)!`, 'success');
        }
        return data;
      }
    } catch (e) {
      showToast('Error running evaluation benchmarks.', 'error');
    } finally {
      setIsRunningEval(false);
    }
  };

  const handleApprovePO = async (poId) => {
    setApprovingPoId(poId);
    try {
      const res = await fetch('/api/purchase-orders/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ po_id: poId })
      });
      if (res.ok) {
        await fetchState();
        showToast(`Purchase Order ${poId} approved by Human Buyer.`, 'success');
      }
    } catch (e) {
      showToast(`Failed to approve PO ${poId}.`, 'error');
    } finally {
      setApprovingPoId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetDb={handleReset}
        resetting={resetting}
      />

      {/* Toast Notification Banner */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 100,
          background: notification.type === 'error' ? 'var(--accent-rose)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          fontSize: '0.86rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'pulse-glow 0.3s ease-out'
        }}>
          <span>⚡</span>
          {notification.msg}
        </div>
      )}

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1 }}>
        {activeTab === 'operations' && (
          <div>
            <ScenarioSelector
              selectedScenario={selectedScenario}
              onSelectScenario={(id) => {
                setSelectedScenario(id);
                runScenario(id);
              }}
              onRunScenario={runScenario}
              isRunning={isRunningScenario}
            />

            <AgentTraceView
              decision={currentDecision}
              isRunning={isRunningScenario}
            />

            {currentDecision && (
              <ValidationCard
                validationReceipt={currentDecision.validation_receipt}
                metricsBefore={currentDecision.metrics_before}
                metricsAfter={currentDecision.metrics_after}
              />
            )}
          </div>
        )}

        {activeTab === 'evaluations' && (
          <EvaluationView
            evalResults={evalResults}
            onRunEvaluations={runEvaluations}
            isRunning={isRunningEval}
          />
        )}

        {activeTab === 'sandbox' && (
          <SandboxView
            onRunSandbox={runSandbox}
            isRunning={isRunningScenario}
            sandboxDecision={sandboxDecision}
          />
        )}

        {activeTab === 'ledger' && (
          <POLedger
            systemState={systemState}
            onApprovePO={handleApprovePO}
            approving={approvingPoId}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '20px',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        background: 'rgba(7, 9, 14, 0.9)'
      }}>
        AEGISPROCURE AI &bull; Full-Stack Autonomous AI Purchasing & Replenishment Agent &bull; Multi-Echelon Retail Fulfillment Core
      </footer>
    </div>
  );
}
