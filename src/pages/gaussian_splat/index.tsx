import {
  Engine,
  GaussianSplattingMesh,
  Scene,
  WebXRDefaultExperience,
  WebXRSessionManager,
} from "@babylonjs/core";
import { Subject, fromEvent, takeUntil } from "rxjs";
import { Component, createSignal, onCleanup, onMount } from "solid-js";
import { createScene } from "babylonUtils/createScene";
import { setupXR as _setupXR } from "babylonUtils/setupXR";
import commonStyle from "common/style.module.css";
import BasicOverlayContent from "components/BasicOverlayContent";
// import localGsUrl from "material/gs_momotaro.cleaned.ply?url";

const serverGsUrl =
  import.meta.env.VITE_STORAGE_URL + "/gs_momotaro.cleaned.ply";
const gsUrl = serverGsUrl;

const GaussianSplat: Component = () => {
  let canvas: HTMLCanvasElement | undefined;

  const cleanup$ = new Subject<void>();

  const [engine, setEngine] = createSignal<Engine | undefined>();

  const [supportVR, setSupportVR] = createSignal<boolean | undefined>();
  const [supportAR, setSupportAR] = createSignal<boolean | undefined>();

  const [xrMode, setXRMode] = createSignal<XRSessionMode>("inline");
  const [xr, setXR] = createSignal<WebXRDefaultExperience | null | undefined>();

  const [hasError, setHasError] = createSignal(false);
  const handleError = (error: unknown) => {
    console.warn(error);
    setHasError(true);
  };

  const setupXR = async (scene: Scene, sessionMode: XRSessionMode) => {
    try {
      const xr = await _setupXR(scene, sessionMode, handleError);
      setXR(xr);
      setXRMode(sessionMode);
    } catch (err) {
      console.warn(err);
    }
  };

  onMount(async () => {
    if (!canvas) return;

    const engine = new Engine(canvas, true);
    setEngine(engine);

    const scene = await createScene(engine, canvas);

    const gs = new GaussianSplattingMesh("gs", null, scene);
    await gs
      .loadFileAsync(gsUrl)
      .then()
      .catch(err => console.warn("failed to load gsPlyUrl: ", err));
    gs.position.z = 2;
    gs.position.y = 1.5;

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
    await setupXR(scene, sessionMode);

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

    await setupXR(engine()!.scenes[0], xrMode);
  };

  return (
    <>
      <div class={commonStyle.overlay}>
        <BasicOverlayContent
          changeXRMode={changeXRMode}
          hasError={hasError()}
          supportAR={supportAR()}
          supportVR={supportVR()}
          title="Gaussian splat"
          xrMode={xrMode()}
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
