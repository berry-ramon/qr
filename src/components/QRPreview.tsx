import { useEffect, useRef, useState } from "react";
import {
  Minus,
  Plus,
  ScanLine,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import jsQR from "jsqr";
import { createQR, toCanvas } from "../lib/downloadHelpers";
import type { Settings } from "../types/qr";

type Detector = {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue: string }>>;
};
type DetectorConstructor = new (options: { formats: string[] }) => Detector;

export default function QRPreview({
  payload,
  settings,
  error,
  onNotice,
}: {
  payload: string;
  settings: Settings;
  error: string;
  onNotice: (message: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [modules, setModules] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.replaceChildren();
    setScanResult("");
    if (!payload || error) {
      setStatus("ready");
      setModules(0);
      return;
    }
    try {
      setStatus("loading");
      const qr = createQR(payload, settings, settings.size);
      qr.append(ref.current);
      setModules(qr._qr?.getModuleCount() || 0);
      Promise.resolve(qr._svgDrawingPromise)
        .then(() => setStatus("ready"))
        .catch(() => setStatus("error"));
    } catch {
      setStatus("error");
    }
  }, [payload, settings, error]);

  const testScan = async () => {
    if (!payload || error) return;
    setScanning(true);
    setScanResult("");
    try {
      const canvas = await toCanvas(
        createQR(payload, settings, 800),
        800,
        "#FFFFFF",
      );
      const DetectorClass = (
        window as Window & { BarcodeDetector?: DetectorConstructor }
      ).BarcodeDetector;
      let decoded: string | undefined;
      if (DetectorClass) {
        try {
          decoded = (
            await new DetectorClass({ formats: ["qr_code"] }).detect(canvas)
          )[0]?.rawValue;
        } catch {
          /* Use jsQR when native decoding fails. */
        }
      }
      if (!decoded) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          const data = ctx.getImageData(0, 0, 800, 800);
          decoded = jsQR(data.data, data.width, data.height)?.data;
        }
      }
      setScanResult(
        decoded === payload
          ? "Scan successful - your QR is readable."
          : "Could not read this QR. Try higher contrast, less spacing, or a smaller logo.",
      );
    } catch {
      setScanResult("Scan failed. Try a different style or smaller logo.");
    } finally {
      setScanning(false);
    }
  };
  return (
    <section className="preview-section" aria-label="Live QR preview">
      <div className="section-heading preview-heading">
        <div>
          <span className="eyebrow">
            <span className="live-dot" /> LIVE PREVIEW
          </span>
          <h2>Your QR code</h2>
        </div>
        <span className="preview-badge">
          {payload && !error ? "Ready to share" : "Waiting for content"}
        </span>
      </div>
      <div className="preview-stage">
        <div className="stage-glow" />
        <div
          className={`qr-sheet ${settings.transparent ? "transparent-sheet" : ""}`}
          style={{
            transform: `scale(${zoom / 100})`,
            width: `min(100%, ${200 + Math.round(((settings.size - 128) / 1920) * 98)}px)`,
            height: "auto",
            aspectRatio: "1",
          }}
        >
          <div className="qr-canvas" ref={ref} />
          {(!payload || error || status === "error") && (
            <div className="qr-empty">
              <ScanLine size={38} strokeWidth={1.2} />
              <span>
                {status === "error"
                  ? "QR could not be generated"
                  : error || "Add content to create your QR"}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="preview-toolbar">
        <div className="zoom-controls">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <Minus size={16} />
          </button>
          <span>{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(175, z + 25))}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <Plus size={16} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(100)}
            title="Fit preview"
            aria-label="Fit preview"
          >
            <RotateCcw size={15} />
          </button>
        </div>
        <button
          className="test-button"
          type="button"
          disabled={!payload || !!error || scanning || status === "error"}
          onClick={() => {
            void testScan();
          }}
          title="Decode the QR locally to verify it scans"
        >
          <ScanLine size={16} />
          {scanning ? "Testing…" : "Test scan"}
        </button>
      </div>
      {scanResult && (
        <p
          className={`scan-result ${scanResult.startsWith("Scan successful") ? "success" : "failure"}`}
          role="status"
        >
          {scanResult.startsWith("Scan successful") ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}{" "}
          {scanResult}
        </p>
      )}
      <div className="preview-meta">
        <span>VERSION {modules ? Math.max(1, (modules - 17) / 4) : "-"}</span>
        <span>MODULES {modules ? `${modules} × ${modules}` : "-"}</span>
        <span>
          ERROR CORRECTION {settings.logo ? "H" : settings.correction}
        </span>
        <button
          type="button"
          title="Copy the encoded content"
          onClick={() => {
            if (payload)
              void navigator.clipboard
                .writeText(payload)
                .then(() => onNotice("Content copied to clipboard"))
                .catch(() => onNotice("Could not copy content"));
          }}
        >
          Copy content
        </button>
      </div>
    </section>
  );
}
