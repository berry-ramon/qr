import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  FileImage,
  FileCode2,
  FileText,
  Copy,
  X,
} from "lucide-react";
import { exportQR } from "../lib/downloadHelpers";
import type { Settings, QRType } from "../types/qr";

export default function DownloadPopover({
  payload,
  settings,
  type,
  disabled,
  notice,
  onExport,
}: {
  payload: string;
  settings: Settings;
  type: QRType;
  disabled: boolean;
  notice: (value: string) => void;
  onExport: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(1024);
  const [paper, setPaper] = useState<"a4" | "a5">("a4");
  const [busy, setBusy] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* Lock body scroll + handle Escape while the modal is open */
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    /* Focus the close button so keyboard users land inside the dialog */
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
    };
  }, [open, busy]);

  const perform = async (format: "png" | "svg" | "jpg" | "pdf" | "copy") => {
    setBusy(true);
    try {
      await exportQR(payload, settings, type, format, size, paper);
      notice(
        format === "copy"
          ? "PNG copied to clipboard"
          : `${format.toUpperCase()} downloaded successfully`,
      );
      onExport();
      setOpen(false);
    } catch (e) {
      notice(
        e instanceof Error ? e.message : "Export failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const exports = [
    {
      id: "png" as const,
      name: "PNG image",
      hint: "Best for digital use",
      icon: FileImage,
    },
    {
      id: "svg" as const,
      name: "SVG vector",
      hint: "Scales infinitely",
      icon: FileCode2,
    },
    {
      id: "jpg" as const,
      name: "JPG image",
      hint: "Solid white background",
      icon: FileImage,
    },
    {
      id: "pdf" as const,
      name: "PDF document",
      hint: "Print-ready page",
      icon: FileText,
    },
    {
      id: "copy" as const,
      name: "Copy as PNG",
      hint: "Paste anywhere",
      icon: Copy,
    },
  ];

  return (
    <>
      <button
        className="button-primary download-main"
        type="button"
        disabled={disabled || busy}
        onClick={() => setOpen(true)}
        title="Choose an export format"
      >
        <Download size={18} /> Download QR
      </button>

      {open &&
        createPortal(
          <div
            className="download-modal-overlay"
            onClick={() => !busy && setOpen(false)}
          >
            <div
              className="download-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="download-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="download-modal-header">
                <div>
                  <span className="download-modal-eyebrow">Export your QR</span>
                  <h3 id="download-modal-title">Choose a format</h3>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={busy}
                  aria-label="Close download options"
                  className="download-modal-close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="download-modal-body">
                {/* Config row */}
                <div className="export-config">
                  <label>
                    Image size
                    <select
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      title="Select image size"
                    >
                      {[512, 1024, 2048, 4096].map((n) => (
                        <option key={n} value={n}>
                          {n} × {n} px
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    PDF page
                    <select
                      value={paper}
                      onChange={(e) => setPaper(e.target.value as "a4" | "a5")}
                      title="Select PDF paper size"
                    >
                      <option value="a4">A4</option>
                      <option value="a5">A5</option>
                    </select>
                  </label>
                </div>

                {/* Export options */}
                <div className="export-list">
                  {exports.map(({ id, name, hint, icon: Icon }) => (
                    <button
                      type="button"
                      key={id}
                      disabled={busy}
                      onClick={() => {
                        void perform(id);
                      }}
                      title={`Export as ${name}`}
                    >
                      <span className="export-icon">
                        <Icon size={18} />
                      </span>
                      <span className="export-text">
                        <strong>{name}</strong>
                        <small>{hint}</small>
                      </span>
                      <span className="export-arrow">↗</span>
                    </button>
                  ))}
                </div>

                {busy && (
                  <p className="download-modal-status" role="status">
                    Preparing your file…
                  </p>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
