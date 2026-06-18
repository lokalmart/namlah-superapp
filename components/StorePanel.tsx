import { PackageCheck, ShoppingBag } from 'lucide-react';
import { storeItems } from '../lib/mockData';
import type { RoleConfig } from '../lib/types';

type StorePanelProps = {
  role: RoleConfig;
};

export function StorePanel({ role }: StorePanelProps) {
  return (
    <section className="screen-panel">
      <header className="screen-header">
        <div>
          <p className="eyebrow">Gudang Semut</p>
          <h2>Katalog dummy untuk role {role.label}.</h2>
        </div>
        <span className="role-badge"><ShoppingBag size={17} /> Showcase</span>
      </header>
      <div className="screen-scroll">
        <div className="store-grid">
          {storeItems.map((item) => (
            <article className="store-item" key={item.id}>
              <div>
                <div className="store-icon"><PackageCheck size={24} /></div>
                <h3 style={{ marginTop: 12 }}>{item.title}</h3>
                <p className="muted">{item.category} / {item.stock}</p>
              </div>
              <div className="price">{item.price}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
