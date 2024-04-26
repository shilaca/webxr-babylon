import {
  PhysicsImpostor,
  Scene,
  WebXRFeatureName,
  WebXRHandTracking,
} from "@babylonjs/core";
import { setupXR } from "babylonUtils/setupXR";

export const setupHandTrackingXR = async (
  scene: Scene,
  sessionMode: XRSessionMode,
  onError?: (error: unknown) => void,
) => {
  try {
    const xr = await setupXR(scene, sessionMode, onError);
    if (!xr)
      return {
        xr,
        handTracking: undefined,
      };

    const featuresManager = xr.baseExperience.featuresManager;

    const handTracking = featuresManager.enableFeature(
      WebXRFeatureName.HAND_TRACKING,
      "latest",
      {
        xrInput: xr.input,
        jointMeshes: {
          enablePhysics: true,
          physicsProps: {
            impostorType: PhysicsImpostor.SphereImpostor,
            friction: 0.5,
            restitution: 0.3,
          },
        },
      },
    ) as WebXRHandTracking;

    return {
      xr,
      handTracking,
    };
  } catch (err) {
    console.warn(err);
  }

  return {
    xr: undefined,
    handTracking: undefined,
  };
};
