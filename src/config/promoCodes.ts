export const VALID_PROMO_CODES = ['DIVE', 'JEWEL', 'BRIEFING'] as const;
export type PromoCode = (typeof VALID_PROMO_CODES)[number];
export const isValidPromoCode = (code: string): code is PromoCode =>
  VALID_PROMO_CODES.includes(code.toUpperCase().trim() as PromoCode);
