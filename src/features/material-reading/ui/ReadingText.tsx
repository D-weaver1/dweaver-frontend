import type {
  ReadingUnit,
  TranslatedReadingUnit,
} from "../model/materialReading.types";

type ReadingTextProps = {
  units: ReadingUnit[];
  onTranslatedUnitClick: (unit: TranslatedReadingUnit) => void;
};

export function ReadingText({
  units,
  onTranslatedUnitClick,
}: ReadingTextProps) {
  return (
    <p className="text-xl leading-9">
      {units.map((unit) => (
        <span key={unit.index}>
          {unit.isTranslated ? (
            <button
              type="button"
              onClick={() => onTranslatedUnitClick(unit)}
              className="rounded-md bg-blue-50 px-1 font-medium text-blue-700 transition hover:bg-blue-100"
            >
              {unit.text}
            </button>
          ) : (
            <span>{unit.text}</span>
          )}

          {unit.spaceAfter ? " " : ""}
        </span>
      ))}
    </p>
  );
}
