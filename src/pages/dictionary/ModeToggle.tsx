import { useLanguagePair } from "@/features/user-language-pairs/model/useLanguagePair";

interface ModeToggleProps {
  mode: "s_t" | "t_s";
  onChange: (mode: "s_t" | "t_s") => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const { currentLanguagePair } = useLanguagePair();
  const src = currentLanguagePair?.sourceLanguage.code ?? "";
  const tgt = currentLanguagePair?.targetLanguage.code ?? "";

  return (
    <div className="btn-group mode-toggle">
      <button
        type="button"
        className={`btn uppercase ${mode === "s_t" ? "btn-active" : ""}`}
        onClick={() => onChange("s_t")}
      >
        {src} → {tgt}
      </button>
      <button
        type="button"
        className={`btn uppercase ${mode === "t_s" ? "btn-active" : ""}`}
        onClick={() => onChange("t_s")}
      >
        {tgt} → {src}
      </button>
    </div>
  );
}
