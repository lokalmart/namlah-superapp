import {
  Activity,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  ClipboardCheck,
  Home,
  MapPin,
  Navigation,
  Route,
  ShieldCheck,
  Store,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { activities, nestPins } from '../lib/mockData';
import { getSourceOfTruth, makePortalActor } from '../lib/odooArchitecture';
import type { NestPin, RoleConfig, SemutAccount } from '../lib/types';

type ConceptMapProps = {
  account: SemutAccount;
  role: RoleConfig;
};

const cirebonMapEmbed = 'https://www.openstreetmap.org/export/embed.html?bbox=108.5200%2C-6.7850%2C108.6120%2C-6.6900&layer=mapnik&marker=-6.7320%2C108.5523';

function iconForPin(pin: NestPin): LucideIcon {
  if (pin.type === 'nest') return Home;
  if (pin.type === 'store') return Store;
  if (pin.type === 'route') return Route;
  if (pin.type === 'stock') return Boxes;
  if (pin.type === 'finance') return CircleDollarSign;
  return MapPin;
}

export function ConceptMap({ account, role }: ConceptMapProps) {
  const visiblePins = nestPins.filter((pin) => pin.roles.includes(role.id));
  const visibleActivities = activities.filter((activity) => activity.roleId === role.id).slice(0, 3);
  const activityCount = visiblePins.reduce((total, pin) => total + pin.activityCount, 0);
  const actor = makePortalActor(account);
  const source = getSourceOfTruth(role.id);

  return (
    <section className="screen-panel map-screen" aria-label="Beranda peta koloni">
      <header className="screen-header map-screen-header">
        <div>
          <p className="eyebrow">Peta Koloni</p>
          <h2>{role.headline}</h2>
          <p className="muted">{account.displayName} / {account.semutId}</p>
        </div>
        <span className="role-badge"><Navigation size={17} /> {role.homeMode}</span>
      </header>

      <div className="map-workbench">
        <section className="real-map-card" aria-label="Peta OpenStreetMap Cirebon">
          <iframe
            className="real-map-frame"
            title="Peta OpenStreetMap Cirebon"
            src={cirebonMapEmbed}
            loading="lazy"
          />
          <div className="map-source-chip"><Navigation size={14} /> OpenStreetMap / Cirebon</div>
          <div className="map-pin-layer" aria-label="Pin aktivitas role">
            {visiblePins.map((pin) => {
              const Icon = iconForPin(pin);
              return (
                <button
                  type="button"
                  className={pin.status === 'urgent' || pin.status === 'active' ? 'real-map-pin hot' : 'real-map-pin'}
                  key={pin.id}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                >
                  <Icon size={18} />
                  <span>
                    <strong>{pin.label}</strong>
                    <small>{pin.activityCount} aktivitas</small>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="role-work-panel" aria-label={`Workspace ${role.label}`}>
          <section className="stage-focus-card">
            <div>
              <span><Workflow size={15} /> Tahap kerja</span>
              <strong>{source.stage}</strong>
              <p>{source.sop.mobileHint}</p>
            </div>
            <button type="button">
              {source.sop.nextActionLabel}
              <ArrowRight size={15} />
            </button>
          </section>

          <section className="role-stat-grid" aria-label="Ringkasan role">
            {role.quickStats.map((stat) => (
              <article key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
            <article>
              <strong>{activityCount}</strong>
              <span>Pin aktif</span>
            </article>
          </section>

          <section className="trace-card">
            <div className="trace-card-head">
              <span><ShieldCheck size={15} /> Jejak data</span>
              <strong>{source.model}</strong>
            </div>
            <div className="trace-list">
              <span>Actor</span><strong>{actor.semutId}</strong>
              <span>Partner</span><strong>{actor.partnerExternalId}</strong>
              <span>Portal</span><strong>{actor.portalLogin}</strong>
              <span>Email</span><strong>{actor.emailRequired ? actor.emailVerificationStatus : 'tidak wajib'}</strong>
              <span>Record</span><strong>{source.saleOrder || source.task}</strong>
              <span>Koloni</span><strong>{actor.koloniCode}</strong>
            </div>
          </section>

          <section className="role-action-grid" aria-label="Aksi role">
            {role.menuItems.slice(0, 4).map((item) => (
              <button type="button" key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </button>
            ))}
          </section>

          <section className="activity-feed" aria-label="Aktivitas terbaru">
            <div className="trace-card-head">
              <span><Activity size={15} /> Aktivitas</span>
              <strong>{role.label}</strong>
            </div>
            {visibleActivities.map((activity) => (
              <article key={activity.id} className={`activity-feed-row ${activity.severity}`}>
                <ClipboardCheck size={16} />
                <div>
                  <strong>{activity.title}</strong>
                  <span>{activity.time} / {activity.severity}</span>
                </div>
              </article>
            ))}
            {!visibleActivities.length && (
              <article className="activity-feed-row">
                <ClipboardCheck size={16} />
                <div>
                  <strong>Belum ada aktivitas role.</strong>
                  <span>demo local</span>
                </div>
              </article>
            )}
          </section>
        </aside>
      </div>
    </section>
  );
}
