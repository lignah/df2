import { useMemo, useState } from "react";
import { questions, subjectById } from "../data/bank";
import { buildQueue, grade } from "../lib/quiz";
import { go } from "../lib/hash";
import { useProgress } from "../progress";
import { QuestionView } from "../components/QuestionView";
import { Shell } from "../components/Shell";
import type { ChoiceKey, QuizMode, SubjectId } from "../types";

const MODES: QuizMode[] = ["all", "unseen", "wrong", "correct"];

function asMode(v: string): QuizMode {
  return (MODES as string[]).includes(v) ? (v as QuizMode) : "all";
}

type LocalResult = {
  choices: string[];
  outcome: boolean | null;
};

export function QuizScreen({
  subjectId,
  mode,
  random,
  qid,
}: {
  subjectId: string;
  mode: string;
  random: boolean;
  qid: string | null;
}) {
  const { progress, record } = useProgress();
  const queue = useMemo(
    () =>
      buildQueue(questions, progress, {
        subjectId: subjectId as SubjectId,
        mode: asMode(mode),
        random,
      }),
    // 세션 중 큐가 줄어들지 않게 최초 스냅샷만 씀
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subjectId, mode, random],
  );

  const startIndex = useMemo(() => {
    if (!qid) return 0;
    const i = queue.findIndex((q) => q.id === qid);
    return i >= 0 ? i : 0;
  }, [queue, qid]);

  const [index, setIndex] = useState(startIndex);
  const [local, setLocal] = useState<Record<string, LocalResult>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<boolean | null | "pending">("pending");
  const [done, setDone] = useState(false);

  const subject = subjectById(subjectId);
  const question = queue[index];
  const backTo =
    subjectId === "all" ? "#/review?tab=wrong" : `#/subject/${subjectId}`;

  const showQuestion = (next: number) => {
    const q = queue[next];
    const saved = q ? local[q.id] : undefined;
    setIndex(next);
    if (saved) {
      setSelected(saved.choices);
      setLocked(true);
      setResult(saved.outcome);
    } else {
      setSelected([]);
      setLocked(false);
      setResult("pending");
    }
  };

  const applyGrade = (choices: string[]) => {
    if (!question || locked) return;
    const outcome = grade(question, choices);
    record(question.id, choices, outcome);
    setLocal((prev) => ({ ...prev, [question.id]: { choices, outcome } }));
    setLocked(true);
    setResult(outcome);
  };

  const onToggle = (key: ChoiceKey) => {
    if (locked || !question) return;
    const multi =
      question.answer.length !== 1 || Boolean(question.flags?.noAnswer);
    if (!multi) {
      setSelected([key]);
      applyGrade([key]);
      return;
    }
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const sessionCorrect = Object.values(local).filter((r) => r.outcome === true).length;
  const sessionWrong = Object.values(local).filter((r) => r.outcome === false).length;

  if (done) {
    return (
      <Shell nav={false}>
        <header className="quiz-head">
          <p className="eyebrow">{subject?.short ?? "복습"}</p>
          <button type="button" className="icon-btn" onClick={() => go(backTo)}>
            닫기
          </button>
        </header>
        <div className="done">
          <h1 className="page-title">이 세트 끝</h1>
          <p className="done-score">
            맞춘 <b className="ok">{sessionCorrect}</b>
            <span className="dot">·</span>
            틀린 <b className="bad">{sessionWrong}</b>
            <span className="dot">·</span>
            {queue.length}문항
          </p>
          <div className="stack">
            {sessionWrong > 0 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  go(
                    subjectId === "all"
                      ? "#/review?tab=wrong"
                      : `#/quiz/${subjectId}?mode=wrong`,
                  )
                }
              >
                틀린 문제 복습
              </button>
            ) : null}
            <button type="button" className="btn-ghost" onClick={() => go(backTo)}>
              돌아가기
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  if (!question) {
    return (
      <Shell nav={false}>
        <header className="quiz-head">
          <p className="eyebrow">{subject?.short ?? "풀이"}</p>
          <button type="button" className="icon-btn" onClick={() => go(backTo)}>
            닫기
          </button>
        </header>
        <p className="empty">이 조건에 해당하는 문항이 없음</p>
      </Shell>
    );
  }

  const last = index >= queue.length - 1;

  return (
    <Shell nav={false}>
      <header className="quiz-head">
        <div>
          <p className="eyebrow">{subject?.short ?? "전체"}</p>
          <p className="quiz-progress">
            {index + 1} / {queue.length}
          </p>
        </div>
        <button type="button" className="icon-btn" onClick={() => go(backTo)}>
          닫기
        </button>
      </header>
      <div className="quiz-bar" aria-hidden="true">
        <span
          className="quiz-bar-fill"
          style={{
            width: `${((index + (locked ? 1 : 0)) / queue.length) * 100}%`,
          }}
        />
      </div>

      <QuestionView
        question={question}
        selected={selected}
        locked={locked}
        result={result}
        onToggle={onToggle}
        onSubmit={() => applyGrade(selected)}
      />

      <footer className="quiz-foot">
        <button
          type="button"
          className="btn-ghost"
          disabled={index === 0}
          onClick={() => showQuestion(index - 1)}
        >
          이전
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={!locked}
          onClick={() => {
            if (last) setDone(true);
            else showQuestion(index + 1);
          }}
        >
          {last ? "결과" : "다음"}
        </button>
      </footer>
    </Shell>
  );
}
