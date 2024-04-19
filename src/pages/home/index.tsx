import { A } from "@solidjs/router";
import { Component, For } from "solid-js";
import { pages } from "AppRoute";
import style from "./style.module.css";

const Home: Component = () => {
  return (
    <main>
      <ul class={style.list}>
        <For each={Object.values(pages)}>
          {route => (
            <li class={style.item}>
              <A class={style.link} href={route.path}>
                {route.name}
              </A>
            </li>
          )}
        </For>
      </ul>
    </main>
  );
};
export default Home;
