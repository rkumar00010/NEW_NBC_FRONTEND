import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { usePortal } from "~/lib/store";

export function RequireAuth({
  role,
  children,
}: {
  role: "sm" | "vendor";
  children: ReactNode;
}) {
  const { state } = usePortal();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.session) {
      navigate("/", { replace: true });
      return;
    }
    if (state.session.role !== role) {
      navigate(state.session.role === "sm" ? "/vendor-mgmt" : "/vendor", { replace: true });
    }
  }, [state.session, role, navigate]);

  if (!state.session || state.session.role !== role) return null;
  return children;
}
