import {
  Color3,
  Engine,
  HemisphericLight,
  IWebXRPlane,
  Material,
  Mesh,
  PolygonMeshBuilder,
  Quaternion,
  Scene,
  StandardMaterial,
  Vector2,
  Vector3,
  WebXRDefaultExperience,
  WebXRPlaneDetector,
  WebXRSessionManager,
} from "@babylonjs/core";
import earcut from "earcut";
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
import ChangeXRMode from "components/ChangeXRMode";
import { setupPlaneDetectorXR } from "./setupXR";

const PlaneDetector: Component = () => {
  let canvas: HTMLCanvasElement | undefined;

  const cleanup$ = new Subject<void>();

  const [engine, setEngine] = createSignal<Engine | undefined>();

  const [supportVR, setSupportVR] = createSignal<boolean | undefined>();
  const [supportAR, setSupportAR] = createSignal<boolean | undefined>();

  const [xrMode, setXRMode] = createSignal<XRSessionMode>("inline");
  const [xr, setXR] = createSignal<WebXRDefaultExperience | null | undefined>();
  const [planeDetector, setPlaneDetector] = createSignal<
    WebXRPlaneDetector | undefined
  >();

  const planeDetector$ = from(observable(planeDetector));
  const planeMap = new Map<number, Mesh>();

  const setupXR = async (scene: Scene, sessionMode: XRSessionMode) => {
    try {
      const { xr, planeDetector } = await setupPlaneDetectorXR(
        scene,
        sessionMode,
      );
      setXR(xr);
      setXRMode(sessionMode);
      setPlaneDetector(planeDetector);
    } catch (err) {
      console.warn(err);
    }
  };

  onMount(async () => {
    if (!canvas) return;

    const engine = new Engine(canvas, true);
    setEngine(engine);

    const scene = await createScene(engine, canvas);
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
    return mat;
  };

  const createPlane = (plane: IWebXRPlane, scene: Scene, mat: Material) => {
    plane.polygonDefinition.push(plane.polygonDefinition[0]);
    const polygon_triangulation = new PolygonMeshBuilder(
      "plane_" + plane.id,
      plane.polygonDefinition.filter(p => p).map(p => new Vector2(p.x, p.z)),
      scene,
      earcut,
    );
    const polygon = polygon_triangulation.build(false, 0.001);

    polygon.createNormals(false);

    polygon.material = mat;
    polygon.rotationQuaternion = new Quaternion();
    plane.transformationMatrix.decompose(
      polygon.scaling,
      polygon.rotationQuaternion,
      polygon.position,
    );

    return polygon;
  };

  planeDetector$.pipe(takeUntil(cleanup$)).subscribe(planeDetector => {
    console.log("planeDetector: ", planeDetector);
    const scene = engine()!.scenes[0];
    planeMap.clear();
    if (planeDetector && scene) {
      planeDetector.onPlaneAddedObservable.add(plane => {
        console.log("planeDetector plane added: ", plane);
        const mat = createPlaneMaterial(scene);
        const mesh = createPlane(plane, scene, mat);
        planeMap.set(plane.id, mesh);
      });
      planeDetector.onPlaneUpdatedObservable.add(plane => {
        console.log("planeDetector plane updated: ", plane);
        const mesh = planeMap.get(plane.id);
        const mat = mesh?.material;
        if (mat) {
          mesh.dispose();
          const newMesh = createPlane(plane, scene, mat);
          planeMap.set(plane.id, newMesh);
        }
      });
      planeDetector.onPlaneRemovedObservable.add(plane => {
        console.log("planeDetector plane removed: ", plane);
        const mesh = planeMap.get(plane.id);
        if (mesh) {
          mesh.dispose();
          planeMap.delete(plane.id);
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
export default PlaneDetector;
