import {
  IWebXRMeshDetectorOptions,
  Scene,
  WebXRDefaultExperience,
  WebXRFeatureName,
  WebXRMeshDetector,
} from "@babylonjs/core";
import { setupXR } from "babylonUtils/setupXR";

export const setupMeshDetectorXR = async (
  scene: Scene,
  sessionMode: XRSessionMode,
): Promise<{
  xr: WebXRDefaultExperience | null | undefined;
  meshDetector: WebXRMeshDetector | undefined;
}> => {
  try {
    const xr = await setupXR(scene, sessionMode);
    if (!xr)
      return {
        xr,
        meshDetector: undefined,
      };

    const featuresManager = xr.baseExperience.featuresManager;

    const meshDetectorOptions: IWebXRMeshDetectorOptions = {
      doNotRemoveMeshesOnSessionEnded: true,
      generateMeshes: true,
    };
    const meshDetector = featuresManager.enableFeature(
      WebXRFeatureName.MESH_DETECTION,
      "latest",
      meshDetectorOptions,
    ) as WebXRMeshDetector;

    return {
      xr,
      meshDetector,
    };
  } catch (err) {
    console.warn(err);
  }

  return {
    xr: undefined,
    meshDetector: undefined,
  };
};
