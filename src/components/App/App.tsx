import "./App.scss";
import React from "react";
import QRCodeTypeComponent, { QRCodeType } from "../Type/Type";
import QRCodeCorrectionLevelComponent, { QRCodeCorrectionLevel } from "../CorrectionLevel/CorrectionLevel";
import QRCodeComponent from "../Code/Code";

export type AppProps = {
  type: QRCodeType;
  correctionLevel: QRCodeCorrectionLevel;
  data: string;
};

export default class App extends React.Component<any, AppProps> {
  constructor(props: any) {
    super(props);

    this.state = {
      type: QRCodeType.Letters,
      correctionLevel: QRCodeCorrectionLevel.L,
      data: "",
    };
  }

  render() {
    // let array: any[] = [];
    // for (let i = 0; i < 40; i++) {
    //   const code = QrCodeGenerator.getFilledServiceBytes(i, 0, 0).qrCode;

    //   let u = 0;

    //   for (let i = 0; i < code.length; i++) {
    //     const element = code[i];

    //     for (let j = 0; j < element.length; j++) {
    //       if (element[j] === undefined) {
    //         u++;
    //       }
    //     }
    //   }

    //   array[i] = (
    //     <li>
    //       {i + 1} : {code.length * code.length - u} + {u} = {code.length * code.length} (
    //       {u % 8 === 0 ? "true" : "false"})
    //     </li>
    //   );
    // }

    return (
      <div className="App">
        <QRCodeTypeComponent
          onTypeChange={(type) => {
            this.setState({ type });
          }}
          onValueChange={(data) => {
            this.setState({ data });
          }}
        />
        <QRCodeCorrectionLevelComponent
          onCorrectionLevelChange={(correctionLevel) => {
            this.setState({ correctionLevel });
          }}
        />
        <QRCodeComponent type={this.state.type} correctionLevel={this.state.correctionLevel} data={this.state.data} />
      </div>
    );
  }
}
