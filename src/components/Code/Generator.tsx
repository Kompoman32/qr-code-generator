import { QRCodeCorrectionLevel } from "../CorrectionLevel/CorrectionLevel";
import { availableDigits, availableLeters, QRCodeType } from "../Type/Type";

export enum QRCodeMask {
  Zeroed = 0,
  First = 1,
  Second = 2,
  Third = 3,
  Fourth = 4,
  Fifth = 5,
  Sixth = 6,
  Seventh = 7,
}

/** https://habr.com/ru/post/172525/ */
export default class QrCodeGenerator {
  static generate(
    data: string,
    type: QRCodeType,
    correctionLevel: QRCodeCorrectionLevel,
    mask: QRCodeMask
  ): { version: number; qrCode: boolean[][] } {
    if (type === QRCodeType.Digits) {
      data = data
        .split("")
        .filter((x) => availableDigits.includes(x))
        .join("");
    }

    if (type === QRCodeType.Letters) {
      data = data
        .split("")
        .filter((x) => availableLeters.includes(x))
        .join("");
    }

    const { outputData, version } = QrCodeGenerator_Data.getGeneratedOutputData(type, correctionLevel, data);

    const dataBlocks: number[][] = QrCodeGenerator_Blocks.getDataBlocks(correctionLevel, version, outputData);
    const correctionBlocks: number[][] = QrCodeGenerator_Blocks.getCorrectionBlocks(
      type,
      correctionLevel,
      version,
      dataBlocks
    );

    const combinedArray = QrCodeGenerator_Blocks.getCombinedBlocks(dataBlocks, correctionBlocks);
    const qrCode = QrCodeGenerator.generateCode(version, correctionLevel, mask, combinedArray);

    return { version: version + 1, qrCode };
  }

  static generateCode(
    version: number,
    correctionLevel: QRCodeCorrectionLevel,
    mask: QRCodeMask,
    data: boolean[]
  ): boolean[][] {
    const qrCode = QrCodeGenerator.getQRCodeWithServiceBytes(version, correctionLevel, mask);
    QrCodeGenerator.fillData(qrCode, mask, data);

    const qrCodeSize = qrCode.length;

    qrCode.forEach((x) => {
      x.unshift(false, false, false, false);
      x.push(false, false, false, false);
    });

    qrCode.unshift(new Array(qrCodeSize + 8).fill(false));
    qrCode.unshift(new Array(qrCodeSize + 8).fill(false));
    qrCode.unshift(new Array(qrCodeSize + 8).fill(false));
    qrCode.unshift(new Array(qrCodeSize + 8).fill(false));

    qrCode.push(new Array(qrCodeSize + 8).fill(false));
    qrCode.push(new Array(qrCodeSize + 8).fill(false));
    qrCode.push(new Array(qrCodeSize + 8).fill(false));
    qrCode.push(new Array(qrCodeSize + 8).fill(false));

    return qrCode;
  }

  static getQRCodeWithServiceBytes(
    version: number,
    correctionLevel: QRCodeCorrectionLevel,
    mask: QRCodeMask
  ): boolean[][] {
    const positionPatternEqualPart = [
      [true, true, true, true, true, true, true],
      [true, false, false, false, false, false, true],
      [true, false, true, true, true, false, true],
      [true, false, true, true, true, false, true],
      [true, false, true, true, true, false, true],
      [true, false, false, false, false, false, true],
      [true, true, true, true, true, true, true],
    ];

    const leftTopPositionPattern = positionPatternEqualPart.map((x) => [...x]);
    leftTopPositionPattern.forEach((x) => {
      x.push(false);
    });
    leftTopPositionPattern.push(new Array(8).fill(false));

    const rightTopPositionPattern = positionPatternEqualPart.map((x) => [...x]);
    rightTopPositionPattern.forEach((x) => {
      x.unshift(false);
    });
    rightTopPositionPattern.push(new Array(8).fill(false));

    const leftBottomPositionPattern = positionPatternEqualPart.map((x) => [...x]);
    leftBottomPositionPattern.forEach((x) => {
      x.push(false);
    });
    leftBottomPositionPattern.unshift(new Array(8).fill(false));

    const searchPattern = [
      [true, true, true, true, true],
      [true, false, false, false, true],
      [true, false, true, false, true],
      [true, false, false, false, true],
      [true, true, true, true, true],
    ];
    const currentSearchPatternPositions = QrCodeGenerator.getSearchPatternPositions(version);

    const versionPattern = QrCodeGenerator.getVersionPattern(version);

    const maskPattern = QrCodeGenerator_Utils.maskCodes[correctionLevel][mask];

    const qrCodeSize =
      (QrCodeGenerator_Utils.searchPatternPositions[version][
        QrCodeGenerator_Utils.searchPatternPositions[version].length - 1
      ] || 14) + 7;
    const qrCodeArray: boolean[][] = new Array(qrCodeSize);
    for (let i = 0; i < qrCodeSize; i++) {
      qrCodeArray[i] = new Array(qrCodeSize).fill(undefined);
    }

    /*------------------------------- POSITION PATTERNS -------------------------------*/
    leftTopPositionPattern.forEach((x, i) => {
      x.forEach((y, j) => {
        qrCodeArray[i][j] = y;
      });
    });

    rightTopPositionPattern.forEach((x, i) => {
      x.forEach((y, j) => {
        qrCodeArray[i][qrCodeSize - 8 + j] = y;
      });
    });
    leftBottomPositionPattern.forEach((x, i) => {
      x.forEach((y, j) => {
        qrCodeArray[qrCodeSize - 8 + i][j] = y;
      });
    });
    /*------------------------------- POSITION PATTERNS -------------------------------*/

    /*------------------------------- VERSION PATTERNS -------------------------------*/
    if (version + 1 >= 7) {
      for (let i = 0; i < versionPattern.length; i++) {
        for (let j = 0; j < versionPattern[i].length; j++) {
          qrCodeArray[qrCodeSize - 8 - versionPattern.length + i][j] = versionPattern[i][j];
        }
      }

      for (let i = 0; i < versionPattern.length; i++) {
        for (let j = 0; j < versionPattern[i].length; j++) {
          qrCodeArray[j][qrCodeSize - 8 - versionPattern.length + i] = versionPattern[i][j];
        }
      }
    }
    /*------------------------------- VERSION PATTERNS -------------------------------*/

    /*------------------------------- SEARCH PATTERNS -------------------------------*/
    currentSearchPatternPositions.forEach((position) => {
      const [x, y] = position;

      for (let i = 0; i < searchPattern.length; i++) {
        for (let j = 0; j < searchPattern[i].length; j++) {
          qrCodeArray[x - 2 + i][y - 2 + j] = searchPattern[i][j];
        }
      }
    });
    /*------------------------------- SEARCH PATTERNS -------------------------------*/

    /*------------------------------- MASK PATTERNS -------------------------------*/
    // TOP LEFT
    for (let i = 0; i < 6; i++) {
      qrCodeArray[8][i] = maskPattern[i];
    }
    qrCodeArray[8][7] = maskPattern[6];
    qrCodeArray[8][8] = maskPattern[7];
    qrCodeArray[7][8] = maskPattern[8];
    for (let i = 0; i < 6; i++) {
      qrCodeArray[5 - i][8] = maskPattern[6 + 3 + i];
    }

    // BOTTOM
    for (let i = 0; i < 7; i++) {
      qrCodeArray[qrCodeSize - 1 - i][8] = maskPattern[i];
    }

    // ALWAYS FILLED
    qrCodeArray[qrCodeSize - 8][8] = true;

    // TOP RIGHT
    for (let i = 7; i < 15; i++) {
      qrCodeArray[8][qrCodeSize + i - 15] = maskPattern[i];
    }
    /*------------------------------- MASK PATTERNS -------------------------------*/

    /*------------------------------- SYNC LINES PATTERNS -------------------------------*/
    for (let i = 8; i < qrCodeSize - 8; i++) {
      // LEFT -> RIGHT
      if (qrCodeArray[6][i] === undefined) {
        qrCodeArray[6][i] = i % 2 === 0;
      }

      // TOP -> BOTTOM
      if (qrCodeArray[i][6] === undefined) {
        qrCodeArray[i][6] = i % 2 === 0;
      }
    }
    /*------------------------------- SYNC LINES PATTERNS -------------------------------*/

    return qrCodeArray;
  }

  static getSearchPatternPositions(version: number): number[][] {
    const positions = QrCodeGenerator_Utils.searchPatternPositions[version];
    const outputPositions = [];

    for (let i = 0; i < positions.length; i++) {
      for (let j = 0; j < positions.length; j++) {
        if (version >= 6) {
          if (
            (i === 0 && j === 0) ||
            (i === 0 && j === positions.length - 1) ||
            (i === positions.length - 1 && j === 0)
          ) {
            continue;
          }
        }

        outputPositions.push([positions[i], positions[j]]);
      }
    }

    return outputPositions;
  }

  static getVersionPattern(version: number): boolean[][] {
    if (version + 1 < 7) {
      return [];
    }

    return QrCodeGenerator_Utils.versionCodes[version].map((x) => x.split("").map((x) => x === "1"));
  }

  /* NOT PURE */
  static fillData(qrCode: boolean[][], mask: QRCodeMask, data: boolean[]): void {
    const codeSize = qrCode.length;

    let c = 0;

    const setPixels2x1 = (i: number, j: number, up: boolean) => {
      for (let k = 0; k < 2; k++) {
        if (qrCode[i][j - k] === undefined) {
          qrCode[i][j - k] = c >= data.length ? false : QrCodeGenerator.getMaskedValue(mask, i, j - k, data[c]);
          c++;
        }
      }
    };

    for (let j = codeSize - 1; j > 0; j -= 2) {
      if (j === 6) {
        j--;
      }

      if (j % 4 === 0 || j === 3) {
        // filling up j === 3 its on the left of sync line.
        for (let i = codeSize - 1; i >= 0; i--) {
          setPixels2x1(i, j, true);
        }
      } else {
        // filling down.
        for (let i = 0; i < codeSize; i++) {
          setPixels2x1(i, j, false);
        }
      }
    }
  }

  static getMaskedValue(mask: QRCodeMask, x: number, y: number, value: boolean): boolean {
    let isInvert = false;
    switch (mask) {
      case QRCodeMask.Zeroed: {
        isInvert = (x + y) % 2 === 0;
        break;
      }
      case QRCodeMask.First: {
        isInvert = y % 2 === 0;
        break;
      }
      case QRCodeMask.Second: {
        isInvert = x % 3 === 0;
        break;
      }
      case QRCodeMask.Third: {
        isInvert = (x + y) % 3 === 0;
        break;
      }
      case QRCodeMask.Fourth: {
        isInvert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
        break;
      }
      case QRCodeMask.Fifth: {
        isInvert = ((x * y) % 2) + ((x * y) % 3) === 0;
        break;
      }
      case QRCodeMask.Sixth: {
        isInvert = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
        break;
      }
      case QRCodeMask.Seventh: {
        isInvert = (((x * y) % 3) + ((x + y) % 2)) % 2 === 0;
        break;
      }
    }

    return isInvert ? !value : value;
  }

  static getMaskRating(code: boolean[][]): number {
    const size = code.length;
    let rating = 0;

    /*-------------- RULE 1 -------------- */
    for (let i = 0; i < size; i++) {
      let sequenceCounter = 0;
      let currentValue: boolean | null = null;

      // Horizontal
      for (let j = 0; j < size; j++) {
        const value = code[i][j];

        if (value !== currentValue) {
          if (sequenceCounter >= 5) {
            rating += sequenceCounter - 2;
          }

          sequenceCounter = 1;
          currentValue = value;
        } else {
          sequenceCounter++;
        }
      }

      currentValue = null;

      for (let j = 0; j < size; j++) {
        const value = code[j][i];

        if (value !== currentValue) {
          if (sequenceCounter >= 5) {
            rating += sequenceCounter - 2;
          }

          sequenceCounter = 1;
          currentValue = value;
        } else {
          sequenceCounter++;
        }
      }
    }
    /*-------------- RULE 1 -------------- */

    const rule1 = rating;

    /*-------------- RULE 2 -------------- */
    for (let i = 0; i < size - 1; i++) {
      for (let j = 0; j < size - 1; j++) {
        const value = code[i][j];

        if (code[i][j + 1] === value && code[i + 1][j + 1] === value && code[i + 1][j] === value) {
          rating += 3;
        }
      }
    }
    /*-------------- RULE 2 -------------- */

    const rule2 = rating - rule1;

    /*-------------- RULE 3 -------------- */

    const checkedPatterns = [
      [false, false, false, false, true, false, true, true, true, false, true, false, false, false, false],
      [false, false, false, false, true, false, true, true, true, false, true],
      [true, false, true, true, true, false, true, false, false, false, false],
    ];

    for (let i = 0; i < size - 11; i++) {
      for (let j = 0; j < size - 11; j++) {
        for (let patternInd = 0; patternInd < checkedPatterns.length; patternInd++) {
          const pattern = checkedPatterns[patternInd];

          if (j < code[i].length - pattern.length) {
            let k = 0;
            for (; k < pattern.length; k++) {
              if (pattern[k] !== code[i][j + k]) {
                break;
              }
            }

            if (k === pattern.length) {
              rating += 40;
              j += pattern.length;
              break;
            }
          }
        }
      }

      for (let j = 0; j < size - 11; j++) {
        for (let patternInd = 0; patternInd < checkedPatterns.length; patternInd++) {
          const pattern = checkedPatterns[patternInd];

          if (j < code[j].length - pattern.length) {
            let k = 0;
            for (; k < pattern.length; k++) {
              if (pattern[k] !== code[j][i + k]) {
                break;
              }
            }

            if (k === pattern.length) {
              rating += 40;
              j += pattern.length;
              break;
            }
          }
        }
      }
    }
    /*-------------- RULE 3 -------------- */

    const rule3 = rating - rule2 - rule1;

    /*-------------- RULE 4 -------------- */
    let filledCount = 0;
    let unfilledCount = 0;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!!code[i][j]) {
          filledCount++;
        } else {
          unfilledCount++;
        }
      }
    }

    rating += Math.floor((filledCount / (size * size)) * 100 - 50) * 2;
    /*-------------- RULE 4 -------------- */

    const rule4 = rating - rule3 - rule2 - rule1;

    // console.log("Rating Rule #1", rule1);
    // console.log("Rating Rule #2", rule2);
    // console.log("Rating Rule #3", rule3);
    // console.log("Rating Rule #4", rule4);

    return rating;
  }
}

export class QrCodeGenerator_Data {
  static getGeneratedOutputData(
    type: QRCodeType,
    correctionLevel: QRCodeCorrectionLevel,
    data: string
  ): { outputData: string; version: number } {
    let generatedData: string = "";
    const initialDataLength = data.length;
    const availableCorrectionVersions = QrCodeGenerator_Utils.versionSizes[correctionLevel];

    let version = availableCorrectionVersions.findIndex(
      (x) => x > initialDataLength * (type === QRCodeType.Bytes ? 8 : 1) - 1
    );

    if (version < 0) {
      version = 0;
    }

    while (version < 40) {
      generatedData = QrCodeGenerator_Data.addServiceBytes(type, version, data);

      if (generatedData.length < availableCorrectionVersions[version]) {
        break;
      }
      version++;
    }

    if (generatedData.length % 8 > 0) {
      generatedData = generatedData + QrCodeGenerator_Utils.fillByteToSize("", 8 - (generatedData.length % 8));
    }

    const additionalBytesCount = (availableCorrectionVersions[version] - generatedData.length) / 8;

    let additionalStr = "1110110000010001".repeat(additionalBytesCount / 2);
    additionalStr += additionalBytesCount % 2 > 0 ? "11101100" : "";

    return { outputData: generatedData + additionalStr, version };
  }

  static addServiceBytes(type: QRCodeType, version: number, data: string): string {
    let generatedData = "";

    const maxDataLengthBitsIndex = version < 9 ? 0 : version < 26 ? 1 : 2;

    switch (type) {
      case QRCodeType.Digits:
        generatedData =
          "0001" +
          QrCodeGenerator_Utils.fillByteToSize(
            data.length.toString(2),
            QrCodeGenerator_Utils.maxDataLengthBits[QRCodeType.Digits][maxDataLengthBitsIndex]
          );
        generatedData += QrCodeGenerator_Data.generateByDigits(data);

        break;
      case QRCodeType.Letters:
        generatedData =
          "0010" +
          QrCodeGenerator_Utils.fillByteToSize(
            data.length.toString(2),
            QrCodeGenerator_Utils.maxDataLengthBits[QRCodeType.Letters][maxDataLengthBitsIndex]
          );
        generatedData += QrCodeGenerator_Data.generateByLetters(data);
        break;
      case QRCodeType.Bytes:
        generatedData =
          "0100" +
          QrCodeGenerator_Utils.fillByteToSize(
            data.length.toString(2),
            QrCodeGenerator_Utils.maxDataLengthBits[QRCodeType.Bytes][maxDataLengthBitsIndex]
          );
        generatedData += QrCodeGenerator_Data.generateByBytes(data);
        break;
      case QRCodeType.Kanji:
        //  generatedData = QrCodeGenerator_Data.generateByKanji(data)
        break;
    }

    return generatedData;
  }

  static generateByDigits(data: string): string {
    let str = "";

    const lastDigitsCount = data.length % 3;

    for (let i = 0; i < data.length - lastDigitsCount; i += 3) {
      const byteStr = (+data.substring(i, i + 3)).toString(2);

      str += QrCodeGenerator_Utils.fillByteToSize(byteStr, 10);
    }

    if (lastDigitsCount > 0) {
      const byteStr = (+data.substring(data.length - lastDigitsCount, data.length)).toString(2);

      str += QrCodeGenerator_Utils.fillByteToSize(byteStr, lastDigitsCount === 2 ? 7 : 4);
    }

    return str;
  }

  static generateByLetters(data: string): string {
    let str = "";

    const lastLettersCount = data.length % 2;

    for (let i = 0; i < data.length - lastLettersCount; i += 2) {
      const symbols = data.substring(i, i + 2);

      const first = availableLeters.indexOf(symbols[0]);
      const second = availableLeters.indexOf(symbols[1]);

      const sumOfChars = first * 45 + second;

      if (sumOfChars < 0) {
        continue;
      }

      str += QrCodeGenerator_Utils.fillByteToSize(sumOfChars.toString(2), 11);
    }

    if (lastLettersCount > 0 || !availableLeters.indexOf(data[data.length - 1])) {
      str += QrCodeGenerator_Utils.fillByteToSize(availableLeters.indexOf(data[data.length - 1]).toString(2), 6);
    }

    return str;
  }

  static generateByBytes(data: string): string {
    const bytes = QrCodeGenerator_Utils.toUTF8Array(data);

    let str = "";

    bytes.forEach((b) => {
      str += QrCodeGenerator_Utils.fillByteToSize(b.toString(2), 8);
    });

    return str;
  }
}

export class QrCodeGenerator_Blocks {
  static getDataBlocks(correctionLevel: QRCodeCorrectionLevel, version: number, data: string): number[][] {
    const currentBlocksCount = QrCodeGenerator_Utils.blocksCount[correctionLevel][version];

    const maxBytesInBlock = Math.floor(data.length / 8 / currentBlocksCount);
    const notSortedBytes = (data.length / 8) % currentBlocksCount;

    const blocks: number[] = new Array(currentBlocksCount).fill(maxBytesInBlock);
    const filledBlocks: number[][] = [];

    for (let i = 0; i < notSortedBytes; i++) {
      blocks[blocks.length - 1 - i]++;
    }

    let copiedData = data + "";

    blocks.forEach((blockSize) => {
      const block: number[] = new Array(blockSize);
      for (let i = 0; i < blockSize; i++) {
        block[i] = parseInt(copiedData.substring(8 * i, 8 * i + 8), 2);
      }

      copiedData = copiedData.substring(8 * blockSize);

      filledBlocks.push(block);
    });

    return filledBlocks;
  }

  static getCorrectionBlocks(
    type: QRCodeType,
    correctionLevel: QRCodeCorrectionLevel,
    version: number,
    dataBlocks: number[][]
  ): number[][] {
    const correctionBlocks: number[][] = [];

    const currentCorrectionBytesCount = QrCodeGenerator_Utils.correctionBytesCount[correctionLevel][version];
    const currentGeneratingPolynomial = QrCodeGenerator_Utils.generatingPolynomial[currentCorrectionBytesCount];

    dataBlocks.forEach((dataBlock) => {
      const bytesOfData = dataBlock.length;

      let correctionBlock = new Array(Math.max(currentCorrectionBytesCount, bytesOfData)).fill(0);
      dataBlock.forEach((x, i) => {
        correctionBlock[i] = x;
      });

      for (let i = 0; i < bytesOfData; i++) {
        const byte = correctionBlock.shift();
        correctionBlock.push(0);

        if (byte === 0) {
          continue;
        }

        const byteInRevertGalueField = QrCodeGenerator_Utils.revertGaluaField[byte];

        const currentGeneratingArray = currentGeneratingPolynomial.map(
          (x) => QrCodeGenerator_Utils.galuaField[(x + byteInRevertGalueField) % 255]
        );

        correctionBlock = correctionBlock.map((x, i) => x ^ currentGeneratingArray[i]);
      }

      correctionBlocks.push(correctionBlock.slice(0, currentCorrectionBytesCount));
    });

    return correctionBlocks;
  }

  static getCombinedBlocks(dataBlocks: number[][], correctionBlocks: number[][]): boolean[] {
    const combinedArray: boolean[] = [];
    let maxSize = dataBlocks[dataBlocks.length - 1].length;

    for (let i = 0; i < maxSize; i++) {
      for (let j = 0; j < dataBlocks.length; j++) {
        if (i < dataBlocks[j].length) {
          combinedArray.push(
            ...QrCodeGenerator_Utils.fillByteToSize(dataBlocks[j][i].toString(2), 8)
              .split("")
              .map((x) => x === "1")
          );
        }
      }
    }

    maxSize = correctionBlocks[correctionBlocks.length - 1].length;

    for (let i = 0; i < maxSize; i++) {
      for (let j = 0; j < correctionBlocks.length; j++) {
        if (i < correctionBlocks[j].length) {
          combinedArray.push(
            ...QrCodeGenerator_Utils.fillByteToSize(correctionBlocks[j][i].toString(2), 8)
              .split("")
              .map((x) => x === "1")
          );
        }
      }
    }

    return combinedArray;
  }
}

export class QrCodeGenerator_Utils {
  static fillByteToSize(byteStr: string, size: number): string {
    if (byteStr.length >= size) {
      return byteStr;
    }

    return "0".repeat(size - byteStr.length) + byteStr;
  }

  static toUTF8Array(str: string) {
    let utf8 = [];
    for (let i = 0; i < str.length; i++) {
      let charcode = str.charCodeAt(i);
      if (charcode < 0x80) utf8.push(charcode);
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
      } else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
      }
      // surrogate pair
      else {
        i++;
        // UTF-16 encodes 0x10000-0x10FFFF by
        // subtracting 0x10000 and splitting the
        // 20 bits of 0x0-0xFFFFF into two halves
        charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        utf8.push(
          0xf0 | (charcode >> 18),
          0x80 | ((charcode >> 12) & 0x3f),
          0x80 | ((charcode >> 6) & 0x3f),
          0x80 | (charcode & 0x3f)
        );
      }
    }
    return utf8;
  }

  static versionSizes = {
    0: [
      152, 272, 440, 640, 864, 1088, 1248, 1552, 1856, 2192, 2592, 2960, 3424, 3688, 4184, 4712, 5176, 5768, 6360, 6888,
      7456, 8048, 8752, 9392, 10208, 10960, 11744, 12248, 13048, 13880, 14744, 15640, 16568, 17528, 18448, 19472, 20528,
      21616, 22496, 23648,
    ],
    1: [
      128, 224, 352, 512, 688, 864, 992, 1232, 1456, 1728, 2032, 2320, 2672, 2920, 3320, 3624, 4056, 4504, 5016, 5352,
      5712, 6256, 6880, 7312, 8000, 8496, 9024, 9544, 10136, 10984, 11640, 12328, 13048, 13800, 14496, 15312, 15936,
      16816, 17728, 18672,
    ],
    2: [
      104, 176, 272, 384, 496, 608, 704, 880, 1056, 1232, 1440, 1648, 1952, 2088, 2360, 2600, 2936, 3176, 3560, 3880,
      4096, 4544, 4912, 5312, 5744, 6032, 6464, 6968, 7288, 7880, 8264, 8920, 9368, 9848, 10288, 10832, 11408, 12016,
      12656, 13328,
    ],
    3: [
      72, 128, 208, 288, 368, 480, 528, 688, 800, 976, 1120, 1264, 1440, 1576, 1784, 2024, 2264, 2504, 2728, 3080, 3248,
      3536, 3712, 4112, 4304, 4768, 5024, 5288, 5608, 5960, 6344, 6760, 7208, 7688, 7888, 8432, 8768, 9136, 9776, 10208,
    ],
  };

  static maxDataLengthBits = {
    0: [10, 12, 14],
    1: [9, 11, 13],
    2: [8, 16, 16],
  };

  static blocksCount = {
    0: [
      1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19,
      19, 20, 21, 22, 24, 25,
    ],
    1: [
      1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33,
      35, 37, 38, 40, 43, 45, 47, 49,
    ],
    2: [
      1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43,
      45, 48, 51, 53, 56, 59, 62, 65, 68,
    ],
    3: [
      1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51,
      54, 57, 60, 63, 66, 70, 74, 77, 81,
    ],
  };

  static correctionBytesCount = {
    0: [
      7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30,
      30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    ],
    1: [
      10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28,
      28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    ],
    2: [
      13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30,
      30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    ],
    3: [
      17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30,
      30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    ],
  };

  static generatingPolynomial: { [key: number]: number[] } = {
    7: [87, 229, 146, 149, 238, 102, 21],
    10: [251, 67, 46, 61, 118, 70, 64, 94, 32, 45],
    13: [74, 152, 176, 100, 86, 100, 106, 104, 130, 218, 206, 140, 78],
    15: [8, 183, 61, 91, 202, 37, 51, 58, 58, 237, 140, 124, 5, 99, 105],
    16: [120, 104, 107, 109, 102, 161, 76, 3, 91, 191, 147, 169, 182, 194, 225, 120],
    17: [43, 139, 206, 78, 43, 239, 123, 206, 214, 147, 24, 99, 150, 39, 243, 163, 136],
    18: [215, 234, 158, 94, 184, 97, 118, 170, 79, 187, 152, 148, 252, 179, 5, 98, 96, 153],
    20: [17, 60, 79, 50, 61, 163, 26, 187, 202, 180, 221, 225, 83, 239, 156, 164, 212, 212, 188, 190],
    22: [210, 171, 247, 242, 93, 230, 14, 109, 221, 53, 200, 74, 8, 172, 98, 80, 219, 134, 160, 105, 165, 231],
    24: [
      229, 121, 135, 48, 211, 117, 251, 126, 159, 180, 169, 152, 192, 226, 228, 218, 111, 0, 117, 232, 87, 96, 227, 21,
    ],
    26: [
      173, 125, 158, 2, 103, 182, 118, 17, 145, 201, 111, 28, 165, 53, 161, 21, 245, 142, 13, 102, 48, 227, 153, 145,
      218, 70,
    ],
    28: [
      168, 223, 200, 104, 224, 234, 108, 180, 110, 190, 195, 147, 205, 27, 232, 201, 21, 43, 245, 87, 42, 195, 212, 119,
      242, 37, 9, 123,
    ],
    30: [
      41, 173, 145, 152, 216, 31, 179, 182, 50, 48, 110, 86, 239, 96, 222, 125, 42, 173, 226, 193, 224, 130, 156, 37,
      251, 216, 238, 40, 192, 180,
    ],
  };

  static galuaField = [
    1, 2, 4, 8, 16, 32, 64, 128, 29, 58, 116, 232, 205, 135, 19, 38, 76, 152, 45, 90, 180, 117, 234, 201, 143, 3, 6, 12,
    24, 48, 96, 192, 157, 39, 78, 156, 37, 74, 148, 53, 106, 212, 181, 119, 238, 193, 159, 35, 70, 140, 5, 10, 20, 40,
    80, 160, 93, 186, 105, 210, 185, 111, 222, 161, 95, 190, 97, 194, 153, 47, 94, 188, 101, 202, 137, 15, 30, 60, 120,
    240, 253, 231, 211, 187, 107, 214, 177, 127, 254, 225, 223, 163, 91, 182, 113, 226, 217, 175, 67, 134, 17, 34, 68,
    136, 13, 26, 52, 104, 208, 189, 103, 206, 129, 31, 62, 124, 248, 237, 199, 147, 59, 118, 236, 197, 151, 51, 102,
    204, 133, 23, 46, 92, 184, 109, 218, 169, 79, 158, 33, 66, 132, 21, 42, 84, 168, 77, 154, 41, 82, 164, 85, 170, 73,
    146, 57, 114, 228, 213, 183, 115, 230, 209, 191, 99, 198, 145, 63, 126, 252, 229, 215, 179, 123, 246, 241, 255, 227,
    219, 171, 75, 150, 49, 98, 196, 149, 55, 110, 220, 165, 87, 174, 65, 130, 25, 50, 100, 200, 141, 7, 14, 28, 56, 112,
    224, 221, 167, 83, 166, 81, 162, 89, 178, 121, 242, 249, 239, 195, 155, 43, 86, 172, 69, 138, 9, 18, 36, 72, 144,
    61, 122, 244, 245, 247, 243, 251, 235, 203, 139, 11, 22, 44, 88, 176, 125, 250, 233, 207, 131, 27, 54, 108, 216,
    173, 71, 142, 1,
  ];

  static revertGaluaField = [
    -1, 0, 1, 25, 2, 50, 26, 198, 3, 223, 51, 238, 27, 104, 199, 75, 4, 100, 224, 14, 52, 141, 239, 129, 28, 193, 105,
    248, 200, 8, 76, 113, 5, 138, 101, 47, 225, 36, 15, 33, 53, 147, 142, 218, 240, 18, 130, 69, 29, 181, 194, 125, 106,
    39, 249, 185, 201, 154, 9, 120, 77, 228, 114, 166, 6, 191, 139, 98, 102, 221, 48, 253, 226, 152, 37, 179, 16, 145,
    34, 136, 54, 208, 148, 206, 143, 150, 219, 189, 241, 210, 19, 92, 131, 56, 70, 64, 30, 66, 182, 163, 195, 72, 126,
    110, 107, 58, 40, 84, 250, 133, 186, 61, 202, 94, 155, 159, 10, 21, 121, 43, 78, 212, 229, 172, 115, 243, 167, 87,
    7, 112, 192, 247, 140, 128, 99, 13, 103, 74, 222, 237, 49, 197, 254, 24, 227, 165, 153, 119, 38, 184, 180, 124, 17,
    68, 146, 217, 35, 32, 137, 46, 55, 63, 209, 91, 149, 188, 207, 205, 144, 135, 151, 178, 220, 252, 190, 97, 242, 86,
    211, 171, 20, 42, 93, 158, 132, 60, 57, 83, 71, 109, 65, 162, 31, 45, 67, 216, 183, 123, 164, 118, 196, 23, 73, 236,
    127, 12, 111, 246, 108, 161, 59, 82, 41, 157, 85, 170, 251, 96, 134, 177, 187, 204, 62, 90, 203, 89, 95, 176, 156,
    169, 160, 81, 11, 245, 22, 235, 122, 117, 44, 215, 79, 174, 213, 233, 230, 231, 173, 232, 116, 214, 244, 234, 168,
    80, 88, 175,
  ];

  static searchPatternPositions = [
    [],
    [18],
    [22],
    [26],
    [30],
    [34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170],
  ];

  static versionCodes = [
    [],
    [],
    [],
    [],
    [],
    [],
    ["000010", "011110", "100110"],
    ["010001", "011100", "111000"],
    ["110111", "011000", "000100"],
    ["101001", "111110", "000000"],
    ["001111", "111010", "111100"],
    ["001101", "100100", "011010"],
    ["101011", "100000", "100110"],
    ["110101", "000110", "100010"],
    ["010011", "000010", "011110"],
    ["011100", "010001", "011100"],
    ["111010", "010101", "100000"],
    ["100100", "110011", "100100"],
    ["000010", "110111", "011000"],
    ["000000", "101001", "111110"],
    ["100110", "101101", "000010"],
    ["111000", "001011", "000110"],
    ["011110", "001111", "111010"],
    ["001101", "001101", "100100"],
    ["101011", "001001", "011000"],
    ["110101", "101111", "011100"],
    ["010011", "101011", "100000"],
    ["010001", "110101", "000110"],
    ["110111", "110001", "111010"],
    ["101001", "010111", "111110"],
    ["001111", "010011", "000010"],
    ["101000", "011000", "101101"],
    ["001110", "011100", "010001"],
    ["010000", "111010", "010101"],
    ["110110", "111110", "101001"],
    ["110100", "100000", "001111"],
    ["010010", "100100", "110011"],
    ["001100", "000010", "110111"],
    ["101010", "000110", "001011"],
    ["111001", "000100", "010101"],
  ];

  static maskCodes: { [key: number]: boolean[][] } = {
    0: [
      [true, true, true, false, true, true, true, true, true, false, false, false, true, false, false],
      [true, true, true, false, false, true, false, true, true, true, true, false, false, true, true],
      [true, true, true, true, true, false, true, true, false, true, false, true, false, true, false],
      [true, true, true, true, false, false, false, true, false, false, true, true, true, false, true],
      [true, true, false, false, true, true, false, false, false, true, false, true, true, true, true],
      [true, true, false, false, false, true, true, false, false, false, true, true, false, false, false],
      [true, true, false, true, true, false, false, false, true, false, false, false, false, false, true],
      [true, true, false, true, false, false, true, false, true, true, true, false, true, true, false],
    ],
    1: [
      [true, false, true, false, true, false, false, false, false, false, true, false, false, true, false],
      [true, false, true, false, false, false, true, false, false, true, false, false, true, false, true],
      [true, false, true, true, true, true, false, false, true, true, true, true, true, false, false],
      [true, false, true, true, false, true, true, false, true, false, false, true, false, true, true],
      [true, false, false, false, true, false, true, true, true, true, true, true, false, false, true],
      [true, false, false, false, false, false, false, true, true, false, false, true, true, true, false],
      [true, false, false, true, true, true, true, true, false, false, true, false, true, true, true],
      [true, false, false, true, false, true, false, true, false, true, false, false, false, false, false],
    ],
    2: [
      [false, true, true, false, true, false, true, false, true, false, true, true, true, true, true],
      [false, true, true, false, false, false, false, false, true, true, false, true, false, false, false],
      [false, true, true, true, true, true, true, false, false, true, true, false, false, false, true],
      [false, true, true, true, false, true, false, false, false, false, false, false, true, true, false],
      [false, true, false, false, true, false, false, true, false, true, true, false, true, false, false],
      [false, true, false, false, false, false, true, true, false, false, false, false, false, true, true],
      [false, true, false, true, true, true, false, true, true, false, true, true, false, true, false],
      [false, true, false, true, false, true, true, true, true, true, false, true, true, false, true],
    ],
    3: [
      [false, false, true, false, true, true, false, true, false, false, false, true, false, false, true],
      [false, false, true, false, false, true, true, true, false, true, true, true, true, true, false],
      [false, false, true, true, true, false, false, true, true, true, false, false, true, true, true],
      [false, false, true, true, false, false, true, true, true, false, true, false, false, false, false],
      [false, false, false, false, true, true, true, false, true, true, false, false, false, true, false],
      [false, false, false, false, false, true, false, false, true, false, true, false, true, false, true],
      [false, false, false, true, true, false, true, false, false, false, false, true, true, false, false],
      [false, false, false, true, false, false, false, false, false, true, true, true, false, true, true],
    ],
  };
}
