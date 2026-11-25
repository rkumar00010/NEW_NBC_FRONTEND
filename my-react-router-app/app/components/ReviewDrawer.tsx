import type { ReactNode } from "react";
import { Icon } from "~/components/Icons";
import { formatDate } from "~/lib/data";
import type { Vendor } from "~/lib/types";

export function ReviewDrawer({
  vendor,
  onClose,
  onApprove,
  onReject,
  onResend,
  onCancel,
  onRemind,
}: {
  vendor: Vendor;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onResend: () => void;
  onCancel: () => void;
  onRemind: () => void;
}) {
  const registration = vendor.registration;
  const canDecide = vendor.status === "Pending Review" || vendor.status === "More Info Required";
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0d1b33]/40" role="dialog" aria-modal="true">
      <button className="h-full flex-1 cursor-default" aria-label="Close review" onClick={onClose} />
      <aside className="flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#eef2f6] px-5 py-4">
          <div>
            <div className="text-xs font-semibold text-[#a6853f]">{vendor.id}</div>
            <h2 className="text-lg font-semibold">{vendor.companyName}</h2>
            <p className="text-sm text-[#6d7890]">{vendor.status}</p>
          </div>
          <button className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[#f4f6f9]" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 text-sm">
          <Row label="Contact" value={`${vendor.contactName || "—"} · ${vendor.loginEmail}`} />
          <Row label="Category" value={vendor.category || "—"} />
          <Row label="Documents" value={vendor.docsLabel} />
          <Row label={vendor.eventLabel || "Updated"} value={formatDate(vendor.eventAt)} />
          {vendor.note && <Notice>{vendor.note}</Notice>}
          {vendor.rejectReason && <Notice>Rejected: {vendor.rejectReason}</Notice>}
          {!registration && <p className="text-[#6d7890]">This vendor has not opened the registration form yet.</p>}
          {registration && (
            <>
              <Section title="Primary details">
                <Row label="Registration no." value={registration.registrationNumber || "—"} />
                <Row label="VAT" value={registration.vatNumber || registration.vatRegNo || "—"} />
                <Row label="Address" value={[registration.address, registration.country, registration.postalCode].filter(Boolean).join(", ") || "—"} />
                {registration.contacts.map((contact) => (
                  <p key={contact.id} className="text-[#24324d]">
                    {contact.name} {contact.primary ? "(Primary)" : ""} · {contact.email}
                    {contact.mobile ? ` · ${contact.mobile}` : ""}
                  </p>
                ))}
              </Section>
              <Section title="Business">
                <Row label="Categories" value={registration.categories.join(", ") || "—"} />
                <Row label="Years" value={registration.yearsInBusiness || "—"} />
                <Row label="Employees" value={registration.employees || "—"} />
                <Row label="Turnover (AED)" value={registration.turnover || "—"} />
              </Section>
              <Section title="Licence">
                <Row label="Trade license" value={registration.tradeLicense ? registration.tradeLicenseNumber || "Uploaded" : "Missing"} />
                <Row label="VAT certificate" value={registration.vatCert ? "Uploaded" : "Missing"} />
                <Row label="Insurance" value={registration.insurance ? "Uploaded" : "Pending"} />
              </Section>
              <Section title="Bank">
                <Row label="Holder" value={registration.accountHolder || "—"} />
                <Row label="Bank" value={[registration.bankName, registration.branch].filter(Boolean).join(", ") || "—"} />
                <Row label="Account" value={mask(registration.accountNumber)} />
                <p className="text-xs text-[#8b95a8]">Finance reviews bank details after submission.</p>
              </Section>
              <Section title="Pre-qualification">
                <Row label="QMS" value={registration.qms || "—"} />
                <Row label="Lead time" value={registration.leadTime || "—"} />
                <Row label="ESG" value={registration.esg || "—"} />
                <p className="text-[#24324d]">{registration.dispute || "No dispute note."}</p>
              </Section>
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-[#eef2f6] px-5 py-4">
          {canDecide && (
            <>
              <button className="nb-gold" onClick={onApprove}>Approve</button>
              <button className="nb-white text-[#c24141]" onClick={onReject}>Reject</button>
            </>
          )}
          {vendor.status === "More Info Required" && (
            <button className="nb-white" onClick={onRemind}>Remind</button>
          )}
          {vendor.status === "Pending Review" && (
            <button className="nb-white" onClick={onRemind}>Request info</button>
          )}
          {vendor.status === "Invited" && (
            <>
              <button className="nb-gold" onClick={onResend}>Resend</button>
              <button className="nb-white text-[#c24141]" onClick={onCancel}>Cancel invite</button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function mask(value: string) {
  if (!value) return "—";
  if (value.length <= 4) return value;
  return `•••• ${value.slice(-4)}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 py-0.5">
      <span className="text-[#8b95a8]">{label}</span>
      <span className="text-right font-medium text-[#1c2740]">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-[#f7f8fb] px-3 py-3">
      <h3 className="mb-1 font-semibold">{title}</h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Notice({ children }: { children: ReactNode }) {
  return <div className="rounded-xl bg-[#fff6e4] px-3 py-2 text-[#8a5a12]">{children}</div>;
}
