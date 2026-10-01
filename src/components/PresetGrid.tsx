import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { defaultSettings, type Preset, type Settings } from '../types/qr';

const withStyle = (name: string, patch: Partial<Settings>): Preset => ({ name, settings: { ...defaultSettings, ...patch } });
export const builtInPresets: Preset[] = [
  withStyle('Minimal', { foreground: '#1A1A1A', background: '#FFFFFF' }),
  withStyle('Brand Magenta', { foreground: '#A91E8A', background: '#FAF7F2', dots: 'rounded', cornerSquare: 'extra-rounded' }),
  withStyle('Gold Luxury', { foreground: '#D4AF37', background: '#252321', dots: 'classy-rounded', cornerSquare: 'extra-rounded' }),
  withStyle('Rounded Soft', { foreground: '#486E87', background: '#F1F6F8', dots: 'rounded', cornerSquare: 'extra-rounded' }),
  withStyle('Print Ready', { foreground: '#000000', background: '#FFFFFF', margin: 40, size: 2048, correction: 'H' }),
  withStyle('Instagram Card', { foreground: '#C53678', background: '#FFFFFF', gradient: 'linear', gradientStart: '#E93C83', gradientEnd: '#7438C2', dots: 'rounded', cornerSquare: 'extra-rounded' }),
  withStyle('Rooftop Vibe', { foreground: '#F5E6CF', background: '#34302D', dots: 'classy', cornerSquare: 'extra-rounded' }),
  withStyle('WhatsApp Link', { foreground: '#128C55', background: '#FFFFFF', dots: 'rounded', cornerSquare: 'extra-rounded' }),
];
const palettes = [
  ['Classic', '#000000', '#FFFFFF'], ['Magenta', '#A91E8A', '#FAF7F2'], ['Gold', '#D4AF37', '#252321'],
  ['Ocean', '#1B5A70', '#EAF4F5'], ['Forest', '#2D654A', '#EDF5EB'], ['Lavender', '#66509A', '#F4F0FA'],
  ['Terracotta', '#AD5A45', '#FFF4ED'], ['Midnight', '#E9EAF5', '#1F2540'], ['Ink', '#27384F', '#F1F4F7'],
  ['Rose', '#A94768', '#FFF1F5'], ['Slate', '#596575', '#F4F6F8'],
];
export { palettes };

export default function PresetGrid({ settings, presets, apply, save, remove }: { settings: Settings; presets: Preset[]; apply: (s: Settings) => void; save: (name: string) => void; remove: (name: string) => void }) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  return <div className="preset-panel"><p className="control-help">A starting point for your next creation.</p><div className="preset-grid">{[...builtInPresets, ...presets].map(p => <div className="preset-card-wrap" key={p.name}><button type="button" className="preset-card" onClick={() => apply({ ...p.settings, logo: settings.logo })} title={`Apply ${p.name} preset`}><span className="preset-art" style={{ background: p.settings.background }}><span className="mini-qr" style={{ color: p.settings.foreground }}><i/><i/><i/><i/><i/><i/><i/><i/><i/></span></span><span>{p.name}</span></button>{p.custom && <button type="button" className="preset-delete" onClick={() => remove(p.name)} aria-label={`Delete ${p.name} preset`} title="Delete preset"><Trash2 size={12}/></button>}</div>)}</div>
    {naming ? <form className="save-preset-form" onSubmit={e => { e.preventDefault(); if (name.trim()) { save(name.trim()); setName(''); setNaming(false); } }}><label className="sr-only" htmlFor="preset-name">Preset name</label><input id="preset-name" autoFocus maxLength={30} placeholder="Name your preset" value={name} onChange={e => setName(e.target.value)}/><button type="submit" className="button-small">Save</button><button type="button" onClick={() => setNaming(false)} title="Cancel">Cancel</button></form> : <button type="button" className="save-preset" onClick={() => setNaming(true)} title="Save all current style settings as a preset"><Plus size={16}/> Save current as preset</button>}
  </div>;
}
