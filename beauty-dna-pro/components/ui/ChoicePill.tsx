"use client";

import clsx from "clsx";

export function ChoicePill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "choice-pill",
        selected ? "choice-pill-on" : "choice-pill-off"
      )}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}
