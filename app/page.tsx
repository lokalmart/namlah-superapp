'use client';

import { useEffect, useMemo, useState } from 'react';
import { AccountPanel } from '../components/AccountPanel';
import { AuthGate } from '../components/AuthGate';
import { BottomNav, getAllowedTabs } from '../components/BottomNav';
import { ConceptMap } from '../components/ConceptMap';
import { QueenMascot } from '../components/QueenMascot';
import { RatuSemutPanel } from '../components/RatuSemutPanel';
import { ScanPanel } from '../components/ScanPanel';
import { StorePanel } from '../components/StorePanel';
import { roleConfigs } from '../lib/mockData';
import { loadAccount, saveAccount } from '../lib/storage';
import type { AppTab, SemutAccount } from '../lib/types';

export default function Page() {
  const [account, setAccount] = useState<SemutAccount | null>(null);
  const [ready, setReady] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('map');

  useEffect(() => {
    setAccount(loadAccount());
    setReady(true);
  }, []);

  useEffect(() => {
    if (account) saveAccount(account);
  }, [account]);

  const activeRole = useMemo(() => {
    if (!account) return roleConfigs.member;
    return roleConfigs[account.activeRoleId] || roleConfigs.member;
  }, [account]);

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
      {activeTab === 'map' && <ConceptMap account={account} role={activeRole} />}
      {activeTab === 'store' && <StorePanel account={account} role={activeRole} />}
      {activeTab === 'ratu' && account.activeRoleId === 'admin' && <RatuSemutPanel account={account} role={activeRole} />}
      {activeTab === 'scan' && <ScanPanel account={account} role={activeRole} />}
      {activeTab === 'account' && <AccountPanel account={account} role={activeRole} onChange={setAccount} onLogout={() => setAccount(null)} />}

      <QueenMascot role={activeRole} activeTab={activeTab} />
      <BottomNav activeTab={activeTab} activeRoleId={account.activeRoleId} onTabChange={setActiveTab} />
    </main>
  );
}
