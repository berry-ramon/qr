import QRCodeStyling, { type Options } from 'qr-code-styling';
import type { Settings } from '../types/qr';

export function qrOptions(payload: string, s: Settings, size = 640): Options {
  const scale = size / 1024;
  const color = s.gradient === 'solid' ? { color: s.foreground } : {
    gradient: { type: s.gradient, rotation: s.rotation * Math.PI / 180,
      colorStops: [{ offset: 0, color: s.gradientStart }, { offset: 1, color: s.gradientEnd }] },
  };
  return {
    type: 'svg', width: size, height: size, margin: Math.round(s.margin * scale), data: payload,
    qrOptions: { errorCorrectionLevel: s.logo ? 'H' : s.correction },
    dotsOptions: { type: s.dots, ...color },
    cornersSquareOptions: { type: s.cornerSquare, color: s.foreground },
    cornersDotOptions: { type: s.cornerDot, color: s.foreground },
    backgroundOptions: s.transparent ? { color: 'rgba(255,255,255,0)' } : { color: s.background },
    ...(s.logo ? { image: s.logo, imageOptions: { imageSize: s.logoSize / 100, margin: Math.round(s.logoPadding * scale), hideBackgroundDots: true, crossOrigin: 'anonymous' } } : {}),
  };
}

export function createQR(payload: string, settings: Settings, size = 640) {
  const renderSize = Math.max(256, size);
  const qr = new QRCodeStyling(qrOptions(payload, settings, renderSize));
  if (settings.spacing || (settings.logo && !settings.logoTransparent)) {
    qr.applyExtension(svg => {
      if (settings.spacing) {
        const dots = svg.querySelector('[id^="clip-path-dot-color-"]');
        dots?.querySelectorAll(':scope > *').forEach(dot => {
          const element = dot as SVGGraphicsElement;
          try {
            const box = element.getBBox();
            const centerX = box.x + box.width / 2;
            const centerY = box.y + box.height / 2;
            const factor = 1 - settings.spacing / 100;
            const previous = element.getAttribute('transform') || '';
            element.setAttribute('transform', `translate(${centerX} ${centerY}) scale(${factor}) translate(${-centerX} ${-centerY}) ${previous}`);
          } catch { /* Some browsers cannot measure SVG paths until attached. */ }
        });
      }
      if (settings.logo && !settings.logoTransparent) {
        const image = svg.querySelector('image');
        if (image) {
          const padding = settings.logoPadding * renderSize / 1024;
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', String(Number(image.getAttribute('x')) - padding));
          rect.setAttribute('y', String(Number(image.getAttribute('y')) - padding));
          rect.setAttribute('width', String(parseFloat(image.getAttribute('width') || '0') + padding * 2));
          rect.setAttribute('height', String(parseFloat(image.getAttribute('height') || '0') + padding * 2));
          rect.setAttribute('fill', settings.logoBackground);
          svg.insertBefore(rect, image);
        }
      }
    });
  }
  return qr;
}

export async function svgBlob(qr: QRCodeStyling, targetSize?: number) {
  const blob = await qr.getRawData('svg');
  if (!(blob instanceof Blob)) throw new Error('Could not render SVG.');
  if (!targetSize || targetSize >= 256) return blob;
  const markup = (await blob.text()).replace(/(<svg\b[^>]*?)\bwidth="\d+"/, `$1width="${targetSize}"`).replace(/(<svg\b[^>]*?)\bheight="\d+"/, `$1height="${targetSize}"`);
  return new Blob([markup], { type: 'image/svg+xml' });
}

export async function toCanvas(qr: QRCodeStyling, size: number, background?: string) {
  const svg = await svgBlob(qr);
  const url = URL.createObjectURL(svg);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas is unavailable.');
    if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, size, size); }
    ctx.drawImage(image, 0, 0, size, size);
    return canvas;
  } finally { URL.revokeObjectURL(url); }
}

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportQR(payload: string, settings: Settings, type: string, format: 'png' | 'svg' | 'jpg' | 'pdf' | 'copy', size: number, paper: 'a4' | 'a5') {
  const file = `qr-${type}-${new Date().toISOString().slice(0, 10)}`;
  const qr = createQR(payload, settings, format === 'svg' ? settings.size : size);
  if (format === 'svg') { saveBlob(await svgBlob(qr, settings.size), `${file}.svg`); return; }
  const canvas = await toCanvas(qr, size, format === 'jpg' || format === 'pdf' ? '#FFFFFF' : undefined);
  if (format === 'pdf') {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ format: paper, unit: 'mm' });
    const width = paper === 'a4' ? 210 : 148;
    const height = paper === 'a4' ? 297 : 210;
    const qrWidth = Math.min(width - 40, height - 40, 150);
    doc.addImage(canvas.toDataURL('image/png'), 'PNG', (width - qrWidth) / 2, (height - qrWidth) / 2, qrWidth, qrWidth);
    doc.save(`${file}.pdf`); return;
  }
  const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('Could not create image.')), mime, 0.96));
  if (format === 'copy') { if (!navigator.clipboard?.write) throw new Error('Clipboard image access is unavailable in this browser.'); await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); return; }
  saveBlob(blob, `${file}.${format}`);
}
