import { useState } from 'react';
import { Download, FileImage, FileCode2, FileText, Copy, ChevronDown } from 'lucide-react';
import { exportQR } from '../lib/downloadHelpers';
import type { Settings, QRType } from '../types/qr';

export default function DownloadPopover({ payload, settings, type, disabled, notice, onExport }: { payload: string; settings: Settings; type: QRType; disabled: boolean; notice: (value: string) => void; onExport: () => void }) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(1024);
  const [paper, setPaper] = useState<'a4' | 'a5'>('a4');
  const [busy, setBusy] = useState(false);
  const perform = async (format: 'png' | 'svg' | 'jpg' | 'pdf' | 'copy') => {
    setBusy(true);
    try { await exportQR(payload, settings, type, format, size, paper); notice(format === 'copy' ? 'PNG copied to clipboard' : `${format.toUpperCase()} downloaded successfully`); onExport(); setOpen(false); }
    catch (e) { notice(e instanceof Error ? e.message : 'Export failed. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div className="download-wrap"><button className="button-primary download-main" type="button" disabled={disabled || busy} onClick={() => setOpen(!open)} aria-expanded={open} title="Choose an export format"><Download size={18}/> Download QR <ChevronDown size={16}/></button>
    {open && <div className="download-popover"><div className="popover-title">EXPORT YOUR QR <button type="button" onClick={() => setOpen(false)} aria-label="Close download options">×</button></div>
      <div className="export-config"><label>Image size <select value={size} onChange={e => setSize(Number(e.target.value))} title="Select image size">{[512, 1024, 2048, 4096].map(n => <option key={n} value={n}>{n} × {n} px</option>)}</select></label><label>PDF page <select value={paper} onChange={e => setPaper(e.target.value as 'a4' | 'a5')} title="Select PDF paper size"><option value="a4">A4</option><option value="a5">A5</option></select></label></div>
      <div className="export-list">{([{ id: 'png', name: 'PNG image', hint: 'Best for digital use', icon: FileImage }, { id: 'svg', name: 'SVG vector', hint: 'Scales infinitely', icon: FileCode2 }, { id: 'jpg', name: 'JPG image', hint: 'Solid white background', icon: FileImage }, { id: 'pdf', name: 'PDF document', hint: 'Print-ready page', icon: FileText }, { id: 'copy', name: 'Copy as PNG', hint: 'Paste anywhere', icon: Copy }] as const).map(({ id, name, hint, icon: Icon }) => <button type="button" key={id} disabled={busy} onClick={() => { void perform(id); }} title={`Export as ${name}`}><span className="export-icon"><Icon size={18}/></span><span><strong>{name}</strong><small>{hint}</small></span><span className="export-arrow">↗</span></button>)}</div>
    </div>}
  </div>;
}
