import { Link, useSearchParams } from "react-router";
import { RequireAuth } from "~/components/RequireAuth";
import { TopBar } from "~/components/TopBar";
import { formatWhen } from "~/lib/data";
import { usePortal } from "~/lib/store";

export function meta() {
  return [{ title: "Vendor Home · National Bonds" }];
}

export default function VendorHome() {
  return (
    <RequireAuth role="vendor">
      <VendorHomeScreen />
    </RequireAuth>
  );
}

function VendorHomeScreen() {
  const { state } = usePortal();
  const [params] = useSearchParams();
  const vendor = state.vendors.find((item) => item.id === state.session?.vendorId);
  const mails = state.mails.filter(
    (mail) => mail.to === vendor?.loginEmail || mail.to === vendor?.contactEmail,
  );
  const profile = params.get("tab") === "profile";

  if (!vendor) {
    return (
      <div className="min-h-screen bg-[#f4f6f9]">
        <TopBar active="home" />
        <main className="mx-auto max-w-lg px-6 py-16">
          <div className="nb-card p-6 text-sm">This vendor record is no longer available.</div>
        </main>
      </div>
    );
  }

  const registration = vendor.registration;
  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <TopBar active={profile ? "profile" : "home"} />
      <main className="mx-auto max-w-[980px] px-4 py-6 lg:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a6853f]">{vendor.id}</p>
        <h1 className="mt-1 text-[28px] font-semibold text-[#17233b]">{vendor.companyName}</h1>
        <p className="mt-1 text-sm text-[#6d7890]">
          Signed in as {vendor.contactName || vendor.loginEmail}
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Tile label="Status" value={vendor.status} />
          <Tile label="Category" value={vendor.category || "—"} />
          <Tile label="On-time delivery" value={vendor.otd == null ? "—" : `${vendor.otd}%`} />
        </div>
        <section className="nb-card mt-5 p-5">
          <h2 className="font-semibold">{profile ? "My profile" : "Company profile"}</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <Item label="Login email" value={vendor.loginEmail} />
            <Item label="Phone" value={vendor.phone || "—"} />
            <Item label="Rating" value={vendor.rating == null ? "New vendor" : vendor.rating.toFixed(1)} />
            <Item label="Since" value={vendor.sinceLabel || "—"} />
            {registration && (
              <>
                <Item label="Registration no." value={registration.registrationNumber || "—"} />
                <Item label="Address" value={registration.address || "—"} />
                <Item label="Bank" value={registration.bankName || "—"} />
                <Item label="Categories" value={registration.categories.join(", ") || "—"} />
              </>
            )}
          </dl>
        </section>
        <section className="nb-card mt-5 p-5">
          <h2 className="font-semibold">Mailbox for this vendor</h2>
          {mails.length === 0 && <p className="mt-2 text-sm text-[#6d7890]">No messages for this email yet.</p>}
          <div className="mt-3 divide-y divide-[#eef2f6]">
            {mails.map((mail) => (
              <div key={mail.id} className="py-3">
                <div className="text-sm font-semibold">{mail.subject}</div>
                <div className="text-xs text-[#8b95a8]">{formatWhen(mail.createdAt)}</div>
                {mail.link && (
                  <Link to={mail.link} className="mt-1 inline-block text-sm font-semibold text-[#8a6d32]">
                    {mail.linkLabel}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="nb-card px-4 py-4">
      <div className="text-xs text-[#8b95a8]">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-[#8b95a8]">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
