import { useEffect, useMemo, useState } from "react";
import {
  QrCode,
  Plus,
  LockKeyhole,
  Sparkles,
  Check,
  AlertCircle,
  Save,
} from "lucide-react";
import QRPreview from "./components/QRPreview";
import InputTabs, { tabs } from "./components/InputTabs";
import TextForm from "./components/forms/TextForm";
import WifiForm from "./components/forms/WifiForm";
import VCardForm from "./components/forms/VCardForm";
import PhoneForm from "./components/forms/PhoneForm";
import EmailForm from "./components/forms/EmailForm";
import SmsForm from "./components/forms/SmsForm";
import WhatsAppForm from "./components/forms/WhatsAppForm";
import LocationForm from "./components/forms/LocationForm";
import EventForm from "./components/forms/EventForm";
import CustomizationPanel from "./components/CustomizationPanel";
import HistoryStrip from "./components/HistoryStrip";
import DownloadPopover from "./components/DownloadPopover";
import ThemeToggle from "./components/ThemeToggle";
import {
  defaultSettings,
  initialFields,
  type Fields,
  type HistoryItem,
  type Preset,
  type QRType,
  type Settings,
} from "./types/qr";
import { getError, getPayload } from "./lib/qrGenerators";
import {
  addHistory,
  loadHistory,
  loadPresets,
  storeHistory,
  storePresets,
} from "./lib/storage";
import { saveBlob } from "./lib/downloadHelpers";

const forms = {
  text: TextForm,
  wifi: WifiForm,
  vcard: VCardForm,
  phone: PhoneForm,
  email: EmailForm,
  sms: SmsForm,
  whatsapp: WhatsAppForm,
  location: LocationForm,
  event: EventForm,
};

export default function App() {
  const [type, setType] = useState<QRType>("text");
  const [allFields, setAllFields] = useState<Record<QRType, Fields>>(() =>
    structuredClone(initialFields),
  );
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [presets, setPresets] = useState<Preset[]>(loadPresets);
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("qr-studio-theme") === "dark";
    } catch {
      return false;
    }
  });
  const [toast, setToast] = useState("");
  const [live, setLive] = useState({ payload: "", settings: defaultSettings });
  const [touched, setTouched] = useState(false);
  const fields = allFields[type];
  const ContentForm = forms[type];
  const payload = useMemo(() => getPayload(type, fields), [type, fields]);
  const error = useMemo(
    () =>
      getError(
        type,
        fields,
        payload,
        settings.logo ? "H" : settings.correction,
      ),
    [type, fields, payload, settings.logo, settings.correction],
  );
  useEffect(() => {
    const timer = setTimeout(() => setLive({ payload, settings }), 140);
    return () => clearTimeout(timer);
  }, [payload, settings]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("qr-studio-theme", dark ? "dark" : "light");
    } catch {
      /* Storage is optional. */
    }
  }, [dark]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  const notice = (message: string) => setToast(message);
  const change = (key: string, value: string) => {
    setTouched(true);
    setAllFields((prev) => ({
      ...prev,
      [type]: { ...prev[type], [key]: value },
    }));
  };
  const saveHistory = () => {
    if (!payload || error) return;
    const item: HistoryItem = {
      id: crypto.randomUUID(),
      type,
      fields: { ...fields },
      settings: { ...settings },
      preview: payload.slice(0, 70),
      createdAt: Date.now(),
      pinned: false,
    };
    setHistory((prev) => {
      const next = addHistory(prev, item);
      if (next !== prev && !storeHistory(next))
        notice("Browser storage is full. Your QR was not saved.");
      return next;
    });
  };
  useEffect(() => {
    if (!touched || !payload || error) return;
    const timer = setTimeout(saveHistory, 1800);
    return () => clearTimeout(timer);
    // Save the settled editor snapshot rather than every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touched, payload, error, fields, settings, type]);
  const updateHistory = (fn: (items: HistoryItem[]) => HistoryItem[]) =>
    setHistory((prev) => {
      const next = fn(prev);
      if (!storeHistory(next))
        notice("Could not save history to this browser.");
      return next;
    });
  const updatePresets = (next: Preset[]) => {
    if (!storePresets(next))
      notice("Browser storage is full. Preset was not saved.");
    setPresets(next);
  };
  const reset = () => {
    setTouched(false);
    setType("text");
    setAllFields(structuredClone(initialFields));
    setSettings(defaultSettings);
    notice("New QR ready to create");
  };
  const importAll = async (file: File) => {
    try {
      if (file.size > 5_000_000) throw new Error("Backup file is too large.");
      const data: unknown = JSON.parse(await file.text());
      if (
        !Array.isArray(data) ||
        !data.every(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            tabs.some((t) => t.id === item.type) &&
            typeof item.preview === "string" &&
            item.fields &&
            typeof item.fields === "object" &&
            Object.values(item.fields).every(
              (value) => typeof value === "string",
            ) &&
            item.settings &&
            typeof item.settings === "object" &&
            typeof item.settings.foreground === "string" &&
            typeof item.settings.background === "string" &&
            (typeof item.settings.logo !== "string" ||
              !item.settings.logo ||
              /^data:image\/(png|jpeg|svg\+xml);base64,/.test(
                item.settings.logo,
              )) &&
            typeof item.pinned === "boolean",
        )
      )
        throw new Error("This is not a valid QR Studio history file.");
      const imported = data as HistoryItem[];
      updateHistory((prev) => {
        const ids = new Set(prev.map((i) => i.id));
        const combined = [...prev, ...imported.filter((i) => !ids.has(i.id))];
        const recent = new Set(
          combined
            .filter((i) => !i.pinned)
            .slice(0, 20)
            .map((i) => i.id),
        );
        return combined.filter((i) => i.pinned || recent.has(i.id));
      });
      notice(`Imported ${imported.length} QR codes`);
    } catch (e) {
      notice(e instanceof Error ? e.message : "Import failed");
    }
  };
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark">
              <QrCode size={23} strokeWidth={2.3} />
            </span>
            <span>
              QR <strong>Studio</strong>
              <small>CREATE · CUSTOMIZE · SHARE</small>
            </span>
          </div>
          <div className="top-actions">
            <span className="privacy-pill">
              <LockKeyhole size={13} /> 100% private & offline
            </span>
            <ThemeToggle dark={dark} toggle={() => setDark(!dark)} />
            <button
              type="button"
              className="new-button"
              onClick={reset}
              title="Start a new QR code"
            >
              <Plus size={17} /> <span>New QR</span>
            </button>
          </div>
        </div>
      </header>
      <main className="main-wrap">
        <div className="hero-copy">
          <div className="hero-overline">
            <Sparkles size={14} /> THE QR CREATOR'S WORKSPACE
          </div>
          <h1>
            Make a mark. <em>Make it scan.</em>
          </h1>
          <p>
            Beautiful, reliable QR codes made entirely in your browser. No links
            that expire. No strings attached.
          </p>
        </div>
        <div className="workspace">
          <div className="left-column">
            <div className="preview-card">
              <QRPreview
                payload={live.payload}
                settings={live.settings}
                error={error}
                onNotice={notice}
              />
              <div className="preview-footer">
                <span>
                  <LockKeyhole size={14} /> Your data never leaves this device
                </span>
                <DownloadPopover
                  payload={payload}
                  settings={settings}
                  type={type}
                  disabled={!payload || !!error}
                  notice={notice}
                  onExport={saveHistory}
                />
              </div>
            </div>
            <section className="input-card">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">STEP 01 · CONTENT</span>
                  <h2>What are we sharing?</h2>
                </div>
                <span className="step-icon">
                  <QrCode size={19} />
                </span>
              </div>
              <InputTabs
                value={type}
                onChange={(next) => {
                  setTouched(true);
                  setType(next);
                }}
              />
              <ContentForm fields={fields} change={change} />
              {error && (
                <p className="validation" role="alert">
                  <AlertCircle size={16} />
                  {error}
                </p>
              )}
              <div className="input-bottom">
                <span>
                  <strong>{payload.length.toLocaleString()}</strong> characters{" "}
                  <span className="middle-dot">·</span> QR codes hold up to
                  ~4,000 characters but work best under 300 for reliable
                  scanning.
                </span>
                <button
                  type="button"
                  className="save-history"
                  disabled={!payload || !!error}
                  onClick={() => {
                    saveHistory();
                    notice("QR saved to recent creations");
                  }}
                  title="Save current QR to recent creations"
                >
                  <Save size={15} /> Save QR
                </button>
              </div>
            </section>
          </div>
          <CustomizationPanel
            settings={settings}
            setSettings={(next) => {
              setTouched(true);
              setSettings(next);
            }}
            presets={presets}
            savePreset={(name) => {
              if (
                [...presets].some(
                  (p) => p.name.toLowerCase() === name.toLowerCase(),
                )
              ) {
                notice("A preset with that name already exists");
                return;
              }
              updatePresets([
                ...presets,
                { name, settings: { ...settings, logo: "" }, custom: true },
              ]);
              notice("Preset saved");
            }}
            deletePreset={(name) => {
              updatePresets(presets.filter((p) => p.name !== name));
              notice("Preset removed");
            }}
            notice={notice}
          />
        </div>
        <HistoryStrip
          items={history}
          select={(item) => {
            setTouched(false);
            setType(item.type);
            setAllFields((prev) => ({ ...prev, [item.type]: item.fields }));
            setSettings({ ...defaultSettings, ...item.settings });
            window.scrollTo({ top: 0, behavior: "smooth" });
            notice("QR loaded into editor");
          }}
          togglePin={(id) =>
            updateHistory((prev) =>
              prev.map((i) => (i.id === id ? { ...i, pinned: !i.pinned } : i)),
            )
          }
          remove={(id) =>
            updateHistory((prev) => prev.filter((i) => i.id !== id))
          }
          clear={() => updateHistory(() => [])}
          exportAll={() => {
            saveBlob(
              new Blob([JSON.stringify(history, null, 2)], {
                type: "application/json",
              }),
              "qr-studio-history.json",
            );
            notice("History backup downloaded");
          }}
          importAll={(file) => {
            void importAll(file);
          }}
          notice={notice}
        />
      </main>
      <footer className="site-footer">
        <span className="footer-brand">
          <QrCode size={17} /> QR Studio
        </span>
        <span>Made to be scanned. Built to last.</span>
        <span>Locally generated · Always yours</span>
      </footer>
      <div
        className={`toast ${toast ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            <Check size={17} />
            {toast}
          </>
        )}
      </div>
    </div>
  );
}
