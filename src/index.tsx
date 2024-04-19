import { render } from "solid-js/web";
import { AppRoute } from "AppRoute";
import "./style.css";

const rootEl = document.getElementById("root");
rootEl && render(() => <AppRoute />, rootEl);
