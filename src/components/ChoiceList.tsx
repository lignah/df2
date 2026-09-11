import type { ChoiceKey, Question } from "../types";
import { Md } from "./Md";

export function ChoiceList({
  question,
  selected,
  locked,
  onToggle,
}: {
  question: Question;
  selected: string[];
  locked: boolean;
  onToggle: (key: ChoiceKey) => void;
}) {
  const answerSet = new Set(question.answer);
  const noAnswer = Boolean(question.flags?.noAnswer);

  return (
    <div className="choices" role="list">
      {question.choices.map((c) => {
        const on = selected.includes(c.key);
        let state = "";
        if (locked) {
          const isCorrectChoice = !noAnswer && answerSet.has(c.key);
          if (isCorrectChoice) state = "is-ok";
          else if (on) state = "is-bad";
        } else if (on) {
          state = "is-on";
        }
        return (
          <button
            key={c.key}
            type="button"
            className={`choice ${state}`}
            onClick={() => onToggle(c.key)}
            disabled={locked}
            aria-pressed={on}
          >
            <span className="choice-key">{c.key}</span>
            <span className="choice-text">
              <Md text={c.text} />
            </span>
            {locked && !noAnswer && answerSet.has(c.key) ? (
              <span className="choice-mark" aria-label="정답">
                ✓
              </span>
            ) : null}
            {locked && on && !answerSet.has(c.key) && !noAnswer ? (
              <span className="choice-mark is-bad" aria-label="오답">
                ✕
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
