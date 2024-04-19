import { AbstractMesh } from "@babylonjs/core";
import {
  AdvancedDynamicTexture,
  Control,
  Rectangle,
  TextBlock,
} from "@babylonjs/gui";

export const createUI = (): AdvancedDynamicTexture => {
  const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("ui1");
  return advancedTexture;
};

export const addLabelToMesh = (
  ui: AdvancedDynamicTexture,
  mesh: AbstractMesh
): void => {
  const label = new Rectangle("label for " + mesh.name);
  label.background = "black";
  label.height = "30px";
  label.alpha = 0.5;
  label.width = "100px";
  label.cornerRadius = 20;
  label.thickness = 1;
  label.linkOffsetY = 30;
  label.top = "10%";
  label.zIndex = 5;
  label.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
  ui.addControl(label);

  const text1 = new TextBlock();
  text1.text = mesh.name;
  text1.color = "white";
  label.addControl(text1);
};
