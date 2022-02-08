import "./Type.scss";
import React from "react";

export enum QRCodeType {
  Digits = 0,
  Letters = 1,
  Bytes = 2,
  Kanji = 3,
}

export type QRCodeTypeProps = {
  onTypeChange: (type: QRCodeType) => void;
  onValueChange: (value: string) => void;
};

export const availableDigits = "0123456789";
export const availableLeters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

export default class QRCodeTypeComponent extends React.Component<QRCodeTypeProps, { type: QRCodeType; data: string }> {
  constructor(props: QRCodeTypeProps) {
    super(props);

    this.state = {
      type: QRCodeType.Digits,
      data: "",
    };
  }

  setValueState(data: string) {
    switch (this.state.type) {
      case QRCodeType.Digits: {
        data = data
          .split("")
          .filter((x) => availableDigits.includes(x))
          .join("");
        break;
      }
      case QRCodeType.Letters: {
        data = data
          .toUpperCase()
          .split("")
          .filter((x) => availableLeters.includes(x))
          .join("");
        break;
      }
      case QRCodeType.Kanji: {
        break;
      }
    }

    this.setState({ data });
    this.props.onValueChange(data);
  }

  render() {
    return (
      <div className="type">
        <div className="radio-buttons">
          <input
            id="qrtype-digits"
            type="radio"
            name="type"
            value={QRCodeType.Digits}
            checked={this.state.type === QRCodeType.Digits}
            onChange={() => {
              this.setState({ type: QRCodeType.Digits });
              this.props.onTypeChange(QRCodeType.Digits);
            }}
          />
          <label htmlFor="qrtype-digits">Цифры</label>
          <input
            id="qrtype-letters"
            type="radio"
            name="type"
            value={QRCodeType.Letters}
            checked={this.state.type === QRCodeType.Letters}
            onChange={() => {
              this.setState({ type: QRCodeType.Letters });
              this.props.onTypeChange(QRCodeType.Letters);
            }}
          />
          <label htmlFor="qrtype-letters">Буквы-цифры</label>
          <input
            id="qrtype-bytes"
            type="radio"
            name="type"
            value={QRCodeType.Bytes}
            checked={this.state.type === QRCodeType.Bytes}
            onChange={() => {
              this.setState({ type: QRCodeType.Bytes });
              this.props.onTypeChange(QRCodeType.Bytes);
            }}
          />
          <label htmlFor="qrtype-bytes">Побайтово</label>
          <input
            id="qrtype-kanji"
            type="radio"
            name="type"
            value={QRCodeType.Kanji}
            checked={this.state.type === QRCodeType.Kanji}
            onChange={() => {
              this.setState({ type: QRCodeType.Kanji });
              this.props.onTypeChange(QRCodeType.Kanji);
            }}
            disabled
          />
          <label htmlFor="qrtype-kanji">Кандзи</label>
        </div>
        <div className="value">
          <label>Данные</label>
          <textarea
            value={this.state.data}
            onChange={(evt) => {
              this.setValueState(evt.target.value);
            }}
          ></textarea>
        </div>
      </div>
    );
  }
}
