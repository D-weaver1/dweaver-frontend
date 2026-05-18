export type MaterialLevelOption = {
  id: string;
  factor: number;
};

type ReadingUnitBase = {
  index: number;
  text: string;
  isTranslated: boolean;
  spaceAfter: boolean;
};

export type OriginalReadingUnit = ReadingUnitBase & {
  isTranslated: false;
};

export type TranslatedReadingUnit = ReadingUnitBase & {
  isTranslated: true;
  wordId: string;
  materialWordId: string;
  sourceText: string;
  targetText: string;
};

export type ReadingUnit = OriginalReadingUnit | TranslatedReadingUnit;

export type MaterialReading = {
  materialId: string;
  levelId: string;
  factor: number;
  text: string;
  units: ReadingUnit[];
};
