import {
  ArcRotateCamera,
  Engine,
  Scene,
  TargetCamera,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";

export const createScene = async (
  engine: Engine,
  canvas: HTMLCanvasElement,
  cameraAlpha: number = Math.PI / 3,
  cameraBeta: number = Math.PI / 4,
  cameraRadius: number = 3,
  cameraTarget: Vector3 = Vector3.Zero(),
): Promise<{ scene: Scene; camera: TargetCamera }> => {
  const scene = new Scene(engine);

  // const camera = new FreeCamera("camera", new Vector3(0, 5, -10), scene);
  // camera.setTarget(Vector3.Zero());

  const camera = new ArcRotateCamera(
    "camera",
    cameraAlpha,
    cameraBeta,
    cameraRadius,
    cameraTarget,
    scene,
  );
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);

  return { scene, camera };
};
