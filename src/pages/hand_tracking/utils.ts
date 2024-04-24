import { WebXRHand, WebXRHandJoint } from "@babylonjs/core";

export const checkIsOpenFinger = (
  hand: WebXRHand,
  key1: WebXRHandJoint,
  key2: WebXRHandJoint,
) => {
  const wristPos = hand.getJointMesh(WebXRHandJoint.WRIST).position.clone();
  const key1Pos = hand.getJointMesh(key1).position.clone();
  const key2Pos = hand.getJointMesh(key2).position.clone();

  const lWriKey1 = key1Pos.subtract(wristPos).length();
  const lWriKey2 = key2Pos.subtract(wristPos).length();

  return lWriKey1 * 0.9 > lWriKey2;
};
