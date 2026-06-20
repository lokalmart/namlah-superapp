'use client';

import { Coins, Loader2, PackageCheck, Send, ShoppingBag, Truck, Workflow } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getKoloniScope } from '../lib/koloni';
import { getActiveRoleAssignment } from '../lib/storage';
import type { NamlahProjectTemplateCode, RoleConfig, RoleId, SemutAccount } from '../lib/types';

type StorePanelProps = {
  account: SemutAccount;
  role: RoleConfig;
};

type ActionStatus = {
  tone: 'idle' | 'success' | 'error';
  text: string;
};

const templateActions: Array<{
  code: NamlahProjectTemplateCode;
  role: RoleId;
  title: string;
  description: string;
  icon: typeof Workflow;
}> = [
  {
    code: 'member_shopping_flow',
    role: 'member',
    title: 'Belanja Koloni',
    description: 'Buat project belanja: order member, proses kasir, pengiriman kurir, dan laporan Ratu.',
    icon: ShoppingBag,
  },
  {
    code: 'kurir_delivery',
    role: 'kurir',
    title: 'Delivery Koloni',
    description: 'Buat task pickup dan serah-terima paket untuk kurir koloni.',
    icon: Truck,
  },
  {
    code: 'umkm_onboarding_basic',
    role: 'umkm',
    title: 'Onboarding UMKM',
    description: 'Buat project onboarding UMKM dari pendaftaran sampai validasi produk.',
    icon: PackageCheck,
  },
  {
    code: 'donation_execution_plan',
    role: 'koperasi',
    title: 'Program Koperasi',
    description: 'Buat project program koloni yang bisa dipantau Ratu dan koperasi.',
    icon: Workflow,
  },
];

export function StorePanel({ account, role }: StorePanelProps) {
  const activeAssignment = getActiveRoleAssignment(account);
  const koloniScope = getKoloniScope(activeAssignment?.koloniCode);
  const [deliveryCustomerName, setDeliveryCustomerName] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<ActionStatus>({
    tone: 'idle',
    text: 'Aksi di halaman ini menulis ke Odoo bridge. Jika Odoo belum aktif, request akan ditolak eksplisit.',
  });

  const activeActions = useMemo(() => {
    if (account.activeRoleId === 'kasir') return [];
    const scoped = templateActions.filter((item) => item.role === account.activeRoleId);
    if (scoped.length) return scoped;
    return templateActions.filter((item) => item.role === 'member' || item.role === 'kurir');
  }, [account.activeRoleId]);

  async function submitCashierOrder() {
    if (submitting || !activeAssignment) return;
    setSubmitting(true);
    setStatus({ tone: 'idle', text: 'Mengirim transaksi kasir ke Odoo...' });
    try {
      const response = await fetch('/api/cashier/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semutId: account.semutId,
          koloniCode: activeAssignment.koloniCode,
          deliveryCustomerName,
          deliveryPhone,
          deliveryAddress,
          amount: Number(amount),
          note,
        }),
      });
      const payload = await response.json().catch(() => null) as { bridge?: { message?: string }; error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.bridge?.message || payload?.error || 'Transaksi kasir belum masuk Odoo.');
      }
      setStatus({ tone: 'success', text: payload?.bridge?.message || 'Transaksi kasir berhasil dibuat di Odoo.' });
      setDeliveryCustomerName('');
      setDeliveryPhone('');
      setDeliveryAddress('');
      setAmount('');
      setNote('');
    } catch (event) {
      setStatus({ tone: 'error', text: event instanceof Error ? event.message : 'Transaksi kasir belum masuk Odoo.' });
    } finally {
      setSubmitting(false);
    }
  }

  async function activateTemplate(templateCode: NamlahProjectTemplateCode) {
    if (submitting || !activeAssignment) return;
    setSubmitting(true);
    setStatus({ tone: 'idle', text: 'Mengaktifkan project template di Odoo...' });
    try {
      const response = await fetch('/api/projects/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semutId: account.semutId,
          roleCode: account.activeRoleId,
          koloniCode: activeAssignment.koloniCode,
          templateCode,
        }),
      });
      const payload = await response.json().catch(() => null) as { bridge?: { message?: string }; error?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.bridge?.message || payload?.error || 'Project template belum masuk Odoo.');
      }
      setStatus({ tone: 'success', text: payload?.bridge?.message || 'Project template berhasil dibuat di Odoo.' });
    } catch (event) {
      setStatus({ tone: 'error', text: event instanceof Error ? event.message : 'Project template belum masuk Odoo.' });
    } finally {
      setSubmitting(false);
    }
  }

  const cashierReady = deliveryCustomerName.trim() && Number(amount) > 0;

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

        {account.activeRoleId === 'kasir' ? (
          <div className="real-action-layout">
            <section className="account-card">
              <p className="small-label">POS Kasir</p>
              <h3>Sale order transaksi koloni</h3>
              <p className="muted">
                Customer bawaan sale.order adalah koloni kasir. Kontak kirim di bawah menjadi partner_shipping_id.
              </p>
              <div className="field-grid cashier-grid">
                <label>
                  Kontak customer kirim
                  <input value={deliveryCustomerName} onChange={(event) => setDeliveryCustomerName(event.target.value)} placeholder="Nama penerima" />
                </label>
                <label>
                  Telepon kirim
                  <input value={deliveryPhone} onChange={(event) => setDeliveryPhone(event.target.value)} placeholder="+62..." />
                </label>
                <label>
                  Nilai transaksi
                  <input inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="150000" />
                </label>
                <label>
                  Alamat kirim
                  <textarea value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Alamat penerima" rows={3} />
                </label>
                <label>
                  Catatan transaksi
                  <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Item / catatan kasir" rows={3} />
                </label>
              </div>
              <button className="primary-action" type="button" onClick={submitCashierOrder} disabled={!cashierReady || submitting}>
                {submitting ? <Loader2 size={17} className="spin-icon" /> : <Coins size={17} />}
                Buat Sale Order
              </button>
            </section>

            <section className="account-card odoo-field-card">
              <p className="small-label">Relasi Odoo</p>
              <h3>Project kasir + task Semut-ID</h3>
              <div className="portal-map">
                <span>project</span>
                <strong>cashier_transaction_flow / {activeAssignment?.koloniCode}</strong>
                <span>task kasir</span>
                <strong>{account.semutId}</strong>
                <span>customer</span>
                <strong>Partner koloni</strong>
                <span>pengiriman</span>
                <strong>Kontak customer input kasir</strong>
              </div>
            </section>
          </div>
        ) : (
          <div className="store-grid">
            {activeActions.map((item) => {
              const Icon = item.icon;
              return (
                <article className="store-item real-template-card" key={item.code}>
                  <div>
                    <div className="store-icon"><Icon size={24} /></div>
                    <h3 style={{ marginTop: 12 }}>{item.title}</h3>
                    <p className="muted">{item.description}</p>
                  </div>
                  <button className="primary-action compact-action" type="button" onClick={() => activateTemplate(item.code)} disabled={submitting}>
                    {submitting ? <Loader2 size={16} className="spin-icon" /> : <Send size={16} />}
                    Aktifkan
                  </button>
                </article>
              );
            })}
          </div>
        )}

        <div className={`bridge-status ${status.tone}`}>
          <strong>{status.tone === 'error' ? 'Belum tersinkron' : status.tone === 'success' ? 'Tersinkron' : 'Odoo bridge'}</strong>
          <span>{status.text}</span>
        </div>
      </div>
    </section>
  );
}
