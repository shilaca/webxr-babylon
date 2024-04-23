import { A, RouteDefinition, RouteSectionProps, Router } from "@solidjs/router";
import { Component, Show, lazy } from "solid-js";

export const pages = {
  basic: {
    path: "/basic",
    name: "Basic",
  },
  gs: {
    path: "/gs",
    name: "Gaussian Splat",
  },
  piano: {
    path: "/piano",
    name: "Piano",
  },
  plane_detector: {
    path: "/plane_detector",
    name: "Plane Detector",
  },
  mesh_detector: {
    path: "/mesh_detector",
    name: "Mesh Detector",
  },
  image_tracking: {
    path: "/image_tracking",
    name: "Image Tracking",
  },
  features: {
    path: "/check_features",
    name: "Check Features",
  },
} as const;

const routes: RouteDefinition[] = [
  {
    path: "/",
    component: lazy(() => import("./pages/home")),
  },
  {
    path: pages.basic.path,
    component: lazy(() => import("./pages/basic")),
  },
  {
    path: pages.gs.path,
    component: lazy(() => import("./pages/gaussian_splat")),
  },
  {
    path: pages.piano.path,
    component: lazy(() => import("./pages/piano")),
  },
  {
    path: pages.plane_detector.path,
    component: lazy(() => import("./pages/plane_detector")),
  },
  {
    path: pages.mesh_detector.path,
    component: lazy(() => import("./pages/mesh_detector")),
  },
  {
    path: pages.image_tracking.path,
    component: lazy(() => import("./pages/image_tracking")),
  },
  {
    path: pages.features.path,
    component: lazy(() => import("./pages/check_features")),
  },
];

const Root: Component<RouteSectionProps<unknown>> = props => {
  return (
    <>
      <Show when={props.location.pathname !== "/"}>
        <A class="button" href="/">
          ←
        </A>
      </Show>
      {props.children}
    </>
  );
};
export const AppRoute = () => <Router root={Root}>{routes}</Router>;
