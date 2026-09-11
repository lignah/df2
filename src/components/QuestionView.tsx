import { useEffect, useRef } from "react";
import type { ChoiceKey, Question } from "../types";
import { ChoiceList } from "./ChoiceList";
import { Md } from "./Md";
import { subjectById } from "../data/bank";

export function QuestionView({
  question,
  selected,
  locked,
  result,
  onToggle,
  onSubmit,
}: {
  question: Question;
  selected: string[];
  locked: boolean;
  result: boolean | null | "pending";
  onToggle: (key: ChoiceKey) => void;
  onSubmit: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const subject = subjectById(question.subjectId);
  const multi = question.answer.length !== 1 || Boolean(question.flags?.noAnswer);
  const stemPlain = question.stem.replace(/[*#`_?？.\s]/g, "");
  const titlePlain = question.title.replace(/[*#`_?？.\s]/g, "");
  const titleDuplicatesStem =
    titlePlain.length > 8 &&
    (stemPlain.startsWith(titlePlain) || titlePlain.startsWith(stemPlain.slice(0, 16)));

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [question.id]);

  return (
    <div className="q-scroll" ref={scroller}>
      <div className="q-meta">
        <span className={`chip chip-${question.subjectId}`}>
          {subject?.short ?? question.subjectId}
        </span>
        {question.rounds.length > 0 ? (
          <span className="chip chip-mute">
            {question.rounds.map((n) => `${n}회`).join("·")}
          </span>
        ) : null}
        <span className="chip chip-mute">{question.lecture}강</span>
      </div>

      {titleDuplicatesStem ? (
        <h1 className="sr-only">{question.title}</h1>
      ) : (
        <h1 className="q-title">{question.title}</h1>
      )}

      <div className="q-stem">
        <Md text={question.stem} />
      </div>

      {multi && !locked ? (
        <p className="q-hint">정답을 모두 고른 뒤 제출</p>
      ) : null}

      <ChoiceList
        question={question}
        selected={selected}
        locked={locked}
        onToggle={onToggle}
      />

      {multi && !locked ? (
        <button
          type="button"
          className="btn-primary q-submit"
          onClick={onSubmit}
          disabled={selected.length === 0}
        >
          제출
        </button>
      ) : null}

      {locked ? (
        <div className="explain">
          <p className="explain-head">
            {result === true
              ? "정답"
              : result === false
                ? "오답"
                : "정답 없음"}
            {question.flags?.noAnswer
              ? " · 교재와 강의 해설이 다름"
              : result === false
                ? ` · 정답 ${question.answer.join("·")}`
                : ""}
          </p>
          {question.explanation ? <Md text={question.explanation} /> : (
            <p className="muted">수록된 해설 없음</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
