import {
  AbstractMesh,
  Color3,
  Engine,
  HemisphericLight,
  IWebXRTrackedImage,
  Mesh,
  MeshBuilder,
  Quaternion,
  Scene,
  StandardMaterial,
  Vector3,
  WebXRDefaultExperience,
  WebXRImageTracking,
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
import trackingImgUrl from "material/goldfish_256.jpg?url";
import { setupImageTrackingXR } from "./setupXR";
import style from "./style.module.css";

const ImageTracking: Component = () => {
  let canvas: HTMLCanvasElement | undefined;

  const cleanup$ = new Subject<void>();

  const [engine, setEngine] = createSignal<Engine | undefined>();

  const [supportVR, setSupportVR] = createSignal<boolean | undefined>();
  const [supportAR, setSupportAR] = createSignal<boolean | undefined>();

  const [xrMode, setXRMode] = createSignal<XRSessionMode>("inline");
  const [xr, setXR] = createSignal<WebXRDefaultExperience | null | undefined>();

  const [imageTracking, setImageTracking] = createSignal<
    WebXRImageTracking | undefined
  >();
  const imageTracking$ = from(observable(imageTracking));

  const [obj, setObj] = createSignal<Mesh | undefined>();

  const [hasError, setHasError] = createSignal(false);
  const handleError = (error: unknown) => {
    console.warn(error);
    setHasError(true);
  };

  const setupXR = async (scene: Scene, sessionMode: XRSessionMode) => {
    try {
      const { xr, imageTracking } = await setupImageTrackingXR(
        scene,
        sessionMode,
        handleError,
      );
      setXR(xr);
      setXRMode(sessionMode);
      setImageTracking(imageTracking);
    } catch (err) {
      console.warn(err);
    }
  };

  onMount(async () => {
    if (!canvas) return;

    const engine = new Engine(canvas, true);
    setEngine(engine);

    const { scene } = await createScene(engine, canvas);
    scene.useRightHandedSystem = true;

    new HemisphericLight("light", new Vector3(1, 1, 0), scene);

    const mat = new StandardMaterial("mat", scene);
    mat.diffuseColor = Color3.Random();

    const mesh = MeshBuilder.CreateTorus(
      "obj",
      {
        diameter: 0.5,
        thickness: 0.2,
      },
      scene,
    );
    mesh.position.set(0, 0.1, 0);
    mesh.visibility = 0;
    mesh.rotationQuaternion = new Quaternion();
    setObj(mesh);

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

  const updateModel = (model: AbstractMesh, image: IWebXRTrackedImage) => {
    const scale =
      typeof image.realWorldWidth === "number" &&
      typeof image.ratio === "number"
        ? image.realWorldWidth / image.ratio
        : 0;
    console.log("scale: ", scale);
    if (scale) {
      image.transformationMatrix.decompose(
        model.scaling,
        model.rotationQuaternion!,
        model.position,
      );
      model.position.z += scale / 2;
      model.scaling.set(scale, scale, scale);
    }
  };

  imageTracking$.pipe(takeUntil(cleanup$)).subscribe(imageTracking => {
    console.log("imageTracking: ", imageTracking);
    const scene = engine()!.scenes[0];
    if (imageTracking && scene) {
      imageTracking.onTrackableImageFoundObservable.add(event => {
        console.log("trackable image found: ", event);
        const mesh = obj();
        if (mesh) {
          mesh.visibility = 1;
          updateModel(mesh, event);
        }
      });
      imageTracking.onTrackedImageUpdatedObservable.add(event => {
        console.log("tracked image updated: ", event);
        const mesh = obj();
        if (mesh) {
          updateModel(mesh, event);
        }
      });
      imageTracking.onUntrackableImageFoundObservable.add(event => {
        console.log("untrackable image found: ", event);
        const mesh = obj();
        if (mesh) {
          mesh.visibility = 0;
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
          title="Image tracking"
          xrMode={xrMode()}
        />

        <figure class={style.imageContainer}>
          <figcaption>Tracking image</figcaption>
          <img
            alt=""
            class={style.image}
            height={500}
            src={trackingImgUrl}
            width={500}
          />
        </figure>
      </div>
      <canvas class={commonStyle.mainCanvas} ref={canvas}>
        Oops! It looks like your browser doesn't support the canvas element.
        Please update your browser or switch to a modern browser that supports
        canvas for the best experience.
      </canvas>
    </>
  );
};
export default ImageTracking;
