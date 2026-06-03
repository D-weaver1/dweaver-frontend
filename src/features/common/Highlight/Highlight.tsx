import type { FC } from "react";
import type { HighlightProps } from "./interfaces";

const Highlight: FC<HighlightProps> = ({
  value,
  search,
  className = "bg-amber-300",
  emptyValue = "—",
  emptyClassName = "text-gray-400",
  words = false,
}) => {
  if (!search || !value) {
    if (!value) {
      return <span className={emptyClassName}>{emptyValue}</span>;
    }

    return <>{value}</>;
  }

  if (!words) {
    return (
      <span>
        {value.split(new RegExp(`(${search})`, "gi")).map((part, idx) => (
          <span
            className={
              part.toLowerCase() === search.toLowerCase()
                ? className
                : undefined
            }
            key={idx}
          >
            {part}
          </span>
        ))}
      </span>
    );
  }

  const delimiters = search.split(" ").filter((s) => s);
  const escaped = delimiters.map((d) =>
    d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");

  return (
    <>
      {value.split(regex).map((part, idx) => (
        <span
          className={
            delimiters.includes(part.toLowerCase()) ? className : undefined
          }
          key={idx}
        >
          {part}
        </span>
      ))}
    </>
  );
};

export default Highlight;
