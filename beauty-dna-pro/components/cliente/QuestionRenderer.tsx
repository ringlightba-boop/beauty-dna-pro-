"use client";

import type { Question } from "@/lib/questions";
import { ChoicePill } from "@/components/ui/ChoicePill";

export function QuestionRenderer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-base font-medium text-ink">{question.pergunta}</p>
      {question.tipo === "text" ? (
        <input
          type="text"
          className="input-field"
          placeholder={question.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {question.opcoes?.map((opt) => (
            <ChoicePill
              key={opt}
              label={opt}
              selected={value === opt}
              onClick={() => onChange(opt)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
