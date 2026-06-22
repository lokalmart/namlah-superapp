'use client';

import {
  Activity,
  ArrowRight,
  ClipboardCheck,
  Crown,
  Home,
  Navigation,
  PackageCheck,
  RadioTower,
  ShieldCheck,
  ShoppingCart,
  Store,
  Workflow,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getSourceOfTruth, makePortalActor } from '../lib/odooArchitecture';
import type { RoleConfig, SemutAccount } from '../lib/types';

type ConceptMapProps = {
  account: SemutAccount;
  role: RoleConfig;
};

type ActivityRecord = {
  id: string;
  model: 'project.task' | 'sale.order';
  odooId: number;
  title: string;
  detail: string;
  semutId: string;
  roleCode: string;
  koloniCode: string;
  updatedAt: string;
};

type ActivityPayload = {
  ok: boolean;
  records?: ActivityRecord[];
  error?: string;
};

type PartnerPin = {
  id: string;
  odooId: number;
  name: string;
  ref: string;
  latitude: number;
  longitude: number;
  partnerKind: string;
  roleCode: string;
  semutId: string;
  koloniCode: string;
  isCompany: boolean;
  updatedAt: string;
};

type PartnerLocationPayload = {
  ok: boolean;
  pins?: PartnerPin[];
  createdFields?: number;
  error?: string;
};

const cirebonMapEmbed = 'https://www.openstreetmap.org/export/embed.html?bbox=108.5200%2C-6.7850%2C108.6120%2C-6.6900&layer=mapnik&marker=-6.7320%2C108.5523';
const mapBounds = {
  minLng: 108.5200,
  maxLng: 108.6120,
  minLat: -6.7850,
  maxLat: -6.6900,
};

function formatRecordTime(value: string) {
  if (!value) return 'Odoo';
  const parsed = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return 'Odoo';
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(parsed);
}

export function ConceptMap({ account, role }: ConceptMapProps) {
  const actor = makePortalActor(account);
  const source = getSourceOfTruth(role.id);
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [partnerPins, setPartnerPins] = useState<PartnerPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinsLoading, setPinsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pinError, setPinError] = useState('');

  const pins = useMemo(() => partnerPins.slice(0, 10).map((pin, index) => {
    const xNumber = ((pin.longitude - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const yNumber = ((mapBounds.maxLat - pin.latitude) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    const inBounds = Number.isFinite(xNumber) && Number.isFinite(yNumber) && xNumber >= 0 && xNumber <= 100 && yNumber >= 0 && yNumber <= 100;
    const fallbackX = 18 + ((index * 19) % 64);
    const fallbackY = 22 + ((index * 17) % 58);
    const Icon = pin.isCompany || pin.partnerKind === 'koloni'
      ? Home
      : pin.roleCode === 'kurir'
        ? Navigation
        : pin.roleCode === 'umkm'
          ? Store
          : pin.roleCode === 'admin' || pin.partnerKind === 'ratu_semut'
            ? Crown
            : PackageCheck;
    return {
      ...pin,
      x: `${Math.min(92, Math.max(8, inBounds ? xNumber : fallbackX))}%`,
      y: `${Math.min(88, Math.max(12, inBounds ? yNumber : fallbackY))}%`,
      hot: index === 0 || pin.isCompany,
      icon: Icon,
    };
  }), [partnerPins]);

  useEffect(() => {
    let cancelled = false;
    async function loadActivities() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/activity/koloni?koloniCode=${encodeURIComponent(actor.koloniCode)}`, { cache: 'no-store' });
        const payload = await response.json().catch(() => null) as ActivityPayload | null;
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || 'Aktivitas koloni Odoo belum bisa dibaca.');
        }
        if (!cancelled) setRecords(payload.records || []);
      } catch (event) {
        if (!cancelled) {
          setRecords([]);
          setError(event instanceof Error ? event.message : 'Aktivitas koloni Odoo belum bisa dibaca.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadActivities();
    return () => {
      cancelled = true;
    };
  }, [actor.koloniCode]);

  useEffect(() => {
    let cancelled = false;
    async function loadPartnerPins() {
      setPinsLoading(true);
      setPinError('');
      try {
        const response = await fetch(`/api/partners/locations?koloniCode=${encodeURIComponent(actor.koloniCode)}`, { cache: 'no-store' });
        const payload = await response.json().catch(() => null) as PartnerLocationPayload | null;
        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || 'Pin partner GPS Odoo belum bisa dibaca.');
        }
        if (!cancelled) setPartnerPins(payload.pins || []);
      } catch (event) {
        if (!cancelled) {
          setPartnerPins([]);
          setPinError(event instanceof Error ? event.message : 'Pin partner GPS Odoo belum bisa dibaca.');
        }
      } finally {
        if (!cancelled) setPinsLoading(false);
      }
    }

    void loadPartnerPins();
    return () => {
      cancelled = true;
    };
  }, [actor.koloniCode]);

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

      <div className="screen-scroll">
        <div className="map-workbench">
          <section className="real-map-card" aria-label="Peta OpenStreetMap Cirebon">
            <div className="illustrated-map-wash" aria-hidden="true" />
            <iframe
              className="real-map-frame"
              title="Peta OpenStreetMap Cirebon"
              src={cirebonMapEmbed}
              loading="lazy"
            />
            <div className="map-source-chip"><Navigation size={14} /> res.partner GPS / {actor.koloniCode}</div>
            <div className="map-pin-layer" aria-label="Pin partner GPS Odoo">
              {pins.map(({ id, name, latitude, longitude, x, y, hot, icon: Icon, odooId, partnerKind, roleCode }) => (
                <button className={hot ? 'real-map-pin hot' : 'real-map-pin'} style={{ left: x, top: y }} type="button" key={id}>
                  <Icon size={17} />
                  <span>
                    <strong>{name}</strong>
                    <small>{partnerKind || roleCode} #{odooId} / {latitude.toFixed(5)}, {longitude.toFixed(5)}</small>
                  </span>
                </button>
              ))}
            </div>
            <div className="map-bottom-sheet" aria-label="Aktivitas terbaru Odoo">
              <div className="sheet-grip" />
              <header>
                <strong>Aktivitas Odoo</strong>
                <span>{actor.koloniCode}</span>
              </header>
              {loading ? (
                <article>
                  <RadioTower size={17} />
                  <div>
                    <strong>Membaca record Odoo...</strong>
                    <span>project.task dan sale.order</span>
                  </div>
                  <small>live</small>
                </article>
              ) : records.length ? (
                records.slice(0, 4).map((record) => {
                  const Icon = record.model === 'sale.order' ? ShoppingCart : Store;
                  return (
                    <article key={record.id}>
                      <Icon size={17} />
                      <div>
                        <strong>{record.title}</strong>
                        <span>{record.model} #{record.odooId} / {record.detail}</span>
                      </div>
                      <small>{formatRecordTime(record.updatedAt)}</small>
                    </article>
                  );
                })
              ) : (
                <article>
                  <ClipboardCheck size={17} />
                  <div>
                    <strong>Belum ada aktivitas Odoo.</strong>
                    <span>{error || 'Aktifkan project, order, atau onboarding untuk membuat record.'}</span>
                  </div>
                  <small>0</small>
                </article>
              )}
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
                <strong>{records.length}</strong>
                <span>Odoo live</span>
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
                <strong>Odoo</strong>
              </div>
              {records.slice(0, 3).map((record) => (
                <article className="activity-feed-row" key={record.id}>
                  <ClipboardCheck size={16} />
                  <div>
                    <strong>{record.title}</strong>
                    <span>{record.model} #{record.odooId} / {record.semutId}</span>
                  </div>
                </article>
              ))}
              {!records.length && (
                <article className="activity-feed-row">
                  <ClipboardCheck size={16} />
                  <div>
                    <strong>Aktivitas Odoo kosong.</strong>
                    <span>{error || 'Belum ada task/order untuk koloni ini.'}</span>
                  </div>
                </article>
              )}
            </section>

            <section className="activity-feed" aria-label="Pin partner GPS">
              <div className="trace-card-head">
                <span><Navigation size={15} /> Pin GPS</span>
                <strong>res.partner</strong>
              </div>
              {pinsLoading ? (
                <article className="activity-feed-row">
                  <RadioTower size={16} />
                  <div>
                    <strong>Membaca partner GPS...</strong>
                    <span>Company partner akan dianggap koloni.</span>
                  </div>
                </article>
              ) : partnerPins.length ? (
                partnerPins.slice(0, 4).map((pin) => (
                  <article className="activity-feed-row" key={pin.id}>
                    <Navigation size={16} />
                    <div>
                      <strong>{pin.name}</strong>
                      <span>{pin.isCompany ? 'koloni' : pin.roleCode} / {pin.latitude}, {pin.longitude}</span>
                    </div>
                  </article>
                ))
              ) : (
                <article className="activity-feed-row">
                  <Navigation size={16} />
                  <div>
                    <strong>Pin partner GPS kosong.</strong>
                    <span>{pinError || 'Update lokasi dari Pengaturan Semut-ID atau Kurir.'}</span>
                  </div>
                </article>
              )}
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
