export type Role = "sm" | "vendor";

export type VendorStatus =
  | "Active"
  | "Blocked"
  | "Pending Review"
  | "Invited"
  | "More Info Required"
  | "Rejected"
  | "Cancelled";

export type Contact = {
  id: string;
  name: string;
  designation: string;
  email: string;
  mobile: string;
  department: string;
  primary: boolean;
};

export type Registration = {
  companyName: string;
  registrationNumber: string;
  vatNumber: string;
  address: string;
  country: string;
  postalCode: string;
  contacts: Contact[];
  categories: string[];
  yearsInBusiness: string;
  employees: string;
  turnover: string;
  website: string;
  tradeLicense: boolean;
  vatCert: boolean;
  insurance: boolean;
  iso: boolean;
  tradeLicenseNumber: string;
  tradeLicenseExpiry: string;
  tradeLicenseDate: string;
  vatRegNo: string;
  vatRegDate: string;
  membershipNo: string;
  membershipDate: string;
  membershipExpiry: string;
  accountHolder: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  swift: string;
  bankDoc: boolean;
  qms: string;
  leadTime: string;
  esg: string;
  dispute: string;
  draftStep: number;
};

export type Vendor = {
  id: string;
  companyName: string;
  category: string;
  contactName: string;
  contactEmail: string;
  loginEmail: string;
  phone: string;
  rating: number | null;
  otd: number | null;
  sinceLabel: string;
  status: VendorStatus;
  docsLabel: string;
  eventAt: string;
  eventLabel: string;
  token: string;
  tokenExpiresAt: string;
  resetToken: string | null;
  password: string | null;
  welcomeMessage: string;
  registration: Registration | null;
  rejectReason: string;
  note: string;
};

export type Mail = {
  id: string;
  to: string;
  toName: string;
  fromName: string;
  subject: string;
  paragraphs: string[];
  link?: string;
  linkLabel?: string;
  createdAt: string;
  read: boolean;
};

export type Session = {
  role: Role;
  email: string;
  name: string;
  vendorId?: string;
};

export type PortalState = {
  session: Session | null;
  vendors: Vendor[];
  mails: Mail[];
};

export type InviteInput = {
  email: string;
  companyName: string;
  category: string;
  contactName: string;
  message: string;
};
