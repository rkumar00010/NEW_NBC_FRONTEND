import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Logo } from "~/components/Logo";
import { usePortal } from "~/lib/store";

export function meta() {
  return [{ title: "Set password · National Bonds Vendor Portal" }];
}

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const { state, setPassword, logout } = usePortal();
  const navigate = useNavigate();
  const [password, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);
  const vendor = state.vendors.find((item) => item.resetToken === token);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = setPassword(token, password, confirm);
    if (result.error || !result.email) {
      setError(result.error ?? "This password link could not be used.");
      return;
    }
    setLeaving(true);
    logout();
    navigate(`/?email=${encodeURIComponent(result.email)}&notice=password`);
  }

  if (leaving) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f6f9] px-5">
        <p className="text-sm text-[#5c6b84]">Password saved. Opening the sign-in page.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f6f9]">
      <div className="bg-[#0d1b33] px-6 py-4">
        <Link to="/">
          <Logo light />
        </Link>
      </div>
      <div className="mx-auto max-w-[460px] px-5 py-12">
        <div className="nb-card p-6">
          <h1 className="text-2xl font-semibold">Set your password</h1>
          {vendor ? (
            <>
              <p className="mt-2 text-sm leading-6 text-[#5c6b84]">
                {vendor.companyName} is approved. Choose a password for{" "}
                <span className="font-semibold text-[#1c2740]">{vendor.loginEmail}</span>, then sign in.
              </p>
              <form onSubmit={submit} className="mt-5 space-y-4">
                <label className="block text-sm font-medium">
                  New password
                  <input
                    className="nb-input mt-1.5"
                    type="password"
                    value={password}
                    onChange={(event) => setPass(event.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </label>
                <label className="block text-sm font-medium">
                  Confirm password
                  <input
                    className="nb-input mt-1.5"
                    type="password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </label>
                <p className="text-xs text-[#8b95a8]">At least 8 characters, including one number.</p>
                {error && <p className="text-sm text-[#c24141]">{error}</p>}
                <button className="nb-gold w-full" type="submit">
                  Save password and continue
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm leading-6 text-[#5c6b84]">
                This password link is invalid or has already been used. Sign in if you already set a password.
              </p>
              <Link to="/" className="nb-gold mt-5 w-full">
                Go to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
