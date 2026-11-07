type IconProps = { className?: string };

function Svg({ className, children, strokeWidth = 2 }: IconProps & { children: React.ReactNode; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export const XIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.6}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const CardsIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6" y="3" width="13" height="17" rx="3" />
    <path d="M3.5 7.5v10A3.5 3.5 0 0 0 7 21h8" />
  </Svg>
);

export const ChatIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20.5l1.4-4.5A7.5 7.5 0 1 1 20 12.5Z" />
  </Svg>
);

export const UserIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
  </Svg>
);

export const BackIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.4}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);

export const SendIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.2}>
    <path d="M5 12h13M12 5l7 7-7 7" />
  </Svg>
);

export const InfoIcon = (p: IconProps) => (
  <Svg {...p} strokeWidth={2.4}>
    <path d="M12 11v6M12 7.5v.01" />
  </Svg>
);

export const SparkleIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" className={p.className} aria-hidden="true" fill="currentColor">
    <path d="M12 2.5c.6 4.6 2.9 6.9 7.5 7.5-4.6.6-6.9 2.9-7.5 7.5-.6-4.6-2.9-6.9-7.5-7.5 4.6-.6 6.9-2.9 7.5-7.5Zm6.5 12c.3 2 1.2 2.9 3 3.2-1.8.3-2.7 1.2-3 3.3-.3-2.1-1.2-3-3-3.3 1.8-.3 2.7-1.2 3-3.2Z" />
  </svg>
);

export const PinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Svg>
);

export const BriefcaseIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="7" width="17" height="12.5" rx="2.5" />
    <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
  </Svg>
);

export const RefreshIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5" />
  </Svg>
);
