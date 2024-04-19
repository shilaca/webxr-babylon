import { ArcRotateCamera, Engine, Scene, Vector3 } from "@babylonjs/core";

export const createScene = async (
  engine: Engine,
  canvas: HTMLCanvasElement,
): Promise<Scene> => {
  const scene = new Scene(engine);

  // const camera = new FreeCamera("camera", new Vector3(0, 5, -10), scene);
  // camera.setTarget(Vector3.Zero());

  const camera = new ArcRotateCamera(
    "camera",
    (3 * Math.PI) / 2,
    Math.PI / 50,
    2.2,
    new Vector3(0, 0, 0),
    scene,
  );
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);

  return scene;
};
