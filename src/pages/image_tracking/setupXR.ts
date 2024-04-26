import {
  IWebXRImageTrackingOptions,
  Scene,
  WebXRDefaultExperience,
  WebXRFeatureName,
  WebXRImageTracking,
} from "@babylonjs/core";
import { setupXR } from "babylonUtils/setupXR";
import trackingImgUrl from "material/goldfish_256.jpg?url";

export const setupImageTrackingXR = async (
  scene: Scene,
  sessionMode: XRSessionMode,
  onError?: (error: unknown) => void,
): Promise<{
  xr: WebXRDefaultExperience | null | undefined;
  imageTracking: WebXRImageTracking | undefined;
}> => {
  try {
    const xr = await setupXR(scene, sessionMode, onError);
    if (!xr)
      return {
        xr,
        imageTracking: undefined,
      };

    const featuresManager = xr.baseExperience.featuresManager;

    const img = document.createElement("img");
    img.src = trackingImgUrl;
    await img.decode();
    const imgBitmap = await createImageBitmap(img);

    const imageTrackingOptions: IWebXRImageTrackingOptions = {
      images: [
        {
          src: imgBitmap,
          estimatedRealWorldWidth: 1,
        },
      ],
    };
    const imageTracking = featuresManager.enableFeature(
      WebXRFeatureName.IMAGE_TRACKING,
      "latest",
      imageTrackingOptions,
    ) as WebXRImageTracking;

    return {
      xr,
      imageTracking,
    };
  } catch (err) {
    console.warn(err);
  }

  return {
    xr: undefined,
    imageTracking: undefined,
  };
};
