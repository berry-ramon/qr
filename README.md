================================================================================
QR STUDIO
================================================================================

A free, open-source, browser-only QR code generator — built by Brandon Kimathi.

Encode text, links, Wi-Fi credentials, contacts, phone numbers, email, SMS,
WhatsApp messages, coordinates, and calendar events into beautiful, permanent
QR codes. No account, no API, no tracking, no backend. Every QR code encodes
the actual content directly — never a redirect through a paid or expiring
shortener.

Part of brandonkimathi.top

---

## FEATURES

- Eight input types — text/URL, Wi-Fi, vCard, phone, email, SMS, WhatsApp,
  location, and calendar events
- Deep customization — colors, gradients, dot shapes, corner styles, quiet
  zone, error correction, and logo embedding
- Preset library — one-click brand-consistent designs
- Four export formats — PNG, JPG, SVG, and print-ready PDF
- 100% client-side — nothing ever leaves the browser
- Works offline — installs as a PWA, precached on first visit
- History and presets — persisted to localStorage

---

## TECH STACK

- React 18 + TypeScript
- Vite for bundling
- Tailwind CSS for styling
- qr-code-styling for client-side QR generation
- jsPDF for PDF export
- jsQR as a fallback for the built-in test-scan feature

---

## RUN LOCALLY

Use Node.js 22 and pnpm 10:

    pnpm install --frozen-lockfile
    pnpm dev

Open the URL printed by Vite (default: http://localhost:5173).

---

## BUILD AND DEPLOY

    pnpm build

Upload the dist/ directory to any static host.

Vercel
Framework preset: Vite
Build command: pnpm build
Output directory: dist

Netlify
Build command: pnpm build
Publish directory: dist

GitHub Pages 1. Set Vite's `base` in vite.config.ts to /<repository-name>/ 2. Build with pnpm build 3. Publish dist/ via GitHub Actions or your preferred Pages workflow

For a custom domain or root hosting, keep base: '/'.

---

## OFFLINE BEHAVIOR

The production build emits a service worker that precaches every asset in the
bundle. Visit once while online to install it — afterwards, the app and all
export features work without a network connection.

The dev server itself is not an offline deployment.

Clipboard image export requires a secure context (HTTPS or localhost).

---

## PRIVACY

- Your QR content, uploaded logos, saved presets, and recent history NEVER
  leave the browser.
- No analytics, no telemetry, no third-party calls.
- localStorage is device- and browser-specific. Export a JSON backup of your
  history if you want to transfer it.

A link encoded in a QR is permanent — but whether its DESTINATION remains
available is controlled by whoever owns that destination.

---

## EXPORTS

PNG — Web, messaging apps, digital documents
JPG — Situations where transparency is unwanted
SVG — Print, signage, anything that needs infinite scaling
PDF — A4/A5 print pages with proper margins
Copy — Paste directly into chat or documents

Use "Test scan" to verify a design before you print or share. It uses the
browser's BarcodeDetector API when available, falling back to jsQR otherwise.

Large payloads and low-contrast designs may be harder to scan. For print:

- Use a LIGHT background
- Keep an adequate QUIET ZONE around the code
- Avoid placing a logo over more than 30% of the code area

---

## PROJECT STRUCTURE

src/
components/
QRPreview.tsx — live canvas + test-scan
InputTabs.tsx — input type selector
forms/ — one form per input type
CustomizationPanel.tsx — all style controls
PresetGrid.tsx — visual preset picker
HistoryStrip.tsx — recent QR codes
DownloadPopover.tsx — export options
ThemeToggle.tsx
lib/
qrGenerators.ts — payload builders per input type
downloadHelpers.ts — PNG / SVG / PDF export logic
storage.ts — localStorage wrappers
types/
qr.ts — shared TypeScript types
App.tsx
main.tsx

---

## CONTRIBUTING

QR Studio is open source and free for everyone. Contributions are welcome.

1. Fork the repository
2. Create a feature branch: git checkout -b feature/my-improvement
3. Commit your changes: git commit -m "Add my improvement"
4. Push to the branch: git push origin feature/my-improvement
5. Open a pull request

Please keep the following principles in mind:

- No backend — everything must run in the browser
- No paid services — no QR API subscriptions, no expiring shorteners
- No tracking — no analytics, no telemetry, no third-party scripts
- Privacy first — user data never leaves the device
- Accessible — WCAG AA contrast, full keyboard nav, ARIA labels

---

## LICENSE

MIT — free to use, modify, and distribute.

---

## CREDITS

Built and maintained by Brandon Kimathi (https://brandonkimathi.top).

Part of the Brandon Kimathi project family.

================================================================================
QR STUDIO — permanent QR codes, made in your browser.
================================================================================
