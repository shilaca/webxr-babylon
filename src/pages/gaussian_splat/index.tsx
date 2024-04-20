import {
  Engine,
  GaussianSplattingMesh,
  WebXRDefaultExperience,
  WebXRSessionManager,
} from "@babylonjs/core";
import { Subject, fromEvent, takeUntil } from "rxjs";
import { Component, createSignal, onCleanup, onMount } from "solid-js";
import { createScene } from "babylonUtils/createScene";
import { setupXR } from "babylonUtils/setupXR";
import commonStyle from "common/style.module.css";
import ChangeXRMode from "components/ChangeXRMode";

const GaussianSplat: Component = () => {
  let canvas: HTMLCanvasElement | undefined;

  const cleanup$ = new Subject<void>();

  const [engine, setEngine] = createSignal<Engine | undefined>();

  const [supportVR, setSupportVR] = createSignal<boolean | undefined>();
  const [supportAR, setSupportAR] = createSignal<boolean | undefined>();

  const [xrMode, setXRMode] = createSignal<XRSessionMode>("inline");
  const [xr, setXR] = createSignal<WebXRDefaultExperience | null | undefined>();

  onMount(async () => {
    if (!canvas) return;

    const engine = new Engine(canvas, true);
    setEngine(engine);

    const scene = await createScene(engine, canvas);

    const gs = new GaussianSplattingMesh("gs", null, scene);
    await gs
      .loadFileAsync(import.meta.env.VITE_STORAGE_URL + "/gs_momotaro.ply")
      .then()
      .catch(err => console.warn("failed to load gsPlyUrl: ", err));

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

    try {
      const xr = await setupXR(scene, sessionMode);
      setXR(xr);
    } catch (err) {
      console.warn(err);
    }

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

  return (
    <>
      <div class={commonStyle.overlay}>
        <ChangeXRMode
          curXRMode={xrMode()}
          supportAR={supportAR()}
          supportVR={supportVR()}
          onChangeXRMode={changeXRMode}
        />
      </div>
      <canvas class={commonStyle.mainCanvas} ref={canvas}>
        Oops! It looks like your browser doesn't support the canvas element.
        Please update your browser or switch to a modern browser that supports
        canvas for the best experience.
      </canvas>
    </>
  );
};
export default GaussianSplat;
