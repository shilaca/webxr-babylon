import { A } from "@solidjs/router";
import { Component, For } from "solid-js";
import { pages } from "AppRoute";
import commonStyle from "common/style.module.css";
import style from "./style.module.css";

const Home: Component = () => {
  return (
    <main class={style.container}>
      <h1 class={style.title}>WebXR examples with Babylon.js</h1>
      <p class={commonStyle.text}>
        <a href="https://github.com/shilaca/webxr-babylon" target="_blank">
          The repository of this site
        </a>
        <br />
        create by{" "}
        <a href="https://twitter.com/shilaca_" target="_blank">
          @shilaca_
        </a>
      </p>

      <div class={style.listContainer}>
        <h2 class={commonStyle.heading}>
          Check the support for WebXR features
        </h2>
        <List items={[pages.features]} />
      </div>

      <div class={style.listContainer}>
        <h2 class={commonStyle.heading}>Simple examples of WebXR features</h2>
        <List
          items={[
            pages.hand_tracking,
            pages.plane_detector,
            pages.mesh_detector,
            pages.image_tracking,
          ]}
        />
      </div>

      <div class={style.listContainer}>
        <h2 class={commonStyle.heading}>Other examples</h2>
        <List items={[pages.piano, pages.gs]} />
      </div>

      <div class={style.listContainer}>
        <h2 class={commonStyle.heading}>etc.</h2>
        <List items={[pages.techbookfest16]} />
      </div>
    </main>
  );
};
export default Home;

const List: Component<{
  items: { path: string; name: string }[];
}> = props => {
  return (
    <ul class={style.list}>
      <For each={props.items}>
        {item => (
          <li class={style.item}>
            <A class={style.link} href={item.path}>
              {item.name}
            </A>
          </li>
        )}
      </For>
    </ul>
  );
};
