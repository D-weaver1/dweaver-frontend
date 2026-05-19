export type MaterialLevelProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export type MaterialLevelOption = {
  id: string;
  factor: number;
  status: MaterialLevelProgressStatus;
};

export type TranslatedWord = {
  wordId: string;
  materialWordId: string;
  sourceText: string;
  targetText: string;
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
  progressStatus: MaterialLevelProgressStatus;
  units: ReadingUnit[];
  translatedWords: TranslatedWord[];
};

export type MaterialProgressSummary = {
  materialId: string;
  completedLevelsCount: number;
  totalLevelsCount: number;
  status: MaterialLevelProgressStatus;
};

export type MaterialsProgressSummaryResponse = {
  summaries: MaterialProgressSummary[];
};
