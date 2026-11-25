import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { Icon } from "~/components/Icons";
import { InviteModal } from "~/components/InviteModal";
import { RequireAuth } from "~/components/RequireAuth";
import { ReviewDrawer } from "~/components/ReviewDrawer";
import { TopBar } from "~/components/TopBar";
import { ageingOf, formatDate } from "~/lib/data";
import { cx } from "~/lib/cx";
import { usePortal } from "~/lib/store";
import type { Vendor, VendorStatus } from "~/lib/types";

type Tab = "active" | "process" | "surveys" | "broadcasts";

const PROCESS_STATUSES = [
  "All Status",
  "Pending Review",
  "Invited",
  "More Info Required",
  "Rejected",
  "Cancelled",
];

export function meta() {
  return [{ title: "Vendor Management · National Bonds" }];
}

export default function VendorManagement() {
  return (
    <RequireAuth role="sm">
      <VendorScreen />
    </RequireAuth>
  );
}

function VendorScreen() {
  const { state, listQuery, setListQuery, approveVendor, rejectVendor, blockVendor, unblockVendor, cancelInvite, resendInvite, remindVendor } = usePortal();
  const [params, setParams] = useSearchParams();
  const tab = (params.get("tab") as Tab) || "active";
  const focus = params.get("focus");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [selected, setSelected] = useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(focus);
  const [confirm, setConfirm] = useState<
    | { type: "approve" | "block" | "unblock" | "cancel" | "resend" | "remind"; vendor: Vendor }
    | { type: "reject"; vendor: Vendor; reason: string }
    | null
  >(null);
  const [toast, setToast] = useState("");

  const activePool = state.vendors.filter((vendor) => vendor.status === "Active" || vendor.status === "Blocked");
  const processPool = state.vendors.filter((vendor) => vendor.status !== "Active" && vendor.status !== "Blocked");
  const categories = ["All Categories", ...new Set(activePool.map((vendor) => vendor.category).filter(Boolean))];
  const query = listQuery.trim().toLowerCase();

  const activeRows = activePool.filter((vendor) => {
    if (category !== "All Categories" && vendor.category !== category) return false;
    return matches(vendor, query);
  });
  const processRows = processPool
    .filter((vendor) => (status === "All Status" ? true : vendor.status === status))
    .filter((vendor) => matches(vendor, query))
    .sort((a, b) => +new Date(b.eventAt) - +new Date(a.eventAt));

  const rows = tab === "active" ? activeRows : processRows;
  const reviewVendor = state.vendors.find((vendor) => vendor.id === reviewId) ?? null;
  const pending = state.vendors.filter((vendor) => vendor.status === "Pending Review").length;
  const activeCount = state.vendors.filter((vendor) => vendor.status === "Active").length;
  const allChecked = rows.length > 0 && rows.every((vendor) => selected.includes(vendor.id));

  function setTab(next: Tab) {
    setParams({ tab: next });
    setReviewId(null);
  }

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 4200);
  }

  function runConfirm() {
    if (!confirm) return;
    const vendor = confirm.vendor;
    if (confirm.type === "approve") {
      const link = approveVendor(vendor.id);
      flash(link ? `Password link sent to ${vendor.loginEmail}. Open the mailbox to set the password.` : "This vendor cannot be approved yet.");
    } else if (confirm.type === "reject") {
      if (!confirm.reason.trim()) return;
      rejectVendor(vendor.id, confirm.reason);
      flash(`Rejection sent to ${vendor.loginEmail}.`);
    } else if (confirm.type === "block") {
      blockVendor(vendor.id);
      flash(`${vendor.companyName} is blocked.`);
    } else if (confirm.type === "unblock") {
      unblockVendor(vendor.id);
      flash(`${vendor.companyName} is active again.`);
    } else if (confirm.type === "cancel") {
      cancelInvite(vendor.id);
      flash(`Invitation cancelled for ${vendor.companyName}.`);
    } else if (confirm.type === "resend") {
      resendInvite(vendor.id);
      flash(`Invitation resent to ${vendor.loginEmail}.`);
    } else if (confirm.type === "remind") {
      remindVendor(vendor.id);
      flash(`More-information email sent to ${vendor.loginEmail}.`);
    }
    setConfirm(null);
    setReviewId(null);
  }

  const kpis = useMemo(
    () => [
      { value: activeCount, label: "Active Vendors", hint: "Approved & live", tone: "text-[#1f8a4c]", icon: "check" as const },
      { value: pending, label: "Pending Review", hint: "Action required", tone: "text-[#c47b12]", icon: "clock" as const },
      { value: 2, label: "Active Surveys", hint: "Pending responses", tone: "text-[#2f6fed]", icon: "file" as const },
      { value: 4, label: "Broadcasts", hint: "Published", tone: "text-[#7a4de0]", icon: "megaphone" as const },
      { value: 0, label: "Survey Responses", hint: "Submitted today", tone: "text-[#0f8f8a]", icon: "file" as const },
    ],
    [activeCount, pending],
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <TopBar active="vendor" />
      <main className="mx-auto max-w-[1280px] px-4 py-6 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-[#17233b]">Vendor Management</h1>
            <div className="mt-1 flex flex-wrap gap-1 text-sm text-[#8b95a8]">
              <button className="text-[#a6853f]" onClick={() => setTab("active")}>Vendor Master</button>
              <span>·</span>
              <button onClick={() => setTab("process")}>Onboarding</button>
              <span>·</span>
              <button onClick={() => setTab("surveys")}>Surveys</button>
              <span>·</span>
              <button onClick={() => setTab("broadcasts")}>Announcements</button>
              <span>·</span>
              <button onClick={() => setTab("broadcasts")}>Broadcasts</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="nb-white" onClick={() => setTab("surveys")}><Icon name="file" className="h-4 w-4" /> Create Survey</button>
            <button className="nb-white" onClick={() => setTab("broadcasts")}><Icon name="megaphone" className="h-4 w-4" /> New Broadcast</button>
            <button className="nb-gold" onClick={() => setInviteOpen(true)}><Icon name="plus" className="h-4 w-4" /> Invite Vendor</button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {kpis.map((item) => (
            <div key={item.label} className="nb-card flex items-start gap-3 px-4 py-3.5">
              <Icon name={item.icon} className={cx("mt-1 h-4 w-4", item.tone)} />
              <div>
                <div className={cx("text-[26px] font-semibold leading-none", item.tone)}>{item.value}</div>
                <div className="mt-1 text-[13px] font-semibold text-[#24324d]">{item.label}</div>
                <div className="text-xs text-[#8b95a8]">{item.hint}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <TabButton on={tab === "active"} onClick={() => setTab("active")} icon="check" label="Active Vendors" />
          <TabButton on={tab === "process"} onClick={() => setTab("process")} icon="clock" label="Vendors Under Process" />
          <TabButton on={tab === "surveys"} onClick={() => setTab("surveys")} icon="file" label="Surveys" count="2" />
          <TabButton on={tab === "broadcasts"} onClick={() => setTab("broadcasts")} icon="megaphone" label="Broadcasts & Announcements" />
        </div>

        {tab === "surveys" && <InfoPanel title="Surveys" lines={["FY2026 Vendor Performance — Active", "Onboarding Satisfaction — Active"]} />}
        {tab === "broadcasts" && (
          <InfoPanel
            title="Broadcasts & Announcements"
            lines={[
              "Portal maintenance window — Published",
              "Updated code of conduct — Published",
              "Holiday payment schedule — Published",
              "New invoice template — Published",
            ]}
          />
        )}

        {(tab === "active" || tab === "process") && (
          <section className="nb-card mt-4 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2f6] px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-[#17233b]">
                  {tab === "active" ? "Active Vendor Master" : "Vendors Under Process"}
                  <span className="ml-2 font-normal text-[#8b95a8]">
                    {tab === "active" ? "All approved & live vendors" : "Pending, more info, invited, rejected"}
                  </span>
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="nb-white px-3 py-1.5 text-xs"
                  onClick={() => exportRows(tab, rows)}
                >
                  <Icon name="download" className="h-3.5 w-3.5" /> Export
                </button>
                <label className="flex items-center gap-2 rounded-lg border border-[#e1e7f0] bg-white px-2.5 py-1.5 text-sm">
                  <Icon name="search" className="h-3.5 w-3.5 text-[#8b95a8]" />
                  <input
                    value={listQuery}
                    onChange={(event) => setListQuery(event.target.value)}
                    placeholder={tab === "active" ? "Search active vendors..." : "Search vendors..."}
                    className="w-40 bg-transparent outline-none"
                  />
                </label>
                {tab === "active" ? (
                  <select className="nb-input w-auto py-1.5" value={category} onChange={(event) => setCategory(event.target.value)}>
                    {categories.map((item) => <option key={item}>{item}</option>)}
                  </select>
                ) : (
                  <select className="nb-input w-auto py-1.5" value={status} onChange={(event) => setStatus(event.target.value)}>
                    {PROCESS_STATUSES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-[#0e1c3a] text-[11px] uppercase tracking-wide text-white">
                  {tab === "active" ? (
                    <tr>
                      <th className="px-3 py-3"><input type="checkbox" checked={allChecked} onChange={() => toggleAll(rows, selected, setSelected)} aria-label="Select all" /></th>
                      <Th>Vendor ID</Th><Th>Company Name</Th><Th>Category</Th><Th>Contact</Th><Th>Rating</Th><Th>OTD %</Th><Th>Since</Th><Th>Status</Th><Th>Actions</Th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-3 py-3"><input type="checkbox" checked={allChecked} onChange={() => toggleAll(rows, selected, setSelected)} aria-label="Select all" /></th>
                      <Th>Vendor ID</Th><Th>Company / Contact</Th><Th>Category</Th><Th>Docs</Th><Th>Ageing</Th><Th>Status</Th><Th>Actions</Th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr><td colSpan={10} className="px-4 py-10 text-center text-[#6d7890]">No vendors match this view.</td></tr>
                  )}
                  {tab === "active" && activeRows.map((vendor) => (
                    <tr key={vendor.id} className={cx("border-b border-[#f0f3f7] hover:bg-[#fafbfd]", focus === vendor.id && "bg-[#fbf6e9]")}>
                      <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(vendor.id)} onChange={() => toggleOne(vendor.id, selected, setSelected)} aria-label={`Select ${vendor.companyName}`} /></td>
                      <td className="px-3 py-3">
                        <div className="font-semibold">{vendor.id}</div>
                        <div className="text-xs text-[#8b95a8]">Since {vendor.sinceLabel}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-[#17233b]">{vendor.companyName}</div>
                        <div className="text-xs text-[#b08a3e]">{vendor.contactEmail}{vendor.phone ? ` · ${vendor.phone}` : ""}</div>
                      </td>
                      <td className="px-3 py-3"><span className="rounded-full bg-[#f4f6f9] px-2 py-1 text-xs">{vendor.category}</span></td>
                      <td className="px-3 py-3">{vendor.contactName}</td>
                      <td className="px-3 py-3 text-[#1f8a4c]">{vendor.rating == null ? "—" : <span className="inline-flex items-center gap-1"><Icon name="star" className="h-3.5 w-3.5" /> {vendor.rating.toFixed(1)}</span>}</td>
                      <td className="px-3 py-3 font-semibold text-[#1f8a4c]">{vendor.otd == null ? "—" : `${vendor.otd}%`}</td>
                      <td className="px-3 py-3">{vendor.sinceLabel || "—"}</td>
                      <td className="px-3 py-3"><StatusPill status={vendor.status} /></td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1.5">
                          <Mini onClick={() => setReviewId(vendor.id)}>Profile</Mini>
                          {vendor.status === "Active" ? (
                            <Mini tone="red" onClick={() => setConfirm({ type: "block", vendor })}><Icon name="ban" className="h-3 w-3" /> Block</Mini>
                          ) : (
                            <Mini onClick={() => setConfirm({ type: "unblock", vendor })}>Unblock</Mini>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tab === "process" && processRows.map((vendor) => (
                    <tr key={vendor.id} className={cx("border-b border-[#f0f3f7] hover:bg-[#fafbfd]", focus === vendor.id && "bg-[#fbf6e9]")}>
                      <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(vendor.id)} onChange={() => toggleOne(vendor.id, selected, setSelected)} aria-label={`Select ${vendor.companyName}`} /></td>
                      <td className="px-3 py-3">
                        <div className="font-semibold">{vendor.id}</div>
                        <div className="text-xs text-[#8b95a8]">{vendor.eventLabel} {formatDate(vendor.eventAt)}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-[#17233b]">{vendor.companyName}</div>
                        <div className="text-xs text-[#b08a3e]">{vendor.loginEmail}</div>
                      </td>
                      <td className="px-3 py-3 text-[#41506a]">{vendor.category || "—"}</td>
                      <td className="px-3 py-3"><Docs label={vendor.docsLabel} /></td>
                      <td className="px-3 py-3">{ageingOf(vendor.eventAt)}</td>
                      <td className="px-3 py-3"><StatusPill status={vendor.status} /></td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <Mini onClick={() => setReviewId(vendor.id)}>Review</Mini>
                          {(vendor.status === "Pending Review" || vendor.status === "More Info Required") && (
                            <>
                              <Mini tone="green" onClick={() => setConfirm({ type: "approve", vendor })}><Icon name="check" className="h-3 w-3" /> Approve</Mini>
                              <Mini tone="red" label="Reject" onClick={() => setConfirm({ type: "reject", vendor, reason: "" })}><Icon name="close" className="h-3 w-3" /></Mini>
                            </>
                          )}
                          {vendor.status === "More Info Required" && (
                            <Mini onClick={() => setConfirm({ type: "remind", vendor })}>Remind</Mini>
                          )}
                          {vendor.status === "Invited" && (
                            <>
                              <Mini onClick={() => setConfirm({ type: "resend", vendor })}>Resend</Mini>
                              <Mini tone="red" onClick={() => setConfirm({ type: "cancel", vendor })}>Cancel</Mini>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selected.length > 0 && <div className="px-4 py-2 text-xs text-[#6d7890]">{selected.length} selected</div>}
          </section>
        )}
      </main>

      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} />}
      {reviewVendor && (
        <ReviewDrawer
          vendor={reviewVendor}
          onClose={() => setReviewId(null)}
          onApprove={() => setConfirm({ type: "approve", vendor: reviewVendor })}
          onReject={() => setConfirm({ type: "reject", vendor: reviewVendor, reason: "" })}
          onResend={() => setConfirm({ type: "resend", vendor: reviewVendor })}
          onCancel={() => setConfirm({ type: "cancel", vendor: reviewVendor })}
          onRemind={() => setConfirm({ type: "remind", vendor: reviewVendor })}
        />
      )}
      {confirm && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#0d1b33]/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold">{titleFor(confirm.type, confirm.vendor)}</h3>
            <p className="mt-2 text-sm leading-6 text-[#5c6b84]">{bodyFor(confirm)}</p>
            {confirm.type === "reject" && (
              <textarea
                className="nb-input mt-3 min-h-24"
                placeholder="Reason the vendor will see in the email"
                value={confirm.reason}
                onChange={(event) => setConfirm({ ...confirm, reason: event.target.value })}
              />
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button className="nb-white" onClick={() => setConfirm(null)}>Cancel</button>
              <button
                className={cx(
                  "inline-flex items-center rounded-[0.7rem] px-4 py-2.5 text-sm font-semibold text-white",
                  confirm.type === "reject" || confirm.type === "block" || confirm.type === "cancel" ? "bg-[#c24141]" : "bg-[#c6a35a]",
                )}
                onClick={runConfirm}
                disabled={confirm.type === "reject" && !confirm.reason.trim()}
              >
                {actionLabel(confirm.type)}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[70] max-w-sm rounded-xl bg-[#10203c] px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function matches(vendor: Vendor, query: string) {
  if (!query) return true;
  return [vendor.id, vendor.companyName, vendor.contactName, vendor.contactEmail, vendor.loginEmail, vendor.category]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function toggleAll(rows: Vendor[], selected: string[], setSelected: (ids: string[]) => void) {
  const ids = rows.map((vendor) => vendor.id);
  const all = ids.every((id) => selected.includes(id));
  setSelected(all ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])]);
}

function toggleOne(id: string, selected: string[], setSelected: (ids: string[]) => void) {
  setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
}

function exportRows(tab: Tab, rows: Vendor[]) {
  const header = tab === "active"
    ? ["Vendor ID", "Company", "Category", "Contact", "Email", "Rating", "OTD", "Since", "Status"]
    : ["Vendor ID", "Company", "Email", "Category", "Docs", "Status"];
  const body = rows.map((vendor) =>
    tab === "active"
      ? [vendor.id, vendor.companyName, vendor.category, vendor.contactName, vendor.contactEmail, vendor.rating ?? "", vendor.otd ?? "", vendor.sinceLabel, vendor.status]
      : [vendor.id, vendor.companyName, vendor.loginEmail, vendor.category, vendor.docsLabel, vendor.status],
  );
  const csv = [header, ...body]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = tab === "active" ? "active-vendors.csv" : "vendors-under-process.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function titleFor(type: string, vendor: Vendor) {
  if (type === "approve") return `Approve ${vendor.companyName}?`;
  if (type === "reject") return `Reject ${vendor.companyName}?`;
  if (type === "block") return `Block ${vendor.companyName}?`;
  if (type === "unblock") return `Unblock ${vendor.companyName}?`;
  if (type === "cancel") return `Cancel the invitation?`;
  if (type === "resend") return `Resend the invitation?`;
  return `Ask ${vendor.companyName} for more information?`;
}

function bodyFor(confirm: { type: string; vendor: Vendor }) {
  if (confirm.type === "approve") {
    return `${confirm.vendor.companyName} moves to Active Vendors. A password setup link is sent to ${confirm.vendor.loginEmail}.`;
  }
  if (confirm.type === "reject") return "The vendor stays under process with status Rejected and receives the reason by mail.";
  if (confirm.type === "block") return "A blocked vendor cannot sign in until you unblock them.";
  if (confirm.type === "unblock") return "The vendor can sign in again with the password they already set.";
  if (confirm.type === "cancel") return "The registration link stops working.";
  if (confirm.type === "resend") return `A new 72-hour link is sent to ${confirm.vendor.loginEmail}.`;
  return `A reminder with the registration link is sent to ${confirm.vendor.loginEmail}.`;
}

function actionLabel(type: string) {
  if (type === "approve") return "Approve and send link";
  if (type === "reject") return "Reject vendor";
  if (type === "block") return "Block vendor";
  if (type === "unblock") return "Unblock";
  if (type === "cancel") return "Cancel invitation";
  if (type === "resend") return "Resend";
  return "Send reminder";
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-3 py-3 font-semibold">{children}</th>;
}

function TabButton({
  on,
  onClick,
  icon,
  label,
  count,
}: {
  on: boolean;
  onClick: () => void;
  icon: "check" | "clock" | "file" | "megaphone";
  label: string;
  count?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold",
        on ? "bg-[#fbf6e9] text-[#8a6d32]" : "text-[#5c6b84] hover:bg-white",
      )}
    >
      <Icon name={icon} className="h-4 w-4" />
      {label}
      {count && <span className="rounded-full bg-[#efe2c2] px-1.5 text-[11px]">{count}</span>}
    </button>
  );
}

function StatusPill({ status }: { status: VendorStatus }) {
  const styles: Record<VendorStatus, string> = {
    Active: "bg-[#e7f6ee] text-[#1c8a4b]",
    Blocked: "bg-[#f1f2f4] text-[#6b7280]",
    "Pending Review": "bg-[#fff3d9] text-[#b7791f]",
    Invited: "bg-[#e8eeff] text-[#3451b2]",
    "More Info Required": "bg-[#fff3d9] text-[#b7791f]",
    Rejected: "bg-[#fde8e8] text-[#c24141]",
    Cancelled: "bg-[#f1f2f4] text-[#6b7280]",
  };
  const label = status === "More Info Required" ? "More Info Req." : status;
  return <span className={cx("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", styles[status])}>{label}</span>;
}

function Docs({ label }: { label: string }) {
  const tone = label === "Complete" ? "text-[#1c8a4b]" : label.includes("Missing") ? "text-[#d14343]" : "text-[#c47b12]";
  const icon = label === "Complete" ? "check" : label === "Pending" ? "clock" : "alert";
  return (
    <span className={cx("inline-flex items-center gap-1 text-xs font-semibold", tone)}>
      <Icon name={icon} className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function Mini({
  children,
  onClick,
  tone = "gold",
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  tone?: "gold" | "green" | "red";
  label?: string;
}) {
  const styles = {
    gold: "border-[#e4d2a4] text-[#8a6d32] hover:bg-[#fbf6e9]",
    green: "border-[#b7e4c7] text-[#1c8a4b] hover:bg-[#f3fbf6]",
    red: "border-[#f3c7c7] text-[#c24141] hover:bg-[#fff6f6]",
  };
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cx("inline-flex items-center gap-1 rounded-lg border bg-white px-2.5 py-1 text-xs font-semibold", styles[tone])}>
      {children}
    </button>
  );
}

function InfoPanel({ title, lines }: { title: string; lines: string[] }) {
  return (
    <section className="nb-card mt-4 p-5">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-[#6d7890]">
        These records match the portal shell. Invite, registration, approval, and vendor login are on the vendor tabs.
      </p>
      <ul className="mt-4 divide-y divide-[#eef2f6]">
        {lines.map((line) => (
          <li key={line} className="py-2.5 text-sm">{line}</li>
        ))}
      </ul>
    </section>
  );
}
