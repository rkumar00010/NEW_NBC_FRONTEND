import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Icon } from "~/components/Icons";
import {
  CATEGORY_CARDS,
  DEFAULT_INVITE_MESSAGE,
  EMAIL_RE,
  nextVendorId,
} from "~/lib/data";
import { cx } from "~/lib/cx";
import { usePortal } from "~/lib/store";

export function InviteModal({ onClose }: { onClose: () => void }) {
  const { state, inviteVendor, resendInvite } = usePortal();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [category, setCategory] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState(DEFAULT_INVITE_MESSAGE);
  const [errors, setErrors] = useState<{ email?: string; company?: string }>({});
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState("");
  const previewId = vendorId ?? nextVendorId(state.vendors);

  function absolute(path: string) {
    return `${window.location.origin}${path}`;
  }

  function send() {
    if (vendorId) {
      const path = resendInvite(vendorId);
      if (path) {
        setLink(absolute(path));
        setNote("Invitation email sent again.");
        setCopied(false);
      }
      return;
    }
    const nextErrors = {
      email: EMAIL_RE.test(email.trim()) ? undefined : "Enter a valid email address.",
      company: company.trim() ? undefined : "Company name is required.",
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.company) return;
    const result = inviteVendor({
      email,
      companyName: company,
      category,
      contactName: contact,
      message,
    });
    setVendorId(result.vendorId);
    setLink(absolute(result.link));
    setNote(`Invitation is in the portal mailbox for ${email.trim()}.`);
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
      setNote("Select the link and copy it.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0d1b33]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="invite-title">
      <div className="max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-2xl bg-[#fbfbfd] shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef3fb] text-[#31548d]">
              <Icon name="mail" />
            </span>
            <h2 id="invite-title" className="text-lg font-semibold">Invite New Vendor</h2>
          </div>
          <button className="grid h-8 w-8 place-items-center rounded-lg text-[#607089] hover:bg-[#f1f4f8]" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="flex px-5">
          {["Fill Details", "Send Invite", "Vendor Registers", "SM Reviews"].map((label, index) => (
            <div
              key={label}
              className={cx(
                "flex flex-1 items-center justify-center gap-2 px-2 py-2.5 text-[12px] font-semibold text-white",
                index === 0 ? "bg-[#101a30]" : "bg-[#243656]",
              )}
              style={{
                clipPath:
                  index === 0
                    ? "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)"
                    : "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)",
                marginLeft: index === 0 ? 0 : -6,
              }}
            >
              <span className={cx("grid h-5 w-5 place-items-center rounded-full text-[10px]", index === 0 ? "bg-[#c6a35a]" : "bg-white/15")}>
                {index + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <Field label="Primary Contact Email" required error={errors.email}>
            <input className="nb-input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="e.g. info@vendorcompany.com" />
          </Field>
          <Field label="Company Name" required error={errors.company}>
            <input className="nb-input" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="e.g. TechStar Solutions Pvt. Ltd." />
          </Field>
          <Field label="Business Category">
            <select className="nb-input" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">— Select Category —</option>
              {CATEGORY_CARDS.map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Contact Person Name">
            <input className="nb-input" value={contact} onChange={(event) => setContact(event.target.value)} placeholder="e.g. John Perera" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Personalised Welcome Message (optional)">
              <textarea className="nb-input min-h-28 resize-y" value={message} onChange={(event) => setMessage(event.target.value)} />
            </Field>
          </div>
        </div>
        {link && vendorId && (
          <div className="px-5 pb-2">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#24324d]">
              <Icon name="key" className="h-4 w-4 text-[#8a6d32]" />
              Generated Registration Link
            </div>
            <div className="flex gap-2">
              <input className="nb-input" readOnly value={link} />
              <button type="button" className="nb-white shrink-0" onClick={copy}>
                <Icon name="copy" className="h-3.5 w-3.5" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-xs text-[#6d7890]">
              Link expires in 72 hours · Vendor ID pre-assigned: {vendorId}
            </p>
            {note && (
              <p className="mt-2 text-sm text-[#1c8a4b]">
                {note}{" "}
                <Link to="/inbox" className="font-semibold text-[#8a6d32] underline">
                  Open mailbox
                </Link>
              </p>
            )}
          </div>
        )}
        <div className="mx-5 mb-4 rounded-xl bg-[#e7f8ee] px-4 py-3 text-sm text-[#1d7a43]">
          <div className="font-semibold">What happens after sending:</div>
          <ol className="mt-2 space-y-1">
            <li>1. System auto-generates Vendor ID ({previewId}) and a secure registration link</li>
            <li>2. Vendor receives the portal link, clicks it, and opens the registration page</li>
            <li>3. Vendor fills details, uploads documents, and submits the form</li>
            <li>4. SM team is notified, then reviews to approve or reject</li>
          </ol>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[#eef2f6] px-5 py-4">
          <button className="nb-white" onClick={onClose}>{link ? "Close" : "Cancel"}</button>
          <button className="nb-gold" onClick={send}>
            <Icon name="send" className="h-4 w-4" />
            {link ? "Resend invitation" : "Send Invitation & Generate Vendor ID"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-[#24324d]">
      {label} {required && <span className="text-[#d14343]">*</span>}
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs font-normal text-[#d14343]">{error}</span>}
    </label>
  );
}
