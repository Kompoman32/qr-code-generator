import "./App.scss";
import React from "react";
import QRCodeTypeComponent, { QRCodeCorrectionLevel, QRCodeMask, QRCodeType } from "../Type/Type";
import QRCodeComponent from "../Code/Code";

export type AppProps = {
  type: QRCodeType;
  correctionLevel: QRCodeCorrectionLevel;
  mask: QRCodeMask;
  data: string;
};

export default class App extends React.Component<any, AppProps> {
  constructor(props: any) {
    super(props);

    this.state = {
      type: QRCodeType.Letters,
      correctionLevel: QRCodeCorrectionLevel.L,
      mask: QRCodeMask.Auto,
      data: "",
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
        </div>
        <div className="code-container">
          <QRCodeComponent
            type={this.state.type}
            correctionLevel={this.state.correctionLevel}
            data={this.state.data}
            mask={this.state.mask}
          />
        </div>
      </div>
    );
  }
}
