import type { CornerDotType, CornerSquareType, DotType, ErrorCorrectionLevel } from 'qr-code-styling';

export type QRType = 'text' | 'wifi' | 'vcard' | 'phone' | 'email' | 'sms' | 'whatsapp' | 'location' | 'event';
export type Fields = Record<string, string>;
export type Settings = {
  foreground: string; background: string; transparent: boolean;
  gradient: 'solid' | 'linear' | 'radial'; gradientStart: string; gradientEnd: string; rotation: number;
  dots: DotType; cornerSquare: CornerSquareType; cornerDot: CornerDotType;
  spacing: number; size: number; margin: number; correction: ErrorCorrectionLevel;
  logo: string; logoSize: number; logoPadding: number; logoBackground: string; logoTransparent: boolean;
};
export type HistoryItem = { id: string; type: QRType; fields: Fields; settings: Settings; preview: string; createdAt: number; pinned: boolean };
export type Preset = { name: string; settings: Settings; custom?: boolean };

export const initialFields: Record<QRType, Fields> = {
  text: { value: 'https://example.com' }, wifi: { ssid: '', password: '', encryption: 'WPA', hidden: 'false' },
  vcard: { name: '', org: '', title: '', phone: '', mobile: '', email: '', website: '', address: '', notes: '' },
  phone: { number: '' }, email: { address: '', subject: '', body: '' }, sms: { number: '', message: '' },
  whatsapp: { number: '', message: '' }, location: { lat: '', lng: '', format: 'geo' },
  event: { title: '', location: '', start: '', end: '', description: '' },
};
export const defaultSettings: Settings = {
  foreground: '#000000', background: '#FFFFFF', transparent: false,
  gradient: 'solid', gradientStart: '#A91E8A', gradientEnd: '#6945C1', rotation: 45,
  dots: 'square', cornerSquare: 'square', cornerDot: 'square', spacing: 0,
  size: 1024, margin: 24, correction: 'M', logo: '', logoSize: 22, logoPadding: 5,
  logoBackground: '#FFFFFF', logoTransparent: false,
};
