import {
  CreateGround,
  CreateSphere,
  Engine,
  HemisphericLight,
  Vector3,
  WebXRDefaultExperience,
  WebXRSessionManager,
} from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials";
import { Subject, fromEvent, takeUntil } from "rxjs";
import {
  Component,
  For,
  Show,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { createScene } from "babylonUtils/createScene";
import { setupXR } from "babylonUtils/setupXR";
import commonStyle from "common/style.module.css";
import style from "./style.module.css";

const Basic: Component = () => {
  let canvas: HTMLCanvasElement | undefined;

  const cleanup$ = new Subject<void>();

  const [engine, setEngine] = createSignal<Engine | undefined>(undefined);

  const [supportVR, setSupportVR] = createSignal<boolean | undefined>(
    undefined,
  );
  const [supportAR, setSupportAR] = createSignal<boolean | undefined>(
    undefined,
  );

  const [xrMode, setXRMode] = createSignal<
    "inline" | "immersive-vr" | "immersive-ar"
  >("inline");
  const [xr, setXR] = createSignal<WebXRDefaultExperience | undefined>(
    undefined,
  );

  onMount(async () => {
    if (!canvas) return;

    const engine = new Engine(canvas, true);
    setEngine(engine);

    const scene = await createScene(engine, canvas);

    const light = new HemisphericLight("light", new Vector3(1, 1, 0), scene);
    const gridMat = new GridMaterial("gridMat", scene);
    const sphere = CreateSphere("sphere", { diameter: 1 }, scene);
    const ground = CreateGround(
      "ground",
      { width: 6, height: 6, subdivisions: 2 },
      scene,
    );
    ground.material = gridMat;

    const vr =
      await WebXRSessionManager.IsSessionSupportedAsync("immersive-vr");
    const ar =
      await WebXRSessionManager.IsSessionSupportedAsync("immersive-ar");
    setSupportVR(vr);
    setSupportAR(ar);

    const sessionMode: XRSessionMode = ar
      ? "immersive-ar"
      : vr
        ? "immersive-vr"
        : "inline";
    setXRMode(sessionMode);

    const xr = await setupXR(scene, sessionMode);
    setXR(xr);

    const featureManager = xr.baseExperience.featuresManager;
    const availableFeatures = featureManager.getEnabledFeatures();

    console.log("availableFeatures: ", availableFeatures);

    engine.runRenderLoop(() => {
      scene.render();
    });

    fromEvent(window, "resize")
      .pipe(takeUntil(cleanup$))
      .subscribe(() => {
        engine.resize();
      });
  });

  onCleanup(() => {
    engine()?.dispose();

    cleanup$.next();
    cleanup$.complete();
  });

  const changeXRMode = async (xrMode: XRSessionMode) => {
    const oldXr = xr();
    if (oldXr) oldXr.dispose();

    const newXr = await setupXR(engine()!.scenes[0], xrMode);
    setXR(newXr);
    setXRMode(xrMode);
  };

  const isSupport = (value: boolean | undefined) =>
    typeof value === "boolean" ? String(value) : "loading...";

  return (
    <>
      <div class={commonStyle.overlay}>
        <p>Support VR: {isSupport(supportVR())}</p>
        <p>Support AR: {isSupport(supportAR())}</p>
        <label>
          Change XR Mode:
          <select
            value={xrMode()}
            onChange={event => {
              console.log(event.currentTarget.value);
              changeXRMode(event.currentTarget.value as XRSessionMode);
            }}
          >
            <option value="inline">inline</option>
            <option value="immersive-vr">VR</option>
            <option value="immersive-ar">AR</option>
          </select>
        </label>
        <Show when={xr()}>
          <AvailableVersions xr={xr()!} />
        </Show>
      </div>
      <canvas class={commonStyle.mainCanvas} ref={canvas}>
        Oops! It looks like your browser doesn't support the canvas element.
        Please update your browser or switch to a modern browser that supports
        canvas for the best experience.
      </canvas>
    </>
  );
};
export default Basic;

const AvailableVersions: Component<{
  xr: WebXRDefaultExperience;
}> = props => {
  const featureManager = props.xr.baseExperience.featuresManager;
  const availableFeatures = featureManager.getEnabledFeatures();

  return (
    <div>
      <p>Available XR Features</p>
      <ul class={style.list}>
        <For each={availableFeatures}>{feature => <li>{feature}</li>}</For>
      </ul>
    </div>
  );
};
