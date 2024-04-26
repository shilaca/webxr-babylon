import { Component, For, Show, createSignal, onMount } from "solid-js";
import commonStyle from "common/style.module.css";
import trackingImgUrl from "material/goldfish_256.jpg?url";
import style from "./style.module.css";

const CheckFeatures = () => {
  let canvas: HTMLCanvasElement | undefined;

  const [loading, setLoading] = createSignal(false);

  const [trackingImg, setTrackingImg] = createSignal<ImageBitmap | undefined>();

  onMount(async () => {
    const img = document.createElement("img");
    img.src = trackingImgUrl;
    await img.decode();
    const imgBitmap = await createImageBitmap(img);
    setTrackingImg(imgBitmap);
  });

  return (
    <>
      <section class={style.overlay} id="overlay">
        <h1 class={commonStyle.heading}>
          Check the support for WebXR session features
        </h1>
        <p class={commonStyle.text}>
          Pressing the button will launch a session with the corresponding
          feature enabled and check if any errors occur.
        </p>
        <For each={["immersive-vr", "immersive-ar"] as const}>
          {sessionMode => (
            <section class={style.container}>
              <h2 class={commonStyle.heading}>{sessionMode}</h2>
              <div class={style.buttonsContainer}>
                <For
                  each={[
                    ["bounded-floor"],
                    ["local"],
                    ["local-floor"],
                    ["unbounded"],
                    ["viewer"],
                    ["anchors"],
                    ["depth-sensing"],
                    ["dom-overlay"],
                    ["hand-tracking"],
                    ["hit-test"],
                    ["image-tracking"],
                    ["layers"],
                    ["light-estimation"],
                    ["mesh-detection"],
                    ["plane-detection"],
                    ["camera-access"],
                    ["space-warp"],
                    ["secondary-views"],
                    //
                  ]}
                >
                  {featureName => (
                    <XrFeatureButton
                      disabled={loading()}
                      featureNames={featureName}
                      sessionMode={sessionMode}
                      trackingImg={trackingImg()}
                      onEnd={() => setLoading(false)}
                      onStart={() => setLoading(true)}
                    />
                  )}
                </For>
              </div>
            </section>
          )}
        </For>
      </section>
      <canvas class={commonStyle.mainCanvas} ref={canvas}>
        Oops! It looks like your browser doesn't support the canvas element.
        Please update your browser or switch to a modern browser that supports
        canvas for the best experience.
      </canvas>
    </>
  );
};
export default CheckFeatures;

const XrFeatureButton: Component<{
  sessionMode: XRSessionMode;
  featureNames: string[];
  disabled: boolean;
  trackingImg?: ImageBitmap;
  onStart: () => void;
  onEnd: () => void;
}> = props => {
  const [supported, setSupported] = createSignal<boolean | undefined>();

  return (
    <>
      <button
        classList={{
          [style.button]: true,
          [style.supported]: supported() === true,
          [style.notSupported]: supported() === false,
        }}
        disabled={props.disabled || supported() !== undefined}
        onClick={async () => {
          props.onStart();

          const session = await navigator.xr
            ?.requestSession(props.sessionMode, {
              requiredFeatures: props.featureNames,
              ...(props.featureNames.includes("dom-overlay")
                ? {
                    domOverlay: {
                      root: document.getElementById("overlay")!,
                    },
                  }
                : {}),
              ...(props.featureNames.includes("depth-sensing")
                ? {
                    depthSensing: {
                      usagePreference: ["cpu-optimized", "gpu-optimized"],
                      dataFormatPreference: ["luminance-alpha", "float32"],
                    },
                  }
                : {}),
              ...(props.featureNames.includes("image-tracking") &&
              props.trackingImg
                ? {
                    trackedImages: [
                      {
                        image: props.trackingImg,
                        widthInMeters: 0.1,
                      },
                    ],
                  }
                : {}),
            })
            .then(session => {
              console.log("requested session: ", session);
              setSupported(true);

              return session;
            })
            .catch(err => {
              console.log("failed to request session: ", err);
              setSupported(false);
            });

          await session?.end();

          props.onEnd();
        }}
      >
        {props.featureNames.join(", ")}
        <br />
        <Show when={supported() === true}>supported</Show>
        <Show when={supported() === false}>not supported</Show>
      </button>
    </>
  );
};
