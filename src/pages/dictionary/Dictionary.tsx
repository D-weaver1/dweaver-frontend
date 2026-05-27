import { TranslatedWordsReview } from "@/features/material-reading/ui/TranslatedWordsReview";
import { useLanguagePair } from "@/features/user-language-pairs/model/useLanguagePair";
import BackIcon from "@/assets/back.svg";
import { http } from "@/shared/api/http";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Dictionary() {
  const { t } = useTranslation();
  const { currentLanguagePair } = useLanguagePair();
  const { data: dictionary = [] } = useQuery({
    queryKey: ["dictionary", currentLanguagePair?.id],
    queryFn: () =>
      http<{ id: string; sourceText: string; translation: string }[]>(
        `/dictionaries/${currentLanguagePair?.id}/words`,
      ),
    enabled: Boolean(currentLanguagePair),
  });
  const words = useMemo(
    () =>
      dictionary.map((entry) => ({
        ...entry,
        targetText: entry.translation,
        wordId: entry.id,
        materialWordId: entry.id,
      })),
    [dictionary],
  );

  return (
    <div>
      {currentLanguagePair && (
        <TranslatedWordsReview
          words={words}
          inDictionary
          languagePair={currentLanguagePair}
          header={
            <div className="dictionary-title">
              <Link
                to="/quizzes"
                title={t("common.back")}
                type="button"
                className="nav-button"
              >
                <img src={BackIcon} alt={t("common.back")} />
              </Link>
              <h2 className="translated-words-title">
                {t("dictionary.yourDictionary")}
              </h2>
            </div>
          }
        />
      )}
    </div>
  );
}
