import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  layout("routes/app-layout.tsx", [
    index("routes/discover.tsx"),
    route("events/:id", "routes/event-detail.tsx"),
    route("saved", "routes/saved.tsx"),
    route("profile", "routes/profile.tsx"),
  ]),
  route("organizers", "routes/organizers.tsx"),
  route("sign-in", "routes/sign-in.tsx"),
  route("welcome/name", "routes/welcome/name.tsx"),
  route("welcome/academic", "routes/welcome/academic.tsx"),
  route("welcome/interests", "routes/welcome/interests.tsx"),
  route("welcome/done", "routes/welcome/done.tsx"),
] satisfies RouteConfig;
