import { useCallback, useEffect, useState } from "react";
import { materialsApi } from "@/features/materials/api/materialsApi";
import type { MaterialCard } from "@/features/materials/model/material.types";
import { useAuth } from "@/features/auth/model/useAuth";
import { useLanguagePair } from "@/features/user-language-pairs/model/useLanguagePair";

const LEVEL_FILTERS = [
  { label: "A1-A2", value: "A1-A2" },
  { label: "B1-B2", value: "B1-B2" },
  { label: "C1-C2", value: "C1-C2" },
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
      setError("Не вдалося завантажити матеріали");
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
        <p className="materials-empty">Завантаження...</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="materials-page">
        <p className="materials-empty">
          Увійдіть в акаунт, щоб переглядати матеріали.
        </p>
      </section>
    );
  }

  if (!currentLanguagePair) {
    return (
      <section className="materials-page">
        <p className="materials-empty">
          Спочатку оберіть мовну пару для навчання.
        </p>
      </section>
    );
  }

  return (
    <section className="materials-page">
      <div className="materials-header">
        <div>
          <p className="page-label">Навчальні матеріали</p>
          <h1>Почати навчання</h1>
          <p className="page-description">
            Оберіть матеріал для адаптивного читання. Список формується для
            поточної мовної пари.
          </p>
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
                {level.label}
              </button>
            );
          })}
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="materials-search"
          placeholder="Пошук за назвою або текстом..."
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      {isLoading ? (
        <p className="materials-empty">Завантаження матеріалів...</p>
      ) : materials.length === 0 ? (
        <p className="materials-empty">Матеріали не знайдено</p>
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
