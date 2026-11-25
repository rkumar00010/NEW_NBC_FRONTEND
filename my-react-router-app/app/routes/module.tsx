import { useParams } from "react-router";
import { RequireAuth } from "~/components/RequireAuth";
import { TopBar } from "~/components/TopBar";
import { usePortal } from "~/lib/store";

const MODULES: Record<string, { title: string; text: string }> = {
  rfq: {
    title: "RFQ",
    text: "Requests for quotation are outside this onboarding build. Vendor invite, registration, and approval are ready in Vendor Management.",
  },
  "purchase-orders": {
    title: "Purchase Orders",
    text: "Purchase orders will sit beside the vendor master. This demo covers the path from invitation to vendor login.",
  },
  invoices: {
    title: "Invoices",
    text: "Invoice processing is not part of this screen. Bank details captured at registration are marked for Finance review.",
  },
  reports: {
    title: "Reports",
    text: "Operational reports are not included yet. Active vendors and vendors under process are available in Vendor Management.",
  },
};

export function meta() {
  return [{ title: "National Bonds Vendor Portal" }];
}

export default function ModulePage() {
  const { state } = usePortal();
  const role = state.session?.role ?? "sm";
  return (
    <RequireAuth role={role === "vendor" ? "vendor" : "sm"}>
      <ModuleBody />
    </RequireAuth>
  );
}

function ModuleBody() {
  const { name = "" } = useParams();
  const module = MODULES[name] ?? {
    title: "Module",
    text: "This section is not part of the vendor onboarding flow.",
  };
  const { state } = usePortal();
  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <TopBar active={name === "purchase-orders" ? "po" : name} />
      <main className="mx-auto max-w-[760px] px-6 py-16">
        <div className="nb-card p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a6853f]">
            {state.session?.role === "vendor" ? "Vendor portal" : "SM portal"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold">{module.title}</h1>
          <p className="mt-3 text-sm leading-6 text-[#5c6b84]">{module.text}</p>
        </div>
      </main>
    </div>
  );
}
