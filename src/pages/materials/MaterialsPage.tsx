import { useCallback, useEffect, useState } from "react";
import { materialsApi } from "@/features/materials/api/materialsApi";
import type { MaterialCard } from "@/features/materials/model/material.types";
import { useAuth } from "@/features/auth/model/useAuth";
import { useLanguagePair } from "@/features/user-language-pairs/model/useLanguagePair";
import { useTranslation } from "react-i18next";

const LEVEL_FILTERS = [
  { labelKey: "levels.a1a2", value: "A1-A2" },
  { labelKey: "levels.b1b2", value: "B1-B2" },
  { labelKey: "levels.c1c2", value: "C1-C2" },
];

export function MaterialsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { currentLanguagePair, isLoading: isLanguagePairLoading } =
    useLanguagePair();

  const [materials, setMaterials] = useState<MaterialCard[]>([]);
  const [search, setSearch] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();
  const loadMaterials = useCallback(async () => {
    if (isAuthLoading || isLanguagePairLoading) {
      return;
    }

    if (!isAuthenticated || !currentLanguagePair) {
      setMaterials([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await materialsApi.getMaterials({
        search,
        levels: selectedLevels,
      });

      setMaterials(response.materials);
    } catch (error) {
      console.error(error);
      setError(t("materials.loadError"));
      setMaterials([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    search,
    selectedLevels,
    isAuthenticated,
    isAuthLoading,
    isLanguagePairLoading,
    currentLanguagePair?.id,
  ]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadMaterials();
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadMaterials]);

  function toggleLevel(level: string) {
    setSelectedLevels((currentLevels) => {
      if (currentLevels.includes(level)) {
        return currentLevels.filter((currentLevel) => currentLevel !== level);
      }

      return [...currentLevels, level];
    });
  }

  if (isAuthLoading || isLanguagePairLoading) {
    return (
      <section className="materials-page">
        <p className="materials-empty">{t("common.loading")}</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="materials-page">
        <p className="materials-empty">{t("materials.authRequired")}</p>
      </section>
    );
  }

  if (!currentLanguagePair) {
    return (
      <section className="materials-page">
        <p className="materials-empty">{t("materials.choosePairRequired")}</p>
      </section>
    );
  }

  return (
    <section className="materials-page">
      <div className="materials-header">
        <div>
          <p className="page-label">{t("materials.title")}</p>
          <h1>{t("nav.startLearning")}</h1>
          <p className="page-description">{t("materials.description")}</p>
        </div>
      </div>

      <div className="materials-toolbar">
        <div className="level-filter-list">
          {LEVEL_FILTERS.map((level) => {
            const isActive = selectedLevels.includes(level.value);

            return (
              <button
                key={level.value}
                type="button"
                className={`level-filter ${isActive ? "active" : ""}`}
                onClick={() => toggleLevel(level.value)}
              >
                {t(level.labelKey)}
              </button>
            );
          })}
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="materials-search"
          placeholder={t("materials.searchPlaceholder")}
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      {isLoading ? (
        <p className="materials-empty">{t("materials.loading")}</p>
      ) : materials.length === 0 ? (
        <p className="materials-empty">{t("materials.notFound")}</p>
      ) : (
        <div className="materials-grid">
          {materials.map((material) => (
            <button
              key={material.id}
              type="button"
              className="material-card"
              onClick={() => {
                console.log("Open material:", material.id);
              }}
            >
              <div className="material-card-header">
                <span className="material-level">{material.languageLevel}</span>
              </div>

              <h2>{material.title}</h2>
              <p>{material.preview}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
