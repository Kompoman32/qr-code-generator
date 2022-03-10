import "./Type.scss";
import React from "react";

export enum QRCodeCorrectionLevel {
  L = 0,
  M = 1,
  Q = 2,
  H = 3,
}

export enum QRCodeMask {
  First = 1,
  Second = 2,
  Third = 3,
  Fourth = 4,
  Fifth = 5,
  Sixth = 6,
  Seventh = 7,
  Eighth = 8,

  Auto = 999,
}

export type QRCodeCorrectionLevelProps = {
  onCorrectionLevelChange: (type: QRCodeCorrectionLevel) => void;
};

export enum QRCodeType {
  Digits = 0,
  Letters = 1,
  Bytes = 2,
  Kanji = 3,
}

export type QRCodeTypeProps = {
  onTypeChange: (type: QRCodeType) => void;
  onValueChange: (value: string) => void;
  onCorrectionLevelChange: (correction: QRCodeCorrectionLevel) => void;
  onMaskChange: (mask: QRCodeMask) => void;
};

export type QRCodeTypeState = {
  type: QRCodeType;
  correction: QRCodeCorrectionLevel;
  mask: QRCodeMask;
  data: string;
};

export const availableDigits = "0123456789";
export const availableLeters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

export default class QRCodeTypeComponent extends React.Component<QRCodeTypeProps, QRCodeTypeState> {
  constructor(props: QRCodeTypeProps) {
    super(props);

    this.state = {
      type: QRCodeType.Digits,
      correction: QRCodeCorrectionLevel.L,
      mask: QRCodeMask.Auto,
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
            title={`Доступные символы: ${availableDigits}`}
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
            title={`Доступные символы: ${availableLeters}`}
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
            title={`Доступные символы: Все`}
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
        {/* <div className="label">
          <label>Процент повреждения информации</label>
        </div> */}
        <div className="table">
          <div className="column">
            <label>Уровень коррекции</label>
            <div className="radio-buttons correction">
              <div className="radio-button-wrapper">
                <input
                  id="qr-correction-level-l"
                  type="radio"
                  name="level"
                  value={QRCodeCorrectionLevel.L}
                  checked={this.state.correction === QRCodeCorrectionLevel.L}
                  onChange={() => {
                    this.setState({ correction: QRCodeCorrectionLevel.L });
                    this.props.onCorrectionLevelChange(QRCodeCorrectionLevel.L);
                  }}
                />
                <label htmlFor="qr-correction-level-l">L (7%)</label>
              </div>
              <div className="radio-button-wrapper">
                <input
                  id="qr-correction-level-m"
                  type="radio"
                  name="level"
                  value={QRCodeCorrectionLevel.M}
                  checked={this.state.correction === QRCodeCorrectionLevel.M}
                  onChange={() => {
                    this.setState({ correction: QRCodeCorrectionLevel.M });
                    this.props.onCorrectionLevelChange(QRCodeCorrectionLevel.M);
                  }}
                />
                <label htmlFor="qr-correction-level-m">M (15%)</label>
              </div>
              <div className="radio-button-wrapper">
                <input
                  id="qr-correction-level-q"
                  type="radio"
                  name="level"
                  value={QRCodeCorrectionLevel.Q}
                  checked={this.state.correction === QRCodeCorrectionLevel.Q}
                  onChange={() => {
                    this.setState({ correction: QRCodeCorrectionLevel.Q });
                    this.props.onCorrectionLevelChange(QRCodeCorrectionLevel.Q);
                  }}
                />
                <label htmlFor="qr-correction-level-q">Q (25%)</label>
              </div>
              <div className="radio-button-wrapper">
                <input
                  id="qr-correction-level-h"
                  type="radio"
                  name="level"
                  value={QRCodeCorrectionLevel.H}
                  checked={this.state.correction === QRCodeCorrectionLevel.H}
                  onChange={() => {
                    this.setState({ correction: QRCodeCorrectionLevel.H });
                    this.props.onCorrectionLevelChange(QRCodeCorrectionLevel.H);
                  }}
                />
                <label htmlFor="qr-correction-level-h">H (30%)</label>
              </div>
            </div>
          </div>
          <div className="column">
            <label>Маски</label>
            <div className="radio-buttons masks">
              <div className="radio-button-wrapper">
                <input
                  id="qr-mask-auto"
                  type="radio"
                  name="mask"
                  value={QRCodeMask.Auto}
                  checked={this.state.mask === QRCodeMask.Auto}
                  onChange={() => {
                    this.setState({ mask: QRCodeMask.Auto });
                    this.props.onMaskChange(QRCodeMask.Auto);
                  }}
                />
                <label htmlFor="qr-mask-auto">Auto</label>
              </div>
              <div className="radio-button-wrapper">
                <input
                  id="qr-mask-1"
                  type="radio"
                  name="mask"
                  value={QRCodeMask.First}
                  checked={this.state.mask === QRCodeMask.First}
                  onChange={() => {
                    this.setState({ mask: QRCodeMask.First });
                    this.props.onMaskChange(QRCodeMask.First);
                  }}
                />
                <label htmlFor="qr-mask-1">1. (X+Y) % 2 </label>
              </div>
              <div className="radio-button-wrapper">
                <input
                  id="qr-mask-2"
                  type="radio"
                  name="mask"
                  value={QRCodeMask.Second}
                  checked={this.state.mask === QRCodeMask.Second}
                  onChange={() => {
                    this.setState({ mask: QRCodeMask.Second });
                    this.props.onMaskChange(QRCodeMask.Second);
                  }}
                />
                <label htmlFor="qr-mask-2">2. Y % 2</label>
              </div>
              <div className="radio-button-wrapper">
                <input
                  id="qr-mask-3"
                  type="radio"
                  name="mask"
                  value={QRCodeMask.Third}
                  checked={this.state.mask === QRCodeMask.Third}
                  onChange={() => {
                    this.setState({ mask: QRCodeMask.Third });
                    this.props.onMaskChange(QRCodeMask.Third);
                  }}
                />
                <label htmlFor="qr-mask-3">3. X % 3</label>
              </div>
              <div className="radio-button-wrapper">
                <input
                  id="qr-mask-4"
                  type="radio"
                  name="mask"
                  value={QRCodeMask.Fourth}
                  checked={this.state.mask === QRCodeMask.Fourth}
                  onChange={() => {
                    this.setState({ mask: QRCodeMask.Fourth });
                    this.props.onMaskChange(QRCodeMask.Fourth);
                  }}
                />
                <label htmlFor="qr-mask-4">4. (X + Y) % 3</label>
              </div>
              <div className="radio-button-wrapper">
                <input
                  id="qr-mask-5"
                  type="radio"
                  name="mask"
                  value={QRCodeMask.Fifth}
                  checked={this.state.mask === QRCodeMask.Fifth}
                  onChange={() => {
                    this.setState({ mask: QRCodeMask.Fifth });
                    this.props.onMaskChange(QRCodeMask.Fifth);
                  }}
                />
                <label htmlFor="qr-mask-5">5. (X/3 + Y/2) % 2</label>
              </div>
              <div className="radio-button-wrapper">
                <input
                  id="qr-mask-6"
                  type="radio"
                  name="mask"
                  value={QRCodeMask.Sixth}
                  checked={this.state.mask === QRCodeMask.Sixth}
                  onChange={() => {
                    this.setState({ mask: QRCodeMask.Sixth });
                    this.props.onMaskChange(QRCodeMask.Sixth);
                  }}
                />
                <label htmlFor="qr-mask-6">6. (X*Y) % 2 + (X*Y) % 3</label>
              </div>
              <div className="radio-button-wrapper">
                <input
                  id="qr-mask-7"
                  type="radio"
                  name="mask"
                  value={QRCodeMask.Seventh}
                  checked={this.state.mask === QRCodeMask.Seventh}
                  onChange={() => {
                    this.setState({ mask: QRCodeMask.Seventh });
                    this.props.onMaskChange(QRCodeMask.Seventh);
                  }}
                />
                <label htmlFor="qr-mask-7">7. ((X*Y) % 2 + (X*Y) % 3) % 2</label>
              </div>
              <div className="radio-button-wrapper">
                <input
                  id="qr-mask-8"
                  type="radio"
                  name="mask"
                  value={QRCodeMask.Eighth}
                  checked={this.state.mask === QRCodeMask.Eighth}
                  onChange={() => {
                    this.setState({ mask: QRCodeMask.Eighth });
                    this.props.onMaskChange(QRCodeMask.Eighth);
                  }}
                />
                <label htmlFor="qr-mask-8">8. ((X*Y) % 3 + (X+Y) % 2) % 2</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
