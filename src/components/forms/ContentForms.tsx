import type { Fields, QRType } from '../../types/qr';

type Props = { fields: Fields; change: (key: string, value: string) => void };
type Field = { key: string; label: string; placeholder?: string; type?: string; wide?: boolean; multiline?: boolean; options?: string[] };
const definitions: Record<QRType, { intro: string; fields: Field[] }> = {
  text: { intro: 'A link, a thought, or anything in between.', fields: [{ key: 'value', label: 'Your content', placeholder: 'https://example.com or type anything...', multiline: true, wide: true }] },
  wifi: { intro: 'Let guests connect without typing a password.', fields: [{ key: 'ssid', label: 'Network name (SSID)', placeholder: 'Your network name' }, { key: 'password', label: 'Password', placeholder: 'Network password' }, { key: 'encryption', label: 'Security', options: ['WPA', 'WEP', 'nopass'] }, { key: 'hidden', label: 'Hidden network', options: ['false', 'true'] }] },
  vcard: { intro: 'Share your contact details in a single scan.', fields: [{ key: 'name', label: 'Full name', placeholder: 'Alex Morgan' }, { key: 'org', label: 'Organization', placeholder: 'Studio Name' }, { key: 'title', label: 'Job title' }, { key: 'phone', label: 'Work phone', type: 'tel' }, { key: 'mobile', label: 'Mobile', type: 'tel' }, { key: 'email', label: 'Email address', type: 'email' }, { key: 'website', label: 'Website', type: 'url' }, { key: 'address', label: 'Address' }, { key: 'notes', label: 'Notes', multiline: true, wide: true }] },
  phone: { intro: 'Open the dialer with your number ready to call.', fields: [{ key: 'number', label: 'Phone number', placeholder: '+1 555 010 2000', type: 'tel' }] },
  email: { intro: 'Start a new message with details filled in.', fields: [{ key: 'address', label: 'Recipient email', placeholder: 'hello@example.com', type: 'email' }, { key: 'subject', label: 'Subject (optional)', placeholder: 'Say hello' }, { key: 'body', label: 'Message (optional)', multiline: true, wide: true }] },
  sms: { intro: 'Open a ready-to-send text message.', fields: [{ key: 'number', label: 'Phone number', placeholder: '+1 555 010 2000', type: 'tel' }, { key: 'message', label: 'Message (optional)', multiline: true, wide: true }] },
  whatsapp: { intro: 'Open a WhatsApp conversation in one scan.', fields: [{ key: 'number', label: 'Phone number with country code', placeholder: '15550102000', type: 'tel' }, { key: 'message', label: 'Prefilled message (optional)', multiline: true, wide: true }] },
  location: { intro: 'Point people to an exact spot on the map.', fields: [{ key: 'lat', label: 'Latitude', placeholder: '40.7128', type: 'number' }, { key: 'lng', label: 'Longitude', placeholder: '-74.0060', type: 'number' }, { key: 'format', label: 'Link format', options: ['geo', 'maps'] }] },
  event: { intro: 'Add an event straight to their calendar.', fields: [{ key: 'title', label: 'Event title', placeholder: 'Opening night' }, { key: 'location', label: 'Location', placeholder: 'The Gallery, New York' }, { key: 'start', label: 'Starts', type: 'datetime-local' }, { key: 'end', label: 'Ends', type: 'datetime-local' }, { key: 'description', label: 'Description (optional)', multiline: true, wide: true }] },
};

function Form({ type, fields, change }: Props & { type: QRType }) {
  const definition = definitions[type];
  return <div role="tabpanel" className="form-content"><p className="form-intro">{definition.intro}</p><div className="fields-grid">{definition.fields.map(field => <label className={`field ${field.wide ? 'wide' : ''}`} key={field.key}><span>{field.label}</span>
    {field.options ? <select value={fields[field.key] || ''} onChange={e => change(field.key, e.target.value)} title={field.label}>{field.options.map(option => <option key={option} value={option}>{option === 'nopass' ? 'None (open)' : option === 'maps' ? 'Google Maps URL' : option === 'geo' ? 'Geo URI' : option === 'true' ? 'Yes' : option === 'false' ? 'No' : option}</option>)}</select>
      : field.multiline ? <textarea rows={type === 'text' ? 4 : 3} value={fields[field.key] || ''} onChange={e => change(field.key, e.target.value)} placeholder={field.placeholder} title={field.label}/>
      : <input type={field.type || 'text'} step={field.type === 'number' ? 'any' : undefined} value={fields[field.key] || ''} onChange={e => change(field.key, e.target.value)} placeholder={field.placeholder} title={field.label}/>}
  </label>)}</div></div>;
}
export const TextForm = (props: Props) => <Form type="text" {...props}/>;
export const WifiForm = (props: Props) => <Form type="wifi" {...props}/>;
export const VCardForm = (props: Props) => <Form type="vcard" {...props}/>;
export const PhoneForm = (props: Props) => <Form type="phone" {...props}/>;
export const EmailForm = (props: Props) => <Form type="email" {...props}/>;
export const SmsForm = (props: Props) => <Form type="sms" {...props}/>;
export const WhatsAppForm = (props: Props) => <Form type="whatsapp" {...props}/>;
export const LocationForm = (props: Props) => <Form type="location" {...props}/>;
export const EventForm = (props: Props) => <Form type="event" {...props}/>;
