import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Logo } from "~/components/Logo";
import { Icon } from "~/components/Icons";
import { DEMO_VENDOR, SM_ACCOUNT } from "~/lib/data";
import { usePortal } from "~/lib/store";

export function meta() {
  return [{ title: "Sign in · National Bonds Vendor Portal" }];
}

export default function Login() {
  const { state, login, resetDemo } = usePortal();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (state.session?.role === "sm") navigate("/vendor-mgmt", { replace: true });
    if (state.session?.role === "vendor") navigate("/vendor", { replace: true });
  }, [state.session, navigate]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const message = login(email, password);
    setError(message ?? "");
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#0d1b33] px-12 py-10 text-white lg:flex lg:flex-col">
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full border border-[#c6a35a]/20" />
        <div className="absolute -left-8 top-40 h-72 w-72 rounded-full border border-[#c6a35a]/10" />
        <Logo light />
        <div className="relative mt-auto max-w-md pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c6a35a]">
            Supplier management
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight">
            Invite, register, and approve vendors in one place.
          </h1>
          <ul className="mt-8 space-y-3 text-sm text-white/75">
            <li>1. SM sends an invitation and a vendor ID is reserved.</li>
            <li>2. The vendor opens the link and completes registration.</li>
            <li>3. SM approves or rejects from Vendors Under Process.</li>
            <li>4. An approved vendor sets a password and signs in.</li>
          </ul>
        </div>
      </section>
      <section className="flex items-center justify-center bg-[#f4f6f9] px-5 py-10">
        <div className="w-full max-w-[440px]">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-[28px] font-semibold text-[#17233b]">Sign in</h2>
          <p className="mt-1 text-sm text-[#6d7890]">National Bonds Vendor Portal</p>
          {params.get("notice") === "password" && (
            <div className="mt-4 rounded-xl bg-[#e7f6ee] px-3 py-2 text-sm text-[#1c8a4b]">
              Password saved. Sign in with your vendor email and the new password.
            </div>
          )}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-[#24324d]">
              Email
              <input
                className="nb-input mt-1.5"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                required
              />
            </label>
            <label className="block text-sm font-medium text-[#24324d]">
              Password
              <span className="relative mt-1.5 block">
                <input
                  className="nb-input pr-10"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d7890]"
                  onClick={() => setShow((value) => !value)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  <Icon name={show ? "eyeOff" : "eye"} />
                </button>
              </span>
            </label>
            {error && <p className="text-sm text-[#c24141]">{error}</p>}
            <button className="nb-gold w-full py-3" type="submit">
              Sign in
            </button>
          </form>
          <div className="mt-6 rounded-2xl border border-[#e6ebf2] bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#8b95a8]">
              Demo access
            </div>
            <button
              type="button"
              className="mt-3 block w-full rounded-xl border border-[#efe4cb] bg-[#fbf6e9] px-3 py-2 text-left text-sm"
              onClick={() => {
                setEmail(SM_ACCOUNT.email);
                setPassword(SM_ACCOUNT.password);
                setError("");
              }}
            >
              <span className="font-semibold text-[#6e5520]">SM team</span>
              <span className="mt-0.5 block text-[#6d7890]">
                {SM_ACCOUNT.email} · {SM_ACCOUNT.password}
              </span>
            </button>
            <button
              type="button"
              className="mt-2 block w-full rounded-xl border border-[#e6ebf2] px-3 py-2 text-left text-sm hover:bg-[#f8fafc]"
              onClick={() => {
                setEmail(DEMO_VENDOR.email);
                setPassword(DEMO_VENDOR.password);
                setError("");
              }}
            >
              <span className="font-semibold">{DEMO_VENDOR.company}</span>
              <span className="mt-0.5 block text-[#6d7890]">
                {DEMO_VENDOR.email} · {DEMO_VENDOR.password}
              </span>
            </button>
            <p className="mt-3 text-xs leading-5 text-[#8b95a8]">
              New vendors receive a password link in the portal mailbox after SM approval.
              This demo keeps accounts in this browser only.
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-[#8a6d32]"
              onClick={() => {
                resetDemo();
                setEmail("");
                setPassword("");
                setError("");
              }}
            >
              Reset demo data
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
