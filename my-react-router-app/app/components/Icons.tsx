import type { ReactNode } from "react";

export type IconName =
  | "search"
  | "mail"
  | "bell"
  | "user"
  | "check"
  | "close"
  | "download"
  | "star"
  | "copy"
  | "upload"
  | "plus"
  | "chevron"
  | "logout"
  | "eye"
  | "eyeOff"
  | "key"
  | "file"
  | "alert"
  | "clock"
  | "send"
  | "ban"
  | "refresh"
  | "laptop"
  | "helmet"
  | "wrench"
  | "megaphone"
  | "heart"
  | "truck"
  | "case"
  | "bolt"
  | "box"
  | "spark"
  | "shield";

const paths: Record<IconName, ReactNode> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 7 9-7" /></>,
  bell: <><path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  user: <><circle cx="12" cy="8" r="3.2" /><path d="M5 19c1.4-3 3.8-4.5 7-4.5S17.6 16 19 19" /></>,
  check: <path d="m5 12 5 5 9-10" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  download: <><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M5 20h14" /></>,
  star: <path d="m12 3 2.6 5.4 6 .9-4.3 4.2 1 5.9L12 16.8 6.7 19.4l1-5.9L3.4 9.3l6-.9Z" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M4 16V6a2 2 0 0 1 2-2h10" /></>,
  upload: <><path d="M12 16V5" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  logout: <><path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2" /><path d="M4 12h10" /><path d="m11 9 3 3-3 3" /></>,
  eye: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
  eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 6.2A10 10 0 0 1 12 6c6 0 10 6 10 6a18 18 0 0 1-3.2 3.8" /><path d="M6.1 6.1C3.7 7.8 2 12 2 12s4 6 10 6a9.7 9.7 0 0 0 4-.8" /></>,
  key: <><circle cx="8" cy="14" r="4" /><path d="M11.5 11.5 20 3" /><path d="m16 7 2 2" /><path d="m18 5 2 2" /></>,
  file: <><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v6h6" /></>,
  alert: <><path d="M12 4 3 19h18L12 4Z" /><path d="M12 10v4" /><path d="M12 16.5h.01" /></>,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v5l3 2" /></>,
  send: <><path d="m4 12 16-7-7 16-2-7-7-2Z" /></>,
  ban: <><circle cx="12" cy="12" r="8" /><path d="m6 6 12 12" /></>,
  refresh: <><path d="M20 12a8 8 0 1 1-2.2-5.5" /><path d="M20 4v5h-5" /></>,
  laptop: <><rect x="4" y="5" width="16" height="10" rx="1.5" /><path d="M3 19h18" /></>,
  helmet: <><path d="M4 14a8 8 0 0 1 16 0" /><path d="M4 14h16v2H4z" /><path d="M8 16v2h8v-2" /></>,
  wrench: <path d="M14.5 6.5a3.5 3.5 0 0 0-4.8 4.8L4 17l3 3 5.7-5.7a3.5 3.5 0 0 0 4.8-4.8L15 12l-3-3 2.5-2.5Z" />,
  megaphone: <><path d="M4 10v4l12 4V6L4 10Z" /><path d="M7 14.5V18" /><path d="M16 8.5a4 4 0 0 1 0 7" /></>,
  heart: <path d="M12 19s-7-4.4-7-8.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 14.6 12 19 12 19Z" />,
  truck: <><path d="M3 7h11v8H3z" /><path d="M14 10h4l3 3v2h-7" /><circle cx="7" cy="17" r="1.6" /><circle cx="17" cy="17" r="1.6" /></>,
  case: <><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M8 7V5h8v2" /><path d="M3 12h18" /></>,
  bolt: <path d="M13 3 6 13h6l-1 8 7-10h-6l1-8Z" />,
  box: <><path d="M3 8 12 4l9 4-9 4-9-4Z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" /></>,
  spark: <path d="M12 3l1.2 4.2L17.5 8.5 13.2 9.8 12 14l-1.2-4.2L6.5 8.5l4.3-1.3L12 3ZM18 14l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6.6-2Z" />,
  shield: <path d="M12 3 5 6v6c0 4.2 2.8 7.2 7 9 4.2-1.8 7-4.8 7-9V6l-7-3Z" />,
};

export function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
