import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  SM_ACCOUNT,
  blankRegistration,
  createSeedVendors,
  docsLabel,
  hoursFromNow,
  makeToken,
  monthLabel,
  nextVendorId,
  passwordError,
  uid,
} from "./data";
import type {
  Contact,
  InviteInput,
  Mail,
  PortalState,
  Registration,
  Vendor,
} from "./types";

const STORAGE_KEY = "nb-vendor-portal-v1";

type PortalContextValue = {
  state: PortalState;
  listQuery: string;
  setListQuery: (query: string) => void;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  inviteVendor: (input: InviteInput) => { vendorId: string; link: string };
  updateRegistration: (vendorId: string, patch: Partial<Registration>) => void;
  addContact: (vendorId: string, contact: Contact) => void;
  removeContact: (vendorId: string, contactId: string) => void;
  submitRegistration: (vendorId: string) => void;
  approveVendor: (vendorId: string) => string | null;
  rejectVendor: (vendorId: string, reason: string) => void;
  blockVendor: (vendorId: string) => void;
  unblockVendor: (vendorId: string) => void;
  cancelInvite: (vendorId: string) => void;
  resendInvite: (vendorId: string) => string | null;
  remindVendor: (vendorId: string) => string | null;
  setPassword: (token: string, password: string, confirm: string) => {
    error: string | null;
    email: string | null;
  };
  markMailRead: (mailId: string) => void;
  resetDemo: () => void;
};

const PortalContext = createContext<PortalContextValue | null>(null);

function createSeed(): PortalState {
  return { session: null, vendors: createSeedVendors(), mails: [] };
}

function loadState(): PortalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeed();
    const parsed = JSON.parse(raw) as PortalState;
    if (!parsed || !Array.isArray(parsed.vendors) || !Array.isArray(parsed.mails)) {
      return createSeed();
    }
    return {
      session: parsed.session ?? null,
      vendors: parsed.vendors,
      mails: parsed.mails,
    };
  } catch {
    return createSeed();
  }
}

function createMail(
  partial: Omit<Mail, "id" | "createdAt" | "read" | "fromName"> & { fromName?: string },
): Mail {
  return {
    id: uid("m"),
    createdAt: new Date().toISOString(),
    read: false,
    fromName: "National Bonds Vendor Portal",
    ...partial,
  };
}

function messageLines(message: string, extra: string[]) {
  const lines = message
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  return [...lines, ...extra];
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PortalState>(loadState);
  const [listQuery, setListQuery] = useState("");
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function commit(next: PortalState) {
    stateRef.current = next;
    setState(next);
  }

  function patchVendor(vendorId: string, recipe: (vendor: Vendor) => Vendor) {
    const current = stateRef.current;
    commit({
      ...current,
      vendors: current.vendors.map((vendor) =>
        vendor.id === vendorId ? recipe(vendor) : vendor,
      ),
    });
  }

  const api = useMemo<PortalContextValue>(() => {
    return {
      state,
      listQuery,
      setListQuery,
      login(email, password) {
        const current = stateRef.current;
        const normalised = email.trim().toLowerCase();
        if (
          normalised === SM_ACCOUNT.email &&
          password === SM_ACCOUNT.password
        ) {
          commit({
            ...current,
            session: {
              role: "sm",
              email: SM_ACCOUNT.email,
              name: SM_ACCOUNT.name,
            },
          });
          return null;
        }
        const vendor = current.vendors.find(
          (item) =>
            item.loginEmail.toLowerCase() === normalised ||
            item.contactEmail.toLowerCase() === normalised,
        );
        if (!vendor) return "No account found for this email.";
        if (vendor.status === "Rejected" || vendor.status === "Cancelled") {
          return "This vendor registration was not approved.";
        }
        if (vendor.status === "Blocked") {
          return "This vendor is blocked. Contact the SM team.";
        }
        if (!vendor.password) {
          if (vendor.status === "Active") {
            return "Open the password email and set a password before signing in.";
          }
          return "This vendor is not active yet. Finish registration and wait for SM approval.";
        }
        if (vendor.password !== password) return "Incorrect password.";
        commit({
          ...current,
          session: {
            role: "vendor",
            email: vendor.loginEmail,
            name: vendor.contactName || vendor.companyName,
            vendorId: vendor.id,
          },
        });
        return null;
      },
      logout() {
        commit({ ...stateRef.current, session: null });
      },
      inviteVendor(input) {
        const current = stateRef.current;
        const id = nextVendorId(current.vendors);
        const token = makeToken(id);
        const email = input.email.trim();
        const companyName = input.companyName.trim();
        const contactName = input.contactName.trim() || companyName;
        const vendor: Vendor = {
          id,
          companyName,
          category: input.category,
          contactName,
          contactEmail: email,
          loginEmail: email,
          phone: "",
          rating: null,
          otd: null,
          sinceLabel: "",
          status: "Invited",
          docsLabel: "Pending",
          eventAt: new Date().toISOString(),
          eventLabel: "Invited",
          token,
          tokenExpiresAt: hoursFromNow(72),
          resetToken: null,
          password: null,
          welcomeMessage: input.message.trim(),
          rejectReason: "",
          note: "",
          registration: blankRegistration({
            companyName,
            categories: input.category ? [input.category] : [],
            contacts: [
              {
                id: uid("c"),
                name: contactName,
                designation: "Primary contact",
                email,
                mobile: "",
                department: "Management",
                primary: true,
              },
            ],
          }),
        };
        const link = `/register?token=${token}`;
        const mail = createMail({
          to: email,
          toName: contactName,
          subject: "You're invited to the National Bonds Vendor Portal",
          paragraphs: messageLines(input.message, [
            `Company: ${companyName}`,
            `Vendor ID: ${id}`,
            "This registration link expires in 72 hours.",
          ]),
          link,
          linkLabel: "Complete registration",
        });
        commit({
          ...current,
          vendors: [vendor, ...current.vendors],
          mails: [mail, ...current.mails],
        });
        return { vendorId: id, link };
      },
      updateRegistration(vendorId, patch) {
        patchVendor(vendorId, (vendor) => {
          if (!vendor.registration) return vendor;
          const registration = { ...vendor.registration, ...patch };
          return {
            ...vendor,
            companyName: registration.companyName || vendor.companyName,
            category: registration.categories[0] || vendor.category,
            registration,
          };
        });
      },
      addContact(vendorId, contact) {
        const current = stateRef.current;
        const vendor = current.vendors.find((item) => item.id === vendorId);
        if (!vendor?.registration) return;
        const contacts = vendor.registration.contacts.map((item) => ({
          ...item,
          primary: contact.primary ? false : item.primary,
        }));
        let nextContacts =
          contacts.length === 0 ? [{ ...contact, primary: true }] : [...contacts, contact];
        if (!nextContacts.some((item) => item.primary)) {
          nextContacts = nextContacts.map((item, index) => ({ ...item, primary: index === 0 }));
        }
        const registration = { ...vendor.registration, contacts: nextContacts };
        const mail = createMail({
          to: SM_ACCOUNT.email,
          toName: SM_ACCOUNT.name,
          subject: `New contact added for ${vendor.companyName}`,
          paragraphs: [
            `${contact.name} (${contact.email}) was added on ${vendor.companyName}.`,
            contact.department
              ? `Department: ${contact.department}.`
              : "The contact is included on the registration for SM review.",
            "Adding a contact notifies the SM team.",
          ],
          link: `/vendor-mgmt?tab=process&focus=${vendor.id}`,
          linkLabel: "Open vendor",
        });
        commit({
          ...current,
          vendors: current.vendors.map((item) =>
            item.id === vendorId ? { ...item, registration } : item,
          ),
          mails: [mail, ...current.mails],
        });
      },
      removeContact(vendorId, contactId) {
        patchVendor(vendorId, (vendor) => {
          if (!vendor.registration) return vendor;
          let contacts = vendor.registration.contacts.filter((item) => item.id !== contactId);
          if (contacts.length && !contacts.some((item) => item.primary)) {
            contacts = contacts.map((item, index) => ({ ...item, primary: index === 0 }));
          }
          return {
            ...vendor,
            registration: { ...vendor.registration, contacts },
          };
        });
      },
      submitRegistration(vendorId) {
        const current = stateRef.current;
        const vendor = current.vendors.find((item) => item.id === vendorId);
        if (!vendor?.registration) return;
        const registration = vendor.registration;
        const primary =
          registration.contacts.find((item) => item.primary) ?? registration.contacts[0];
        const submitted: Vendor = {
          ...vendor,
          status: "Pending Review",
          companyName: registration.companyName || vendor.companyName,
          category: registration.categories[0] || vendor.category,
          contactName: primary?.name || vendor.contactName,
          phone: primary?.mobile || vendor.phone,
          docsLabel: docsLabel(registration),
          eventAt: new Date().toISOString(),
          eventLabel: "Submitted",
          registration: { ...registration, draftStep: 6 },
        };
        const vendorMail = createMail({
          to: vendor.loginEmail,
          toName: submitted.contactName,
          subject: `We received ${submitted.companyName}'s registration`,
          paragraphs: [
            `Dear ${submitted.contactName},`,
            `Vendor ID ${vendor.id} has been submitted for review.`,
            "The path is SM Initiator, then SM Approver, then Finance for the bank details.",
            "You will receive an email when a decision is made.",
          ],
        });
        const smMail = createMail({
          to: SM_ACCOUNT.email,
          toName: SM_ACCOUNT.name,
          subject: `${submitted.companyName} submitted registration`,
          paragraphs: [
            `${submitted.companyName} (${vendor.id}) is waiting in Vendors Under Process.`,
            `Documents: ${submitted.docsLabel}.`,
            "Review the form, then approve or reject the vendor.",
          ],
          link: `/vendor-mgmt?tab=process&focus=${vendor.id}`,
          linkLabel: "Review vendor",
        });
        commit({
          ...current,
          vendors: current.vendors.map((item) => (item.id === vendorId ? submitted : item)),
          mails: [smMail, vendorMail, ...current.mails],
        });
      },
      approveVendor(vendorId) {
        const current = stateRef.current;
        const vendor = current.vendors.find((item) => item.id === vendorId);
        if (!vendor) return null;
        if (vendor.status !== "Pending Review" && vendor.status !== "More Info Required") {
          return null;
        }
        const resetToken = makeToken(`${vendor.id}-pw`);
        const link = `/reset-password?token=${resetToken}`;
        const approved: Vendor = {
          ...vendor,
          status: "Active",
          sinceLabel: monthLabel(),
          resetToken,
          eventAt: new Date().toISOString(),
          eventLabel: "Approved",
          rejectReason: "",
          note: "",
        };
        const mail = createMail({
          to: vendor.loginEmail,
          toName: vendor.contactName || vendor.companyName,
          subject: `Set your password — ${vendor.companyName} is approved`,
          paragraphs: [
            `Dear ${vendor.contactName || vendor.companyName},`,
            `${vendor.companyName} (${vendor.id}) has been approved on the National Bonds Vendor Portal.`,
            "Set a password with the link below, then sign in with this email address.",
          ],
          link,
          linkLabel: "Set your password",
        });
        commit({
          ...current,
          vendors: current.vendors.map((item) => (item.id === vendorId ? approved : item)),
          mails: [mail, ...current.mails],
        });
        return link;
      },
      rejectVendor(vendorId, reason) {
        const current = stateRef.current;
        const vendor = current.vendors.find((item) => item.id === vendorId);
        if (!vendor) return;
        const rejected: Vendor = {
          ...vendor,
          status: "Rejected",
          rejectReason: reason.trim(),
          eventAt: new Date().toISOString(),
          eventLabel: "Rejected",
          resetToken: null,
        };
        const mail = createMail({
          to: vendor.loginEmail,
          toName: vendor.contactName || vendor.companyName,
          subject: `Registration update for ${vendor.companyName}`,
          paragraphs: [
            `Dear ${vendor.contactName || vendor.companyName},`,
            `The registration for ${vendor.companyName} (${vendor.id}) was not approved.`,
            reason.trim(),
            "Contact the SM team if you need to discuss this decision.",
          ],
        });
        commit({
          ...current,
          vendors: current.vendors.map((item) => (item.id === vendorId ? rejected : item)),
          mails: [mail, ...current.mails],
        });
      },
      blockVendor(vendorId) {
        patchVendor(vendorId, (vendor) => ({ ...vendor, status: "Blocked" }));
      },
      unblockVendor(vendorId) {
        patchVendor(vendorId, (vendor) => ({ ...vendor, status: "Active" }));
      },
      cancelInvite(vendorId) {
        const current = stateRef.current;
        const vendor = current.vendors.find((item) => item.id === vendorId);
        if (!vendor) return;
        const cancelled: Vendor = {
          ...vendor,
          status: "Cancelled",
          eventAt: new Date().toISOString(),
          eventLabel: "Cancelled",
          tokenExpiresAt: new Date().toISOString(),
        };
        const mail = createMail({
          to: vendor.loginEmail,
          toName: vendor.contactName || vendor.companyName,
          subject: `Invitation cancelled for ${vendor.companyName}`,
          paragraphs: [
            `Dear ${vendor.contactName || vendor.companyName},`,
            `The invitation for ${vendor.companyName} (${vendor.id}) has been cancelled.`,
            "The registration link no longer opens the form.",
          ],
        });
        commit({
          ...current,
          vendors: current.vendors.map((item) => (item.id === vendorId ? cancelled : item)),
          mails: [mail, ...current.mails],
        });
      },
      resendInvite(vendorId) {
        const current = stateRef.current;
        const vendor = current.vendors.find((item) => item.id === vendorId);
        if (!vendor) return null;
        const token = makeToken(vendor.id);
        const link = `/register?token=${token}`;
        const refreshed: Vendor = {
          ...vendor,
          status: "Invited",
          token,
          tokenExpiresAt: hoursFromNow(72),
          eventAt: new Date().toISOString(),
          eventLabel: "Invited",
        };
        const mail = createMail({
          to: vendor.loginEmail,
          toName: vendor.contactName || vendor.companyName,
          subject: "Your National Bonds registration link",
          paragraphs: messageLines(
            vendor.welcomeMessage ||
              `Dear ${vendor.contactName},\n\nYou are invited to register on the National Bonds Vendor Portal.`,
            [
              `Company: ${vendor.companyName}`,
              `Vendor ID: ${vendor.id}`,
              "This new link expires in 72 hours.",
            ],
          ),
          link,
          linkLabel: "Complete registration",
        });
        commit({
          ...current,
          vendors: current.vendors.map((item) => (item.id === vendorId ? refreshed : item)),
          mails: [mail, ...current.mails],
        });
        return link;
      },
      remindVendor(vendorId) {
        const current = stateRef.current;
        const vendor = current.vendors.find((item) => item.id === vendorId);
        if (!vendor) return null;
        const token = makeToken(vendor.id);
        const link = `/register?token=${token}`;
        const note =
          vendor.note ||
          "Please update the missing documents and submit the registration again.";
        const reminded: Vendor = {
          ...vendor,
          status: "More Info Required",
          token,
          tokenExpiresAt: hoursFromNow(72),
          eventLabel: "Info requested",
          note,
        };
        const mail = createMail({
          to: vendor.loginEmail,
          toName: vendor.contactName || vendor.companyName,
          subject: `More information needed for ${vendor.companyName}`,
          paragraphs: [
            `Dear ${vendor.contactName || vendor.companyName},`,
            note,
            `Vendor ID: ${vendor.id}`,
            "Update the form and submit it again.",
          ],
          link,
          linkLabel: "Update registration",
        });
        commit({
          ...current,
          vendors: current.vendors.map((item) => (item.id === vendorId ? reminded : item)),
          mails: [mail, ...current.mails],
        });
        return link;
      },
      setPassword(token, password, confirm) {
        const issue = passwordError(password, confirm);
        if (issue) return { error: issue, email: null };
        const current = stateRef.current;
        const vendor = current.vendors.find((item) => item.resetToken === token);
        if (!vendor) {
          return { error: "This password link is invalid or has already been used.", email: null };
        }
        commit({
          ...current,
          vendors: current.vendors.map((item) =>
            item.id === vendor.id ? { ...item, password, resetToken: null } : item,
          ),
        });
        return { error: null, email: vendor.loginEmail };
      },
      markMailRead(mailId) {
        const current = stateRef.current;
        const mail = current.mails.find((item) => item.id === mailId);
        if (!mail || mail.read) return;
        commit({
          ...current,
          mails: current.mails.map((item) =>
            item.id === mailId ? { ...item, read: true } : item,
          ),
        });
      },
      resetDemo() {
        localStorage.removeItem(STORAGE_KEY);
        commit(createSeed());
        setListQuery("");
      },
    };
    // commit closes over the latest ref, so the actions stay stable enough for this demo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, listQuery]);

  return <PortalContext.Provider value={api}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) throw new Error("usePortal must be used inside PortalProvider");
  return context;
}
