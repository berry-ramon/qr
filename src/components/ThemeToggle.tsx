import { Moon, Sun } from 'lucide-react';
export default function ThemeToggle({ dark, toggle }: { dark: boolean; toggle: () => void }) {
  return <button type="button" className="icon-button" onClick={toggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>{dark ? <Sun size={19}/> : <Moon size={19}/>}</button>;
}
