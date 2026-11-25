import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),
  route("home", "routes/home.tsx"),
  route("vendor-mgmt", "routes/vendor-mgmt.tsx"),
  route("register", "routes/register.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
  route("inbox", "routes/inbox.tsx"),
  route("vendor", "routes/vendor-home.tsx"),
  route("module/:name", "routes/module.tsx"),
] satisfies RouteConfig;
