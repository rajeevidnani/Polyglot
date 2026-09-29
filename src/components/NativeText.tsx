import { Rendering } from '../data/learnTypes';
import { useSindhiScript } from '../lib/script';

interface NativeTextProps {
  lang: string;
  value: Rendering;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { main: 'text-base', sub: 'text-xs' },
  md: { main: 'text-xl', sub: 'text-sm' },
  lg: { main: 'text-3xl', sub: 'text-base' },
};

// Shows the native script large with the romanised form underneath.
// Sindhi follows the script chosen in Settings (Perso-Arabic, Devanagari or both).
export default function NativeText({ lang, value, size = 'md', className = '' }: NativeTextProps) {
  const sindhiScript = useSindhiScript();
  const s = sizes[size];

  const scripts: { text: string; rtl: boolean }[] = [];
  if (lang === 'Sindhi') {
    if (sindhiScript !== 'devanagari' && value.n) scripts.push({ text: value.n, rtl: true });
    if (sindhiScript !== 'arabic' && value.d) scripts.push({ text: value.d, rtl: false });
  } else if (value.n) {
    scripts.push({ text: value.n, rtl: false });
  }

  if (scripts.length === 0) {
    return <span className={`font-semibold ${s.main} ${className}`}>{value.r}</span>;
  }

  return (
    <span className={`inline-flex flex-col items-center gap-0.5 ${className}`}>
      {scripts.map(({ text, rtl }) => (
        <span key={text} dir={rtl ? 'rtl' : 'ltr'} className={`font-semibold leading-snug ${s.main}`}>
          {text}
        </span>
      ))}
      <span className={`text-slate-500 italic ${s.sub}`}>{value.r}</span>
    </span>
  );
}
