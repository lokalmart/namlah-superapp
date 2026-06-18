import { ArrowLeft, Delete } from 'lucide-react';

type PinPadProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit?: () => void;
  submitLabel?: string;
  disabled?: boolean;
};

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'clear'];

export function PinPad({ value, onChange, onSubmit, submitLabel = 'Lanjutkan', disabled }: PinPadProps) {
  function press(key: string) {
    if (key === 'back') return onChange(value.slice(0, -1));
    if (key === 'clear') return onChange('');
    if (value.length < 4) onChange(`${value}${key}`);
  }

  return (
    <>
      <div className="pin-dots" aria-label={`${value.length} dari 4 digit PIN terisi`}>
        {[0, 1, 2, 3].map((index) => (
          <span className={index < value.length ? 'pin-dot filled' : 'pin-dot'} key={index} />
        ))}
      </div>
      <div className="keypad">
        {keys.map((key) => (
          <button type="button" key={key} onClick={() => press(key)} aria-label={key === 'back' ? 'Hapus satu digit' : key === 'clear' ? 'Bersihkan PIN' : `Digit ${key}`}>
            {key === 'back' ? <ArrowLeft size={21} /> : key === 'clear' ? <Delete size={21} /> : key}
          </button>
        ))}
      </div>
      {onSubmit && (
        <button className="primary-action" type="button" onClick={onSubmit} disabled={disabled || value.length !== 4} style={{ marginTop: 12 }}>
          {submitLabel}
        </button>
      )}
    </>
  );
}
