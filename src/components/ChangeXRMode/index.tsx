import { Component, Show } from "solid-js";

const isSupport = (value: boolean | undefined) =>
  typeof value === "boolean" ? String(value) : "loading...";

const ChangeXRMode: Component<{
  supportVR: boolean | undefined;
  supportAR: boolean | undefined;
  curXRMode: XRSessionMode;
  onChangeXRMode: (mode: XRSessionMode) => void;
}> = props => {
  return (
    <>
      <div>
        <p>Support VR: {isSupport(props.supportVR)}</p>
        <p>Support AR: {isSupport(props.supportAR)}</p>
        <label>
          Change XR Mode:
          <select
            value={props.curXRMode}
            onChange={event =>
              props.onChangeXRMode(event.currentTarget.value as XRSessionMode)
            }
          >
            <option value="inline">inline</option>
            <Show when={props.supportVR}>
              <option value="immersive-vr">VR</option>
            </Show>
            <Show when={props.supportAR}>
              <option value="immersive-ar">AR</option>
            </Show>
          </select>
        </label>
      </div>
    </>
  );
};
export default ChangeXRMode;
