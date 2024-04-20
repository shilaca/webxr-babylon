import { WebXRDefaultExperience, WebXRFeaturesManager } from "@babylonjs/core";
import { Component, For, Show, createSignal } from "solid-js";
import style from "./style.module.css";

const AvailableXRFeatureVersions: Component<{
  xr: WebXRDefaultExperience;
}> = props => {
  const [showVersion, setShowVersion] = createSignal(false);

  const featureManager = props.xr.baseExperience.featuresManager;
  const enabledFeatures = featureManager.getEnabledFeatures();

  const availableFeatures = WebXRFeaturesManager.GetAvailableFeatures();

  return (
    <div>
      <p>Available XR Features</p>
      <label>
        <input
          checked={showVersion()}
          onchange={event => setShowVersion(event.target.checked)}
          type="checkbox"
        />
        show version
      </label>
      <ul class={style.list}>
        <For each={availableFeatures}>
          {feature => (
            <li
              classList={{
                [style.active]: enabledFeatures.includes(feature),
              }}
            >
              {feature}
              <Show when={showVersion()}>
                <br />
                <span class={style.version}>
                  {WebXRFeaturesManager.GetAvailableVersions(feature).join(
                    ", ",
                  )}
                </span>
              </Show>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};
export default AvailableXRFeatureVersions;
