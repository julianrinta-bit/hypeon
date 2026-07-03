// Ticker.tsx — dark marquee, 17 channel types, verde/gris alternating, doubled for seamless loop.
// Replaces CredibilityStrip in page.tsx at integration time.
// CredibilityStrip.tsx is NOT deleted.

const ITEMS: { label: string; variant: 'green' | 'gray' }[] = [
  { label: 'Ad Revenue',                 variant: 'gray'  },
  { label: 'Lead Magnet',                variant: 'gray'  },
  { label: 'Brand Awareness',            variant: 'green' },
  { label: 'Shorts Strategy',            variant: 'gray'  },
  { label: 'Subscriber Growth',          variant: 'gray'  },
  { label: 'Content Production',         variant: 'green' },
  { label: 'Channel Audit',              variant: 'gray'  },
  { label: 'Thumbnail Systems',          variant: 'gray'  },
  { label: 'Multi-language Expansion',   variant: 'green' },
  { label: 'Live Streaming',             variant: 'gray'  },
  { label: 'Monetization',              variant: 'gray'  },
  { label: 'Audience Retention',         variant: 'green' },
  { label: 'SEO & Metadata',             variant: 'gray'  },
  { label: 'Community Building',         variant: 'gray'  },
  { label: 'Format Development',         variant: 'green' },
  { label: 'Cross-platform Distribution',variant: 'gray'  },
  { label: 'Revenue Attribution',        variant: 'gray'  },
];

// Separator color alternates with each item for visual rhythm.
// Pattern from dc.html: green sep after gray item, gray sep after green item.
function sepVariant(itemVariant: 'green' | 'gray'): 'green' | 'gray' {
  return itemVariant === 'gray' ? 'green' : 'gray';
}

function TickerRow() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <span key={i} style={{ display: 'contents' }}>
          <span
            className={`ticker-v2__item ticker-v2__item--${item.variant}`}
          >
            {item.label}
          </span>
          <span
            className={`ticker-v2__sep${sepVariant(item.variant) === 'gray' ? ' ticker-v2__sep--gray' : ''}`}
            aria-hidden="true"
          >
            ◆
          </span>
        </span>
      ))}
    </>
  );
}

export default function Ticker() {
  return (
    <div className="ticker-v2" aria-label="Channel service types" role="marquee">
      {/* Track is doubled so the translateX(-50%) loop is seamless */}
      <div className="ticker-v2__track">
        <TickerRow />
        <TickerRow />
      </div>
    </div>
  );
}
