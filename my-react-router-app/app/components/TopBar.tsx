import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Icon } from "~/components/Icons";
import { Logo } from "~/components/Logo";
import { cx } from "~/lib/cx";
import { usePortal } from "~/lib/store";

type Item = { id: string; label: string; to: string; badge?: string; locked?: boolean };

const HIDDEN_KEY = "nb-hidden-tabs";

export function TopBar({
  active,
  mode,
  personName,
}: {
  active?: string;
  mode?: "sm" | "vendor" | "register";
  personName?: string;
}) {
  const { state, listQuery, setListQuery, logout } = usePortal();
  const navigate = useNavigate();
  const location = useLocation();
  const [menu, setMenu] = useState<"user" | "tabs" | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const pending = state.vendors.filter((vendor) => vendor.status === "Pending Review").length;
  const unread = state.mails.filter((mail) => !mail.read).length;
  const resolvedMode =
    mode ?? (state.session?.role === "vendor" ? "vendor" : state.session ? "sm" : "public");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HIDDEN_KEY);
      if (raw) setHidden(JSON.parse(raw) as string[]);
    } catch {
      setHidden([]);
    }
  }, []);

  const smItems: Item[] = [
    { id: "home", label: "Home", to: "/home", locked: true },
    { id: "vendor", label: "Vendor Mgmt", to: "/vendor-mgmt", badge: String(pending), locked: true },
    { id: "rfq", label: "RFQ", to: "/module/rfq", badge: "5" },
    { id: "po", label: "Purchase Orders", to: "/module/purchase-orders" },
    { id: "invoices", label: "Invoices", to: "/module/invoices" },
    { id: "reports", label: "Reports", to: "/module/reports" },
  ];
  const vendorItems: Item[] = [
    { id: "home", label: "Home", to: "/vendor", locked: true },
    { id: "registration", label: "Registration", to: "/vendor?tab=profile", locked: true },
    { id: "rfq", label: "RFQ", to: "/module/rfq", badge: "5" },
    { id: "po", label: "Purchase Orders", to: "/module/purchase-orders" },
    { id: "invoices", label: "Invoices", to: "/module/invoices" },
    { id: "profile", label: "My Profile", to: "/vendor?tab=profile", locked: true },
  ];
  const registerItems = vendorItems.map((item) =>
    item.id === "registration" ? { ...item, to: `${location.pathname}${location.search}` } : item,
  );
  const items =
    resolvedMode === "sm"
      ? smItems
      : resolvedMode === "public"
        ? []
        : resolvedMode === "register"
          ? registerItems
          : vendorItems;
  const visible = items.filter((item) => item.locked || !hidden.includes(item.id));
  const displayName =
    personName ??
    (state.session?.role === "vendor"
      ? state.session.name
      : state.session
        ? "SM Team"
        : "Sign in");

  function toggleTab(id: string) {
    const next = hidden.includes(id) ? hidden.filter((item) => item !== id) : [...hidden, id];
    setHidden(next);
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(next));
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0d1b33] text-white">
      <div className="flex h-[68px] items-center gap-4 px-4 lg:px-6">
        <Link to={state.session?.role === "vendor" ? "/vendor" : state.session ? "/vendor-mgmt" : "/"} className="shrink-0">
          <Logo light />
        </Link>
        <div className="hidden text-[13px] font-semibold tracking-wide text-white/90 min-[1440px]:block">
          Vendor Portal
        </div>
        <nav className="nb-scroll flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
          {visible.map((item) => {
            const on = item.id === active;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={cx(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-2 text-[13px] font-medium",
                  on ? "bg-white/10 text-white shadow-[inset_0_-2px_0_#c6a35a]" : "text-white/75 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
                {item.badge && item.badge !== "0" && (
                  <span className="rounded-full bg-[#e25b4a] px-1.5 text-[10px] leading-4 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {resolvedMode === "sm" && (
            <button
              className="hidden items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/85 hover:bg-white/5 lg:inline-flex"
              onClick={() => setMenu(menu === "tabs" ? null : "tabs")}
            >
              <Icon name="spark" className="h-3.5 w-3.5" />
              Customize Tabs
            </button>
          )}
          <label className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/80 xl:flex">
            <Icon name="search" className="h-3.5 w-3.5" />
            <input
              value={listQuery}
              onChange={(event) => setListQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !location.pathname.startsWith("/vendor-mgmt")) {
                  navigate("/vendor-mgmt");
                }
              }}
              placeholder="Search..."
              className="w-28 bg-transparent text-sm outline-none placeholder:text-white/45 lg:w-36"
              aria-label="Search vendors"
            />
          </label>
          <Link
            to="/inbox"
            className="relative grid h-9 w-9 place-items-center rounded-full text-white/85 hover:bg-white/10"
            aria-label="Portal mailbox"
          >
            <Icon name="mail" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#e25b4a] px-1 text-[10px]">
                {unread}
              </span>
            )}
          </Link>
          {state.session ? (
            <div className="relative">
              <button
                className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-sm"
                onClick={() => setMenu(menu === "user" ? null : "user")}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#c6a35a] text-xs font-bold text-[#10203c]">
                  {displayName.slice(0, 1)}
                </span>
                <span className="hidden max-w-32 truncate sm:block">{displayName}</span>
              </button>
              {menu === "user" && (
                <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-[#e6ebf2] bg-white p-1 text-[#1c2740] shadow-xl">
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[#f6f8fb]"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    <Icon name="logout" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/" className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium">
              {resolvedMode === "register" ? personName || "Vendor" : "Sign in"}
            </Link>
          )}
        </div>
      </div>
      {menu === "tabs" && (
        <div className="absolute right-6 top-16 z-50 w-64 rounded-xl border border-[#e6ebf2] bg-white p-3 text-[#1c2740] shadow-xl">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8b95a8]">
            Visible tabs
          </div>
          {smItems.map((item) => (
            <label key={item.id} className="flex items-center gap-2 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={item.locked || !hidden.includes(item.id)}
                disabled={item.locked}
                onChange={() => toggleTab(item.id)}
              />
              {item.label}
            </label>
          ))}
        </div>
      )}
    </header>
  );
}
