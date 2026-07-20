import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode } from 'react';

type InputSize = 'sm' | 'md' | 'lg';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  inputSize?: InputSize;
  invalid?: boolean;
  leading?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { inputSize = 'md', invalid, leading, className, type = 'text', ...rest },
  ref,
) {
  const classes = [
    'ui-input',
    `ui-input--${inputSize}`,
    invalid ? 'ui-input--invalid' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={leading ? 'ui-input-wrap' : 'ui-input-wrap ui-input-wrap--plain'}>
      {leading ? <span className="ui-input-wrap__leading">{leading}</span> : null}
      <input ref={ref} type={type} className={classes} aria-invalid={invalid || undefined} {...rest} />
    </span>
  );
});

type FieldProps = LabelHTMLAttributes<HTMLLabelElement> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
};

export function Field({ label, hint, error, required, className, children, ...rest }: FieldProps) {
  return (
    <label className={['ui-field', className ?? ''].filter(Boolean).join(' ')} {...rest}>
      <span className="ui-field__label">
        {label}
        {required ? <span className="ui-field__req" aria-hidden="true"> *</span> : null}
      </span>
      {children}
      {error ? (
        <span className="ui-field__error" role="alert">{error}</span>
      ) : hint ? (
        <span className="ui-field__hint">{hint}</span>
      ) : null}
    </label>
  );
}
