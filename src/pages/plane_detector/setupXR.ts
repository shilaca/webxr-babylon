import {
  IWebXRPlaneDetectorOptions,
  Scene,
  WebXRDefaultExperience,
  WebXRFeatureName,
  WebXRPlaneDetector,
} from "@babylonjs/core";
import { setupXR } from "babylonUtils/setupXR";

export const setupPlaneDetectorXR = async (
  scene: Scene,
  sessionMode: XRSessionMode,
  onError?: (error: unknown) => void,
): Promise<{
  xr: WebXRDefaultExperience | null | undefined;
  planeDetector: WebXRPlaneDetector | undefined;
}> => {
  try {
    const xr = await setupXR(scene, sessionMode, onError);
    if (!xr)
      return {
        xr,
        planeDetector: undefined,
      };

    const featuresManager = xr.baseExperience.featuresManager;

    const planeDetectorOptions: IWebXRPlaneDetectorOptions = {
      doNotRemovePlanesOnSessionEnded: true,
    };
    const planeDetector = featuresManager.enableFeature(
      WebXRFeatureName.PLANE_DETECTION,
      "latest",
      planeDetectorOptions,
    ) as WebXRPlaneDetector;

    return {
      xr,
      planeDetector,
    };
  } catch (err) {
    console.warn(err);
  }

  return {
    xr: undefined,
    planeDetector: undefined,
  };
};
