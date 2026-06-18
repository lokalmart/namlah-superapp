import { Coins, PackageCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { storeItems } from '../lib/mockData';
import type { RoleConfig, SemutAccount } from '../lib/types';

type StorePanelProps = {
  account: SemutAccount;
  role: RoleConfig;
};

export function StorePanel({ account, role }: StorePanelProps) {
  const visibleItems = account.activeRoleId === 'kasir'
    ? storeItems.slice(0, 4)
    : account.activeRoleId === 'kurir'
      ? storeItems.filter((item) => item.category === 'Layanan' || item.category === 'Sembako' || item.category === 'Segar')
      : account.activeRoleId === 'koperasi'
        ? storeItems.filter((item) => item.category === 'Koperasi' || item.category === 'Sembako' || item.category === 'UMKM')
        : storeItems;

  return (
    <section className="screen-panel">
      <header className="screen-header">
        <div>
          <p className="eyebrow">Gudang Semut</p>
          <h2>{role.storeMode}</h2>
        </div>
        <span className="role-badge"><ShoppingBag size={17} /> Shop Inventory</span>
      </header>
      <div className="screen-scroll">
        <div className="role-menu-row panel-row">
          {role.menuItems.slice(0, 3).map((item) => (
            <button type="button" className="role-menu-card" key={item.label}>
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </button>
          ))}
        </div>
        <div className="store-grid">
          {visibleItems.map((item) => (
            <article className="store-item" key={item.id}>
              <div>
                <div className="store-icon"><PackageCheck size={24} /></div>
                <h3 style={{ marginTop: 12 }}>{item.title}</h3>
                <p className="muted">{item.category} / {item.stock}</p>
              </div>
              <div className="price"><Coins size={18} /> {item.price}</div>
              <span className="rarity-chip"><Sparkles size={13} /> Koloni item</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
