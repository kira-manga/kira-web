import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 12h14M13 6l6 6-6 6" /></IconBase>;
}

export function BookIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" /></IconBase>;
}

export function DownloadIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" /></IconBase>;
}

export function BackupIcon(props: IconProps) {
  return <IconBase {...props}><path d="M7 18.5h10a4 4 0 0 0 .9-7.9A6.2 6.2 0 0 0 6 9.2 4.7 4.7 0 0 0 7 18.5Z" /><path d="M12 16V9m0 0-2.5 2.5M12 9l2.5 2.5" /></IconBase>;
}

export function SlidersIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 6h6m4 0h6M10 3v6M4 18h10m4 0h2m-6-3v6M4 12h2m4 0h10M6 9v6" /></IconBase>;
}

export function GlobeIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9" /><path d="M3.5 9h17M3.5 15h17M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></IconBase>;
}

export function ShieldIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 3 5 6v5c0 4.8 2.8 8.2 7 10 4.2-1.8 7-5.2 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></IconBase>;
}

export function SparkIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 2c.8 6.4 3.6 9.2 10 10-6.4.8-9.2 3.6-10 10-.8-6.4-3.6-9.2-10-10 6.4-.8 9.2-3.6 10-10Z" /></IconBase>;
}

export function CheckIcon(props: IconProps) {
  return <IconBase {...props}><path d="m5 12 4 4L19 6" /></IconBase>;
}

export function MenuIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 7h16M4 12h16M4 17h16" /></IconBase>;
}

export function CloseIcon(props: IconProps) {
  return <IconBase {...props}><path d="m6 6 12 12M18 6 6 18" /></IconBase>;
}

export function SearchIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></IconBase>;
}

export function HomeIcon(props: IconProps) {
  return <IconBase {...props}><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></IconBase>;
}

export function HistoryIcon(props: IconProps) {
  return <IconBase {...props}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></IconBase>;
}

export function LibraryIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 4h4v16H5zM11 4h4v16h-4zM17 6l3-1 3 14-3 1z" /></IconBase>;
}

export function SettingsIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></IconBase>;
}

export function PlayIcon(props: IconProps) {
  return <IconBase {...props}><path d="m8 5 11 7-11 7V5Z" /></IconBase>;
}

export function MoonIcon(props: IconProps) {
  return <IconBase {...props}><path d="M20.5 14.2A8.2 8.2 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" /></IconBase>;
}

export function SunIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></IconBase>;
}
