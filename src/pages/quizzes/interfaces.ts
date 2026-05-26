interface Language {
  id: string;
  code: string;
  name: string;
}

interface QuizShortAttempt {
  id: string;
  createdAt: string;
  completedAt: string | null;
  correct: number;
  total: number;
}

interface QuizShort {
  id: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  attempts: QuizShortAttempt[];
}

export type QuizzesResponse = QuizShort[];

interface MyDictionary {
  id: string;
  source: Language;
  target: Language;
}

export type DictionariesResponse = MyDictionary[];

interface QuizQuestion {
  id: string;
  type: "s2t_translate" | "t2s_translate";
  text: string;
  answered: boolean;
  isCorrect?: boolean;
  options: [{ text: string }];
}

export interface QuizResponse {
  id: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  questions: QuizQuestion[];
}
