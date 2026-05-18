import type {
  ReadingUnit,
  TranslatedReadingUnit,
} from "../model/materialReading.types";

type WordPopupPosition = {
  top: number;
  left: number;
};

type ReadingTextProps = {
  units: ReadingUnit[];
  onTranslatedUnitClick: (
    unit: TranslatedReadingUnit,
    position: WordPopupPosition,
  ) => void;
};

export function ReadingText({
  units,
  onTranslatedUnitClick,
}: ReadingTextProps) {
  function handleTranslatedUnitClick(
    unit: TranslatedReadingUnit,
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    const rect = event.currentTarget.getBoundingClientRect();

    onTranslatedUnitClick(unit, {
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
  }

  return (
    <p className="reading-text">
      {units.map((unit) => (
        <span key={unit.index}>
          {unit.isTranslated ? (
            <button
              type="button"
              onClick={(event) => handleTranslatedUnitClick(unit, event)}
              className="reading-unit-button"
            >
              {unit.text}
            </button>
          ) : (
            <span className="reading-unit-original">{unit.text}</span>
          )}

          {unit.spaceAfter ? " " : ""}
        </span>
      ))}
    </p>
  );
}
