import { Boxes, CircleDollarSign, Gem, Home, MapPin, Route, Shield, Sparkles, Store } from 'lucide-react';
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
  const tileCount = Array.from({ length: 36 }, (_, index) => index);
  const squadCount = Math.max(3, Math.min(9, Math.ceil(activityCount / 9)));

  return (
    <section className="map-stage game-map" aria-label="Beranda peta sarang versi game">
      <div className="map-grid" />
      <div className="map-path" />
      <div className="game-board" aria-hidden="true">
        {tileCount.map((tile) => (
          <span className={tile % 7 === 0 ? 'game-tile raised' : tile % 5 === 0 ? 'game-tile nest-tile' : 'game-tile'} key={tile} />
        ))}
      </div>
      <div className="resource-node leaf-node" aria-hidden="true"><Gem size={18} /></div>
      <div className="resource-node amber-node" aria-hidden="true"><Sparkles size={18} /></div>

      <div className="map-topbar">
        <div className="map-title">
          <span className="role-badge">{role.label} / {role.homeMode}</span>
          <h1>{role.headline}</h1>
          <p>{account.displayName} / {account.semutId}</p>
          <div className="role-action-row">
            {role.featuredActions.map((action) => (
              <span key={action}>{action}</span>
            ))}
          </div>
        </div>
        <div className="game-hud-stack">
          <div className="map-meter">
            <strong>{activityCount}</strong>
            <span>Aktivitas pin</span>
          </div>
          <div className="map-meter compact">
            <strong>LV. {visiblePins.length + 2}</strong>
            <span>Kekuatan sarang</span>
          </div>
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
            <span className="pin-count">{pin.activityCount}</span>
          </button>
        );
      })}

      <div className="ant-squad" aria-hidden="true">
        {Array.from({ length: squadCount }, (_, index) => (
          <span
            className="ant-unit"
            key={index}
            style={{
              left: `${index * 8}%`,
              top: `${42 + (index % 3) * 12}%`,
              ['--delay' as string]: `${index * -0.35}s`,
            }}
          />
        ))}
      </div>

      <div className="activity-strip">
        {visibleActivities.map((activity) => (
          <article className="activity-card" key={activity.id}>
            <span className="quest-icon"><Shield size={15} /></span>
            <p>{activity.title}</p>
            <span>{activity.time} / {activity.severity}</span>
          </article>
        ))}
        {!visibleActivities.length && (
          <article className="activity-card">
            <span className="quest-icon"><Shield size={15} /></span>
            <p>Belum ada aktivitas khusus untuk role ini.</p>
            <span>dummy local</span>
          </article>
        )}
      </div>
    </section>
  );
}
