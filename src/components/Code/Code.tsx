import "./Code.scss";
import React from "react";
import { QRCodeType } from "../Type/Type";
import { QRCodeCorrectionLevel } from "../CorrectionLevel/CorrectionLevel";
import QrCodeGenerator from "./Generator";

export type QRCodeProps = {
  type: QRCodeType;
  correctionLevel: QRCodeCorrectionLevel;
  data: string;
};

export default class QRCodeComponent extends React.Component<QRCodeProps, any> {
  render() {
    const qrCodes = [];

    for (let i = 0; i < 8; i++) {
      const result = QrCodeGenerator.generate(this.props.data, this.props.type, this.props.correctionLevel, i);
      qrCodes.push(result);
    }

    const ratings: number[] = [];

    for (let i = 0; i < 8; i++) {
      const size = qrCodes[i].qrCode.length;
      const qrCode = qrCodes[i].qrCode.slice(4, size - 1 - 4).map((x) => x.slice(4, size - 1 - 4));
      ratings.push(QrCodeGenerator.getMaskRating(qrCode));
    }

    const drawQrCode = (id: string, qrCode: boolean[][]) =>
      qrCode.map((line, lineInd) => {
        return (
          <div key={"line_" + id + "_" + lineInd} className="line">
            {line.map((byte, byteInd) => {
              let className = "byte";

              if (!!byte) {
                className += " x";
              }

              if (byte === undefined) {
                className += " y";
              }

              if (!!byte && qrCode[lineInd - 1] && !qrCode[lineInd - 1][byteInd]) {
                className += " top";
              }
              if (!!byte && qrCode[lineInd + 1] && !qrCode[lineInd + 1][byteInd]) {
                className += " bottom";
              }
              if (!!byte && !line[byteInd - 1]) {
                className += " left";
              }
              if (!!byte && !line[byteInd + 1]) {
                className += " right";
              }

              return <div className={className} key={"byte_" + id + "_" + lineInd + "_" + byteInd}></div>;
            })}
          </div>
        );
      });
    return (
      <div>
        <label>Best Mask: {ratings.findIndex((x) => ratings.reduce((a, v) => Math.min(a, v)) === x) + 1}</label>
        <div className="codes-wrapper">
          {qrCodes.map((x, i) => (
            <div className="code">
              <label>Версия {x.version}</label>
              <label>Маска {i + 1}</label>
              <label>Штрафные очки {ratings[i]}</label>
              {drawQrCode("code", x.qrCode)}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
