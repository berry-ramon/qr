import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Palette, Shapes, ImagePlus, ShieldCheck, Bookmark, UploadCloud, X, Info } from 'lucide-react';
import PresetGrid, { palettes } from './PresetGrid';
import type { Preset, Settings } from '../types/qr';

type Props = { settings: Settings; setSettings: (settings: Settings) => void; presets: Preset[]; savePreset: (name: string) => void; deletePreset: (name: string) => void; notice: (text: string) => void };
function ColorControl({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return <label className="color-control" title={`Set ${label.toLowerCase()}`}><span>{label}</span><span className="color-input-group"><input type="color" value={value} onChange={e => { onChange(e.target.value); setDraft(e.target.value); }} aria-label={`${label} color picker`}/><input className="hex-input" aria-label={`${label} hex color`} value={draft} onChange={e => { setDraft(e.target.value); if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value); }} onBlur={() => setDraft(value)} maxLength={7}/></span></label>;
}
function Range({ label, value, min, max, unit, onChange, hint }: { label: string; value: number; min: number; max: number; unit: string; onChange: (n: number) => void; hint?: string }) {
  return <label className="range-field" title={hint || `Adjust ${label.toLowerCase()}`}><span className="range-label"><span>{label}</span><strong>{value}{unit}</strong></span><input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}/><span className="range-ends"><span>{min}{unit}</span><span>{max}{unit}</span></span></label>;
}
function Section({ title, icon: Icon, children, startOpen = false }: { title: string; icon: typeof Palette; children: React.ReactNode; startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  return <section className={`custom-section ${open ? 'expanded' : ''}`}><button type="button" className="accordion-head" onClick={() => setOpen(!open)} aria-expanded={open} title={`${open ? 'Collapse' : 'Expand'} ${title}`}><span className="accordion-icon"><Icon size={18}/></span><span>{title}</span><ChevronDown className="accordion-chevron" size={17}/></button>{open && <div className="accordion-body">{children}</div>}</section>;
}

export default function CustomizationPanel({ settings: s, setSettings, presets, savePreset, deletePreset, notice }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const patch = (update: Partial<Settings>) => setSettings({ ...s, ...update });
  const upload = (file?: File) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) { notice('Choose a PNG, JPG, or SVG logo.'); return; }
    if (file.size > 900_000) { notice('Logo must be under 900 KB to keep your browser storage fast.'); return; }
    if (file.type === 'image/svg+xml') {
      file.text().then(text => {
        if (/<script|<foreignObject|\son\w+\s*=|(?:href|url\()\s*['"]?https?:/i.test(text)) { notice('This SVG contains unsafe or external content. Use a simple SVG instead.'); return; }
        const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === 'string') { patch({ logo: reader.result, correction: 'H' }); notice('Logo added. Error correction set to H.'); } }; reader.readAsDataURL(file);
      }).catch(() => notice('Could not read logo.'));
    } else { const reader = new FileReader(); reader.onload = () => { if (typeof reader.result === 'string') { patch({ logo: reader.result, correction: 'H' }); notice('Logo added. Error correction set to H.'); } }; reader.readAsDataURL(file); }
  };
  return <aside className="custom-card"><div className="custom-top"><span className="eyebrow">MAKE IT YOURS</span><h2>Customize</h2><p>Fine-tune every detail of your QR.</p></div>
    <Section title="Colors" icon={Palette} startOpen><div className="control-stack"><ColorControl label="Foreground" value={s.foreground} onChange={foreground => patch({ foreground })}/><ColorControl label="Background" value={s.background} onChange={background => patch({ background })}/>
      <div className="control-divider"/><span className="control-label">Dot fill</span><div className="segmented">{(['solid', 'linear', 'radial'] as const).map(mode => <button key={mode} type="button" className={s.gradient === mode ? 'selected' : ''} onClick={() => patch({ gradient: mode })} title={`${mode} dot color`}>{mode === 'solid' ? 'Solid' : mode === 'linear' ? 'Linear' : 'Radial'}</button>)}</div>
      {s.gradient !== 'solid' && <><ColorControl label="Start color" value={s.gradientStart} onChange={gradientStart => patch({ gradientStart })}/><ColorControl label="End color" value={s.gradientEnd} onChange={gradientEnd => patch({ gradientEnd })}/>{s.gradient === 'linear' && <Range label="Rotation" value={s.rotation} min={0} max={360} unit="°" onChange={rotation => patch({ rotation })}/>}</>}
      <label className="toggle-line" title="Remove background for overlays"><span>Transparent background</span><input type="checkbox" checked={s.transparent} onChange={e => patch({ transparent: e.target.checked })}/><span className="switch"/></label>
      <div className="control-divider"/><span className="control-label">Quick palettes</span><div className="palette-grid">{palettes.map(([name, fg, bg]) => <button key={name} type="button" title={name} aria-label={`Apply ${name} palette`} className="palette-swatch" onClick={() => patch({ foreground: fg, background: bg, transparent: false, gradient: 'solid' })} style={{ background: bg }}><span style={{ background: fg }}/></button>)}</div>
    </div></Section>
    <Section title="Shape & style" icon={Shapes}><div className="control-stack"><label className="field compact"><span>Dot style</span><select value={s.dots} onChange={e => patch({ dots: e.target.value as Settings['dots'] })} title="Choose the shape of QR modules">{['square', 'rounded', 'dots', 'classy', 'classy-rounded', 'extra-rounded'].map(v => <option key={v} value={v}>{v.replace('-', ' ')}</option>)}</select></label><div className="two-col"><label className="field compact"><span>Corner squares</span><select value={s.cornerSquare} onChange={e => patch({ cornerSquare: e.target.value as Settings['cornerSquare'] })} title="Choose the outer finder shape">{['square', 'dot', 'extra-rounded'].map(v => <option key={v} value={v}>{v.replace('-', ' ')}</option>)}</select></label><label className="field compact"><span>Corner dots</span><select value={s.cornerDot} onChange={e => patch({ cornerDot: e.target.value as Settings['cornerDot'] })} title="Choose the inner finder shape"><option>square</option><option>dot</option></select></label></div>
      <Range label="Dot spacing" value={s.spacing} min={0} max={20} unit="%" onChange={spacing => patch({ spacing })} hint="Add breathing room between modules; high values can reduce scan reliability"/><Range label="QR size" value={s.size} min={128} max={2048} unit="px" onChange={size => patch({ size })} hint="Default SVG size; choose export resolution from Download"/><Range label="Quiet zone" value={s.margin} min={0} max={40} unit="px" onChange={margin => patch({ margin })} hint="White border around the code helps scanners detect it"/>
    </div></Section>
    <Section title="Logo embed" icon={ImagePlus}><div className="control-stack"><input ref={input} className="sr-only" type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={e => { upload(e.target.files?.[0]); e.target.value = ''; }} aria-label="Upload logo"/>
      {s.logo ? <div className="logo-present"><img src={s.logo} alt="Your uploaded logo"/><span>Logo added<small>Stored only in this browser</small></span><button type="button" onClick={() => patch({ logo: '', correction: 'M' })} title="Remove logo" aria-label="Remove logo"><X size={16}/></button></div> : <div role="button" tabIndex={0} className="upload-zone" onClick={() => input.current?.click()} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') input.current?.click(); }} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); upload(e.dataTransfer.files[0]); }} title="Drop a logo here or browse files"><UploadCloud size={23}/><strong>Drop your logo here</strong><span>or click to browse · PNG, JPG, SVG</span></div>}
      {s.logo && <><div className="warning-note"><Info size={16}/> Logo requires H correction, making the QR denser. Test scan before exporting.</div><Range label="Logo size" value={s.logoSize} min={10} max={40} unit="%" onChange={logoSize => patch({ logoSize })}/><Range label="Logo padding" value={s.logoPadding} min={0} max={30} unit="px" onChange={logoPadding => patch({ logoPadding })}/><ColorControl label="Logo backing" value={s.logoBackground} onChange={logoBackground => patch({ logoBackground })}/><label className="toggle-line" title="Make the logo backing transparent"><span>Transparent logo backing</span><input type="checkbox" checked={s.logoTransparent} onChange={e => patch({ logoTransparent: e.target.checked })}/><span className="switch"/></label></>}
    </div></Section>
    <Section title="Error correction" icon={ShieldCheck}><p className="control-help">More correction helps damaged codes scan, but adds density.</p><div className="correction-grid">{(['L', 'M', 'Q', 'H'] as const).map((level, i) => <button type="button" key={level} disabled={!!s.logo && level !== 'H'} onClick={() => patch({ correction: level })} className={(s.logo ? 'H' : s.correction) === level ? 'selected' : ''} title={['L: 7% recovery, lightest QR density', 'M: 15% recovery, balanced default', 'Q: 25% recovery, denser but resilient', 'H: 30% recovery, best for logos'][i]}><strong>{level}</strong><span>{[7,15,25,30][i]}%</span></button>)}</div></Section>
    <Section title="Presets" icon={Bookmark}><PresetGrid settings={s} presets={presets} apply={setSettings} save={savePreset} remove={deletePreset}/></Section>
  </aside>;
}
