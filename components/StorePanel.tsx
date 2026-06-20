import { Coins, PackageCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { getKoloniScope } from '../lib/koloni';
import { storeItems } from '../lib/mockData';
import { getActiveRoleAssignment } from '../lib/storage';
import type { RoleConfig, SemutAccount } from '../lib/types';

type StorePanelProps = {
  account: SemutAccount;
  role: RoleConfig;
};

export function StorePanel({ account, role }: StorePanelProps) {
  const activeAssignment = getActiveRoleAssignment(account);
  const koloniScope = getKoloniScope(activeAssignment?.koloniCode);
  const scopedItems = storeItems.filter((item) => {
    if (item.koloniCode === activeAssignment?.koloniCode) return true;
    if (item.visibility === 'public_catalog') return true;
    return item.visibility === 'parent_scope' && koloniScope.scopeKoloniCodes.includes(item.koloniCode);
  });
  const visibleItems = account.activeRoleId === 'kasir'
    ? scopedItems.slice(0, 4)
    : account.activeRoleId === 'kurir'
      ? scopedItems.filter((item) => item.category === 'Layanan' || item.category === 'Sembako' || item.category === 'Segar')
      : account.activeRoleId === 'koperasi'
        ? scopedItems.filter((item) => item.category === 'Koperasi' || item.category === 'Sembako' || item.category === 'UMKM')
        : scopedItems;

  return (
    <section className="screen-panel">
      <header className="screen-header">
        <div>
          <p className="eyebrow">Gudang Semut</p>
          <h2>{role.storeMode}</h2>
        </div>
        <span className="role-badge"><ShoppingBag size={17} /> {koloniScope.label}</span>
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
                <p className="muted">{item.category} / {item.ownerLabel} / {item.stock}</p>
              </div>
              <div className="price"><Coins size={18} /> {item.price}</div>
              <span className="rarity-chip"><Sparkles size={13} /> {item.koloniCode}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
