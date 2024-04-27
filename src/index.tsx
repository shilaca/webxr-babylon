import { render } from "solid-js/web";
import { AppRoute } from "AppRoute";
import "./style.css";

/**
 * Google Tag Manager
 */
((gtmId: string) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  const f = document.getElementsByTagName("script")[0];
  const j = document.createElement("script");
  j.async = true;
  j.src = "https://www.googletagmanager.com/gtm.js?id=" + gtmId;
  f.parentNode?.insertBefore(j, f);
})(import.meta.env.VITE_GA_ID);

const rootEl = document.getElementById("root");
rootEl && render(() => <AppRoute />, rootEl);
