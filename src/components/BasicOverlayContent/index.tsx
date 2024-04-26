import { Component } from "solid-js";
import commonStyle from "common/style.module.css";
import ChangeXRMode from "components/ChangeXRMode";
import NotSupport from "components/NotSupport";

const BasicOverlayContent: Component<{
  title: string;
  xrMode: XRSessionMode;
  supportAR: boolean | undefined;
  supportVR: boolean | undefined;
  changeXRMode: (mode: XRSessionMode) => Promise<void>;
  hasError: boolean;
}> = props => {
  return (
    <>
      <h2 class={commonStyle.heading}>{props.title}</h2>
      <ChangeXRMode
        curXRMode={props.xrMode}
        supportAR={props.supportAR}
        supportVR={props.supportVR}
        onChangeXRMode={props.changeXRMode}
      />
      <NotSupport show={props.hasError} />
    </>
  );
};
export default BasicOverlayContent;
