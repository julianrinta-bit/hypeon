'use client';

interface BotButton {
  label: string;
  value: string;
}

interface Props {
  buttons: BotButton[];
  onSelect: (value: string, label: string) => void;
  disabled?: boolean;
}

export default function BotButtons({ buttons, onSelect, disabled = false }: Props) {
  return (
    <div className="chat-bot-buttons" role="group" aria-label="Choose an option">
      {buttons.map((btn) => (
        <button
          key={btn.value}
          className="chat-bot-btn"
          onClick={() => onSelect(btn.value, btn.label)}
          disabled={disabled}
          type="button"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
