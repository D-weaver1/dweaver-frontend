export type MaterialCard = {
  id: string;
  title: string;
  languageLevel: string;
  preview: string;
};

export type MaterialsFilters = {
  search?: string;
  selectedLevelGroups: string[];
  languageLevels: string[];
};

export type GetMaterialsResponse = {
  languagePairId: string;
  filters: MaterialsFilters;
  materials: MaterialCard[];
};

export type GetMaterialsParams = {
  search?: string;
  levels?: string[];
};
