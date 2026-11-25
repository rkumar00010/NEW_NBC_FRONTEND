import { Link } from "react-router";
import { RequireAuth } from "~/components/RequireAuth";
import { TopBar } from "~/components/TopBar";
import { ageingOf, formatDate } from "~/lib/data";
import { usePortal } from "~/lib/store";

export function meta() {
  return [{ title: "Home · National Bonds Vendor Portal" }];
}

export default function Home() {
  return (
    <RequireAuth role="sm">
      <HomeScreen />
    </RequireAuth>
  );
}

function HomeScreen() {
  const { state } = usePortal();
  const active = state.vendors.filter((vendor) => vendor.status === "Active").length;
  const pending = state.vendors.filter((vendor) => vendor.status === "Pending Review");
  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <TopBar active="home" />
      <main className="mx-auto max-w-[1100px] px-6 py-8">
        <h1 className="text-[28px] font-semibold text-[#17233b]">Good day, SM Team</h1>
        <p className="mt-1 text-sm text-[#6d7890]">
          {active} vendors are live and {pending.length} registrations are waiting for review.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Active vendors" value={active} />
          <Stat label="Pending review" value={pending.length} />
          <Stat label="Invited" value={state.vendors.filter((vendor) => vendor.status === "Invited").length} />
        </div>
        <section className="nb-card mt-6 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Waiting for review</h2>
            <Link to="/vendor-mgmt?tab=process" className="text-sm font-semibold text-[#8a6d32]">
              Open Vendor Management
            </Link>
          </div>
          <div className="mt-4 divide-y divide-[#eef2f6]">
            {pending.length === 0 && (
              <p className="py-6 text-sm text-[#6d7890]">No vendors are waiting. Invite a company to begin.</p>
            )}
            {pending.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <div className="font-semibold">{vendor.companyName}</div>
                  <div className="text-xs text-[#8b95a8]">
                    {vendor.id} · {vendor.eventLabel} {formatDate(vendor.eventAt)} · {ageingOf(vendor.eventAt)}
                  </div>
                </div>
                <Link
                  to={`/vendor-mgmt?tab=process&focus=${vendor.id}`}
                  className="nb-white px-3 py-1.5 text-xs"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="nb-card px-4 py-4">
      <div className="text-3xl font-semibold text-[#17233b]">{value}</div>
      <div className="mt-1 text-sm text-[#6d7890]">{label}</div>
    </div>
  );
}
