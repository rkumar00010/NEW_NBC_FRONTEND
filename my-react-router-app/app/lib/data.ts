import type { Contact, Registration, Vendor } from "./types";

export const SM_ACCOUNT = {
  email: "sm@nationalbonds.lk",
  password: "Sm@12345",
  name: "SM Team",
};

export const DEMO_VENDOR = {
  email: "john.doe@abcsuppliers.lk",
  password: "Vendor@123",
  company: "ABC Suppliers Pvt. Ltd.",
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CATEGORY_CARDS = [
  { name: "IT & Technology", icon: "laptop" },
  { name: "Construction", icon: "helmet" },
  { name: "General Supplies", icon: "box" },
  { name: "Facilities & Maint.", icon: "wrench" },
  { name: "Marketing", icon: "megaphone" },
  { name: "Healthcare", icon: "heart" },
  { name: "Logistics", icon: "truck" },
  { name: "Consulting", icon: "case" },
  { name: "Utilities & Energy", icon: "bolt" },
] as const;

export const COUNTRIES = [
  "Sri Lanka",
  "United Arab Emirates",
  "India",
  "Qatar",
  "Oman",
  "Bahrain",
  "Saudi Arabia",
];

export const BANKS = [
  "Commercial Bank of Ceylon",
  "Bank of Ceylon",
  "Sampath Bank",
  "Hatton National Bank",
  "Nations Trust Bank",
  "HSBC",
  "Emirates NBD",
];

export const DEPARTMENTS = [
  "Management",
  "Finance",
  "Sales",
  "Operations",
  "Procurement",
  "Technical",
  "Administration",
];

export const YEAR_OPTIONS = [
  "Less than 1 year",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "10+ years",
];

export const EMPLOYEE_OPTIONS = ["1–10", "11–50", "51–200", "201–500", "500+"];

export const TURNOVER_OPTIONS = [
  "Under 1M",
  "1M – 10M",
  "10M – 60M",
  "60M – 500M",
  "500M+",
];

export const QMS_OPTIONS = [
  "Yes, ISO 9001 certified",
  "Yes, not certified",
  "Under development",
  "Not in place",
];

export const LEAD_OPTIONS = [
  "1–3 business days",
  "4–7 business days",
  "1–2 weeks",
  "Over 2 weeks",
];

export const ESG_OPTIONS = [
  "Formal ESG policy",
  "Informal practices",
  "Planning to adopt",
  "None",
];

export const DEFAULT_INVITE_MESSAGE =
  "Dear [Vendor Name],\n\nYou are invited to register on the National Bonds Vendor Portal...";

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function hoursFromNow(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ageingOf(iso: string) {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000)),
  );
  return `${days}d`;
}

export function monthLabel(date = new Date()) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function nextVendorId(vendors: { id: string }[]) {
  const max = vendors.reduce((highest, vendor) => {
    const value = Number(vendor.id.replace(/\D/g, ""));
    return Number.isFinite(value) ? Math.max(highest, value) : highest;
  }, 1000);
  return `VND-${max + 1}`;
}

export function makeToken(seed: string) {
  return `${seed.replace(/[^A-Za-z0-9]/g, "")}-${Math.random().toString(36).slice(2, 8)}`;
}

export function passwordError(password: string, confirm: string) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (!/\d/.test(password)) return "Include at least one number.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

export function blankRegistration(partial: Partial<Registration> = {}): Registration {
  return {
    companyName: "",
    registrationNumber: "",
    vatNumber: "",
    address: "",
    country: "Sri Lanka",
    postalCode: "",
    contacts: [],
    categories: [],
    yearsInBusiness: "",
    employees: "",
    turnover: "",
    website: "",
    tradeLicense: false,
    vatCert: false,
    insurance: false,
    iso: false,
    tradeLicenseNumber: "",
    tradeLicenseExpiry: "",
    tradeLicenseDate: "",
    vatRegNo: "",
    vatRegDate: "",
    membershipNo: "",
    membershipDate: "",
    membershipExpiry: "",
    accountHolder: "",
    bankName: "",
    branch: "",
    accountNumber: "",
    swift: "",
    bankDoc: false,
    qms: "",
    leadTime: "",
    esg: "",
    dispute: "",
    draftStep: 1,
    ...partial,
  };
}

export function docsLabel(registration: Registration | null) {
  if (!registration) return "Pending";
  if (!registration.tradeLicense) return "Trade License";
  if (!registration.registrationNumber.trim()) return "Co.Reg Missing";
  if (
    !registration.vatCert &&
    !registration.vatRegNo.trim() &&
    !registration.vatNumber.trim()
  ) {
    return "VAT Pending";
  }
  if (!registration.insurance) return "Insurance";
  return "Complete";
}

function contact(
  name: string,
  email: string,
  mobile: string,
  primary = true,
  department = primary ? "Management" : "Finance",
): Contact {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    designation: primary ? "Primary contact" : department,
    email,
    mobile,
    department,
    primary,
  };
}

function vendor(
  partial: Partial<Vendor> & Pick<Vendor, "id" | "companyName" | "status">,
): Vendor {
  const next: Vendor = {
    category: "",
    contactName: "",
    contactEmail: "",
    loginEmail: "",
    phone: "",
    rating: null,
    otd: null,
    sinceLabel: "",
    docsLabel: "Pending",
    eventAt: new Date().toISOString(),
    eventLabel: "",
    token: `${partial.id.replace("-", "")}-seed`,
    tokenExpiresAt: hoursFromNow(72),
    resetToken: null,
    password: null,
    welcomeMessage: "",
    registration: null,
    rejectReason: "",
    note: "",
    ...partial,
  };
  if (!next.loginEmail) next.loginEmail = next.contactEmail;
  return next;
}

export function createSeedVendors(): Vendor[] {
  return [
    vendor({
      id: "VND-1001",
      companyName: "ABC Suppliers Pvt. Ltd.",
      category: "General Supplies",
      contactName: "John Doe",
      contactEmail: "john.doe@abcsuppliers.lk",
      phone: "+94 77 123 4567",
      rating: 4.2,
      otd: 94,
      sinceLabel: "Jan 2024",
      status: "Active",
      docsLabel: "Complete",
      eventAt: "2024-01-28T09:00:00.000Z",
      eventLabel: "Since",
      password: DEMO_VENDOR.password,
      registration: blankRegistration({
        companyName: "ABC Suppliers Pvt. Ltd.",
        registrationNumber: "PV 123456",
        vatNumber: "134567890-7000",
        address: "42 Galle Road, Colombo 03",
        country: "Sri Lanka",
        postalCode: "00300",
        contacts: [
          contact("John Doe", "john.doe@abcsuppliers.lk", "+94 77 123 4567"),
          contact(
            "Sarah Fernando",
            "sarah.fernando@abcsuppliers.lk",
            "+94 71 987 6543",
            false,
            "Finance",
          ),
        ],
        categories: ["General Supplies"],
        yearsInBusiness: "10+ years",
        employees: "51–200",
        turnover: "60M – 500M",
        website: "https://www.abcsuppliers.lk",
        tradeLicense: true,
        vatCert: true,
        insurance: true,
        iso: true,
        tradeLicenseNumber: "TL-2024-1188",
        tradeLicenseExpiry: "2026-12-31",
        tradeLicenseDate: "2024-01-15",
        vatRegNo: "134567890-7000",
        vatRegDate: "2024-01-20",
        accountHolder: "ABC Suppliers Pvt. Ltd.",
        bankName: "Commercial Bank of Ceylon",
        branch: "Colombo City Branch",
        accountNumber: "1234-5678-9012",
        swift: "CCEYLKLX",
        bankDoc: true,
        qms: "Yes, ISO 9001 certified",
        leadTime: "1–3 business days",
        esg: "Formal ESG policy",
        dispute: "Disputes are escalated to the contract manager and resolved within 10 business days.",
        draftStep: 6,
      }),
    }),
    vendor({
      id: "VND-1003",
      companyName: "CleanCo Services Ltd.",
      category: "Facilities",
      contactName: "Sara Ahmed",
      contactEmail: "sara.ahmed@cleanco.lk",
      phone: "+971 50 987 6543",
      rating: 4.5,
      otd: 97,
      sinceLabel: "Mar 2024",
      status: "Active",
      docsLabel: "Complete",
      eventAt: "2024-03-15T09:00:00.000Z",
      eventLabel: "Since",
      password: DEMO_VENDOR.password,
    }),
    vendor({
      id: "VND-1005",
      companyName: "TechPro Ltd.",
      category: "IT & Technology",
      contactName: "Ali Hassan",
      contactEmail: "ali.hassan@techpro.lk",
      phone: "+971 4 567 8901",
      rating: 3.8,
      otd: 88,
      sinceLabel: "Jun 2024",
      status: "Active",
      docsLabel: "Complete",
      eventAt: "2024-06-02T09:00:00.000Z",
      eventLabel: "Since",
      password: DEMO_VENDOR.password,
    }),
    vendor({
      id: "VND-1008",
      companyName: "TechStar Solutions Pvt. Ltd.",
      category: "IT & Technology",
      contactName: "Kamal Perera",
      contactEmail: "kamal@techstar.lk",
      phone: "+94 77 220 1188",
      status: "Pending Review",
      docsLabel: "Co.Reg Missing",
      eventAt: daysAgo(2),
      eventLabel: "Submitted",
      registration: blankRegistration({
        companyName: "TechStar Solutions Pvt. Ltd.",
        address: "88 Duplication Road, Colombo 04",
        country: "Sri Lanka",
        postalCode: "00400",
        contacts: [contact("Kamal Perera", "kamal@techstar.lk", "+94 77 220 1188")],
        categories: ["IT & Technology"],
        yearsInBusiness: "5–10 years",
        employees: "51–200",
        turnover: "10M – 60M",
        website: "https://www.techstar.lk",
        tradeLicense: true,
        vatCert: true,
        insurance: true,
        tradeLicenseNumber: "TL-2025-2201",
        tradeLicenseExpiry: "2026-04-12",
        tradeLicenseDate: "2025-04-12",
        vatRegNo: "10220017890008",
        vatNumber: "10220017890008",
        accountHolder: "TechStar Solutions Pvt. Ltd.",
        bankName: "Sampath Bank",
        branch: "Bambalapitiya",
        accountNumber: "2201-4488-9011",
        swift: "BSAMLKLX",
        bankDoc: true,
        qms: "Under development",
        leadTime: "4–7 business days",
        esg: "Planning to adopt",
        dispute: "We assign a project lead and reply within five business days.",
        draftStep: 6,
      }),
    }),
    vendor({
      id: "VND-1009",
      companyName: "Greenwave Services LLC",
      category: "Facilities",
      contactName: "Sara Ahmed",
      contactEmail: "sara@greenwave.lk",
      phone: "+971 50 111 2244",
      status: "Pending Review",
      docsLabel: "Complete",
      eventAt: daysAgo(3),
      eventLabel: "Submitted",
      registration: blankRegistration({
        companyName: "Greenwave Services LLC",
        registrationNumber: "CL-88921",
        vatNumber: "100998877",
        address: "Dubai Investment Park",
        country: "United Arab Emirates",
        postalCode: "00000",
        contacts: [contact("Sara Ahmed", "sara@greenwave.lk", "+971 50 111 2244")],
        categories: ["Facilities & Maint."],
        yearsInBusiness: "10+ years",
        employees: "201–500",
        turnover: "60M – 500M",
        tradeLicense: true,
        vatCert: true,
        insurance: true,
        iso: true,
        tradeLicenseNumber: "TL-77821",
        tradeLicenseExpiry: "2026-11-01",
        tradeLicenseDate: "2023-11-01",
        vatRegNo: "100998877",
        accountHolder: "Greenwave Services LLC",
        bankName: "Emirates NBD",
        branch: "DIP Branch",
        accountNumber: "8899-2211-0044",
        swift: "EBILAEAD",
        bankDoc: true,
        qms: "Yes, ISO 9001 certified",
        leadTime: "1–3 business days",
        esg: "Formal ESG policy",
        dispute: "A written response is issued within seven days.",
        draftStep: 6,
      }),
    }),
    vendor({
      id: "VND-1010",
      companyName: "Metro Print & Design Co.",
      category: "Marketing",
      contactName: "Ali Hassan",
      contactEmail: "ali@metroprint.lk",
      phone: "+94 11 250 3344",
      status: "Pending Review",
      docsLabel: "VAT Pending",
      eventAt: daysAgo(4),
      eventLabel: "Submitted",
      registration: blankRegistration({
        companyName: "Metro Print & Design Co.",
        registrationNumber: "PV 778120",
        address: "12 Ward Place, Colombo 07",
        country: "Sri Lanka",
        contacts: [contact("Ali Hassan", "ali@metroprint.lk", "+94 11 250 3344")],
        categories: ["Marketing"],
        yearsInBusiness: "3–5 years",
        employees: "11–50",
        turnover: "1M – 10M",
        tradeLicense: true,
        insurance: true,
        tradeLicenseNumber: "TL-44190",
        tradeLicenseExpiry: "2026-08-01",
        tradeLicenseDate: "2024-08-01",
        accountHolder: "Metro Print & Design Co.",
        bankName: "Hatton National Bank",
        branch: "Borella",
        accountNumber: "4419-0088-2211",
        swift: "HBLILKLX",
        qms: "Yes, not certified",
        leadTime: "4–7 business days",
        esg: "Informal practices",
        dispute: "The account manager calls the buyer the same day a dispute is raised.",
        draftStep: 6,
      }),
    }),
    vendor({
      id: "VND-1006",
      companyName: "Apex Consulting Group",
      category: "Consulting",
      contactName: "Nimal Jayawardena",
      contactEmail: "nimal@apexconsulting.lk",
      phone: "+94 77 555 0199",
      status: "More Info Required",
      docsLabel: "Trade License",
      eventAt: daysAgo(6),
      eventLabel: "Info requested",
      note: "The trade license image was unreadable. Please upload a clear copy.",
      registration: blankRegistration({
        companyName: "Apex Consulting Group",
        registrationNumber: "PV 550190",
        address: "Level 8, World Trade Center, Colombo 01",
        country: "Sri Lanka",
        contacts: [contact("Nimal Jayawardena", "nimal@apexconsulting.lk", "+94 77 555 0199")],
        categories: ["Consulting"],
        yearsInBusiness: "10+ years",
        employees: "51–200",
        turnover: "10M – 60M",
        vatCert: true,
        vatRegNo: "5501907000",
        vatNumber: "5501907000",
        accountHolder: "Apex Consulting Group",
        bankName: "Bank of Ceylon",
        branch: "Corporate Branch",
        accountNumber: "5501-9000-2211",
        qms: "Yes, ISO 9001 certified",
        leadTime: "1–2 weeks",
        esg: "Formal ESG policy",
        dispute: "Engagement letters name a partner who resolves disputes.",
        draftStep: 6,
      }),
    }),
    vendor({
      id: "VND-1011",
      companyName: "SkyBridge Logistics",
      category: "Logistics",
      contactName: "Ravi Fernando",
      contactEmail: "ravi@skybridge.lk",
      phone: "+94 76 300 2211",
      status: "Invited",
      docsLabel: "Pending",
      eventAt: daysAgo(5),
      eventLabel: "Invited",
      registration: blankRegistration({
        companyName: "SkyBridge Logistics",
        contacts: [contact("Ravi Fernando", "ravi@skybridge.lk", "+94 76 300 2211")],
        categories: ["Logistics"],
      }),
    }),
  ];
}
