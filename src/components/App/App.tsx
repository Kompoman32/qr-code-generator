import "./App.scss";
import React from "react";
import QRCodeTypeComponent, { QRCodeCorrectionLevel, QRCodeMask, QRCodeType } from "../Type/Type";
import QRCodeComponent from "../Code/Code";
import QrCodeSteps, { QRCodeStepsProps } from "../Code/Steps";

export type AppState = {
  type: QRCodeType;
  correctionLevel: QRCodeCorrectionLevel;
  mask: QRCodeMask;
  data: string;
  info: QRCodeStepsProps;
};

export default class App extends React.Component<any, AppState> {
  constructor(props: any) {
    super(props);

    this.state = {
      type: QRCodeType.Digits,
      correctionLevel: QRCodeCorrectionLevel.L,
      mask: QRCodeMask.Auto,
      data: "",
      info: {
        type: QRCodeType.Digits,
        correctionLevel: QRCodeCorrectionLevel.L,
        mask: QRCodeMask.Auto,
        bestMask: QRCodeMask.First,
        version: 0,
        forcedVersion: -1,
        data: "",
        originalData: "",
      },
    };
  }

  render() {
    return (
      <div className="App">
        <div className="inputs-container">
          <QRCodeTypeComponent
            onTypeChange={(type) => {
              this.setState({ type });
            }}
            onValueChange={(data) => {
              this.setState({ data });
            }}
            onCorrectionLevelChange={(correctionLevel) => {
              this.setState({ correctionLevel });
            }}
            onMaskChange={(mask) => {
              this.setState({ mask });
            }}
          />
          <QrCodeSteps
            type={this.state.info.type}
            correctionLevel={this.state.info.correctionLevel}
            mask={this.state.info.mask}
            bestMask={this.state.info.bestMask}
            version={this.state.info.version}
            forcedVersion={this.state.info.forcedVersion}
            data={this.state.info.data}
            originalData={this.state.info.originalData}
          ></QrCodeSteps>
        </div>
        <div className="code-container">
          <QRCodeComponent
            type={this.state.type}
            correctionLevel={this.state.correctionLevel}
            data={this.state.data}
            mask={this.state.mask}
            updateInscrutions={(info: QRCodeStepsProps) => {
              this.setState({ info });
              this.forceUpdate();
            }}
          />
        </div>
      </div>
    );
  }
}
