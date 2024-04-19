import { Scene } from "@babylonjs/core";

// const getFloorMeshes = (scene: Scene) => {
//   const env = scene.createDefaultEnvironment();
//   return env?.ground ? [env.ground] : undefined;
// };

export const setupXR = async (scene: Scene, sessionMode: XRSessionMode) => {
  // const floorMeshes =
  //   sessionMode === "immersive-vr" ? getFloorMeshes(scene) : undefined;

  const xr = await scene.createDefaultXRExperienceAsync({
    // floorMeshes,
    // disableDefaultUI: false,
    uiOptions: {
      sessionMode,
    },
  });

  if (!xr.baseExperience) console.warn("No XR Support");

  // const featureManager = xr.baseExperience.featuresManager;
  // featureManager.enableFeature(WebXRFeatureName.TELEPORTATION, "stable", {
  //   xrInput: xr.input,
  //   floorMeshes: env?.ground ? [env.ground] : undefined,
  // });

  // featureManager.enableFeature(WebXRFeatureName.HAND_TRACKING, "latest", {
  //   xrInput: xr.input,
  //   jointMeshes: {
  //     enablePhysics: true,
  //     physicsProps: {
  //       impostorType: PhysicsImpostor.SphereImpostor,
  //       friction: 0.5,
  //       restitution: 0.3,
  //     },
  //   },
  // });

  return xr;
};
