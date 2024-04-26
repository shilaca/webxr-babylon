import { Scene } from "@babylonjs/core";

// const getFloorMeshes = (scene: Scene) => {
//   const env = scene.createDefaultEnvironment();
//   return env?.ground ? [env.ground] : undefined;
// };

export const setupXR = async (
  scene: Scene,
  sessionMode: XRSessionMode,
  onError?: (error: unknown) => void,
) => {
  // const floorMeshes =
  //   sessionMode === "immersive-vr" ? getFloorMeshes(scene) : undefined;

  const xr = await scene
    .createDefaultXRExperienceAsync({
      // floorMeshes,
      // disableDefaultUI: false,
      uiOptions: {
        sessionMode,
        optionalFeatures: [
          "bounded-floor",
          "local",
          "local-floor",
          "unbounded",
          "viewer",
        ],
        onError,
      },
    })
    .catch(err => {
      console.warn("failed to createDefaultXRExperienceAsync: ", err);
      return null;
    });

  if (!xr?.baseExperience) console.warn("No XR Support");

  return xr;
};
