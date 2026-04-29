// Attribution capture module — client-side only.
// All browser API access is guarded with typeof window !== 'undefined'
// so this module is safe to import in Next.js Server Components.

const VISITOR_ID_KEY = 'hom_vid';
const ATTRIBUTION_KEY = 'hom_attr';
const SESSION_ID_KEY = 'hom_sid';

export interface AttributionData {
  visitorId: string;
  sessionId: string | null;
  isReturning: boolean;

  // UTM parameters
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;

  // Click IDs
  fbclid: string | null;
  gclid: string | null;

  // Referrer
  referrer: string | null;

  // Device info
  screenWidth: number | null;
  screenHeight: number | null;
  language: string | null;
  timezone: string | null;

  // Derived
  resolvedSource: string;

  // Timestamps
  capturedAt: string;
}

// ─── Visitor ID ────────────────────────────────────────────────────────────

/**
 * Returns the persistent visitor ID from localStorage,
 * creating and persisting a new UUID v4 if none exists.
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';

  const existing = localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;

  const id = generateUUID();
  try {
    localStorage.setItem(VISITOR_ID_KEY, id);
  } catch {
    // localStorage may be blocked (private mode quota exceeded, etc.)
  }
  return id;
}

// ─── Session ID ────────────────────────────────────────────────────────────

/**
 * Writes a session ID to sessionStorage.
 */
export function setSessionId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_ID_KEY, id);
  } catch {
    // sessionStorage may be unavailable
  }
}

/**
 * Reads the current session ID from sessionStorage, or null if absent.
 */
export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sessionStorage.getItem(SESSION_ID_KEY);
  } catch {
    return null;
  }
}

// ─── First-touch attribution ───────────────────────────────────────────────

/**
 * Returns the stored first-touch attribution object from localStorage,
 * or null if none has been persisted yet.
 */
export function getFirstTouchAttribution(): object | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ATTRIBUTION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as object;
  } catch {
    return null;
  }
}

/**
 * Persists attribution data to localStorage under ATTRIBUTION_KEY.
 * NEVER overwrites an existing value — first touch is immutable.
 */
function persistFirstTouchAttribution(data: AttributionData): void {
  if (typeof window === 'undefined') return;
  try {
    // Guard: do not overwrite if already stored
    if (localStorage.getItem(ATTRIBUTION_KEY) !== null) return;
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(data));
  } catch {
    // Ignore write errors (quota, private mode, etc.)
  }
}

// ─── Source resolution ─────────────────────────────────────────────────────

/**
 * Derives a human-readable source string when utm_source is absent.
 * Priority: fbclid → gclid → referrer domain → 'direct'.
 */
export function resolveSource(data: AttributionData): string {
  if (data.utmSource) return data.utmSource;
  if (data.fbclid) return 'facebook';
  if (data.gclid) return 'google';
  if (data.referrer) {
    try {
      const url = new URL(data.referrer);
      return url.hostname.replace(/^www\./, '');
    } catch {
      return 'referral';
    }
  }
  return 'direct';
}

// ─── Main capture function ─────────────────────────────────────────────────

/**
 * Captures visitor attribution data on page load.
 * Safe to call in a useEffect or inside a 'use client' component.
 * Returns a fully-populated AttributionData object.
 */
export function captureAttribution(): AttributionData {
  // Guard: return a neutral object when running server-side
  if (typeof window === 'undefined') {
    return buildServerSidePlaceholder();
  }

  const visitorId = getOrCreateVisitorId();
  const isReturning = localStorage.getItem(ATTRIBUTION_KEY) !== null;

  // Ensure session ID exists for this session
  let sessionId = getSessionId();
  if (!sessionId) {
    sessionId = generateUUID();
    setSessionId(sessionId);
  }

  // Parse URL parameters
  const params = new URLSearchParams(window.location.search);

  const utmSource   = params.get('utm_source');
  const utmMedium   = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');
  const utmContent  = params.get('utm_content');
  const utmTerm     = params.get('utm_term');
  const fbclid      = params.get('fbclid');
  const gclid       = params.get('gclid');

  // Referrer — truncated to 500 chars
  const rawReferrer = typeof document !== 'undefined' ? document.referrer : '';
  const referrer    = rawReferrer ? rawReferrer.slice(0, 500) : null;

  // Device info
  const screenWidth  = window.screen?.width  ?? null;
  const screenHeight = window.screen?.height ?? null;
  const language     = navigator.language ?? null;
  const timezone     = resolveTimezone();

  const partialData: Omit<AttributionData, 'resolvedSource'> = {
    visitorId,
    sessionId,
    isReturning,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    fbclid,
    gclid,
    referrer,
    screenWidth,
    screenHeight,
    language,
    timezone,
    capturedAt: new Date().toISOString(),
  };

  const resolvedSource = resolveSource({ ...partialData, resolvedSource: '' });

  const data: AttributionData = {
    ...partialData,
    resolvedSource,
  };

  // Persist first touch — no-op if already stored
  persistFirstTouchAttribution(data);

  return data;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function generateUUID(): string {
  // Use the Web Crypto API when available (all modern browsers, Node 20+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: RFC 4122 v4 UUID built from Math.random()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function resolveTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

function buildServerSidePlaceholder(): AttributionData {
  return {
    visitorId: '',
    sessionId: null,
    isReturning: false,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    utmTerm: null,
    fbclid: null,
    gclid: null,
    referrer: null,
    screenWidth: null,
    screenHeight: null,
    language: null,
    timezone: null,
    resolvedSource: 'direct',
    capturedAt: new Date().toISOString(),
  };
}
