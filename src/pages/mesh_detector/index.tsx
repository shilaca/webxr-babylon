import {
  Color3,
  Engine,
  HemisphericLight,
  Mesh,
  Scene,
  StandardMaterial,
  Vector3,
  WebXRDefaultExperience,
  WebXRMeshDetector,
  WebXRSessionManager,
} from "@babylonjs/core";
import { Subject, fromEvent, takeUntil, from } from "rxjs";
import {
  Component,
  createSignal,
  observable,
  onCleanup,
  onMount,
} from "solid-js";
import { createScene } from "babylonUtils/createScene";
import commonStyle from "common/style.module.css";
import BasicOverlayContent from "components/BasicOverlayContent";
import { setupMeshDetectorXR } from "./setupXR";

const MeshDetector: Component = () => {
  let canvas: HTMLCanvasElement | undefined;

  const cleanup$ = new Subject<void>();

  const [engine, setEngine] = createSignal<Engine | undefined>();

  const [supportVR, setSupportVR] = createSignal<boolean | undefined>();
  const [supportAR, setSupportAR] = createSignal<boolean | undefined>();

  const [xrMode, setXRMode] = createSignal<XRSessionMode>("inline");
  const [xr, setXR] = createSignal<WebXRDefaultExperience | null | undefined>();

  const [meshDetector, setMeshDetector] = createSignal<
    WebXRMeshDetector | undefined
  >();
  const meshDetector$ = from(observable(meshDetector));
  const meshMap = new Map<number, Mesh>();

  const [hasError, setHasError] = createSignal(false);
  const handleError = (error: unknown) => {
    console.warn(error);
    setHasError(true);
  };

  const setupXR = async (scene: Scene, sessionMode: XRSessionMode) => {
    try {
      const { xr, meshDetector } = await setupMeshDetectorXR(
        scene,
        sessionMode,
        handleError,
      );
      setXR(xr);
      setXRMode(sessionMode);
      setMeshDetector(meshDetector);
    } catch (err) {
      console.warn(err);
    }
  };

  onMount(async () => {
    if (!canvas) return;

    const engine = new Engine(canvas, true);
    setEngine(engine);

    const { scene, camera } = await createScene(engine, canvas);
    camera.setTarget(new Vector3(0, 1, 0));
    new HemisphericLight("light", new Vector3(1, 1, 0), scene);

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

  const createPlaneMaterial = (scene: Scene) => {
    const mat = new StandardMaterial("mat", scene);
    mat.alpha = 0.5;
    mat.diffuseColor = Color3.Random();
    mat.wireframe = true;
    return mat;
  };

  meshDetector$.pipe(takeUntil(cleanup$)).subscribe(meshDetector => {
    console.log("meshDetector: ", meshDetector);
    const scene = engine()!.scenes[0];
    meshMap.clear();
    if (meshDetector && scene) {
      meshDetector.onMeshAddedObservable.add(event => {
        console.log("meshDetector mesh added: ", event);
        const mesh = event.mesh;
        if (mesh) {
          mesh.material = createPlaneMaterial(scene);
        }
      });
      meshDetector.onMeshUpdatedObservable.add(event => {
        console.log("meshDetector mesh updated: ", event);
      });
      meshDetector.onMeshRemovedObservable.add(event => {
        console.log("meshDetector mesh removed: ", event);
        const mesh = event.mesh;
        if (mesh) {
          mesh.dispose();
        }
      });
    }
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
          title="Mesh Detector"
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
export default MeshDetector;
