import { useLanguagePair } from "@/features/user-language-pairs/model/useLanguagePair";
import BackIcon from "@/assets/back.svg";
import PdfIcon from "@/assets/pdf.svg";
import { http } from "@/shared/api/http";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { playPronunciation } from "@/features/material-reading/lib/playPronunciation";
import { ModeToggle } from "./ModeToggle";
import { Highlight } from "@/features/common";
import toast from "react-hot-toast";

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
  const [mode, setMode] = useState<"s_t" | "t_s">("s_t");
  const [query, setQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const words = useMemo(() => {
    const key = mode === "s_t" ? "sourceText" : "translation";

    return dictionary
      .map((entry) => ({
        ...entry,
        targetText: entry.translation,
        wordId: entry.id,
        materialWordId: entry.id,
      }))
      .filter(
        (entry) =>
          entry.sourceText.toLowerCase().includes(query.toLowerCase()) ||
          entry.translation.toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) => a[key].localeCompare(b[key]));
  }, [dictionary, mode, query]);
  const targetLanguageCode = currentLanguagePair?.targetLanguage.code;

  const handleExportPdf = async () => {
    setIsExporting(true);

    try {
      const response = await http<Response>(
        `/dictionaries/${currentLanguagePair?.id}/export-pdf?mode=${mode}&query=${encodeURIComponent(query)}`,
        {
          method: "POST",
        },
        true,
        true,
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `dictionary_${currentLanguagePair?.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to export PDF";

      toast.error(message);
    }

    setIsExporting(false);
  };

  return (
    <div>
      <section className="translated-words-section">
        <div className="translated-words-header dictionary-header">
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
          <div className="dictionary-panel">
            <input
              type="text"
              placeholder={t("dictionary.searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
            />
            <ModeToggle mode={mode} onChange={setMode} />
            <button
              type="button"
              disabled={isExporting}
              className="nav-button"
              onClick={handleExportPdf}
              title={t("dictionary.exportPdf")}
            >
              <img width="20" height="20" src={PdfIcon} alt="Export PDF" />
            </button>
          </div>
        </div>

        <div className="translated-words-list">
          {words.map((word) => (
            <div key={word.materialWordId} className="translated-word-card">
              <div className="dictionary-word-line">
                <div className="translated-word-source">
                  <Highlight
                    search={query}
                    value={mode === "s_t" ? word.sourceText : word.targetText}
                  />
                </div>

                <div className="translated-word-target">
                  <Highlight
                    search={query}
                    value={mode === "s_t" ? word.targetText : word.sourceText}
                  />
                </div>

                <div className="dictionary-word-line__btns">
                  <button
                    type="button"
                    className="translated-word-secondary-button"
                    onClick={() => {
                      if (targetLanguageCode) {
                        playPronunciation(word.targetText, targetLanguageCode);
                      }
                    }}
                  >
                    {t("materialReading.translatedWords.listen")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
