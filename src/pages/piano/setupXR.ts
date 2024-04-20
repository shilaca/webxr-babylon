import {
  PhysicsImpostor,
  Scene,
  WebXRFeatureName,
  WebXRHandTracking,
} from "@babylonjs/core";
import { setupXR } from "babylonUtils/setupXR";

export const setupPianoXR = async (
  scene: Scene,
  sessionMode: XRSessionMode,
) => {
  try {
    const xr = await setupXR(scene, sessionMode);
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

    featuresManager.enableFeature(
      WebXRFeatureName.POINTER_SELECTION,
      "latest",
      {
        xrInput: xr.input,
        enablePointerSelectionOnAllControllers: true,
      },
    );

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
