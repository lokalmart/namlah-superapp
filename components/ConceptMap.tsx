import { Boxes, CircleDollarSign, Home, MapPin, PackageCheck, Route, Store } from 'lucide-react';
import { activities, nestPins } from '../lib/mockData';
import type { NestPin, RoleConfig, SemutAccount } from '../lib/types';

type ConceptMapProps = {
  account: SemutAccount;
  role: RoleConfig;
};

function iconForPin(pin: NestPin) {
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

  return (
    <section className="map-stage" aria-label="Beranda peta sarang">
      <div className="map-grid" />
      <div className="map-path" />

      <div className="map-topbar">
        <div className="map-title">
          <span className="role-badge">{role.label} / {role.homeMode}</span>
          <h1>{role.headline}</h1>
          <p>{account.displayName} / {account.semutId}</p>
        </div>
        <div className="map-meter">
          <strong>{activityCount}</strong>
          <span>Aktivitas pin</span>
        </div>
      </div>

      {visiblePins.map((pin) => {
        const Icon = iconForPin(pin);
        return (
          <button
            type="button"
            className={pin.status === 'urgent' || pin.status === 'active' ? 'pin hot' : 'pin'}
            data-label={`${pin.label} / ${pin.activityCount}`}
            aria-label={`${pin.label}, ${pin.activityCount} aktivitas`}
            key={pin.id}
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <Icon size={22} />
          </button>
        );
      })}

      <div className="activity-strip">
        {visibleActivities.map((activity) => (
          <article className="activity-card" key={activity.id}>
            <p>{activity.title}</p>
            <span>{activity.time} / {activity.severity}</span>
          </article>
        ))}
        {!visibleActivities.length && (
          <article className="activity-card">
            <p>Belum ada aktivitas khusus untuk role ini.</p>
            <span>dummy local</span>
          </article>
        )}
      </div>
    </section>
  );
}
