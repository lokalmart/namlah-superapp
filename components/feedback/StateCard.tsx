import { type ReactNode } from 'react';
import { AlertTriangle, Inbox, RefreshCcw, type LucideIcon } from 'lucide-react';

type StateCardProps = {
  state: 'loading' | 'error' | 'empty';
  title?: string;
  message?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StateCard({ state, title, message, onRetry, retryLabel = 'Coba lagi', icon: Icon, className }: StateCardProps) {
  const classes = ['state-card', `state-card--${state}`, className ?? ''].filter(Boolean).join(' ');
  const Glyph = Icon ?? (state === 'error' ? AlertTriangle : state === 'empty' ? Inbox : undefined);

  return (
    <div className={classes} role={state === 'error' ? 'alert' : undefined}>
      {state === 'loading' ? (
        <div className="state-card__skeleton" aria-hidden="true">
          {[0, 1, 2].map((row) => (
            <div className="skeleton-line" key={row} style={{ width: `${90 - row * 12}%` }} />
          ))}
        </div>
      ) : (
        <>
          {Glyph ? (
            <span className="state-card__icon">
              <Glyph size={20} />
            </span>
          ) : null}
          <div className="state-card__text">
            {title ? <strong>{title}</strong> : null}
            {message ? <span>{message}</span> : null}
          </div>
          {onRetry ? (
            <button type="button" className="ui-button ui-button--secondary ui-button--sm state-card__retry" onClick={onRetry}>
              <RefreshCcw size={14} />
              {retryLabel}
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

type SkeletonProps = {
  rows?: number;
  className?: string;
};

export function Skeleton({ rows = 3, className }: SkeletonProps) {
  return (
    <div className={['state-card__skeleton', className ?? ''].filter(Boolean).join(' ')} aria-hidden="true">
      {Array.from({ length: rows }).map((_, row) => (
        <div className="skeleton-line" key={row} style={{ width: `${92 - (row % 3) * 18}%` }} />
      ))}
    </div>
  );
}
