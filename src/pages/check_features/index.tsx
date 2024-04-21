import { Component, For, Show, createSignal, onMount } from "solid-js";
import commonStyle from "common/style.module.css";
import trackingImgUrl from "material/goldfish_256.jpg?url";
import style from "./style.module.css";

const CheckFeatures = () => {
  let canvas: HTMLCanvasElement | undefined;

  const [loading, setLoading] = createSignal(false);

  return (
    <>
      <div class={style.overlay} id="overlay">
        <For each={["immersive-vr", "immersive-ar"] as const}>
          {sessionMode => (
            <div class={style.container}>
              <p>{sessionMode}</p>
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
                ]}
              >
                {featureName => (
                  <XrFeatureButton
                    disabled={loading()}
                    featureNames={featureName}
                    sessionMode={sessionMode}
                    onEnd={() => setLoading(false)}
                    onStart={() => setLoading(true)}
                  />
                )}
              </For>
            </div>
          )}
        </For>
      </div>
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
  onStart: () => void;
  onEnd: () => void;
}> = props => {
  const [supported, setSupported] = createSignal<boolean | undefined>();

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
              ...(props.featureNames.includes("image-tracking") && trackingImg()
                ? {
                    trackedImages: [
                      {
                        image: trackingImg()!,
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
