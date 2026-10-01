import type { HistoryItem, Preset } from '../types/qr';

function read<T>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}
export const loadHistory = () => read<HistoryItem[]>('qr-studio-history', []);
export const loadPresets = () => read<Preset[]>('qr-studio-presets', []);
export function storeHistory(items: HistoryItem[]) { try { localStorage.setItem('qr-studio-history', JSON.stringify(items)); return true; } catch { return false; } }
export function storePresets(items: Preset[]) { try { localStorage.setItem('qr-studio-presets', JSON.stringify(items)); return true; } catch { return false; } }
export function addHistory(items: HistoryItem[], item: HistoryItem) {
  const existing = items.find(i => i.type === item.type && JSON.stringify(i.fields) === JSON.stringify(item.fields) && JSON.stringify(i.settings) === JSON.stringify(item.settings));
  if (existing) return items;
  const result = [item, ...items];
  const unpinned = result.filter(i => !i.pinned);
  const kept = new Set(unpinned.slice(0, 20).map(i => i.id));
  return result.filter(i => i.pinned || kept.has(i.id));
}
