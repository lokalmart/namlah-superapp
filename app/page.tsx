'use client';

import { useEffect, useMemo, useState } from 'react';
import { AccountPanel } from '../components/AccountPanel';
import { AuthGate } from '../components/AuthGate';
import { BottomNav, getAllowedTabs } from '../components/BottomNav';
import { ConceptMap } from '../components/ConceptMap';
import { Fab } from '../components/Fab';
import { ForumPanel } from '../components/ForumPanel';
import { RatuSemutPanel } from '../components/RatuSemutPanel';
import { RoleContextBar } from '../components/RoleContextBar';
import { ScanPanel } from '../components/ScanPanel';
import { StorePanel } from '../components/StorePanel';
import { BridgeStatusBar, type BridgeStatus } from '../components/feedback/BridgeStatusBar';
import { getFeaturedAction } from '../lib/featuredAction';
import { roleConfigs } from '../lib/roleConfig';
import { loadAccount, saveAccount } from '../lib/storage';
import type { AppTab, SemutAccount } from '../lib/types';

export default function Page() {
  const [account, setAccount] = useState<SemutAccount | null>(null);
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('map');
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus | null>(null);

  useEffect(() => {
    setAccount(loadAccount());
    setReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadBridge() {
      try {
        const response = await fetch('/api/odoo/health', { cache: 'no-store' });
        const payload = (await response.json().catch(() => null)) as
          | { status?: string; bridge?: { writesEnabled?: boolean }; error?: string }
          | null;
        if (cancelled || !payload) return;
        if (payload.status === 'connected') {
          setBridgeStatus({ mode: payload.bridge?.writesEnabled ? 'connected' : 'read_only' });
        } else if (payload.status === 'not_configured') {
          setBridgeStatus({ mode: 'read_only', detail: 'Odoo bridge belum dikonfigurasi. Cek env connection.' });
        } else {
          setBridgeStatus({ mode: 'unreachable', detail: payload.error ?? 'Odoo unreachable — cek konfigurasi bridge.' });
        }
      } catch {
        if (!cancelled) setBridgeStatus({ mode: 'unreachable', detail: 'Odoo unreachable — cek konfigurasi bridge.' });
      }
    }
    void loadBridge();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (account) saveAccount(account);
  }, [account]);

  const activeRole = useMemo(() => {
    if (!account) return roleConfigs.member;
    return roleConfigs[account.activeRoleId] || roleConfigs.member;
  }, [account]);

  const featuredAction = useMemo(() => (account ? getFeaturedAction(activeRole) : null), [account, activeRole]);

  useEffect(() => {
    if (!account) return;
    const allowedTabs = getAllowedTabs(account.activeRoleId);
    if (!allowedTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(allowedTabs[0]?.id || 'map');
    }
  }, [account, activeTab]);

  if (!ready) return <main className="loading-screen">Membuka koloni...</main>;

  if (!account) {
    return <AuthGate onAuthenticated={setAccount} />;
  }

  return (
    <main className={`superapp theme-${account.experienceTheme}`} style={{ ['--role' as string]: activeRole.theme }}>
      <RoleContextBar
        account={account}
        role={activeRole}
        activeTab={activeTab}
        onAccountChange={setAccount}
        onTabChange={setActiveTab}
      />
      {bridgeStatus ? (
        <div className="bridge-status-region">
          <BridgeStatusBar status={bridgeStatus} />
        </div>
      ) : null}
      {activeTab === 'map' && <ConceptMap account={account} role={activeRole} key="map" />}
      {activeTab === 'store' && <StorePanel account={account} role={activeRole} key="store" />}
      {activeTab === 'forum' && <ForumPanel account={account} role={activeRole} onTabChange={setActiveTab} key="forum" />}
      {activeTab === 'ratu' && account.activeRoleId === 'admin' && <RatuSemutPanel account={account} role={activeRole} key="ratu" />}
      {activeTab === 'scan' && <ScanPanel account={account} role={activeRole} key="scan" />}
      {activeTab === 'account' && <AccountPanel account={account} role={activeRole} onChange={setAccount} onLogout={() => setAccount(null)} key="account" />}

      {featuredAction ? (
        <Fab
          icon={<featuredAction.icon size={20} />}
          label={featuredAction.label}
          onClick={() => setActiveTab(featuredAction.targetTab)}
        />
      ) : null}

      <BottomNav activeTab={activeTab} activeRoleId={account.activeRoleId} onTabChange={setActiveTab} />
    </main>
  );
}
