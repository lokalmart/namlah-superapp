'use client';

import { AlertTriangle, ClipboardCheck, Crown, FileBarChart, KanbanSquare, Landmark, Play, RefreshCcw, ShieldCheck, ShoppingCart, Sparkles, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { describeKoloniPolicy, getKoloniNode, getKoloniScope } from '../lib/koloni';
import { buildKoloniDashboard, stagesForFlow } from '../lib/projectControlTower';
import { getActiveRoleAssignment } from '../lib/storage';
import type { NamlahKoloniDashboard, NamlahKanbanFlow, NamlahRatuView, RoleConfig, SemutAccount } from '../lib/types';

type RatuSemutPanelProps = {
  account: SemutAccount;
  role: RoleConfig;
};

const flowLabels: Record<NamlahKanbanFlow, string> = {
  umkm_onboarding: 'Onboarding UMKM',
  umkm_promotion: 'Promosi UMKM',
  donation_program: 'Program Donasi',
};

const viewButtons: Array<{ id: NamlahRatuView; label: string; icon: LucideIcon }> = [
  { id: 'kanban', label: 'Kanban Misi', icon: KanbanSquare },
  { id: 'sales_orders', label: 'Sales Order', icon: ShoppingCart },
  { id: 'milestones', label: 'Milestones', icon: Landmark },
  { id: 'balance_sheet', label: 'Balance Sheet', icon: FileBarChart },
];

export function RatuSemutPanel({ account, role }: RatuSemutPanelProps) {
  const assignment = getActiveRoleAssignment(account);
  const koloniCode = assignment?.koloniCode;
  const koloniNode = useMemo(() => getKoloniNode(koloniCode), [koloniCode]);
  const koloniScope = useMemo(() => getKoloniScope(koloniCode), [koloniCode]);
  const koloniPolicy = useMemo(() => describeKoloniPolicy(koloniNode), [koloniNode]);
  const [activeView, setActiveView] = useState<NamlahRatuView>('kanban');
  const [flow, setFlow] = useState<NamlahKanbanFlow>('umkm_onboarding');
  const [dashboard, setDashboard] = useState<NamlahKoloniDashboard>(() => buildKoloniDashboard(account.activeRoleId, koloniCode, 'kanban'));
  const [lastAction, setLastAction] = useState('Dashboard Ratu Semut siap.');
  const [syncing, setSyncing] = useState(false);
  const visibleStages = useMemo(() => stagesForFlow(flow), [flow]);
  const visibleTasks = useMemo(
    () => dashboard.tasks.filter((task) => visibleStages.some((stage) => stage.code === task.stageCode)),
    [dashboard.tasks, visibleStages],
  );

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const params = new URLSearchParams({
          role: account.activeRoleId,
          view: activeView,
        });
        if (koloniCode) params.set('koloniCode', koloniCode);
        const response = await fetch(`/api/ratu/dashboard?${params.toString()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('dashboard failed');
        const nextDashboard = await response.json() as NamlahKoloniDashboard;
        if (active) {
          setDashboard(nextDashboard);
          setLastAction(`Sinkron ${nextDashboard.koloniCode}`);
        }
      } catch {
        if (active) {
          setDashboard(buildKoloniDashboard(account.activeRoleId, koloniCode, activeView));
          setLastAction('Fallback ke data demo lokal.');
        }
      }
    }

    loadDashboard();
    const timer = window.setInterval(loadDashboard, 12000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [account.activeRoleId, activeView, koloniCode]);

  async function simulateUmkmOnboarding() {
    setSyncing(true);
    try {
      const response = await fetch('/api/umkm/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semutId: account.semutId,
          ownerName: account.displayName,
          businessName: `${account.displayName} Mart`,
          koloniCode,
        }),
      });
      const result = await response.json() as { ok?: boolean; tasks?: Array<{ title: string }> };
      setLastAction(result.ok ? `Onboarding dibuat: ${result.tasks?.[0]?.title || 'task UMKM'}` : 'Onboarding belum berhasil.');
    } catch {
      setLastAction('Simulasi onboarding belum tersambung.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <section className="screen-panel mission-control">
      <header className="screen-header mission-header">
        <div>
          <p className="eyebrow">Ratu Semut</p>
          <h2>Ruang kendali misi, order, milestone, dan laporan koloni.</h2>
        </div>
        <span className="role-badge"><Crown size={17} /> {role.label}</span>
      </header>

      <div className="screen-scroll mission-scroll">
        <section className="mission-toolbar">
          <div className="mission-sync-card">
            <Crown size={20} />
            <div>
              <strong>{koloniScope.label}</strong>
              <span>{dashboard.koloniCode} / {dashboard.wilayahCode} / {dashboard.generatedAt}</span>
            </div>
          </div>
          <div className="mission-actions">
            <button type="button" onClick={simulateUmkmOnboarding} disabled={syncing}>
              {syncing ? <RefreshCcw size={16} /> : <Play size={16} />}
              Simulasi UMKM
            </button>
            <span>{lastAction}</span>
          </div>
        </section>

        <section className="mission-metrics" aria-label="Ringkasan dashboard koloni">
          <article className="mission-metric">
            <span>Policy koloni</span>
            <strong>{koloniPolicy.accessMode}</strong>
            <p>{koloniPolicy.catalogVisibility} / child scope {koloniScope.childCount}</p>
          </article>
          {dashboard.metrics.map((metric) => (
            <article className="mission-metric" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </article>
          ))}
        </section>

        <section className="flow-tabs" aria-label="Pilih tampilan Ratu Semut">
          {viewButtons.map(({ id, label, icon: Icon }) => (
            <button type="button" className={activeView === id ? 'active' : ''} onClick={() => setActiveView(id)} key={id}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </section>

        {activeView === 'kanban' && (
          <>
            <section className="flow-tabs" aria-label="Pilih flow kanban">
              {(Object.keys(flowLabels) as NamlahKanbanFlow[]).map((flowId) => (
                <button type="button" className={flow === flowId ? 'active' : ''} onClick={() => setFlow(flowId)} key={flowId}>
                  {flowLabels[flowId]}
                </button>
              ))}
            </section>

            <section className="kanban-board" aria-label={`Kanban ${flowLabels[flow]}`}>
              {visibleStages.map((stage) => {
                const stageTasks = visibleTasks.filter((task) => task.stageCode === stage.code);
                return (
                  <article className={stage.fold ? 'kanban-column folded' : 'kanban-column'} key={stage.code}>
                    <header>
                      <strong>{stage.label}</strong>
                      <span>{stageTasks.length}</span>
                    </header>
                    <p>{stage.mobileHint}</p>
                    <div className="kanban-task-stack">
                      {stageTasks.map((task) => (
                        <button type="button" className={task.isLate ? 'mission-task late' : task.needsValidation ? 'mission-task review' : 'mission-task'} key={task.id}>
                          <span>{task.project}</span>
                          <strong>{task.title}</strong>
                          <small>{task.roleCode} / {task.proofStatus} / {task.semutId}</small>
                        </button>
                      ))}
                      {!stageTasks.length && <span className="empty-stage">Tidak ada task aktif</span>}
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}

        {activeView === 'sales_orders' && (
          <section className="ratu-table-card" aria-label="Sales Order">
            <header><ShoppingCart size={18} /><strong>Sales Order</strong></header>
            <div className="ratu-table">
              <span>Order</span><span>Customer</span><span>Source</span><span>Amount</span><span>Status</span><span>Task</span><span>Date</span>
              {dashboard.salesOrders.map((order) => (
                <div className="ratu-table-row seven" key={order.id}>
                  <strong>{order.orderNumber}</strong><span>{order.customer}</span><span>{order.sourceApp}</span><span>{order.amount}</span><span>{order.status}</span><span>{order.linkedTask}</span><span>{order.date}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeView === 'milestones' && (
          <section className="ratu-table-card" aria-label="Milestones">
            <header><Landmark size={18} /><strong>Milestones</strong></header>
            <div className="ratu-table">
              <span>Milestone</span><span>Project</span><span>Deadline</span><span>Reached</span><span>Progress</span><span>Koloni</span>
              {dashboard.milestones.map((milestone) => (
                <div className="ratu-table-row six" key={milestone.id}>
                  <strong>{milestone.milestone}</strong><span>{milestone.project}</span><span>{milestone.deadline}</span><span>{milestone.reached ? 'Ya' : 'Belum'}</span><span>{milestone.progress}</span><span>{milestone.koloniCode}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeView === 'balance_sheet' && (
          <section className="ratu-table-card" aria-label="Balance Sheet">
            <header><FileBarChart size={18} /><strong>Balance Sheet Report</strong></header>
            <div className="ratu-table">
              <span>Account Group</span><span>Debit</span><span>Credit</span><span>Balance</span><span>Period</span><span>Koloni</span>
              {dashboard.balanceSheetLines.map((line) => (
                <div className="ratu-table-row six" key={line.id}>
                  <strong>{line.accountGroup}</strong><span>{line.debit}</span><span>{line.credit}</span><span>{line.balance}</span><span>{line.period}</span><span>{line.koloniCode}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mission-lower-grid">
          <article className="mission-card">
            <div className="mission-card-head">
              <span><Sparkles size={16} /> Template Rencana</span>
              <strong>{dashboard.templates.length}</strong>
            </div>
            <div className="template-stack">
              {dashboard.templates.map((template) => (
                <div className="template-row" key={template.code}>
                  <strong>{template.title}</strong>
                  <span>{template.category} / {template.impactMetric}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="mission-card">
            <div className="mission-card-head">
              <span><ClipboardCheck size={16} /> Butuh Validasi</span>
              <strong>{dashboard.validationTasks.length}</strong>
            </div>
            <div className="template-stack">
              {dashboard.validationTasks.map((task) => (
                <div className="template-row" key={task.id}>
                  <strong>{task.title}</strong>
                  <span>{task.stageLabel} / {task.roleCode}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="mission-card">
            <div className="mission-card-head">
              <span><AlertTriangle size={16} /> Risiko Terlambat</span>
              <strong>{dashboard.lateTasks.length}</strong>
            </div>
            <div className="template-stack">
              {dashboard.lateTasks.map((task) => (
                <div className="template-row" key={task.id}>
                  <strong>{task.title}</strong>
                  <span>{task.deadline} / {task.planCode}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="mission-card">
            <div className="mission-card-head">
              <span><ShieldCheck size={16} /> Audit Service User</span>
              <strong>{dashboard.auditTrail.length}</strong>
            </div>
            <div className="template-stack">
              {dashboard.auditTrail.map((event) => (
                <div className="template-row" key={event.id}>
                  <strong>{event.actorSemutId}</strong>
                  <span>{event.actionType} / {event.sourceApp}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </section>
  );
}
