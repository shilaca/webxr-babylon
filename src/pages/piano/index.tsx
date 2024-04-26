import {
  AbstractMesh,
  Engine,
  HemisphericLight,
  IPointerEvent,
  PointerEventTypes,
  Scene,
  Vector3,
  WebXRDefaultExperience,
  WebXRHand,
  WebXRHandJoint,
  WebXRHandTracking,
  WebXRSessionManager,
} from "@babylonjs/core";
import { Subject, fromEvent, takeUntil, from } from "rxjs";
import {
  Component,
  createEffect,
  createSignal,
  observable,
  onCleanup,
  onMount,
} from "solid-js";
import Soundfont from "soundfont-player";
import { createScene } from "babylonUtils/createScene";
import commonStyle from "common/style.module.css";
import BasicOverlayContent from "components/BasicOverlayContent";
import { createPiano } from "pages/piano/createPiano";
import { setupPianoXR } from "pages/piano/setupXR";

const Piano: Component = () => {
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

  // const [audioCtx, setAudioCtx] = createSignal<AudioContext | undefined>();
  const [pianoSound, setPianoSound] = createSignal<
    Soundfont.Player | undefined
  >();

  const pointerToKey = new Map<
    string,
    {
      mesh: AbstractMesh;
      note: Soundfont.Player;
    }
  >();

  const setupXR = async (scene: Scene, sessionMode: XRSessionMode) => {
    try {
      const { xr, handTracking } = await setupPianoXR(
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
    createPiano(scene);

    const audioCtx = new AudioContext();
    // setAudioCtx(audioCtx);
    const pianoSound = await Soundfont.instrument(
      audioCtx,
      "acoustic_grand_piano",
    );
    setPianoSound(pianoSound);

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

    scene.onPointerObservable.add(pointerInfo => {
      const pointerId = (
        pointerInfo.event as IPointerEvent
      ).pointerId.toString();
      switch (pointerInfo.type) {
        case PointerEventTypes.POINTERDOWN:
          if (pointerInfo.pickInfo?.hit) {
            const pickedMesh = pointerInfo.pickInfo.pickedMesh;
            const meshName = pointerInfo.pickInfo.pickedMesh?.name;
            if (pickedMesh?.parent?.name === "keyboard" && meshName) {
              pickedMesh.position.y -= 0.5;
              // play the sound of the note
              pointerToKey.set(pointerId, {
                mesh: pickedMesh,
                note: pianoSound.play(meshName),
              });
            }
          }
          break;
        case PointerEventTypes.POINTERUP:
          if (pointerToKey.has(pointerId)) {
            const key = pointerToKey.get(pointerId);
            if (key) {
              key.mesh.position.y += 0.5;
              key.note.stop();
              // stop the sound of the note of the  key that is released
              pointerToKey.delete(pointerId);
            }
          }
          break;

        default:
          // console.log(
          //   "pointer event types: ",
          //   pointerInfo.type,
          //   PointerEventTypes,
          // );
          break;
      }
    });

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
    const sound = pianoSound();
    const delta = 0.2;
    const scene = engine()?.scenes[0];
    if (!sound || !scene) return;
    scene.onBeforeRenderObservable.add(() => {
      const fingers = hands().flatMap(hand => [
        hand.getJointMesh(WebXRHandJoint.THUMB_TIP),
        hand.getJointMesh(WebXRHandJoint.INDEX_FINGER_TIP),
        hand.getJointMesh(WebXRHandJoint.MIDDLE_FINGER_TIP),
        hand.getJointMesh(WebXRHandJoint.RING_FINGER_TIP),
        hand.getJointMesh(WebXRHandJoint.PINKY_FINGER_TIP),
      ]);
      const keys = scene.getNodeByName("keyboard")?.getChildMeshes(true) ?? [];

      for (let key of keys) {
        const intersect = fingers.some(finger => {
          const result = key.intersectsMesh(finger);
          return result;
        });
        const keyCode = key.name;
        if (intersect && !pointerToKey.has(keyCode)) {
          key.position.y -= delta;
          pointerToKey.set(keyCode, {
            mesh: key,
            note: sound.play(keyCode),
          });
        } else if (!intersect && pointerToKey.has(keyCode)) {
          const pointer = pointerToKey.get(keyCode);
          key.position.y += delta;
          pointer?.note.stop();
          pointerToKey.delete(keyCode);
        }
      }
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
          title="Piano"
          xrMode={xrMode()}
        />

        {/* <button
          class={commonStyle.button}
          onClick={() => {
            const ctx = audioCtx();
            if (!ctx) return;
            const oscillator = ctx.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(440, ctx.currentTime);
            oscillator.connect(ctx.destination);
            oscillator.start();
            window.setTimeout(() => {
              oscillator.stop();
              oscillator.disconnect();
            }, 100);
          }}
        >
          Audio Check
        </button> */}
      </div>
      <canvas class={commonStyle.mainCanvas} ref={canvas}>
        Oops! It looks like your browser doesn't support the canvas element.
        Please update your browser or switch to a modern browser that supports
        canvas for the best experience.
      </canvas>
    </>
  );
};
export default Piano;
