declare global {
  interface Window { fbq?: (...args: unknown[]) => void; }
}

export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.fbq) {
    if (params) {
      window.fbq('trackCustom', event, params);
    } else {
      window.fbq('track', event);
    }
  }
}
