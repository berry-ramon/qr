import { AlignLeft, Wifi, Contact, Phone, Mail, MessageSquare, MessageCircle, MapPin, CalendarDays } from 'lucide-react';
import type { QRType } from '../types/qr';
export const tabs = [
  { id: 'text', label: 'Text / URL', icon: AlignLeft }, { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'vcard', label: 'vCard', icon: Contact }, { id: 'phone', label: 'Phone', icon: Phone },
  { id: 'email', label: 'Email', icon: Mail }, { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle }, { id: 'location', label: 'Location', icon: MapPin },
  { id: 'event', label: 'Event', icon: CalendarDays },
] as const;
export default function InputTabs({ value, onChange }: { value: QRType; onChange: (type: QRType) => void }) {
  return <div className="tabs" role="tablist" aria-label="QR content type">{tabs.map(({ id, label, icon: Icon }) =>
    <button key={id} type="button" role="tab" aria-selected={value === id} className={`tab ${value === id ? 'active' : ''}`} onClick={() => onChange(id)} title={`Create a ${label} QR code`}><Icon size={16} strokeWidth={1.8}/>{label}</button>
  )}</div>;
}
