export type BotStateId =
  | 'INIT'
  | 'AWAIT_PURPOSE'
  | 'AWAIT_HANDLE'
  | 'RESOLVING_HANDLE'
  | 'AWAIT_EMAIL'
  | 'DONE'
  | 'UNAVAILABLE';

export type PurposeValue = 'ad_revenue' | 'lead_gen' | 'brand' | 'other';

export interface ConversationContext {
  sessionId: string;
  visitorId?: string;
  turn: number;
  purpose?: PurposeValue;
  handle?: string;
  channelId?: string;
  channelName?: string;
  subscriberCount?: number;
}

export interface BotRequest {
  stateId: 'INIT' | 'AWAIT_PURPOSE' | 'AWAIT_HANDLE' | 'AWAIT_EMAIL' | 'UNAVAILABLE';
  input: string | null;
  context: ConversationContext;
  botTrap?: string;
}

export interface BotMessage {
  text: string;
  cta?: boolean;
}

export interface BotButton {
  label: string;
  value: string;
}

export interface BotResponse {
  ok: true;
  stateId: BotStateId;
  messages: BotMessage[];
  buttons?: BotButton[];
  context: ConversationContext;
}
