import { cx } from "~/lib/cx";

export function Logo({ light = false }: { light?: boolean }) {
  const gold = "#c6a35a";
  const navy = "#0d1b33";
  return (
    <div className="flex items-center gap-2.5">
      <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="17" fill={light ? gold : navy} />
        <circle
          cx="18"
          cy="18"
          r="13"
          fill="none"
          stroke={light ? navy : gold}
          strokeWidth="1.4"
        />
        <path
          d="M18 8c3.6 2.8 5.6 5.8 5.6 10S21.6 25.2 18 28c2-2.8 3.2-5.8 3.2-10S20 10.8 18 8Z"
          fill={light ? navy : gold}
        />
      </svg>
      <div className="leading-none">
        <div className="text-[9px] tracking-wide text-[#c6a35a]" dir="rtl">
          الصكوك الوطنية
        </div>
        <div
          className={cx(
            "mt-0.5 text-[11px] font-bold tracking-[0.14em]",
            light ? "text-white" : "text-[#0d1b33]",
          )}
        >
          NATIONAL BONDS
        </div>
        <div
          className={cx(
            "mt-0.5 text-[7px] tracking-[0.16em]",
            light ? "text-white/70" : "text-[#7d879b]",
          )}
        >
          SAVE · INVEST · PROSPER
        </div>
      </div>
    </div>
  );
}
