'use client';

import { type ReactNode } from 'react';

type FabProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  position?: 'bottom-end' | 'bottom-start';
};

export function Fab({ icon, label, onClick, position = 'bottom-end' }: FabProps) {
  return (
    <button type="button" className={`ui-fab ui-fab--${position}`} onClick={onClick} aria-label={label}>
      <span className="ui-fab__icon" aria-hidden="true">{icon}</span>
      <span className="ui-fab__label">{label}</span>
    </button>
  );
}
