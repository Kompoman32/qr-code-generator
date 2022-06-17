import "./Steps.scss";
import React from "react";
import { availableDigits, availableLeters, QRCodeCorrectionLevel, QRCodeMask, QRCodeType } from "../Type/Type";
import { QrCodeGenerator_Blocks, QrCodeGenerator_Data, QrCodeGenerator_Utils } from "./Generator";

export type QRCodeStepsProps = {
  type: QRCodeType;
  correctionLevel: QRCodeCorrectionLevel;
  mask: QRCodeMask;
  bestMask: QRCodeMask;
  version: number;
  forcedVersion: number;
  data: string;
  originalData: string;
};

export default class QrCodeSteps extends React.Component<QRCodeStepsProps, {}> {
  constructor(props: QRCodeStepsProps) {
    super(props);
    this.state = {
      useOffset: true,
    };
  }

  step0() {
    const arr: any[] = [];

    const { type, correctionLevel, mask, bestMask, version = -1, forcedVersion = -1 } = this.props;

    arr.push(
      <p>
        Parameters:
        <ul>
          <li>
            <b>Type:</b> {QRCodeType[type]}
          </li>
          <li>
            <b>CorrectionLevel:</b> {QRCodeCorrectionLevel[correctionLevel]}
          </li>
          <li>
            <b>Mask:</b> {QRCodeMask[mask]} = {QrCodeGenerator_Utils.maskFormula[mask]}
          </li>
          {mask === QRCodeMask.Auto ? (
            <li>
              <b>Best Mask:</b> {QRCodeMask[bestMask]} = {QrCodeGenerator_Utils.maskFormula[bestMask]}
            </li>
          ) : (
            ""
          )}
          <li>
            <b>Version:</b> {version < 0 ? "Error" : version}
          </li>
          {forcedVersion >= 0 ? (
            <li>
              <b>Forced Min Version:</b> {forcedVersion}
            </li>
          ) : (
            ""
          )}
        </ul>
        {}
      </p>
    );

    const step = <div className="step">{arr}</div>;

    return step;
  }

  step1() {
    const arr: any[] = [];

    const { type, originalData } = this.props;

    switch (type) {
      case QRCodeType.Digits: {
        arr.push(
          <p>
            In Digits type it used 10 bits for 3 symbols. If 2 characters remain at the end, the resulting two-digit
            number is coded with 7 bits, and if 1 character, then 4 bits.
          </p>
        );

        arr.push(<p>Available Digits: {availableDigits.split("").join(", ")}</p>);

        const generatedBytes = QrCodeGenerator_Data.generateByDigits(originalData);

        const tableRows = [];

        for (let i = 0; i < originalData.length; i += 3) {
          tableRows.push(
            <tr>
              <td>{originalData.substring(i, i + 3)}</td>
              <td>{generatedBytes.substring(10 * (i / 3), 10 * (i / 3 + 1))}</td>
            </tr>
          );
        }

        arr.push(
          <table>
            <thead>
              <tr>
                <th>Part</th>
                <th>Bits</th>
              </tr>
            </thead>
            <tbody>{tableRows}</tbody>
          </table>
        );
        break;
      }
      case QRCodeType.Letters: {
        arr.push(
          <p>
            In Digits type it used 11 bits for 2 symbols. If 1 characters remain at the end, the resulting character is
            coded with 6 bits.
          </p>
        );

        arr.push(
          <p>
            Each character is coded according to the table below. First character is multiplied by 45 and summarized
            with second character (if there is only one character, but it is simply encoded).
          </p>
        );

        // arr.push(<p>Available Chracters: {availableLeters.split("").join(", ").replace(", ,", ", <space>,")}</p>);

        const generatedBytes = QrCodeGenerator_Data.generateByLetters(originalData);

        const tableRows = [];

        for (let i = 0; i < originalData.length; i += 2) {
          const symbols = originalData.substring(i, i + 2);

          const first = availableLeters.indexOf(symbols[0]);
          const second = availableLeters.indexOf(symbols[1]);

          tableRows.push(
            <tr>
              <td>{symbols.replaceAll(" ", "<space>")}</td>
              <td>{second >= 0 ? `${first} * 45 + ${second}` : first}</td>
              <td>{generatedBytes.substring(11 * (i / 2), 11 * (i / 2 + 1))}</td>
            </tr>
          );
        }

        arr.push(
          <div className="tables">
            {QrCodeGenerator_Utils.availableLettersTable()}
            <table>
              <thead>
                <tr>
                  <th>Chars</th>
                  <th>Value</th>
                  <th>Bits</th>
                </tr>
              </thead>
              <tbody>{tableRows}</tbody>
            </table>
          </div>
        );

        break;
      }
      case QRCodeType.Bytes: {
        break;
      }
    }

    const step = <div className="step">{arr}</div>;

    return step;
  }

  render() {
    return this.step1();
  }
}
