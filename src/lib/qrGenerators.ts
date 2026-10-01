import type { Fields, QRType } from '../types/qr';

const escapeWifi = (value: string) => value.replace(/([\\;,:"])/g, '\\$1');
const escapeCard = (value: string) => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
const digits = (value: string) => value.replace(/[^\d+]/g, '');
const icsDate = (value: string) => value.replace(/[-:]/g, '').replace('T', 'T') + '00';

export function getPayload(type: QRType, f: Fields): string {
  const v = (key: string) => (f[key] || '').trim();
  switch (type) {
    case 'text': {
      const value = v('value');
      if (/^(www\.|[\w-]+\.[a-z]{2,}(?:\/|$))/i.test(value)) return `https://${value}`;
      return value;
    }
    case 'wifi': return v('ssid') ? `WIFI:T:${v('encryption')};S:${escapeWifi(v('ssid'))};P:${escapeWifi(v('password'))};H:${v('hidden')};;` : '';
    case 'vcard': return v('name') ? ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeCard(v('name'))}`,
      ...([['ORG','org'],['TITLE','title'],['TEL;TYPE=WORK','phone'],['TEL;TYPE=CELL','mobile'],['EMAIL','email'],['URL','website'],['ADR;TYPE=WORK','address'],['NOTE','notes']] as const)
        .filter(([,key]) => v(key)).map(([tag,key]) => `${tag}:${escapeCard(v(key))}`), 'END:VCARD'].join('\r\n') : '';
    case 'phone': return v('number') ? `tel:${digits(v('number'))}` : '';
    case 'email': {
      if (!v('address')) return '';
      const params = new URLSearchParams();
      if (v('subject')) params.set('subject', v('subject'));
      if (v('body')) params.set('body', v('body'));
      return `mailto:${v('address')}${params.size ? `?${params.toString()}` : ''}`;
    }
    case 'sms': return v('number') ? `sms:${digits(v('number'))}${v('message') ? `?body=${encodeURIComponent(v('message'))}` : ''}` : '';
    case 'whatsapp': return v('number') ? `https://wa.me/${v('number').replace(/\D/g, '')}${v('message') ? `?text=${encodeURIComponent(v('message'))}` : ''}` : '';
    case 'location': return v('lat') && v('lng') ? v('format') === 'maps'
      ? `https://www.google.com/maps?q=${encodeURIComponent(v('lat'))},${encodeURIComponent(v('lng'))}`
      : `geo:${v('lat')},${v('lng')}` : '';
    case 'event': return v('title') && v('start') && v('end') ? [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//QR Studio//EN', 'BEGIN:VEVENT',
      `UID:${encodeURIComponent(v('title'))}-${icsDate(v('start'))}@qrstudio.local`,
      `DTSTART:${icsDate(v('start'))}`, `DTEND:${icsDate(v('end'))}`,
      `SUMMARY:${escapeCard(v('title'))}`, ...(v('location') ? [`LOCATION:${escapeCard(v('location'))}`] : []),
      ...(v('description') ? [`DESCRIPTION:${escapeCard(v('description'))}`] : []), 'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n') : '';
  }
}

export function getError(type: QRType, f: Fields, payload: string, correction: 'L' | 'M' | 'Q' | 'H' = 'M'): string {
  if (type === 'email' && f.address && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.address.trim())) return 'Enter a valid email address.';
  if (type === 'text' && /^https?:\/\//i.test(payload)) { try { const url = new URL(payload); if (!url.hostname.includes('.')) return 'Enter a valid URL with a domain.'; } catch { return 'Enter a valid URL.'; } }
  if (type === 'location' && (f.lat || f.lng) && (isNaN(Number(f.lat)) || isNaN(Number(f.lng)) || Number(f.lat) < -90 || Number(f.lat) > 90 || Number(f.lng) < -180 || Number(f.lng) > 180)) return 'Latitude must be −90 to 90 and longitude −180 to 180.';
  if (type === 'event' && f.start && f.end && f.end <= f.start) return 'The end must be after the start.';
  if (['phone', 'sms', 'whatsapp'].includes(type) && f.number && f.number.replace(/\D/g, '').length < 6) return 'Enter a valid phone number including country code.';
  const limit = { L: 2900, M: 2250, Q: 1600, H: 1200 }[correction];
  if (new TextEncoder().encode(payload).length > limit) return `This content is too long for correction level ${correction}. Shorten it to under ${limit.toLocaleString()} bytes or use a lighter correction level.`;
  return '';
}
