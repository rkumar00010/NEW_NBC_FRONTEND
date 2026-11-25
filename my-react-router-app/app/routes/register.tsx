import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Icon, type IconName } from "~/components/Icons";
import { TopBar } from "~/components/TopBar";
import {
  BANKS,
  CATEGORY_CARDS,
  COUNTRIES,
  DEPARTMENTS,
  EMAIL_RE,
  EMPLOYEE_OPTIONS,
  ESG_OPTIONS,
  LEAD_OPTIONS,
  QMS_OPTIONS,
  TURNOVER_OPTIONS,
  YEAR_OPTIONS,
  formatDate,
  uid,
} from "~/lib/data";
import { cx } from "~/lib/cx";
import { usePortal } from "~/lib/store";
import type { Registration, Vendor } from "~/lib/types";

const STEPS = [
  "Primary Details",
  "Business Info",
  "License Details",
  "Bank Details",
  "Pre-Qualification",
  "Review & Submit",
];

export function meta() {
  return [{ title: "Vendor Registration · National Bonds" }];
}

export default function RegisterPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { state, updateRegistration, addContact, removeContact, submitRegistration } = usePortal();
  const vendor = state.vendors.find((item) => item.token === token) ?? null;
  const registration = vendor?.registration ?? null;
  const [step, setStep] = useState(registration?.draftStep || 1);
  const [maxReached, setMaxReached] = useState(registration?.draftStep || 1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);

  if (!vendor || !registration) {
    return (
      <Frame name="Vendor">
        <Message
          title="This registration link is not valid"
          text="Ask the SM team to send a new invitation. The link in the portal mailbox is the one that opens this form."
        />
      </Frame>
    );
  }

  const expired = new Date(vendor.tokenExpiresAt).getTime() < Date.now();
  const editable = vendor.status === "Invited" || vendor.status === "More Info Required";
  const person = registration.contacts.find((contact) => contact.primary)?.name || vendor.contactName;

  if (editable && expired) {
    return (
      <Frame name={person}>
        <Message
          title="This registration link has expired"
          text="Links last 72 hours. Ask the SM team to resend the invitation from Vendors Under Process."
        />
      </Frame>
    );
  }

  if (!editable) {
    return (
      <Frame name={person}>
        <Done vendor={vendor} />
      </Frame>
    );
  }

  function patch(partial: Partial<Registration>) {
    updateRegistration(vendor!.id, partial);
    setSaved(false);
  }

  function goNext() {
    const found = validate(step, registration!);
    setErrors(found);
    if (Object.keys(found).length) return;
    const next = Math.min(6, step + 1);
    setStep(next);
    setMaxReached((value) => Math.max(value, next));
    updateRegistration(vendor!.id, { draftStep: next });
  }

  function goBack() {
    setErrors({});
    setStep((value) => Math.max(1, value - 1));
  }

  function saveDraft() {
    updateRegistration(vendor!.id, { draftStep: step });
    setSaved(true);
  }

  function submit() {
    for (let index = 1; index <= 5; index += 1) {
      const found = validate(index, registration!);
      if (Object.keys(found).length) {
        setStep(index);
        setErrors(found);
        return;
      }
    }
    submitRegistration(vendor!.id);
  }

  return (
    <Frame name={person}>
      <div className="mx-auto max-w-[1080px] px-4 py-6 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-semibold text-[#17233b]">Vendor Registration & Onboarding</h1>
            <p className="mt-1 text-sm text-[#6d7890]">Complete your vendor profile — {vendor.companyName}</p>
          </div>
          <div className="flex gap-2">
            <button className="nb-white" onClick={saveDraft}>Save Draft</button>
            {step < 6 ? (
              <button className="nb-gold" onClick={goNext}>Next Step →</button>
            ) : (
              <button className="nb-gold" onClick={submit}>Submit Registration</button>
            )}
          </div>
        </div>
        {saved && <p className="mt-2 text-sm text-[#1c8a4b]">Draft saved on this browser.</p>}
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#eadfc4]">
          <div className="h-full bg-[#c6a35a]" style={{ width: `${(step / 6) * 100}%` }} />
        </div>
        {vendor.status === "More Info Required" && (
          <div className="mt-4 rounded-xl bg-[#fff6e4] px-4 py-3 text-sm text-[#8a5a12]">
            {vendor.note || "The SM team asked for an update. Change the form and submit it again."}
          </div>
        )}
        <section className="nb-card mt-5 p-4 sm:p-6">
          <div className="flex gap-2 overflow-x-auto border-b border-[#eef2f6] pb-4">
            {STEPS.map((label, index) => {
              const number = index + 1;
              const done = number < step;
              const current = number === step;
              return (
                <button
                  key={label}
                  type="button"
                  disabled={number > maxReached}
                  onClick={() => {
                    if (number <= maxReached) {
                      setStep(number);
                      setErrors({});
                    }
                  }}
                  className={cx("flex shrink-0 items-center gap-2 rounded-lg px-1 py-1", current && "border-b-2 border-[#c6a35a]")}
                >
                  <span
                    className={cx(
                      "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold",
                      done && "bg-[#e7f6ee] text-[#1f8a4c]",
                      current && "bg-[#c6a35a] text-white",
                      !done && !current && "bg-[#eef1f6] text-[#8b95a8]",
                    )}
                  >
                    {done ? <Icon name="check" className="h-3.5 w-3.5" /> : number}
                  </span>
                  <span className={cx("text-xs font-medium", current ? "text-[#8a6d32]" : done ? "text-[#1f8a4c]" : "text-[#8b95a8]")}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-5">
            {step === 1 && (
              <PrimaryStep
                vendorId={vendor.id}
                registration={registration}
                errors={errors}
                adding={adding}
                onPatch={patch}
                onAdding={setAdding}
                onAdd={(contact) => addContact(vendor.id, contact)}
                onRemove={(contactId) => removeContact(vendor.id, contactId)}
              />
            )}
            {step === 2 && <BusinessStep registration={registration} errors={errors} onPatch={patch} />}
            {step === 3 && <LicenseStep registration={registration} errors={errors} onPatch={patch} />}
            {step === 4 && <BankStep registration={registration} errors={errors} onPatch={patch} />}
            {step === 5 && <PrequalStep registration={registration} errors={errors} onPatch={patch} />}
            {step === 6 && <ReviewStep registration={registration} />}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#eef2f6] pt-4">
            <button className="nb-white" onClick={goBack} disabled={step === 1}>← Previous</button>
            <span className="text-sm text-[#8b95a8]">Step {step} of 6</span>
            {step < 6 ? (
              <button className="nb-gold" onClick={goNext}>Next →</button>
            ) : (
              <button className="nb-gold" onClick={submit}>Submit Registration</button>
            )}
          </div>
        </section>
      </div>
    </Frame>
  );
}

function Frame({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <TopBar mode="register" active="registration" personName={`Vendor ${name}`} />
      {children}
    </div>
  );
}

function Message({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <div className="nb-card p-6">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#5c6b84]">{text}</p>
        <Link to="/inbox" className="nb-gold mt-5">Open mailbox</Link>
      </div>
    </div>
  );
}

function Done({ vendor }: { vendor: Vendor }) {
  const { state } = usePortal();
  const approved = vendor.status === "Active" || vendor.status === "Blocked";
  const rejected = vendor.status === "Rejected" || vendor.status === "Cancelled";
  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <div className="nb-card p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#a6853f]">{vendor.id}</p>
        <h1 className="mt-1 text-2xl font-semibold">
          {vendor.status === "Pending Review" && "Registration submitted"}
          {approved && "This vendor is already approved"}
          {rejected && (vendor.status === "Cancelled" ? "Invitation cancelled" : "Registration not approved")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#5c6b84]">
          {vendor.status === "Pending Review" &&
            `${vendor.companyName} is now in Vendors Under Process. The SM Initiator reviews it, then the SM Approver, then Finance checks the bank details.`}
          {approved && `${vendor.companyName} can sign in after the password in the approval email is set.`}
          {vendor.status === "Rejected" && (vendor.rejectReason || "The SM team did not approve this registration.")}
          {vendor.status === "Cancelled" && "The SM team cancelled this invitation."}
        </p>
        {vendor.status === "Pending Review" && (
          <p className="mt-3 text-sm text-[#6d7890]">Submitted {formatDate(vendor.eventAt)} · Documents: {vendor.docsLabel}</p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/inbox" className="nb-white">Open mailbox</Link>
          {state.session?.role === "sm" && (
            <Link to={`/vendor-mgmt?tab=process&focus=${vendor.id}`} className="nb-gold">
              Review in Vendor Management
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function PrimaryStep({
  vendorId,
  registration,
  errors,
  adding,
  onPatch,
  onAdding,
  onAdd,
  onRemove,
}: {
  vendorId: string;
  registration: Registration;
  errors: Record<string, string>;
  adding: boolean;
  onPatch: (partial: Partial<Registration>) => void;
  onAdding: (value: boolean) => void;
  onAdd: (contact: Registration["contacts"][number]) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Company Primary Details</h2>
      <p className="text-sm text-[#6d7890]">Enter your company’s core information and contact details</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Company Name" required error={errors.companyName}>
          <input className="nb-input" value={registration.companyName} onChange={(event) => onPatch({ companyName: event.target.value })} />
        </Field>
        <Field label="Vendor ID">
          <input className="nb-input" value={vendorId} readOnly />
        </Field>
        <Field label="Registration Number" required error={errors.registrationNumber}>
          <input className="nb-input" placeholder="e.g. PV 123456" value={registration.registrationNumber} onChange={(event) => onPatch({ registrationNumber: event.target.value })} />
        </Field>
        <Field label="VAT Registration No.">
          <input className="nb-input" placeholder="e.g. 134567890-7000" value={registration.vatNumber} onChange={(event) => onPatch({ vatNumber: event.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Registered Address" required error={errors.address}>
            <input className="nb-input" placeholder="Street, City, Province" value={registration.address} onChange={(event) => onPatch({ address: event.target.value })} />
          </Field>
        </div>
        <Field label="Country" required error={errors.country}>
          <select className="nb-input" value={registration.country} onChange={(event) => onPatch({ country: event.target.value })}>
            {COUNTRIES.map((country) => <option key={country}>{country}</option>)}
          </select>
        </Field>
        <Field label="Postal Code">
          <input className="nb-input" placeholder="e.g. 10100" value={registration.postalCode} onChange={(event) => onPatch({ postalCode: event.target.value })} />
        </Field>
      </div>
      <h3 className="mt-6 text-sm font-semibold">Contact Persons</h3>
      {errors.contacts && <p className="mt-1 text-xs text-[#d14343]">{errors.contacts}</p>}
      <div className="mt-2 space-y-2">
        {registration.contacts.map((contact) => (
          <div key={contact.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#f4f7ff] px-3 py-2.5">
            <div>
              <div className="text-sm font-semibold">{contact.name}{contact.primary ? " (Primary)" : contact.department ? ` (${contact.department})` : ""}</div>
              <div className="text-xs text-[#6d7890]">{contact.designation}</div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#2f6fed]">{contact.email}</span>
              <span className="text-[#6d7890]">{contact.mobile}</span>
              {contact.primary && <span className="rounded-full bg-[#e7f6ee] px-2 py-0.5 font-semibold text-[#1c8a4b]">Primary</span>}
              <button className="font-semibold text-[#c24141]" onClick={() => onRemove(contact.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      {!adding ? (
        <button className="mt-3 text-sm font-semibold text-[#c6a35a]" onClick={() => onAdding(true)}>+ Add Contact Person</button>
      ) : (
        <AddContact onCancel={() => onAdding(false)} onSave={(contact) => { onAdd(contact); onAdding(false); }} />
      )}
    </div>
  );
}

function AddContact({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (contact: Registration["contacts"][number]) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    designation: "",
    email: "",
    mobile: "",
    department: "",
    primary: "No",
  });
  const [error, setError] = useState("");

  function save() {
    if (!form.name.trim() || !EMAIL_RE.test(form.email.trim()) || !form.mobile.trim()) {
      setError("Full name, a valid email, and mobile are required.");
      return;
    }
    onSave({
      id: uid("c"),
      name: form.name.trim(),
      designation: form.designation.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      department: form.department,
      primary: form.primary === "Yes",
    });
  }

  return (
    <div className="mt-3 rounded-2xl border border-[#e6ebf2] bg-[#f8f9fc] p-4">
      <h4 className="font-semibold">New Contact Person</h4>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Full Name" required>
          <input className="nb-input" placeholder="e.g. Kamal Perera" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </Field>
        <Field label="Designation">
          <input className="nb-input" placeholder="e.g. Finance Manager" value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} />
        </Field>
        <Field label="Email" required>
          <input className="nb-input" placeholder="e.g. kamal@company.lk" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </Field>
        <Field label="Mobile" required>
          <input className="nb-input" placeholder="+94 7X XXX XXXX" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
        </Field>
        <Field label="Role / Department">
          <select className="nb-input" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })}>
            <option value="">— Select —</option>
            {DEPARTMENTS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Set as Primary Contact">
          <select className="nb-input" value={form.primary} onChange={(event) => setForm({ ...form, primary: event.target.value })}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </Field>
      </div>
      <p className="mt-3 rounded-lg bg-[#eaf2ff] px-3 py-2 text-xs text-[#31548d]">
        Adding a contact will send an email notification to the SM team for approval.
      </p>
      {error && <p className="mt-2 text-xs text-[#d14343]">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button className="nb-white" onClick={onCancel}>Cancel</button>
        <button className="nb-gold" onClick={save}>Save & Add Contact</button>
      </div>
    </div>
  );
}

function BusinessStep({
  registration,
  errors,
  onPatch,
}: {
  registration: Registration;
  errors: Record<string, string>;
  onPatch: (partial: Partial<Registration>) => void;
}) {
  function toggle(name: string) {
    const has = registration.categories.includes(name);
    if (has) {
      onPatch({ categories: registration.categories.filter((item) => item !== name) });
      return;
    }
    if (registration.categories.length >= 3) return;
    onPatch({ categories: [...registration.categories, name] });
  }
  return (
    <div>
      <h2 className="text-lg font-semibold">Business Information</h2>
      <p className="text-sm text-[#6d7890]">Select up to 3 categories that describe your business</p>
      {errors.categories && <p className="mt-2 text-xs text-[#d14343]">{errors.categories}</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {CATEGORY_CARDS.map((card) => {
          const selected = registration.categories.includes(card.name);
          return (
            <button
              key={card.name}
              type="button"
              onClick={() => toggle(card.name)}
              className={cx(
                "rounded-xl border px-3 py-4 text-sm font-semibold",
                selected ? "border-[#e4d3a1] bg-[#fbf6e9] text-[#6e5520]" : "border-[#e6ebf2] bg-white text-[#24324d]",
              )}
            >
              <Icon name={card.icon as IconName} className="mx-auto mb-2 h-5 w-5" />
              {card.name}
            </button>
          );
        })}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Years in Business" required error={errors.yearsInBusiness}>
          <select className="nb-input" value={registration.yearsInBusiness} onChange={(event) => onPatch({ yearsInBusiness: event.target.value })}>
            <option value="">Select</option>
            {YEAR_OPTIONS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Number of Employees" required error={errors.employees}>
          <select className="nb-input" value={registration.employees} onChange={(event) => onPatch({ employees: event.target.value })}>
            <option value="">Select</option>
            {EMPLOYEE_OPTIONS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Annual Turnover (AED)" required error={errors.turnover}>
          <select className="nb-input" value={registration.turnover} onChange={(event) => onPatch({ turnover: event.target.value })}>
            <option value="">Select</option>
            {TURNOVER_OPTIONS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Website">
          <input className="nb-input" placeholder="https://www.yourcompany.lk" value={registration.website} onChange={(event) => onPatch({ website: event.target.value })} />
        </Field>
      </div>
    </div>
  );
}

function LicenseStep({
  registration,
  errors,
  onPatch,
}: {
  registration: Registration;
  errors: Record<string, string>;
  onPatch: (partial: Partial<Registration>) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">License & Certification Details</h2>
      <p className="text-sm text-[#6d7890]">Upload all required documents. Trade license is mandatory.</p>
      <div className="mt-4 space-y-2">
        <UploadRow title="Trade License" hint="REQUIRED · Must be valid" required uploaded={registration.tradeLicense} onToggle={() => onPatch({ tradeLicense: !registration.tradeLicense })} error={errors.tradeLicense} />
        <UploadRow title="VAT Certificate" hint="REQUIRED if VAT registered" uploaded={registration.vatCert} onToggle={() => onPatch({ vatCert: !registration.vatCert })} />
        <UploadRow title="Insurance Certificate" hint="PDF · Max 5MB" uploaded={registration.insurance} onToggle={() => onPatch({ insurance: !registration.insurance })} />
        <UploadRow title="ISO / Quality Certifications" hint="PDF/JPG · Optional" uploaded={registration.iso} onToggle={() => onPatch({ iso: !registration.iso })} />
      </div>
      <h3 className="mt-6 text-sm font-semibold">Registration & Membership Details</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <Field label="Trade License Number" required error={errors.tradeLicenseNumber}>
          <input className="nb-input" placeholder="e.g. TL-2024-XXXX" value={registration.tradeLicenseNumber} onChange={(event) => onPatch({ tradeLicenseNumber: event.target.value })} />
        </Field>
        <Field label="Trade License Expiry" required error={errors.tradeLicenseExpiry}>
          <input className="nb-input" type="date" value={registration.tradeLicenseExpiry} onChange={(event) => onPatch({ tradeLicenseExpiry: event.target.value })} />
        </Field>
        <Field label="Trade Licence Registration Date" required error={errors.tradeLicenseDate}>
          <input className="nb-input" type="date" value={registration.tradeLicenseDate} onChange={(event) => onPatch({ tradeLicenseDate: event.target.value })} />
        </Field>
        <Field label="VAT Registration No.">
          <input className="nb-input" placeholder="e.g. 100234567890008" value={registration.vatRegNo} onChange={(event) => onPatch({ vatRegNo: event.target.value })} />
        </Field>
        <Field label="VAT Registration Date">
          <input className="nb-input" type="date" value={registration.vatRegDate} onChange={(event) => onPatch({ vatRegDate: event.target.value })} />
        </Field>
        <Field label="Membership Registration No.">
          <input className="nb-input" placeholder="e.g. MEM-2024-00123" value={registration.membershipNo} onChange={(event) => onPatch({ membershipNo: event.target.value })} />
        </Field>
        <Field label="Membership Registration Date">
          <input className="nb-input" type="date" value={registration.membershipDate} onChange={(event) => onPatch({ membershipDate: event.target.value })} />
        </Field>
        <Field label="Membership Registration Expiry Date">
          <input className="nb-input" type="date" value={registration.membershipExpiry} onChange={(event) => onPatch({ membershipExpiry: event.target.value })} />
        </Field>
      </div>
    </div>
  );
}

function BankStep({
  registration,
  errors,
  onPatch,
}: {
  registration: Registration;
  errors: Record<string, string>;
  onPatch: (partial: Partial<Registration>) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Bank Account Details</h2>
      <p className="text-sm text-[#6d7890]">These details will be reviewed and approved by the Finance team separately.</p>
      <div className="mt-3 rounded-xl bg-[#fff8ea] px-4 py-3 text-sm text-[#8a5a12]">
        Security Notice: Bank detail changes require Finance team approval and a 48-hour verification period.
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Account Holder Name" required error={errors.accountHolder}>
            <input className="nb-input" value={registration.accountHolder} onChange={(event) => onPatch({ accountHolder: event.target.value })} />
          </Field>
        </div>
        <Field label="Bank Name" required error={errors.bankName}>
          <select className="nb-input" value={registration.bankName} onChange={(event) => onPatch({ bankName: event.target.value })}>
            <option value="">Select bank</option>
            {BANKS.map((bank) => <option key={bank}>{bank}</option>)}
          </select>
        </Field>
        <Field label="Branch">
          <input className="nb-input" placeholder="e.g. Colombo City Branch" value={registration.branch} onChange={(event) => onPatch({ branch: event.target.value })} />
        </Field>
        <Field label="Account Number" required error={errors.accountNumber}>
          <input className="nb-input" placeholder="e.g. 1234-5678-9012" value={registration.accountNumber} onChange={(event) => onPatch({ accountNumber: event.target.value })} />
        </Field>
        <Field label="SWIFT / BIC Code">
          <input className="nb-input" placeholder="e.g. CCEYLKLX" value={registration.swift} onChange={(event) => onPatch({ swift: event.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Supporting Document (Cancelled Cheque / Bank Letter)">
            <button type="button" className="nb-white" onClick={() => onPatch({ bankDoc: !registration.bankDoc })}>
              <Icon name="upload" className="h-4 w-4" />
              {registration.bankDoc ? "Uploaded — remove" : "Upload Document"}
            </button>
          </Field>
        </div>
      </div>
    </div>
  );
}

function PrequalStep({
  registration,
  errors,
  onPatch,
}: {
  registration: Registration;
  errors: Record<string, string>;
  onPatch: (partial: Partial<Registration>) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Pre-Qualification Questionnaire</h2>
      <p className="text-sm text-[#6d7890]">Annual assessment. Responses are reviewed and rated by the SM team.</p>
      <div className="mt-3 rounded-xl bg-[#eef4ff] px-4 py-3 text-sm text-[#31548d]">
        First assessment — your answers are reviewed with the registration.
      </div>
      <Question n={1} text="Does your company have a formal Quality Management System (QMS) in place?" options={QMS_OPTIONS} value={registration.qms} error={errors.qms} onChange={(qms) => onPatch({ qms })} />
      <Question n={2} text="What is your average order fulfilment lead time for standard items?" options={LEAD_OPTIONS} value={registration.leadTime} error={errors.leadTime} onChange={(leadTime) => onPatch({ leadTime })} />
      <Question n={3} text="Does your company maintain any Environmental, Social and Governance (ESG) policies?" options={ESG_OPTIONS} value={registration.esg} error={errors.esg} onChange={(esg) => onPatch({ esg })} />
      <div className="mt-5">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#0e1c3a] text-xs text-white">4</span>
          Describe your dispute resolution process for procurement disagreements
        </div>
        <textarea className="nb-input min-h-28" placeholder="Please describe your company’s process." value={registration.dispute} onChange={(event) => onPatch({ dispute: event.target.value })} />
        {errors.dispute && <p className="mt-1 text-xs text-[#d14343]">{errors.dispute}</p>}
      </div>
    </div>
  );
}

function ReviewStep({ registration }: { registration: Registration }) {
  const answered = [registration.qms, registration.leadTime, registration.esg, registration.dispute.trim()].filter(Boolean).length;
  const primaryOk = Boolean(registration.companyName && registration.registrationNumber && registration.address && registration.contacts.length);
  const businessOk = Boolean(registration.categories.length && registration.yearsInBusiness && registration.employees && registration.turnover);
  const license = !registration.tradeLicense
    ? { tone: "bad" as const, text: "Trade license missing" }
    : !registration.insurance
      ? { tone: "warn" as const, text: "Insurance pending" }
      : { tone: "ok" as const, text: "Complete" };
  const bank = registration.accountHolder && registration.bankName && registration.accountNumber
    ? { tone: "warn" as const, text: "Pending Finance" }
    : { tone: "bad" as const, text: "Incomplete" };
  return (
    <div>
      <h2 className="text-lg font-semibold">Review & Submit</h2>
      <p className="text-sm text-[#6d7890]">Please review all sections before final submission</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ReviewCard title="Primary Details" text={primaryOk ? "Complete" : "Incomplete"} tone={primaryOk ? "ok" : "bad"} />
        <ReviewCard title="Business Info" text={businessOk ? "Complete" : "Incomplete"} tone={businessOk ? "ok" : "bad"} />
        <ReviewCard title="License Details" text={license.text} tone={license.tone} />
        <ReviewCard title="Bank Details" text={bank.text} tone={bank.tone} />
        <ReviewCard title="Pre-Qualification" text={`${answered}/4 answered`} tone={answered === 4 ? "ok" : "warn"} />
        <ReviewCard title="Questionnaire" text={answered === 4 ? "Complete" : "Incomplete"} tone={answered === 4 ? "ok" : "bad"} />
      </div>
      <div className="mt-4 rounded-xl bg-[#0e1c3a] px-4 py-3 text-sm text-white">
        <span className="font-semibold">Submission Workflow:</span> Your registration will be reviewed by the SM Initiator → SM Approver → Finance (Bank Details). You will receive email notifications at each stage.
      </div>
    </div>
  );
}

function ReviewCard({ title, text, tone }: { title: string; text: string; tone: "ok" | "warn" | "bad" }) {
  const styles = {
    ok: "border-[#d7f0e2] bg-[#f3fbf6]",
    warn: "border-[#f3e2b8] bg-[#fff8ea]",
    bad: "border-[#f6d4d4] bg-[#fff5f5]",
  };
  return (
    <div className={cx("rounded-xl border px-4 py-3", styles[tone])}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon name={tone === "ok" ? "check" : "alert"} className="h-4 w-4" />
        {title}
      </div>
      <div className="mt-1 text-xs text-[#5c6b84]">{text}</div>
    </div>
  );
}

function Question({
  n,
  text,
  options,
  value,
  error,
  onChange,
}: {
  n: number;
  text: string;
  options: readonly string[];
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#0e1c3a] text-xs text-white">{n}</span>
        {text}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cx(
              "rounded-xl border px-3 py-3 text-left text-sm",
              value === option ? "border-[#e4d3a1] bg-[#fbf6e9] font-semibold text-[#6e5520]" : "border-[#e6ebf2] bg-white",
            )}
          >
            {option}
          </button>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-[#d14343]">{error}</p>}
    </div>
  );
}

function UploadRow({
  title,
  hint,
  required,
  uploaded,
  onToggle,
  error,
}: {
  title: string;
  hint: string;
  required?: boolean;
  uploaded: boolean;
  onToggle: () => void;
  error?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e6ebf2] px-3 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f4f7fb] text-[#5c6b84]">
            <Icon name="file" />
          </span>
          <div>
            <div className="text-sm font-semibold">{title} {required && <span className="text-[#d14343]">*</span>}</div>
            <div className="text-xs text-[#8b95a8]">{uploaded ? "Uploaded" : hint}</div>
          </div>
        </div>
        <button type="button" className={uploaded ? "text-sm font-semibold text-[#1c8a4b]" : "nb-gold px-3 py-1.5 text-xs"} onClick={onToggle}>
          {uploaded ? "Uploaded · Replace" : "Upload"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-[#d14343]">{error}</p>}
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
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-[#24324d]">
      {label} {required && <span className="text-[#d14343]">*</span>}
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs font-normal text-[#d14343]">{error}</span>}
    </label>
  );
}

function validate(step: number, registration: Registration) {
  const errors: Record<string, string> = {};
  if (step === 1) {
    if (!registration.companyName.trim()) errors.companyName = "Company name is required.";
    if (!registration.registrationNumber.trim()) errors.registrationNumber = "Registration number is required.";
    if (!registration.address.trim()) errors.address = "Registered address is required.";
    if (!registration.country) errors.country = "Country is required.";
    if (!registration.contacts.length || registration.contacts.some((contact) => !contact.name.trim() || !EMAIL_RE.test(contact.email))) {
      errors.contacts = "Add a contact with a name and a valid email.";
    }
  }
  if (step === 2) {
    if (!registration.categories.length) errors.categories = "Select at least one category.";
    if (registration.categories.length > 3) errors.categories = "Select up to 3 categories.";
    if (!registration.yearsInBusiness) errors.yearsInBusiness = "Select years in business.";
    if (!registration.employees) errors.employees = "Select the number of employees.";
    if (!registration.turnover) errors.turnover = "Select annual turnover.";
  }
  if (step === 3) {
    if (!registration.tradeLicense) errors.tradeLicense = "Upload the trade license.";
    if (!registration.tradeLicenseNumber.trim()) errors.tradeLicenseNumber = "Trade license number is required.";
    if (!registration.tradeLicenseExpiry) errors.tradeLicenseExpiry = "Expiry date is required.";
    if (!registration.tradeLicenseDate) errors.tradeLicenseDate = "Registration date is required.";
  }
  if (step === 4) {
    if (!registration.accountHolder.trim()) errors.accountHolder = "Account holder name is required.";
    if (!registration.bankName) errors.bankName = "Select a bank.";
    if (!registration.accountNumber.trim()) errors.accountNumber = "Account number is required.";
  }
  if (step === 5) {
    if (!registration.qms) errors.qms = "Select an answer.";
    if (!registration.leadTime) errors.leadTime = "Select an answer.";
    if (!registration.esg) errors.esg = "Select an answer.";
    if (!registration.dispute.trim()) errors.dispute = "Describe the dispute process.";
  }
  return errors;
}
