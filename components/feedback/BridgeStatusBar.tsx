'use client';

import { ChevronDown, CircleCheck, CircleX, WifiOff, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

export type BridgeStatus =
  | { mode: 'connected'; detail?: string; lastSync?: string }
  | { mode: 'read_only'; detail?: string; lastSync?: string }
  | { mode: 'unreachable'; detail?: string; lastSync?: string };

const presets: Record<BridgeStatus['mode'], { tone: string; label: string; Icon: LucideIcon; copy: string }> = {
  connected: {
    tone: 'success',
    label: 'Odoo live',
    Icon: CircleCheck,
    copy: 'Odoo live — data real-time.',
  },
  read_only: {
    tone: 'warning',
    label: 'Read-only',
    Icon: WifiOff,
    copy: 'Odoo bridge dalam mode read-only.',
  },
  unreachable: {
    tone: 'error',
    label: 'Terputus',
    Icon: CircleX,
    copy: 'Odoo unreachable — cek konfigurasi bridge.',
  },
};

type BridgeStatusBarProps = {
  status: BridgeStatus;
  className?: string;
};

export function BridgeStatusBar({ status, className }: BridgeStatusBarProps) {
  const [open, setOpen] = useState(false);
  const preset = presets[status.mode];
  const { Icon } = preset;
  const detail = status.detail ?? preset.copy;

  return (
    <div
      className={['bridge-status-bar', `bridge-status-bar--${preset.tone}`, className ?? ''].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
    >
      <span className="bridge-status-bar__dot" aria-hidden="true">
        <Icon size={16} />
      </span>
      <div className="bridge-status-bar__body">
        <strong>{preset.label}</strong>
        <span>{detail}</span>
      </div>
      {(status.lastSync || status.detail) && (
        <button
          type="button"
          className="bridge-status-bar__toggle"
          aria-expanded={open}
          aria-label="Detail status Odoo"
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDown size={15} />
        </button>
      )}
      {open ? (
        <div className="bridge-status-bar__details">
          {status.lastSync ? <span>Sync terakhir: {status.lastSync}</span> : null}
          {status.detail ? <span>{status.detail}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
