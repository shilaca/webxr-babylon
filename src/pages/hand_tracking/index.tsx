import {
  Engine,
  HemisphericLight,
  MeshBuilder,
  Quaternion,
  Scene,
  TransformNode,
  Vector3,
  WebXRDefaultExperience,
  WebXRHand,
  WebXRHandJoint,
  WebXRHandTracking,
  WebXRSessionManager,
} from "@babylonjs/core";
import { Subject, from, fromEvent, takeUntil } from "rxjs";
import {
  Component,
  createEffect,
  createSignal,
  observable,
  onCleanup,
  onMount,
} from "solid-js";
import { createScene } from "babylonUtils/createScene";
import commonStyle from "common/style.module.css";
import BasicOverlayContent from "components/BasicOverlayContent";
import { setupHandTrackingXR } from "pages/hand_tracking/setupXR";
import { checkIsOpenFinger } from "pages/hand_tracking/utils";

const Basic: Component = () => {
  let canvas: HTMLCanvasElement | undefined;

  const cleanup$ = new Subject<void>();

  const [engine, setEngine] = createSignal<Engine | undefined>();

  const [supportVR, setSupportVR] = createSignal<boolean | undefined>();
  const [supportAR, setSupportAR] = createSignal<boolean | undefined>();

  const [xrMode, setXRMode] = createSignal<XRSessionMode>("inline");
  const [xr, setXR] = createSignal<WebXRDefaultExperience | null | undefined>();

  const [handTracking, setHandTracking] = createSignal<
    WebXRHandTracking | undefined
  >();
  const handTracking$ = from(observable(handTracking));

  const [hands, setHands] = createSignal<WebXRHand[]>([]);

  const [hasError, setHasError] = createSignal(false);
  const handleError = (error: unknown) => {
    console.warn(error);
    setHasError(true);
  };

  const setupXR = async (scene: Scene, sessionMode: XRSessionMode) => {
    try {
      const { xr, handTracking } = await setupHandTrackingXR(
        scene,
        sessionMode,
        handleError,
      );
      setXR(xr);
      setXRMode(sessionMode);
      setHandTracking(handTracking);
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

    const root = new TransformNode("cubeRoot", scene);
    root.rotationQuaternion = new Quaternion();

    const cube = MeshBuilder.CreateBox("cube", { size: 0.1 }, scene);
    cube.parent = root;

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

  handTracking$.pipe(takeUntil(cleanup$)).subscribe(handTracking => {
    setHands([]);
    if (handTracking) {
      handTracking.onHandAddedObservable.add(hand => {
        setHands(prev => [...prev, hand]);
      });
    }
  });

  createEffect(async () => {
    const scene = engine()?.scenes[0];
    if (!scene) return;

    const cubeScale = {
      cur: 0,
      next: 0,
      scaleDelta: 0.1,
    };

    scene.onBeforeRenderObservable.add(() => {
      const root = scene.getTransformNodeByName("cubeRoot");
      const cube = scene.getMeshByName("cube");

      if (!cube || !root) return;

      hands().forEach(hand => {
        const name = hand.handMesh?.name ?? "";
        if (/.*L$/.test(name)) {
          const wristPos = hand
            .getJointMesh(WebXRHandJoint.WRIST)
            .position.clone();
          const thumb2Pos = hand
            .getJointMesh(WebXRHandJoint.THUMB_PHALANX_PROXIMAL)
            .position.clone();
          const pinky2Pos = hand
            .getJointMesh(WebXRHandJoint.PINKY_FINGER_PHALANX_PROXIMAL)
            .position.clone();

          const vWriThu = thumb2Pos.subtract(wristPos);
          const vWriPin = pinky2Pos.subtract(wristPos);

          const cross = vWriThu.cross(wristPos).normalize();
          const dot = vWriThu.dot(vWriPin);

          const joint = hand.getJointMesh(
            WebXRHandJoint.INDEX_FINGER_PHALANX_INTERMEDIATE,
          );
          const pos = joint.position.clone();
          const quaternion = joint.rotationQuaternion!.clone();

          const deltaPos = vWriThu.cross(vWriPin).normalize();

          root.position.copyFrom(pos.add(deltaPos.scale(0.12)));
          root.rotationQuaternion?.copyFrom(quaternion);

          const fingerToCheck: WebXRHandJoint[][] = [
            [
              WebXRHandJoint.INDEX_FINGER_TIP,
              WebXRHandJoint.INDEX_FINGER_PHALANX_DISTAL,
            ],
            [
              WebXRHandJoint.MIDDLE_FINGER_TIP,
              WebXRHandJoint.MIDDLE_FINGER_PHALANX_DISTAL,
            ],
            [
              WebXRHandJoint.RING_FINGER_TIP,
              WebXRHandJoint.RING_FINGER_PHALANX_DISTAL,
            ],
            [
              WebXRHandJoint.PINKY_FINGER_TIP,
              WebXRHandJoint.PINKY_FINGER_PHALANX_DISTAL,
            ],
          ];

          const isOpenFingers = fingerToCheck.every(keys =>
            checkIsOpenFinger(hand, keys[0], keys[1]),
          );
          const isOpenSide = dot < 0.004;
          const isOpen = isOpenSide && isOpenFingers;

          const upturn = Math.abs(cross.y) < 0.3;
          console.log(isOpen, upturn, cross.y);
          if (isOpen) {
            cubeScale.next = 1;
          } else {
            cubeScale.next = 0;
          }
        }
      });

      cubeScale.cur =
        Math.abs(cubeScale.cur - cubeScale.next) < 0.01
          ? cubeScale.next
          : cubeScale.cur +
            (cubeScale.next - cubeScale.cur) * cubeScale.scaleDelta;

      cube.scaling.copyFromFloats(cubeScale.cur, cubeScale.cur, cubeScale.cur);
      const updateRotation = (num: number) => {
        const delta = 0.02;
        return (num + delta) % (2 * Math.PI);
      };
      cube.rotation.set(
        updateRotation(cube.rotation.x),
        updateRotation(cube.rotation.y),
        updateRotation(cube.rotation.z),
      );
    });
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
          title="Hand tracking"
          xrMode={xrMode()}
        />
        <p>
          Enter XR mode, and when you open your left hand there, a cube appears
        </p>
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
