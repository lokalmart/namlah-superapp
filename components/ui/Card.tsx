import { type HTMLAttributes, type ReactNode } from 'react';

type CardVariant = 'elevated' | 'outlined' | 'filled';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  as?: 'div' | 'section' | 'article';
  header?: ReactNode;
  footer?: ReactNode;
};

export function Card({ variant = 'elevated', as: Tag = 'div', header, footer, className, children, ...rest }: CardProps) {
  const classes = ['ui-card', `ui-card--${variant}`, className ?? ''].filter(Boolean).join(' ');
  return (
    <Tag className={classes} {...rest}>
      {header ? <div className="ui-card__header">{header}</div> : null}
      <div className="ui-card__body">{children}</div>
      {footer ? <div className="ui-card__footer">{footer}</div> : null}
    </Tag>
  );
}
