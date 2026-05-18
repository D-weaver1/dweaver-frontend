export const MATERIAL_LEVEL_FACTORS = [20, 40, 60, 80] as const;

export type MaterialLevelFactor = (typeof MATERIAL_LEVEL_FACTORS)[number];

export const MATERIAL_LEVEL_TRANSLATION_KEYS: Record<
  number,
  {
    title: string;
    description: string;
  }
> = {
  20: {
    title: "materialReading.levels.20.title",
    description: "materialReading.levels.20.description",
  },
  40: {
    title: "materialReading.levels.40.title",
    description: "materialReading.levels.40.description",
  },
  60: {
    title: "materialReading.levels.60.title",
    description: "materialReading.levels.60.description",
  },
  80: {
    title: "materialReading.levels.80.title",
    description: "materialReading.levels.80.description",
  },
};
