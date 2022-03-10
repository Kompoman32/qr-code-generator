import "./Code.scss";
import "../../styles/contextmenu.scss";
import React from "react";
import { QRCodeType, QRCodeCorrectionLevel, QRCodeMask } from "../Type/Type";
import QrCodeGenerator from "./Generator";

export type QRCodeProps = {
  type: QRCodeType;
  correctionLevel: QRCodeCorrectionLevel;
  mask: QRCodeMask;
  data: string;
};

export type QRCodeState = {
  useOffset: boolean;
};

export default class QRCodeComponent extends React.Component<QRCodeProps, QRCodeState> {
  static MENU_ID = "qrcode-context-menu";

  constructor(props: QRCodeProps) {
    super(props);
    this.state = {
      useOffset: true,
    };
  }

  render() {
    let qrCode: boolean[][] | undefined;
    let version: number | undefined;
    let mask: QRCodeMask;

    if (this.props.mask === QRCodeMask.Auto) {
      const qrCodes = new Map<QRCodeMask, { version: number; qrCode: boolean[][] }>();
      const ratings: number[] = [];
      for (let i = QRCodeMask.First; i <= QRCodeMask.Eighth; i++) {
        const result = QrCodeGenerator.generate(this.props.data, this.props.type, this.props.correctionLevel, i, false);
        qrCodes.set(i, result);
        ratings[i] = QrCodeGenerator.getMaskRating(result.qrCode);
      }

      const bestIndex = ratings.reduce((a, x, ind, arr) => (arr[ind] < arr[a] ? ind : a), QRCodeMask.First);

      version = qrCodes.get(bestIndex)?.version;
      qrCode = qrCodes.get(bestIndex)?.qrCode;

      mask = bestIndex;
    } else {
      const result = QrCodeGenerator.generate(
        this.props.data,
        this.props.type,
        this.props.correctionLevel,
        this.props.mask,
        false
      );
      qrCode = result.qrCode;
      version = result.version;
      mask = this.props.mask;
    }

    // QrCodeGenerator.addOffset(qrCode as boolean[][]);

    /* eslint-disable  @typescript-eslint/no-unused-vars */
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
      <div className="codes-wrapper">
        <div className="code">
          <div className="title">
            <div className="offset-checkbox">
              <input
                id="use-offset"
                type="checkbox"
                name="use-offset"
                checked={this.state.useOffset}
                onChange={() => {
                  this.setState({ useOffset: !this.state.useOffset });
                }}
              />
              <label htmlFor="use-offset">Добавить отступ</label>
            </div>
            <div>Версия{version}</div>
            <div>Маска {mask}</div>
            <div
              className="save menu left"
              title="Скачать SVG"
              onClick={() => {
                QRcodeDraw.downloadPng(qrCode as boolean[][], this.state.useOffset);
              }}
            >
              💾
              <div
                className="item"
                onClick={(e) => {
                  e.stopPropagation();
                  QRcodeDraw.downloadSvg(qrCode as boolean[][], this.state.useOffset);
                }}
              >
                SVG
              </div>
              <div
                className="item"
                onClick={(e) => {
                  e.stopPropagation();
                  QRcodeDraw.downloadPng(qrCode as boolean[][], this.state.useOffset, false);
                }}
              >
                PNG
              </div>
              <div
                className="item"
                onClick={(e) => {
                  e.stopPropagation();
                  QRcodeDraw.downloadPng(qrCode as boolean[][], this.state.useOffset);
                }}
              >
                PNG (прозр.)
              </div>
            </div>
          </div>
          {/* {drawQrCode("code", qrCode)} */}
          <QRcodeDraw qrCode={qrCode as boolean[][]} useOffset={this.state.useOffset} />
        </div>
      </div>
    );
  }
}

class QRcodeDraw extends React.Component<{ qrCode: boolean[][]; useOffset: boolean }, any> {
  render() {
    return QRcodeDraw.drawQrCodeSvg("code", this.props.qrCode, this.props.useOffset);
  }

  static downloadBlob(blob: Blob | string, name: string): void {
    let a = document.createElement("a");
    a.download = name;
    a.rel = "noopener"; // tabnabbing

    // Support blobs
    a.href = typeof blob === "string" ? blob : URL.createObjectURL(blob);
    setTimeout(() => {
      try {
        a.dispatchEvent(new MouseEvent("click"));
      } catch (e) {
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
        a.dispatchEvent(evt);
      }
      a.remove();
    }, 0);
  }

  static downloadSvg(qrCode: boolean[][], useOffset: boolean): void {
    const blob = new Blob([QRcodeDraw.drawQrCodeSvgStr(qrCode, useOffset)], { type: "text/plain;charset=utf-8" });

    QRcodeDraw.downloadBlob(blob, "QRCode.svg");
  }

  static downloadPng(qrCode: boolean[][], useOffset: boolean, transparent: boolean = true) {
    QRcodeDraw.downloadBlob(QRcodeDraw.drawQrCodePng(qrCode, useOffset, transparent), "QRCode.png");
  }

  static drawQrCodeSvg(id: string, qrCode: boolean[][], useOffset: boolean) {
    const array: any[] = [];

    const qrCodeCopy = qrCode.map((x) => [...x]);

    const size = qrCode.length;

    const offset = useOffset ? 4 * 5 : 0;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!!qrCodeCopy[i][j]) {
          array.push(<rect key={`${id}_rect_${i}_${j}`} width={5} height={5} y={i * 5 + offset} x={j * 5 + offset} />);
        }
      }
    }

    return (
      <svg
        key={id}
        viewBox={`0 0 ${size * 5 + offset * 2} ${size * 5 + offset * 2}`}
        style={{ strokeWidth: 0.2, stroke: "black" }}
      >
        {array}
      </svg>
    );
  }

  static drawQrCodeSvgStr(qrCode: boolean[][], useOffset: boolean) {
    const array: string[] = [];

    const qrCodeCopy = qrCode.map((x) => [...x]);

    const size = qrCode.length;

    const offset = useOffset ? 4 * 5 : 0;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!!qrCodeCopy[i][j]) {
          array.push(`<rect width="${5}" height="${5}" y="${i * 5 + offset}" x="${j * 5 + offset}" />`);
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${
      size * 5 + offset * 2
    } ${size * 5 + offset * 2}" style="stroke-width: 0.2; stroke: black">${array.join("")}</svg>`;
  }

  static drawQrCodePng(qrCode: boolean[][], useOffset: boolean, transparent: boolean): string {
    const qrCodeCopy = qrCode.map((x) => [...x]);
    const size = qrCode.length;

    const offset = useOffset ? 4 * 5 : 0;

    const canvas = document.createElement("canvas") as HTMLCanvasElement;

    canvas.setAttribute("width", size * 5 + offset * 2 + "");
    canvas.setAttribute("height", size * 5 + offset * 2 + "");

    const context = canvas.getContext("2d");

    if (!transparent) {
      context?.beginPath();
      context?.rect(0, 0, size * 5 + offset * 2, size * 5 + offset * 2);
      context && (context.fillStyle = "white");
      context?.fill();
      context?.closePath();
    }

    context?.beginPath();
    context && (context.fillStyle = "black");

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!!qrCodeCopy[i][j]) {
          context?.fillRect(j * 5 + offset, i * 5 + offset, 5, 5);
        }
      }
    }

    context?.closePath();

    return canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  }
}
