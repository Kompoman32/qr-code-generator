import "./CorrectionLevel.scss";
import React from "react";

export enum QRCodeCorrectionLevel {
  L = 0,
  M = 1,
  Q = 2,
  H = 3,
}

export type QRCodeCorrectionLevelProps = {
  onCorrectionLevelChange: (type: QRCodeCorrectionLevel) => void;
};

export default class QRCodeCorrectionLevelComponent extends React.Component<
  QRCodeCorrectionLevelProps,
  { type: QRCodeCorrectionLevel }
> {
  constructor(props: QRCodeCorrectionLevelProps) {
    super(props);

    this.state = {
      type: QRCodeCorrectionLevel.L,
    };
  }

  render() {
    return (
      <div className="correction-level">
        <div className="label">
          <label>Процент повреждения информации</label>
        </div>
        <div className="radio-buttons">
          <input
            id="qr-correction-level-l"
            type="radio"
            name="level"
            value={QRCodeCorrectionLevel.L}
            checked={this.state.type === QRCodeCorrectionLevel.L}
            onChange={() => {
              this.setState({ type: QRCodeCorrectionLevel.L });
              this.props.onCorrectionLevelChange(QRCodeCorrectionLevel.L);
            }}
          />
          <label htmlFor="qr-correction-level-l">L (7%)</label>
          <input
            id="qr-correction-level-m"
            type="radio"
            name="level"
            value={QRCodeCorrectionLevel.M}
            checked={this.state.type === QRCodeCorrectionLevel.M}
            onChange={() => {
              this.setState({ type: QRCodeCorrectionLevel.M });
              this.props.onCorrectionLevelChange(QRCodeCorrectionLevel.M);
            }}
          />
          <label htmlFor="qr-correction-level-m">M (15%)</label>
          <input
            id="qr-correction-level-q"
            type="radio"
            name="level"
            value={QRCodeCorrectionLevel.Q}
            checked={this.state.type === QRCodeCorrectionLevel.Q}
            onChange={() => {
              this.setState({ type: QRCodeCorrectionLevel.Q });
              this.props.onCorrectionLevelChange(QRCodeCorrectionLevel.Q);
            }}
          />
          <label htmlFor="qr-correction-level-q">Q (25%)</label>
          <input
            id="qr-correction-level-h"
            type="radio"
            name="level"
            value={QRCodeCorrectionLevel.H}
            checked={this.state.type === QRCodeCorrectionLevel.H}
            onChange={() => {
              this.setState({ type: QRCodeCorrectionLevel.H });
              this.props.onCorrectionLevelChange(QRCodeCorrectionLevel.H);
            }}
          />
          <label htmlFor="qr-correction-level-h">H (30%)</label>
        </div>
      </div>
    );
  }
}
