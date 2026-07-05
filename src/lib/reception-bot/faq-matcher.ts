import { FAQ_ENTRIES } from '@/lib/data/reception-bot-responses';

export interface FAQEntry {
  key: string;
  keywords: string[];
  variants: string[];
}

export function matchFAQ(input: string): FAQEntry | null {
  const lower = input.toLowerCase().trim();
  if (!lower || lower.length < 3) return null;

  for (const entry of FAQ_ENTRIES) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) return entry;
    }
  }
  return null;
}
