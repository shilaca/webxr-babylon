import {
  Color3,
  Mesh,
  MeshBuilder,
  Scene,
  SceneLoader,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { KEY_PARAMS, PIANO_SCALE } from "pages/piano/constants";
import { PianoKey } from "pages/piano/types";

export const createPiano = (scene: Scene) => {
  // Transform Node that acts as the parent of all piano keys
  const keyboard = new TransformNode("keyboard");
  keyboard.position.y += 80;

  let referencePositionX = -2.4 * 14;
  for (let register = 1; register <= 7; register++) {
    KEY_PARAMS.forEach(key => {
      createKey(
        scene,
        keyboard,
        Object.assign({ register, referencePositionX }, key),
      );
    });
    referencePositionX += 2.4 * 7;
  }

  // Register 0
  createKey(scene, keyboard, {
    type: "white",
    note: "A",
    topWidth: 1.9,
    bottomWidth: 2.3,
    topPositionX: -0.2,
    wholePositionX: -2.4,
    register: 0,
    referencePositionX: -2.4 * 21,
  });
  KEY_PARAMS.slice(10, 12).forEach(key => {
    createKey(
      scene,
      keyboard,
      Object.assign({ register: 0, referencePositionX: -2.4 * 21 }, key),
    );
  });

  // Register 8
  createKey(scene, keyboard, {
    type: "white",
    note: "C",
    topWidth: 2.3,
    bottomWidth: 2.3,
    topPositionX: 0,
    wholePositionX: -2.4 * 6,
    register: 8,
    referencePositionX: 84,
  });

  // Transform node that acts as the parent of all piano components
  const piano = new TransformNode("piano");
  keyboard.parent = piano;

  // Import and scale piano frame
  SceneLoader.ImportMesh(
    "frame",
    "https://raw.githubusercontent.com/MicrosoftDocs/mixed-reality/docs/mixed-reality-docs/mr-dev-docs/develop/javascript/tutorials/babylonjs-webxr-piano/files/",
    "pianoFrame.babylon",
    scene,
    function (meshes) {
      const frame = meshes[0];
      frame.parent = piano;
    },
  );

  scaleFromPivot(piano, new Vector3(0, 0, 0), PIANO_SCALE);

  piano.position.z += 0.3;
  piano.position.y += 0.5;
};

const createKey = (scene: Scene, parent: TransformNode, props: PianoKey) => {
  if (props.type === "white") {
    // Create bottom part
    const bottom = MeshBuilder.CreateBox(
      "whiteKeyBottom",
      { width: props.bottomWidth, height: 1.5, depth: 4.5 },
      scene,
    );
    // Create top part
    const top = MeshBuilder.CreateBox(
      "whiteKeyTop",
      { width: props.topWidth, height: 1.5, depth: 5 },
      scene,
    );
    top.position.z = 4.75;
    top.position.x += props.topPositionX;
    // Merge bottom and top parts
    // Parameters of BABYLON.Mesh.MergeMeshes: (arrayOfMeshes, disposeSource, allow32BitsIndices, meshSubclass, subdivideWithSubMeshes, multiMultiMaterials)
    const key = Mesh.MergeMeshes(
      [bottom, top],
      true,
      false,
      undefined,
      false,
      false,
    );
    if (key) {
      key.position.x = (props.referencePositionX ?? 0) + props.wholePositionX;
      key.name = props.note + props.register;
      key.parent = parent;
    }
    return key;
  }

  if (props.type === "black") {
    // Create black color material
    const blackMat = new StandardMaterial("black");
    blackMat.diffuseColor = new Color3(0, 0, 0);

    // Create black key
    const key = MeshBuilder.CreateBox(
      props.note + props.register,
      { width: 1.4, height: 2, depth: 5 },
      scene,
    );
    if (key) {
      key.position.z += 4.75;
      key.position.y += 0.25;
      key.position.x = (props.referencePositionX ?? 0) + props.wholePositionX;
      key.material = blackMat;
      key.parent = parent;
    }
    return key;
  }
};

const scaleFromPivot = (
  transformNode: TransformNode,
  pivotPoint: Vector3,
  scale: number,
) => {
  const _sx = scale / transformNode.scaling.x;
  const _sy = scale / transformNode.scaling.y;
  const _sz = scale / transformNode.scaling.z;
  transformNode.scaling = new Vector3(_sx, _sy, _sz);
  transformNode.position = new Vector3(
    pivotPoint.x + _sx * (transformNode.position.x - pivotPoint.x),
    pivotPoint.y + _sy * (transformNode.position.y - pivotPoint.y),
    pivotPoint.z + _sz * (transformNode.position.z - pivotPoint.z),
  );
};
