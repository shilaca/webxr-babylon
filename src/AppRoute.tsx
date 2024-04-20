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
