import { Component, Show } from "solid-js";
import commonStyle from "common/style.module.css";

const NotSupport: Component<{
  show: boolean;
}> = props => {
  return (
    <Show when={props.show}>
      <p class={commonStyle.alert}>Your browser does't support.</p>
    </Show>
  );
};
export default NotSupport;
