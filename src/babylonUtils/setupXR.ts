import { Scene } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

// const getFloorMeshes = (scene: Scene) => {
//   const env = scene.createDefaultEnvironment();
//   return env?.ground ? [env.ground] : undefined;
// };

export const setupXR = async (scene: Scene, sessionMode: XRSessionMode) => {
  // const floorMeshes =
  //   sessionMode === "immersive-vr" ? getFloorMeshes(scene) : undefined;

  const xr = await scene
    .createDefaultXRExperienceAsync({
      // floorMeshes,
      // disableDefaultUI: false,
      uiOptions: {
        sessionMode,
        optionalFeatures: ["unbounded"],
      },
    })
    .catch(err => {
      console.warn("failed to createDefaultXRExperienceAsync: ", err);
      return null;
    });

  if (!xr?.baseExperience) console.warn("No XR Support");

  return xr;
};
