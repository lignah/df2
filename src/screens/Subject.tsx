import { useState } from "react";
import { questions, subjectById } from "../data/bank";
import { statsFor } from "../lib/quiz";
import { go, quizPath } from "../lib/hash";
import { useProgress } from "../progress";
import { ProgressBar } from "../components/ProgressBar";
import { Shell } from "../components/Shell";

export function SubjectScreen({ subjectId }: { subjectId: string }) {
  const subject = subjectById(subjectId);
  const { progress } = useProgress();
  const [random, setRandom] = useState(false);
  const st = statsFor(questions, progress, subjectId as "arch");

  if (!subject) {
    return (
      <Shell>
        <p className="empty">없는 과목임</p>
      </Shell>
    );
  }

  const start = (mode: string) => {
    go(quizPath(subject.id, { mode, random }));
  };

  return (
    <Shell>
      <header className="page-head">
        <button type="button" className="back" onClick={() => go("#/")}>
          홈
        </button>
        <p className="eyebrow">과목</p>
        <h1 className="page-title">{subject.name}</h1>
        <p className="muted">
          실전 {subject.examCount}문항 배점 · 여기선 {st.total}문항
        </p>
      </header>

      <section className="stat-card">
        <div className="stat-row">
          <span>
            맞춘 <b className="ok">{st.correct}</b>
          </span>
          <span>
            틀린 <b className="bad">{st.wrong}</b>
          </span>
          <span>
            남은 <b>{st.unseen}</b>
          </span>
        </div>
        <ProgressBar
          value={st.correct + st.wrong + st.reviewed}
          max={st.total}
          label={`${st.correct + st.wrong + st.reviewed} / ${st.total}`}
        />
      </section>

      <label className="toggle">
        <span>랜덤 순서</span>
        <input
          type="checkbox"
          checked={random}
          onChange={(e) => setRandom(e.target.checked)}
        />
      </label>

      <div className="stack">
        <button
          type="button"
          className="btn-primary"
          onClick={() => start("all")}
          disabled={st.total === 0}
        >
          전체 풀기
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => start("unseen")}
          disabled={st.unseen === 0}
        >
          안 푼 문제 {st.unseen}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => start("wrong")}
          disabled={st.wrong === 0}
        >
          틀린 문제 {st.wrong}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => start("correct")}
          disabled={st.correct === 0}
        >
          맞춘 문제 복습 {st.correct}
        </button>
      </div>
    </Shell>
  );
}
